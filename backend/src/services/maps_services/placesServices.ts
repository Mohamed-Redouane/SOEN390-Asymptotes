import axios from 'axios';

const lat = 45.5017;
const lng = -73.5673;
const radiusBound = 40000;

export const fetchPlaceDetails = async (placeId: string) => {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
                place_id: placeId,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        });

        if (response.data.status !== 'OK') {
            throw new Error('Error getting place details');
        }

        const place = response.data.result;

        return {
            name: place.name,
            address: place.formatted_address,
            place_id: place.place_id,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
        };
    } catch (error) {
        console.error('Error getting place details:', error);
        throw new Error('Error getting place details');
    }
};

export const fetchPlacePredictions = async (searchQuery: string) => {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
            params: {
                input: searchQuery,
                key: process.env.GOOGLE_MAPS_API_KEY,
                types: ["establishment", "geocode"], // Fixed typo: "establishment"
                location: `${lat},${lng}`,
                radius: radiusBound,
                components: "country:ca",
            },
        });

        if (response.data.status !== 'OK') {
            throw new Error('Error getting place predictions');
        }

        const predictions = response.data.predictions;

        const detailedPredictions = await Promise.all(
            predictions.map(async (prediction: { place_id: string; description: string }) => {
                const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
                    params: {
                        place_id: prediction.place_id,
                        key: process.env.GOOGLE_MAPS_API_KEY,
                    },
                });

                if (detailsResponse.data.status !== 'OK') {
                    throw new Error('Error getting place details');
                }

                const place = detailsResponse.data.result;

                return {
                    name: place.name,
                    address: place.formatted_address,
                    place_id: place.place_id,
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng,
                };
            })
        );

        return detailedPredictions;
    } catch (error) {
        console.error('Error getting place predictions:', error);
        throw new Error('Error getting place predictions');
    }
};