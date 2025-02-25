import { describe, it, expect } from "vitest";
import { distanceCalculation } from "../../utils/distanceCalculation";

describe("distanceCalculation", () => {
  it("should return 0 when both coordinates are identical", () => {
    const d = distanceCalculation(40, -74, 40, -74);
    expect(d).toBe(0);
  });

  it("should calculate the distance between New York City and London correctly", () => {
    // New York City (40.7128, -74.0060) and London (51.5074, -0.1278)
    const d = distanceCalculation(40.7128, -74.0060, 51.5074, -0.1278);
    // Expected distance is approximately 5570 km.
    expect(d).toBeCloseTo(5570, 0);
  });

  it("should calculate ~111.2 km for a 1° longitude difference at the equator", () => {
    const d = distanceCalculation(0, 0, 0, 1);
    expect(d).toBeCloseTo(111.2, 1);
  });

  it("should calculate ~111.2 km for a 1° latitude difference at the equator", () => {
    const d = distanceCalculation(0, 0, 1, 0);
    expect(d).toBeCloseTo(111.2, 1);
  });
});
