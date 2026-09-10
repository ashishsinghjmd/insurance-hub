import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates conflicting tailwind classes", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });

  it("handles falsy values", () => {
    expect(cn("foo", false, null, undefined, "")).toBe("foo");
  });
});
