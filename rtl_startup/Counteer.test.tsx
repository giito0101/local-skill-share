import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Counter } from "./Counter";

test("click increments", async () => {
  render(<Counter />);
  const user = userEvent.setup();

  await user.click(screen.getByRole("button", { name: "+1" }));
  expect(screen.getByLabelText("count")).toHaveTextContent("1");
});
