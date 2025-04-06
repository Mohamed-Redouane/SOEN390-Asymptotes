export const getAddress = (feature: any): string => {
  const houseNumber = feature?.properties?.["addr:housenumber"] ?? "";
  const street = feature?.properties?.["addr:street"] ?? "";
  const city = feature?.properties?.["addr:city"] ?? "";
  const fallback = `${houseNumber} ${street}, ${city}`.trim();
  return feature?.properties?.address ?? fallback;
};
//there is a whitespace in the test file infoBuilding.test.ts at "createInfoWindow" test : `<button id = "get-directions-building-button"`
export const createInfoWindow = (
  name: string,
  address: string
): string => `
  <div class="max-w-[250px] bg-white rounded-lg p-3 shadow-md text-gray-800 font-sans">
    <h3 class="text-xl font-bold text-[#5A2DA2] mb-2">${name}</h3>
    <p class="m-0">${address}</p>
    <div class= "flex flex-col items-center">
    <button id = "start-building-button" class=" w-32 mt-3 rounded-lg bg-[#5A2DA2] text-white font-bold px-2 py-1 cursor-pointer hover:bg-[#4b29f1]">
      Set as Start 
    </button>
    <button id = "destination-building-button" class="w-36 mt-3 rounded-lg bg-[#5A2DA2] text-white font-bold px-2 py-1 cursor-pointer hover:bg-[#4b29f1]">
      Set as Destination
    </button>
    </div>

  </div>
`;