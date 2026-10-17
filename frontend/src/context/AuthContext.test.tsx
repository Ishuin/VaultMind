import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { apiFetch } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

const mockedApiFetch = vi.mocked(apiFetch);

function Probe() {
  const { user, loading } = useAuth();
  if (loading) return <div>loading</div>;
  return <div>{user ? `user:${user.email}` : "anonymous"}</div>;
}

const renderProbe = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("AuthContext session restore", () => {
  it("hydrates the user from a stored token", async () => {
    localStorage.setItem("thoughtweb-token", "stored-token");
    mockedApiFetch.mockResolvedValue({ id: 7, email: "sam@example.com", username: "sam" });

    renderProbe();

    await waitFor(() => expect(screen.getByText("user:sam@example.com")).toBeInTheDocument());
    expect(mockedApiFetch).toHaveBeenCalledWith("/users/me");
  });

  it("drops a bad token and shows anonymous when restore fails", async () => {
    localStorage.setItem("thoughtweb-token", "expired-token");
    mockedApiFetch.mockRejectedValue(new Error("401 unauthorized"));

    renderProbe();

    await waitFor(() => expect(screen.getByText("anonymous")).toBeInTheDocument());
    expect(localStorage.getItem("thoughtweb-token")).toBeNull();
  });

  it("starts anonymous with no stored token and never calls the API", async () => {
    renderProbe();

    await waitFor(() => expect(screen.getByText("anonymous")).toBeInTheDocument());
    expect(mockedApiFetch).not.toHaveBeenCalled();
  });

  it("throws a clear error when used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow("useAuth must be used within an AuthProvider");
    spy.mockRestore();
  });
});
