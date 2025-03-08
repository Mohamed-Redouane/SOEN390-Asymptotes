import { getDirections } from '../api/mapsApi';

interface LocationType {
   name: string;
   address: string;
   place_id: string;
   lat: number;
   lng: number;
}


export async function fetchDirections(source: LocationType, destination: LocationType) {
   const directions = await getDirections(source.place_id, destination.place_id);
   return directions;
}
