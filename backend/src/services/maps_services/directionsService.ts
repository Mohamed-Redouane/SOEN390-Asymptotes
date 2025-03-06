import axios from 'axios';
import { orderRoutes } from '../../utils/orderRoutes.js';
import fs from 'fs';

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
        }).then((response) => {
            if(response.data.status !== 'OK'){
                console.error('No available driving directions');
                return null;
            }else{
                orderRoutes(response); //function to order the routes by duration
                return response;
            }
        });
      

        const responseWalking = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'walking',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        }).then((response) => {
            if (response.data.status !== 'OK'){
                console.error('No available walking directions');
                return null;
            }else{
                orderRoutes(response); //function to order the routes by duration
                return response;
            }
        });


        const responseBicycling = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'bicycling',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        }).then((response) => {
            if (response.data.status !== 'OK'){
                console.error('No available bicycling directions');
                return null;
            }else{
                orderRoutes(response); //function to order the routes by duration
                return response;
            }
        });
         
       
        const responseTransit = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'transit',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        }).then((response) => {
            if (response.data.status !== 'OK'){
                console.error('Error getting transit directions');
                return null;
            }else{
                orderRoutes(response); //function to order the routes by duration
                return response;
            }
        });

        //if all were null, throw an error
        if (!responseDriving && !responseWalking && !responseBicycling && !responseTransit) {
            throw new Error('Error getting directions');
        }
        const response = {

            //if the response is null just return an empty array otherwise return the routes
            data: {
                walking: responseWalking? responseWalking.data.routes : [],
                driving: responseDriving? responseDriving.data.routes : [],
                bicycling: responseBicycling ? responseBicycling.data.routes : [],
                transit: responseTransit ? responseTransit.data.routes : [],
            },
        };

        console.log("response from fetchDirections:" ,response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting directions:', error);
        throw new Error('Error getting directions');
    }
}
