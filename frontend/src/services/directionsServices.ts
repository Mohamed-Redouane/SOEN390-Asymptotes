interface LocationType {
   name: string;
   address: string;
   place_id: string;
   lat: number;
   lng: number;
}


import { getDirections } from '../api/mapsApi';
export async function fetchDirections(source: LocationType, destination: LocationType, travelMode: string) {
   const directions = await getDirections(source.place_id, destination.place_id, travelMode);
   return directions;
}
