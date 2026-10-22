"""B1 workspaces: cross-workspace isolation (404), role matrix, LanceDB prefilter."""
import asyncio

from app.db.lancedb import get_lancedb
from app.services.vector_service import VectorService

PROBE_DIM = 384


def _personal_ws(client, user) -> dict:
    """The auto-created personal workspace of a user."""
    resp = client.get("/api/v1/workspaces/", headers=user["headers"])
    assert resp.status_code == 200, resp.text
    mine = [w for w in resp.json() if w["role"] == "owner"]
    assert mine, "registration must create a personal workspace"
    return mine[0]


def _ws_headers(user, workspace_id: int) -> dict:
    return {**user["headers"], "X-Workspace-Id": str(workspace_id)}


def _create_ws(client, user, name: str) -> dict:
    resp = client.post(
        "/api/v1/workspaces/", json={"name": name}, headers=user["headers"]
    )
    assert resp.status_code == 200, resp.text
    return resp.json()


def test_registration_creates_personal_workspace(client, make_user):
    user = make_user()
    ws = _personal_ws(client, user)
    assert ws["name"].startswith(user["username"])


def test_cross_workspace_access_returns_404(client, make_user):
    alice, bob = make_user("alice"), make_user("bob")

    # Bob owns a workspace Alice is not a member of
    bob_ws = _create_ws(client, bob, "bob-only")

    resp = client.get(f"/api/v1/workspaces/{bob_ws['id']}", headers=alice["headers"])
    assert resp.status_code == 404

    # Naming another workspace in an ownership-filtered endpoint: 404, not data
    resp = client.get(
        "/api/v1/conversations/", headers=_ws_headers(alice, bob_ws["id"])
    )
    assert resp.status_code == 404

    # Bob's conversation is invisible from Alice's workspace (and vice versa)
    convo = client.post("/api/v1/conversations/", headers=bob["headers"])
    assert convo.status_code == 200
    resp = client.get(
        f"/api/v1/conversations/{convo.json()['id']}",
        headers=_ws_headers(alice, bob_ws["id"]),
    )
    assert resp.status_code == 404


def test_role_matrix_member_viewer_admin_owner(client, make_user):
    owner = make_user("owner")
    viewer = make_user("viewer")
    member = make_user("member")
    admin = make_user("admin")
    ws = _create_ws(client, owner, "role-matrix")
    ws_id = ws["id"]
    assert ws["role"] == "owner"

    for user, role in ((viewer, "viewer"), (member, "member"), (admin, "admin")):
        resp = client.post(
            f"/api/v1/workspaces/{ws_id}/members",
            json={"email": user["email"], "role": role},
            headers=owner["headers"],
        )
        assert resp.status_code == 200, resp.text

    # viewer: read allowed, every write denied
    resp = client.get(
        "/api/v1/conversations/", headers=_ws_headers(viewer, ws_id)
    )
    assert resp.status_code == 200
    for method, url, kwargs in (
        ("post", "/api/v1/conversations/", {}),
        ("delete", "/api/v1/conversations/999999", {}),
    ):
        resp = getattr(client, method)(
            url, headers=_ws_headers(viewer, ws_id), **kwargs
        )
        assert resp.status_code == 403, (method, url, resp.text)
    resp = client.post(
        "/api/v1/sources/upload",
        headers=_ws_headers(viewer, ws_id),
        files={"file": ("note.txt", b"hello", "text/plain")},
    )
    assert resp.status_code == 403

    # member: can create conversations and upload
    resp = client.post(
        "/api/v1/conversations/", headers=_ws_headers(member, ws_id)
    )
    assert resp.status_code == 200, resp.text
    resp = client.post(
        "/api/v1/sources/upload",
        headers=_ws_headers(member, ws_id),
        files={"file": ("note.txt", b"hello workspace", "text/plain")},
    )
    assert resp.status_code == 200, resp.text

    # member cannot manage members; admin can
    resp = client.post(
        f"/api/v1/workspaces/{ws_id}/members",
        json={"email": owner["email"], "role": "viewer"},
        headers=_ws_headers(member, ws_id),
    )
    assert resp.status_code == 403
    resp = client.post(
        f"/api/v1/workspaces/{ws_id}/members",
        json={"email": owner["email"], "role": "viewer"},
        headers=_ws_headers(admin, ws_id),
    )
    assert resp.status_code == 400  # already a member, but role gate passed

    # admin cannot grant owner; only an owner can
    resp = client.patch(
        f"/api/v1/workspaces/{ws_id}/members/{member['id']}",
        json={"role": "owner"},
        headers=_ws_headers(admin, ws_id),
    )
    assert resp.status_code == 403
    resp = client.patch(
        f"/api/v1/workspaces/{ws_id}/members/{member['id']}",
        json={"role": "owner"},
        headers=owner["headers"],
    )
    assert resp.status_code == 200


def test_sources_are_scoped_per_workspace(client, make_user):
    user = make_user()
    personal = _personal_ws(client, user)
    shared = _create_ws(client, user, "second-ws")

    resp = client.post(
        "/api/v1/sources/upload",
        headers=_ws_headers(user, personal["id"]),
        files={"file": ("personal.txt", b"personal secret", "text/plain")},
    )
    assert resp.status_code == 200, resp.text
    personal_doc_id = resp.json()["document_id"]

    resp = client.post(
        "/api/v1/sources/upload",
        headers=_ws_headers(user, shared["id"]),
        files={"file": ("shared.txt", b"shared secret", "text/plain")},
    )
    assert resp.status_code == 200, resp.text
    shared_doc_id = resp.json()["document_id"]

    def _filenames(workspace_id=None):
        headers = _ws_headers(user, workspace_id) if workspace_id else user["headers"]
        resp = client.get("/api/v1/sources/", headers=headers)
        assert resp.status_code == 200, resp.text
        return {d["filename"] for d in resp.json()}

    assert "personal.txt" in _filenames(personal["id"])
    assert "shared.txt" not in _filenames(personal["id"])
    assert "shared.txt" in _filenames(shared["id"])
    assert "personal.txt" not in _filenames(shared["id"])

    # Deleting through the wrong workspace must 404 and keep the row
    resp = client.delete(
        f"/api/v1/sources/{personal_doc_id}",
        headers=_ws_headers(user, shared["id"]),
    )
    assert resp.status_code == 404
    resp = client.delete(
        f"/api/v1/sources/{shared_doc_id}",
        headers=_ws_headers(user, shared["id"]),
    )
    assert resp.status_code == 200, resp.text


def test_vector_prefilter_scopes_by_workspace(client, make_user):
    """Same user, two workspaces: each search sees only its own (or legacy NULL) chunks."""
    user = make_user()
    personal = _personal_ws(client, user)
    other = _create_ws(client, user, "vector-ws")

    vs = VectorService()
    table = get_lancedb().open_table("document_chunks")
    uid = user["id"]
    try:
        table.delete(f"user_id = {uid}")

        def _chunk(marker: str, ws_id) -> dict:
            vector = [0.0] * PROBE_DIM
            vector[0] = 1.0 if marker == "a" else -1.0
            return {
                "id": f"probe_ws_{uid}_{marker}",
                "document_id": 999999,
                "user_id": uid,
                "workspace_id": ws_id,
                "text": f"workspace isolation probe {marker}",
                "vector": vector,
                "metadata": '{"probe": true}',
            }

        asyncio.run(
            vs.add_chunks(
                [
                    _chunk("a", personal["id"]),
                    _chunk("b", other["id"]),
                    _chunk("legacy", None),
                ]
            )
        )

        query = [0.0] * PROBE_DIM
        query[0] = 1.0
        results = asyncio.run(
            vs.search(query, uid, limit=10, workspace_id=personal["id"])
        )
        ids = {r["id"] for r in results}
        assert f"probe_ws_{uid}_a" in ids
        assert f"probe_ws_{uid}_b" not in ids, "other-workspace chunk leaked"
        assert f"probe_ws_{uid}_legacy" in ids, "NULL-workspace legacy chunk must stay visible"

        query[0] = -1.0
        results = asyncio.run(
            vs.search(query, uid, limit=10, workspace_id=other["id"])
        )
        ids = {r["id"] for r in results}
        assert f"probe_ws_{uid}_b" in ids
        assert f"probe_ws_{uid}_a" not in ids
    finally:
        table.delete(f"user_id = {uid}")


def test_audit_list_filters_by_workspace(client, make_user):
    user = make_user()
    extra = _create_ws(client, user, "audit-ws")

    # workspace.create was recorded against the extra workspace
    resp = client.get(
        "/api/v1/audit/",
        headers=user["headers"],
        params={"workspace_id": extra["id"]},
    )
    assert resp.status_code == 200, resp.text
    items = resp.json()["items"]
    assert any(e["action"] == "workspace.create" for e in items)
    assert all(e["workspace_id"] == extra["id"] for e in items)

    # Non-member workspace: 404
    stranger = make_user("stranger")
    resp = client.get(
        "/api/v1/audit/",
        headers=stranger["headers"],
        params={"workspace_id": extra["id"]},
    )
    assert resp.status_code == 404
