import { describe, expect, it } from "vitest";
import { canTransition, sourcesFor } from "./reviews.ts";

describe("review transitions", () => {
  it("only lets a pending review be decided, and never changes a decided one", () => {
    expect(canTransition("pending", "approved")).toBe(true);
    expect(canTransition("pending", "rejected")).toBe(true);
    expect(canTransition("approved", "rejected")).toBe(false);
    expect(sourcesFor("approved")).toEqual(["pending"]);
  });
});
