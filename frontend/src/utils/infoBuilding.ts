export const getAddress = (feature: any): string => {
    const houseNumber = feature.properties["addr:housenumber"] || "";
    const street = feature.properties["addr:street"] || "";
    const city = feature.properties["addr:city"] || "";
    return feature.properties.address || `${houseNumber} ${street}, ${city}`.trim();
}

export const createInfoWindow = (
    name: string,
    address: string
): string => `
  <div class="max-w-[250px] bg-white rounded-lg p-3 shadow-md text-gray-800 font-sans">
    <h3 class="text-xl font-bold text-[#5A2DA2] mb-2">${name}</h3>
    <p class="m-0">${address}</p>
    <button id = "get-directions-building-button" class="mt-3 rounded-lg bg-[#5A2DA2] text-white font-bold px-4 py-2 cursor-pointer hover:bg-[#4b29f1]">
      Get Directions
    </button>
  </div>
`;