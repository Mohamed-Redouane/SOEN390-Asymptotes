import axios from 'axios';
import { orderRoutes } from '../../utils/orderRoutes.js';


export const fetchDirections = async (source: string, destination: string) => {

    try {
        let responseDriving = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'driving',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        });

        if (responseDriving.data.status !== 'OK') {
            throw new Error('Error getting directions');
        }
        responseDriving = orderRoutes(responseDriving);

        let responseWalking = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'walking',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        });

        if (responseWalking.data.status !== 'OK') {
            throw new Error('Error getting directions');
        }

        responseWalking = orderRoutes(responseWalking);


        let responseBicycling = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'bicycling',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        });

        if (responseBicycling.data.status !== 'OK') {
            throw new Error('Error getting directions');
        }

        responseBicycling = orderRoutes(responseBicycling);
        let responseTransit = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'transit',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        });

        if (responseTransit.data.status !== 'OK' || responseBicycling.data.status !== 'OK' || responseWalking.data.status !== 'OK' || responseDriving.data.status !== 'OK') {
            throw new Error('Error getting directions');
        }

        responseTransit = orderRoutes(responseTransit);

        const response = {
            data: {
                walking: responseWalking.data.routes,
                driving: responseDriving.data.routes,
                bicycling: responseBicycling.data.routes,
                transit: responseTransit.data.routes,
            },
        };


        console.log("response from fetchDirections:" ,response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting directions:', error);
        throw new Error('Error getting directions');
    }
}
