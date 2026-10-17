import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiError, apiFetch, getAuthHeader } from "./api";

const jsonResponse = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  ({
    ok: status < 400,
    status,
    headers: new Headers(headers),
    json: () => Promise.resolve(body),
  }) as Response;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getAuthHeader", () => {
  it("returns an empty object when no token is stored", () => {
    expect(getAuthHeader()).toEqual({});
  });

  it("returns a Bearer header when a token is stored", () => {
    localStorage.setItem("thoughtweb-token", "abc123");
    expect(getAuthHeader()).toEqual({ Authorization: "Bearer abc123" });
  });
});

describe("apiFetch", () => {
  it("returns the parsed body on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, { id: 1 })));
    await expect(apiFetch("/users/me")).resolves.toEqual({ id: 1 });
  });

  it("throws ApiError with the string detail on 400", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(400, { detail: "Incorrect password" })));
    const error = await apiFetch("/login").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe("Incorrect password");
  });

  it("joins pydantic validation array details into one message", async () => {
    const body = { detail: [{ loc: ["body", "email"], msg: "not a valid email" }] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(422, body)));
    const error = await apiFetch("/users/", { method: "POST" }).catch((e) => e);
    expect(error.status).toBe(422);
    expect(error.message).toBe("email: not a valid email");
  });

  it("surfaces the request id from the response headers", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(500, { detail: "boom" }, { "X-Request-ID": "req-9" })));
    const error = await apiFetch("/chat/query").catch((e) => e);
    expect(error.requestId).toBe("req-9");
  });

  it("maps a network failure to a friendly ApiError with status 0", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Failed to fetch")));
    const error = await apiFetch("/sources/").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.code).toBe("network_error");
    expect(error.message).toContain("backend server");
  });
});
