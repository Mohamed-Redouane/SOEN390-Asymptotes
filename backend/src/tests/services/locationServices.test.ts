import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { fetchAddressFromCoordinates } from '../../services/maps_services/locationServices.js';

describe('fetchAddressFromCoordinates', () => {
    it('should return formatted address and place_id for valid coordinates', async() => {
        //mock successful repsonse
        const mockResponse = {
            status: 'OK',
            results: [
                {
                    formatted_address: '123 Main St, Montreal, QC, Canada',
                    place_id: 'ChIJ1234567890',
                    geometry: {
                        location: {
                            lat: 45.5049,
                            lng: -73.5779,
                        },
                    },
                    types: ['street_address'],
                },
            ],
        };

        vi.spyOn(axios, 'get').mockResolvedValue({ data: mockResponse });

        const result = await fetchAddressFromCoordinates(45.5049, -73.5779);

        expect(result).toEqual({
            formatted_address: '123 Main St, Montreal, QC, Canada',
            place_id: 'ChIJ1234567890',
        });

        expect(axios.get).toHaveBeenCalledWith('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: '45.5049,-73.5779',
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        });
    });

    it('should throw an error if no address is found', async () => {

        const mockResponse = {
            status: 'ZERO_RESULTS',
            results: [],
        }

        vi.spyOn(axios, 'get').mockResolvedValue( { data: mockResponse });

        await expect(fetchAddressFromCoordinates(45.5049, -73.5779)).rejects.toThrow(
            'No address found for the given coordinates.'
        );
    });

    it('should throw an error if API response status is not OK or ZERO_RESULTS', async () => {
        const mockResponse = {
            status: 'REQUEST_DENIED',
            results: [],
        };

        vi.spyOn(axios, 'get').mockResolvedValue({ data: mockResponse });

        await expect(fetchAddressFromCoordinates(45.5049, -73.5779)).rejects.toThrow(
            'Failed to fetch address.'
        );
    });

    it('should throw an error when API call fails', async () => {
        vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));

        await expect(fetchAddressFromCoordinates(45.5049, -73.5779)).rejects.toThrow(
            'Network Error'
        );
    });

    it('should throw a generic error if the caught error is not an instance of Error', async () => {
        vi.spyOn(axios, 'get').mockRejectedValue('Unexpected error');
    
        await expect(fetchAddressFromCoordinates(45.5049, -73.5779)).rejects.toThrow(
            'Failed to fetch address.'
        );
    });
});