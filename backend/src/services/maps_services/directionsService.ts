import axios from 'axios';


export const fetchDirections = async (source: string, destination: string, travelMode: string) => {

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: travelMode,
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        });

       

        if (response.data.status !== 'OK') {
            throw new Error('Error getting directions');
        }

        console.log("response from fetchDirections:" ,response.data.routes.length);
       

        return response.data.routes;
    } catch (error) {
        console.error('Error getting directions:', error);
        throw new Error('Error getting directions');
    }
}
