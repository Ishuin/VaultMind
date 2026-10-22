import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LocalModeIndicator, OllamaStatus } from "./LocalModeIndicator";
import { apiFetch } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

const mockedApiFetch = vi.mocked(apiFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LocalModeIndicator", () => {
  it("shows the data-stays-local promise", () => {
    render(<LocalModeIndicator />);
    expect(screen.getByTestId("local-mode-indicator")).toHaveTextContent(
      /data stays on this machine/i
    );
  });
});

describe("OllamaStatus", () => {
  it("renders connected state with models and default", async () => {
    mockedApiFetch.mockResolvedValue({
      ollama_reachable: true,
      models: ["llama3.2:1b", "qwen2.5:3b"],
      default_model: "llama3.2:1b",
    });

    render(<OllamaStatus />);

    await waitFor(() => {
      expect(screen.getByTestId("ollama-status")).toHaveTextContent(
        /Connected — 2 models available \(default: llama3.2:1b\)/
      );
    });
    expect(screen.getByTestId("local-mode-indicator")).toBeInTheDocument();
  });

  it("renders a setup hint when Ollama is not running", async () => {
    mockedApiFetch.mockResolvedValue({
      ollama_reachable: false,
      models: [],
      default_model: null,
    });

    render(<OllamaStatus />);

    await waitFor(() => {
      expect(screen.getByTestId("ollama-status")).toHaveTextContent(
        /Ollama not reachable/
      );
    });
    expect(screen.queryByTestId("local-mode-indicator")).not.toBeInTheDocument();
  });

  it("renders nothing when the status call fails", async () => {
    mockedApiFetch.mockRejectedValue(new Error("offline"));

    const { container } = render(<OllamaStatus />);
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
