import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { fetchPlacePredictions } from '../../services/maps_services/placesServices.js';
import MockAdapter from 'axios-mock-adapter';




describe('fetchPlacesPredictions', () => {
    let mock: MockAdapter;

    beforeEach(() => {

        mock = new MockAdapter(axios as any);
        vi.clearAllMocks(); // Clear mocks before each test
    });

    afterEach(() => {
        mock.reset(); // Reset mock after each test
    });

    it('should return place predictions successfully', async () => {
        const mockAutocompleteResponse = {

            status: 'OK',
            predictions: [
                { place_id: 'place_123', description: 'Place 1' },
                { place_id: 'place_456', description: 'Place 2' },
            ],

        };

        const mockDetailsResponse = {

            status: 'OK',
            result: {
                name: 'Test Place',
                formatted_address: '123 Test St',
                place_id: 'place_123',
                geometry: { location: { lat: 45.5017, lng: -73.5673 } },
            },

        };

        // Mock the autocomplete API response
        mock.onGet('https://maps.googleapis.com/maps/api/place/autocomplete/json').reply(200, mockAutocompleteResponse);
        mock.onGet('https://maps.googleapis.com/maps/api/place/details/json').reply(200, mockDetailsResponse);
        mock.onGet('https://maps.googleapis.com/maps/api/place/details/json').reply(200, mockDetailsResponse);

        const searchQuery = 'test';
        const result = await fetchPlacePredictions(searchQuery);

        expect(mock.history.get.length).toBe(3); // One for predictions, two for details
        expect(result).toEqual([
            {
                name: 'Test Place',
                address: '123 Test St',
                place_id: 'place_123',
                lat: 45.5017,
                lng: -73.5673,
            },
            {
                name: 'Test Place',
                address: '123 Test St',
                place_id: 'place_123',
                lat: 45.5017,
                lng: -73.5673,
            },
        ]);
    });

    it('should throw an error when predictions API returns a failure', async () => {
        mock.onGet('https://maps.googleapis.com/maps/api/place/autocomplete/json').reply(500);
        await expect(fetchPlacePredictions('test')).rejects.toThrow('Error getting place predictions');
    });

    it('should throw an error when place details API fails', async () => {
        mock.onGet('https://maps.googleapis.com/maps/api/place/autocomplete/json').reply(200, {
            status: 'OK',
            predictions: [{ place_id: 'place_123', description: 'Place 1' }],
        });
        mock.onGet('https://maps.googleapis.com/maps/api/place/details/json').reply(500);
        await expect(fetchPlacePredictions('test')).rejects.toThrow('Error getting place predictions');
    });
});
