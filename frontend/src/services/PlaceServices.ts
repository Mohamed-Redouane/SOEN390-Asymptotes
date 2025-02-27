export const fetchPlacePredictions = (searchQuery: string, location: any) => {
    return new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
        if (!searchQuery) {
            resolve([]);
            return;
        }

        const autocompleteService = new google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
            {
                input: searchQuery,
                types: ["establishment", "geocode"],
                componentRestrictions: { country: "CA" },// restricts the location 
                //TODO: use the user's location to restrict the search to the area around them
                locationBias: {
                    north: location ? (location.lat + 0.07) : 45.5049,
                    south: location ? location.lat - 0.07 : 45.4849,
                    east: location ? location.lng + 0.07 : -73.5679,
                    west: location ? location.lng - 0.07 : -73.5879
                } // focuses the search on this location instead of worldwide
            },
            (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    resolve(predictions);
                } else {
                    resolve([]);
                }
            }
        );
    });
};

export const fetchPlaceDetails = (placeId: string, description?: string) => {
    return new Promise<{ name: string; address: string, place_id: string, lat:number, lng: number }>((resolve, reject) => {
        const placesService = new google.maps.places.PlacesService(document.createElement("div"));
        placesService.getDetails({ placeId }, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                resolve({ 
                    name: place.name ||( description ?? ""), 
                    address: place.formatted_address ?? "",
                    place_id: place.place_id ?? "",
                    lat: place.geometry && place.geometry.location ? place.geometry.location.lat(): 0,
                    lng: place.geometry && place.geometry.location ? place.geometry.location.lng(): 0,
                });
                
            } else {
                reject("Failed to fetch place details.");
            }
        });
    });
};

export const fetchPlaceIDfromCoords = (location: {lat:number, lng:number}) => {
    return new Promise<string>((resolve, reject) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat: location.lat, lng: location.lng } }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results) {
                resolve(results[0].place_id);
            } else {
                reject("Failed to fetch place ID.");
            }
        });
    });

}

import { getPlacePredictions, getPlacesDetails} from '../api/mapsApi';
interface LocationType {
    name: string;
    address: string;
    place_id: string;
    lat: number;
    lng: number;
}

export async function getSuggestions(searchQuery: string, lat: number, lng: number) {
    const predictions = await getPlacePredictions(searchQuery, lat, lng, "Montreal");
    return predictions;
}

export async function getPlaceDetails(placeId: string) {
    const details = await getPlacesDetails(placeId);
    return details;
}


