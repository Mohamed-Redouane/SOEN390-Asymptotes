
import axios from 'axios';
import { orderRoutes } from '../../utils/orderRoutes.js';
import { trimRoutes } from '../../utils/trimRoutes.js';

const fetchDirectionsForMode = async (source: string, destination: string, mode: string) => {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode,
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        });

        if (response.data.status !== 'OK') {
            console.error(`No available ${mode} directions`);
            return null;
        } else {
            orderRoutes(response); // Function to order the routes by duration
            return response;
        }
    } catch (error) {
        console.error(`Error getting ${mode} directions:`, error);
        return null;
    }
};

export const fetchDirections = async (source: string, destination: string) => {
    try {
        const responseDriving = await fetchDirectionsForMode(source, destination, 'driving');
        const responseWalking = await fetchDirectionsForMode(source, destination, 'walking');
        const responseBicycling = await fetchDirectionsForMode(source, destination, 'bicycling');
        const responseTransit = await fetchDirectionsForMode(source, destination, 'transit');

        // If all were null, throw an error
        if (!responseDriving && !responseWalking && !responseBicycling && !responseTransit) {
            throw new Error('Error getting directions');
        }
        
        const response = {
            data: {
                walking: responseWalking ? responseWalking.data.routes : [],
                driving: responseDriving ? responseDriving.data.routes : [],
                bicycling: responseBicycling ? responseBicycling.data.routes : [],
                transit: responseTransit ?  trimRoutes(responseTransit) : [],
            },
        };

        return response.data;
    } catch (error) {
        console.error('Error getting directions:', error);
        throw new Error('Error getting directions');
    }
};