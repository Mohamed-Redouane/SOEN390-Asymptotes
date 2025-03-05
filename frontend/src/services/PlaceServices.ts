

import { getPlacePredictions, getPlacesDetails} from '../api/mapsApi';
    // interface LocationType {
    //     name: string;
    //     address: string;
    //     place_id: string;
    //     lat: number;
    //     lng: number;
    // }

export async function getSuggestions(searchQuery: string, lat: number, lng: number) {
    const predictions = await getPlacePredictions(searchQuery, lat, lng, "Montreal");
    return predictions;
}

export async function getPlaceDetails(placeId: string) {
    const details = await getPlacesDetails(placeId);
    return details;
}


