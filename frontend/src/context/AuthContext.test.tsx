import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, renderHook, screen, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider, useAuth, type User } from "./AuthContext";
import { apiFetch } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
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

describe("AuthContext signIn / signOut", () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it("signIn posts form credentials, persists the token, hydrates session", async () => {
    mockedApiFetch.mockImplementation((url: string) =>
      url === "/login/access-token"
        ? Promise.resolve({ access_token: "fresh-token" })
        : Promise.resolve({ id: 7, email: "sam@example.com", username: "sam" })
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let returned: User | null = null;
    await act(async () => {
      returned = await result.current.signIn({
        email: "sam@example.com",
        password: "pw",
      });
    });

    expect(returned?.email).toBe("sam@example.com");
    expect(localStorage.getItem("thoughtweb-token")).toBe("fresh-token");
    expect(result.current.session?.access_token).toBe("fresh-token");
    expect(result.current.user?.email).toBe("sam@example.com");

    const loginCall = mockedApiFetch.mock.calls.find(
      ([url]) => url === "/login/access-token"
    );
    expect(loginCall).toBeDefined();
    const body = loginCall![1].body as URLSearchParams;
    expect(body.get("username")).toBe("sam@example.com");
    expect(body.get("password")).toBe("pw");
  });

  it("signIn failure returns null, stores no token, stays anonymous", async () => {
    mockedApiFetch.mockRejectedValue(new Error("Incorrect email/username or password"));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let returned: User | null = null;
    await act(async () => {
      returned = await result.current.signIn({
        email: "sam@example.com",
        password: "wrong",
      });
    });

    expect(returned).toBeNull();
    expect(localStorage.getItem("thoughtweb-token")).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it("signOut clears the stored token and drops the session", async () => {
    localStorage.setItem("thoughtweb-token", "stored-token");
    mockedApiFetch.mockResolvedValue({
      id: 7,
      email: "sam@example.com",
      username: "sam",
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user?.email).toBe("sam@example.com"));

    await act(async () => {
      await result.current.signOut();
    });

    expect(localStorage.getItem("thoughtweb-token")).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });
});
