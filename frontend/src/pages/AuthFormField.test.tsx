import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormField } from "./Auth";

const renderField = (type?: string) =>
  render(
    <FormField
      id="test-password"
      label="Password"
      type={type ?? "password"}
      placeholder="Enter password"
      value=""
      onChange={() => {}}
      icon="lock"
    />
  );

describe("FormField password reveal", () => {
  it("starts masked as a password input", () => {
    renderField();
    const input = screen.getByLabelText("Password") as HTMLInputElement;
    expect(input.type).toBe("password");
    expect(screen.queryByRole("button", { name: "Hide password" })).not.toBeInTheDocument();
  });

  it("reveals and re-hides the value on toggle", () => {
    renderField();
    const input = screen.getByLabelText("Password") as HTMLInputElement;

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input.type).toBe("password");
    expect(screen.getByRole("button", { name: "Show password" })).toHaveAttribute("aria-pressed", "false");
  });

  it("renders no toggle for non-password fields", () => {
    renderField("text");
    expect(screen.queryByRole("button", { name: "Show password" })).not.toBeInTheDocument();
  });
});
