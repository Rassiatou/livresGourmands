import { describe, expect, it } from "vitest";
import { toCuisineCategoryLabel } from "./cuisineCategories";

describe("toCuisineCategoryLabel", () => {
  it("returns mapped label for known id", () => {
    expect(toCuisineCategoryLabel(2)).toBe("Cuisine du monde");
  });

  it("uses fallback for unknown id", () => {
    expect(toCuisineCategoryLabel(99, "Autres livres")).toBe("Autres livres");
  });
});
