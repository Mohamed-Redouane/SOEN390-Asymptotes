import { describe, it, expect } from "vitest";
import getCentral from "../../utils/CoordinateBuilding";

describe("getCentral Function", () => {
  it("should return the correct central point for given coordinates", () => {
    const coords = [
      { lat: 45.495, lng: -73.578 },
      { lat: 45.496, lng: -73.579 },
      { lat: 45.497, lng: -73.580 },
    ];

    const expectedCentral = {
      lat: (45.495 + 45.496 + 45.497) / 3,
      lng: (-73.578 + -73.579 + -73.580) / 3,
    };

    const result = getCentral(coords);
    expect(result).toEqual(expectedCentral);
  });

  it("should handle a single coordinate correctly", () => {
    const coords = [{ lat: 45.495, lng: -73.578 }];
    const expectedCentral = { lat: 45.495, lng: -73.578 };

    const result = getCentral(coords);
    expect(result).toEqual(expectedCentral);
  });
  
});
