"""Audit retention prune + per-user CSV/JSON export (H4)."""
import csv
import io
import json
from datetime import datetime, timedelta

from app.db.database import SessionLocal
from app.models.audit_log import AuditLog
from app.services.audit_service import prune_old_events, record


def test_prune_removes_only_events_older_than_retention(client, make_user):
    """Rows past the retention window are deleted; recent rows survive."""
    user = make_user(prefix="prune_old")
    db = SessionLocal()
    try:
        marker = "prune.test"
        record(db, user["id"], marker, detail={"age": "old"})
        record(db, user["id"], marker, detail={"age": "recent"})
        old_id = (
            db.query(AuditLog)
            .filter(AuditLog.action == marker, AuditLog.detail.contains("old"))
            .one()
            .id
        )
        db.query(AuditLog).filter(AuditLog.id == old_id).update(
            {"created_at": datetime.utcnow() - timedelta(days=120)},
            synchronize_session=False,
        )
        db.commit()

        deleted = prune_old_events(db, retention_days=90)

        assert deleted >= 1, "the 120-day-old row must be pruned"
        assert db.query(AuditLog).filter(AuditLog.id == old_id).one_or_none() is None
        remaining = (
            db.query(AuditLog).filter(AuditLog.action == marker).all()
        )
        assert len(remaining) == 1, "the recent row must survive"
        assert remaining[0].detail and "recent" in remaining[0].detail

        db.query(AuditLog).filter(AuditLog.action == marker).delete()
        db.commit()
    finally:
        db.close()


def test_prune_respects_custom_retention_days(client, make_user):
    """A shorter custom window prunes rows the default 90d window would keep."""
    user = make_user(prefix="prune_cust")
    db = SessionLocal()
    try:
        marker = "prune.custom"
        record(db, user["id"], marker)
        event_id = (
            db.query(AuditLog).filter(AuditLog.action == marker).one().id
        )
        db.query(AuditLog).filter(AuditLog.id == event_id).update(
            {"created_at": datetime.utcnow() - timedelta(days=10)},
            synchronize_session=False,
        )
        db.commit()

        prune_old_events(db, retention_days=90)
        assert (
            db.query(AuditLog).filter(AuditLog.id == event_id).one_or_none()
            is not None
        ), "10-day-old row must survive the default 90d window"

        deleted = prune_old_events(db, retention_days=7)
        assert deleted >= 1
        assert (
            db.query(AuditLog).filter(AuditLog.id == event_id).one_or_none() is None
        ), "10-day-old row must be pruned by a 7d window"
    finally:
        db.close()


def test_export_csv_contains_only_own_events(client, make_user):
    """CSV export streams the caller's rows with the expected header."""
    alice = make_user(prefix="exp_csv_a")
    bob = make_user(prefix="exp_csv_b")

    db = SessionLocal()
    try:
        record(db, alice["id"], "export.own_event")
        record(db, bob["id"], "export.foreign_event")

        resp = client.get(
            "/api/v1/audit/export?format=csv", headers=alice["headers"]
        )
        assert resp.status_code == 200
        assert resp.headers["content-type"].startswith("text/csv")
        assert "attachment" in resp.headers["content-disposition"]

        rows = list(csv.DictReader(io.StringIO(resp.text)))
        assert rows, "export must contain the caller's own events"
        assert all("action" in row for row in rows)
        assert any(row["action"] == "export.own_event" for row in rows)
        assert all(
            row["action"] != "export.foreign_event" for row in rows
        ), "another user's events must never appear"
    finally:
        db.query(AuditLog).filter(AuditLog.action.like("export.%")).delete()
        db.commit()
        db.close()


def test_export_json_contains_only_own_events(client, make_user):
    """JSON export is one array of the caller's rows with the expected fields."""
    user = make_user(prefix="exp_json")

    db = SessionLocal()
    try:
        record(db, user["id"], "export.own_event")

        resp = client.get(
            "/api/v1/audit/export?format=json", headers=user["headers"]
        )
        assert resp.status_code == 200
        assert resp.headers["content-type"].startswith("application/json")

        data = json.loads(resp.text)
        assert isinstance(data, list) and data, "export must be a non-empty array"
        assert all("action" in item and "created_at" in item for item in data)
        assert any(item["action"] == "export.own_event" for item in data)
        assert all(item["action"] != "export.foreign_event" for item in data)
    finally:
        db.query(AuditLog).filter(AuditLog.action.like("export.%")).delete()
        db.commit()
        db.close()


def test_export_rejects_unknown_format(client, make_user):
    """Only csv and json are accepted."""
    user = make_user(prefix="exp_fmt")
    resp = client.get(
        "/api/v1/audit/export?format=xml", headers=user["headers"]
    )
    assert resp.status_code == 422
