import { Router, Request, Response } from 'express';
import axios from 'axios';
const router = Router();
import { fetchDirections } from '../services/maps_services/directionsService.js';
import { fetchPlaceDetails, fetchPlacePredictions } from '../services/maps_services/placesServices.js';

interface LocationType {
    name: string;
    address: string;
    place_id: string;
    lat: number;
    lng: number;
}
router.get('/placesPredictions', async (req, res) => {
    try{
        const searchQuery = req.query.searchQuery as string;

        if(!searchQuery){
            res.status(400).send('Search query is required');
            return;
        }

        const predictions = await fetchPlacePredictions(searchQuery);
        res.json(predictions);

    }catch(error){
        if (error instanceof Error) {
            res.status(500).send(error.message);
        } else {
            res.status(500).send('Error getting suggestions');
        }
    };
    }
);

router.get('/placeDetails', async (req, res) => {
    try {
        const placeId = req.query.placeId as string;
        if (!placeId) {
            res.status(400).send('Place ID is required');
            return;
        }
        const placeDetails = await fetchPlaceDetails(placeId);
        res.json(placeDetails);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).send(error.message);
        } else {
            res.status(500).send('Error getting place details');
        }

    }
});

router.get('/directions', async (req, res) => {
    try {
        const source = req.query.source as string;
        const destination = req.query.destination as string;

        if (!source || !destination) {
            res.status(400).send('Source, destination, and travel mode are required');
            return;
        }

        const response = await fetchDirections(source, destination);
        res.json(response);
    } catch (error) {
        console.error('Error getting directions:', error);
        res.status(500).send('Error getting directions');
    }
}
)



router.get('/test', (_req: Request, res: Response) => {
    res.send('maps works');
});
export default router;