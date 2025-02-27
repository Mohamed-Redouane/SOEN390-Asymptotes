import { Router, Request, Response } from 'express';
import axios from 'axios';
import { L } from 'vitest/dist/chunks/reporters.QZ837uWx.js';
import { resolve } from 'path';
const router = Router();

interface LocationType {
    name: string;
    address: string;
    place_id: string;
    lat: number;
    lng: number;
}
router.get('/placesPredictions', async (req, res) => {

    try {
        const query = req.query.searchQuery;
        const lat = 45.5017;
        const lng = -73.5673;
        const radiusBound = 40000;

        if (!query) {
            res.status(400).send('Search query is required');
            return;
        }

        const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
            params: {
                input: query,
                key: process.env.GOOGLE_MAPS_API_KEY,
                types: ["establsihment", "geocode"],
                location: `${lat},${lng}`,
                radius: radiusBound,
                components: "country:ca",
            },
        });

        if (response.data.status !== 'OK') {
            res.status(500).send('Error getting place predictions');
            return;
        }

        const predictions = response.data.predictions

        const detailedPredictions = await Promise.all(predictions.map(async (prediction: { place_id: string; description: string }) => {
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
        }));


        res.json(detailedPredictions);
    } catch (error) {
        console.error('Error getting place predictions:', error);
        res.status(500).send('Error getting place predictions');
    }

    // res.send('Predictions');
}
);

router.get('/placeDetails', async (req, res) => {
    try {
        const id = req.query.placeId;
        if (!id) {
            res.status(400).send('Place ID is required');
            return;
        }

        const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
                place_id: id,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        });

        if (response.data.status !== 'OK') {
            res.status(500).send('Error getting place details');
            return;
        }

        const place = response.data.result;

        res.json({
            name: place.name,
            address: place.formatted_address,
            place_id: place.place_id,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
        });
    } catch (error) {
        console.error('Error getting place details:', error);
        res.status(500).send('Error getting place details');
    }
});

router.get('/directions', async (req, res) => {
    try {
        const source = req.query.source;
        const destination = req.query.destination;
        const travelMode = req.query.travelMode || 'driving';

        if (!source || !destination || !travelMode) {
            res.status(400).send('Source, destination, and travel mode are required');
            return;
        }

        const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: travelMode,
                key: process.env.GOOGLE_MAPS_API_KEY,
                provideRouteAlternatives: true,
            },
        });
  
            if (response.data.status !== 'OK') {
                res.status(500).send('Error getting directions');
                return;
            }
            const routes = response.data.routes;

           
    

       
     
        res.json(routes);
    } catch (error) {
        console.error('Error getting directions:', error);
        res.status(500).send('Error getting directions');
    }
}
)
export default router;