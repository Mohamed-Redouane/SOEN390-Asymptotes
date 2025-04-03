import {describe, expect, it} from "vitest";
import {getAddress, createInfoWindow} from "../../utils/infoBuilding";

describe("getAddress", () => {
    it("should return the address of a building", () => {
        const feature = {
            properties: {
                "addr:housenumber": "123",
                "addr:street": "Street",
                "addr:city": "Montreal",
                address: "456 Street, Montreal",
            },
        };
        expect(getAddress(feature)).toBe("456 Street, Montreal");
    });

    it('use existing address if available', () => {
        const feature = {
            properties: {
                address: "123 Street, Montreal",
            },
        };
        expect(getAddress(feature)).toBe("123 Street, Montreal");
    });

});

describe("createInfoWindow", () => {
    it("should return the HTML content for an info window", () => {
        const name = "Building";
        const address = "123 Street, Montreal";
        expect(createInfoWindow(name, address)).toBe(`
  <div class="max-w-[250px] bg-white rounded-lg p-3 shadow-md text-gray-800 font-sans">
    <h3 class="text-xl font-bold text-[#5A2DA2] mb-2">Building</h3>
    <p class="m-0">123 Street, Montreal</p>
    <button id = "get-directions-building-button" class="mt-3 rounded-lg bg-[#5A2DA2] text-white font-bold px-4 py-2 cursor-pointer hover:bg-[#4b29f1]">
      Get Directions
    </button>
  </div>
`);
    });
});