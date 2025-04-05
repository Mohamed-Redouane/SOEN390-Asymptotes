import axios from 'axios';
import { orderRoutes } from '../../utils/orderRoutes.js';
import { trimRoutes } from '../../utils/trimRoutes.js';
import { isRouteBetweenConcordiaCampuses, generateShuttleRoute } from './shuttleRouteService.js';

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

const isShuttleEligible = (source: string, destination: string): boolean => {
    // List of known Concordia campus place IDs
    const concordiaCampusIds = [
        'ChIJ19SC3jIbyUwRLPI2b48L-4k',  // SGW
        'ChIJp3MoHy4XyUwRkr_5bwBScNw',  // Loyola
        'ChIJCT3qZGoayUwRmPk37VHZSRY',  // Another SGW variant
        'ChIJk5Bx5kkXyUwRHLCpsk_QqeM',  // Another Loyola variant
        'ChIJOx0fzmsayUwR_rq19AxGGm8'   // Another SGW variant
    ];

    // Check if both source and destination are Concordia campuses
    const isSourceCampus = concordiaCampusIds.includes(source);
    const isDestinationCampus = concordiaCampusIds.includes(destination);
    
    console.log('Checking if is Concordia campus route:', isSourceCampus && isDestinationCampus, 'for', source, destination);
    
    return isSourceCampus && isDestinationCampus;
};

export const fetchDirections = async (source: string, destination: string) => {
    try {
        console.log('Fetching directions from', source, 'to', destination);

        const responseDriving = await fetchDirectionsForMode(source, destination, 'driving');
        const responseWalking = await fetchDirectionsForMode(source, destination, 'walking');
        const responseBicycling = await fetchDirectionsForMode(source, destination, 'bicycling');
        const responseTransit = await fetchDirectionsForMode(source, destination, 'transit');

        // If all were null, throw an error
        if (!responseDriving && !responseWalking && !responseBicycling && !responseTransit) {
            throw new Error('Error getting directions');
        }
        
        // Check if route is between Concordia campuses and generate shuttle route if applicable
        const isEligible = await isRouteBetweenConcordiaCampuses(source, destination);
        console.log('Is shuttle eligible?', isEligible, 'for route from', source, 'to', destination);
        
        let shuttleRoutes: any[] = [];
        
        // Generate shuttle route if eligible
        if (isEligible) {
            console.log('Generating shuttle route for eligible route');
            shuttleRoutes = await generateShuttleRoute(source, destination);
        }
        
        console.log('Generated shuttle routes:', shuttleRoutes.length > 0 ? 'Yes' : 'No');
        
        const response = {
            data: {
                walking: responseWalking ? responseWalking.data.routes : [],
                driving: responseDriving ? responseDriving.data.routes : [],
                bicycling: responseBicycling ? responseBicycling.data.routes : [],
                transit: responseTransit ? trimRoutes(responseTransit) : [],
                shuttle: shuttleRoutes,
            },
        };

        return response.data;
    } catch (error) {
        console.error('Error getting directions:', error);
        throw new Error('Error getting directions');
    }
};