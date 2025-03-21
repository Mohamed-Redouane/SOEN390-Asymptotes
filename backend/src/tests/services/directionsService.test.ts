import {describe,  it, beforeEach, afterEach, vi, expect} from 'vitest';
import { fetchDirections } from '../../services/maps_services/directionsService.js';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

describe('fetchDirections function in directionsService,js', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(axios as any);
        vi.clearAllMocks(); // Clear mocks before each test
    });

    afterEach(() => {
        mock.reset(); // Reset mock after each test
    });

    it('fetches directions properly given source and destination ', async () => {
        const source = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
        const destination = 'ChIJsXU6z5lZwokRdsjKc_UGGWA';
       
        const mockDrivingResponse = {
            status: 'OK',
            routes: [
                {
                    legs: [
                        {
                            duration: { value: 400 },
                            distance: { value: 500 },
                        },
                    ],
                },
            ],
        };

        const mockWalkingResponse = {
            status: 'OK',
            routes: [
                {
                    legs: [
                        {
                            duration: { value: 400 },
                            distance: { value: 500},
                        },
                    ],
                },
            ],
        };

        const mockBicyclingResponse = {
            status: 'OK',
            routes: [
                {
                    legs: [
                        {
                            duration: { value: 400 },
                            distance: { value: 500 },
                        },
                    ],
                },
            ],
        };

        const mockTransitResponse = {
            status: 'OK',
            routes: [
                {
                    legs: [
                        {
                            duration: { value: 400 },
                            distance: { value: 500 },
                        },
                    ],
                },
            ],
        };

        const mockResponse = {
            status:'OK',
            routes: {
                "driving": mockDrivingResponse.routes,
                "walking": mockWalkingResponse.routes,
                "bicycling": mockBicyclingResponse.routes,
                "transit": mockTransitResponse.routes,
            }
        }
        // mock the four requests the function makes
        mock.onGet('https://maps.googleapis.com/maps/api/directions/json').reply(200, mockDrivingResponse);
        mock.onGet('https://maps.googleapis.com/maps/api/directions/json').reply(200, mockWalkingResponse);
        mock.onGet('https://maps.googleapis.com/maps/api/directions/json').reply(200, mockBicyclingResponse);
        mock.onGet('https://maps.googleapis.com/maps/api/directions/json').reply(200, mockTransitResponse);

        const respone = await fetchDirections(source, destination);
        expect(mock.history.get.length).toBe(4); // One for each mode
        expect(respone).toEqual(mockResponse.routes);

    });


    it('should return a null array when the max length of routes was exceeded', async () => {
        const source = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
        const destination = 'ChIJsXU6z5lZwokRdsjKc_UGGWA';

        const mockBicyclingResponse = {
            status: 'MAX_ROUTE_LENGTH_EXCEEDED',
            routes: [],
        };

        const mockDrivingResponse = {
            status: 'OK',
            routes: [
                {
                    legs: [
                        {
                            duration: { value: 2039},
                            distance: { value: 500 },
                        },
                    ],
                },
            ],
        };

        const mockTransitResponse = {
            status: 'OK',
            routes: [
                {
                    legs: [
                        {
                            duration: { value: 400 },
                            distance: { value: 500 },
                        },
                    ],
                },
            ],
        };

        const mockWalkingResponse = {
            status: 'OK',
            routes: [
                {
                    legs: [
                        {
                            duration: { value: 20 },
                            distance: { value: 511},
                        },
                    ],
                },
            ],
        };

        const mockResponse = {
            status:'OK',
            routes: {
                "driving": mockDrivingResponse.routes,
                "walking": mockWalkingResponse.routes,
                "bicycling": mockBicyclingResponse.routes,
                "transit": mockTransitResponse.routes,
            }
        }

    
        mock.onGet('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'driving',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        }).reply(200, mockDrivingResponse);

        mock.onGet('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'walking',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        }).reply(200, mockWalkingResponse);

        mock.onGet('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'bicycling',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        }).reply(200, mockBicyclingResponse);

        mock.onGet('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'transit',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        }).reply(200, mockTransitResponse);

        const response = await fetchDirections(source, destination);
        expect(mock.history.get.length).toBe(4); // One for each mode
        expect(response).toEqual(mockResponse.routes);
        console.log("response in directions test", response.bicycling);
    });

    it('should throw an error when the directions API fails', async () => {
        const source = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
        const destination = 'ChIJsXU6z5lZwokRdsjKc_UGGWA';

        const mockBicyclingResponse = {
            status: 'MAX_ROUTE_LENGTH_EXCEEDED',
            routes: [],
        };

        const mockDrivingResponse = {
            status: 'BAD_REQUEST',
            routes: [],
        };

        const mockTransitResponse = {
            status: 'BAD_REQUEST',
            routes: [],
        };

        const mockWalkingResponse = {
            status: 'BAD_REQUEST',
            routes: [],
        };


        mock.onGet('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'driving',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        }).reply(200, mockDrivingResponse);

        mock.onGet('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'walking',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        }).reply(200, mockWalkingResponse);

        mock.onGet('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'bicycling',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        }).reply(200, mockBicyclingResponse);

        mock.onGet('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `place_id:${source}`,
                destination: `place_id:${destination}`,
                mode: 'transit',
                key: process.env.GOOGLE_MAPS_API_KEY,
                alternatives: true,
            },
        }).reply(200, mockTransitResponse);


        await expect(fetchDirections(source, destination)).rejects.toThrow('Error getting directions');
        
    });

    it('should trim the list of transit routes when it is longer than 3', async () => {
        const source = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
        const destination = 'ChIJsXU6z5lZwokRdsjKc_UGGWA';

        const mockResponse = {
            status: 'OK',
            routes: [
                {
                    legs: [
                        {
                            duration: { value: 400 },
                            distance: { value: 500 },
                        },
                    ],
                },
            ],
        }
        const mockTransitResponse = {
            status: 'OK',
            routes: [
                {
                    legs: [
                        {
                            duration: { value: 400 },
                            distance: { value: 500 },
                        },
                    ],
                },
                {
                    legs: [
                        {
                            duration: { value: 400 },
                            distance: { value: 500 },
                        },
                    ],
                },
                {
                    legs: [
                        {
                            duration: { value: 400 },
                            distance: { value: 500 },
                        },
                    ],
                },
                {
                    legs: [
                        {
                            duration: { value: 400 },
                            distance: { value: 500 },
                        },
                    ],
                },
            ],
        };

        //mock the four requests the function makes
        mock.onGet('https://maps.googleapis.com/maps/api/directions/json').reply(200, mockResponse);
        mock.onGet('https://maps.googleapis.com/maps/api/directions/json').reply(200, mockResponse);
        mock.onGet('https://maps.googleapis.com/maps/api/directions/json').reply(200, mockResponse);
        mock.onGet('https://maps.googleapis.com/maps/api/directions/json').reply(200, mockTransitResponse); // the last is the transit request

        const response = await fetchDirections(source, destination);
        expect(mock.history.get.length).toBe(4); // One for each mode
        expect(response.transit.length).toBe(3);
    });

    it('should not trim the transit routes if they are <= 3', async () => {
        const source = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
        const destination = 'ChIJsXU6z5lZwokRdsjKc_UGGWA';

        const mockResponse = {
            status: 'OK',
            routes: [
                {
                    legs: [
                        {
                            duration: { value: 400 },
                            distance: { value: 500 },
                        },
                    ],
                },
                {
                    legs: [
                        {
                            duration: { value: 400 },
                            distance: { value: 500 },
                        },
                    ],
                }
            ],
        }

        mock.onGet('https://maps.googleapis.com/maps/api/directions/json').reply(200, mockResponse);
        mock.onGet('https://maps.googleapis.com/maps/api/directions/json').reply(200, mockResponse);
        mock.onGet('https://maps.googleapis.com/maps/api/directions/json').reply(200, mockResponse);
        mock.onGet('https://maps.googleapis.com/maps/api/directions/json').reply(200, mockResponse);

        const response = await fetchDirections(source, destination);
        expect(mock.history.get.length).toBe(4); // One for each mode
        expect(response.transit).toEqual(mockResponse.routes);
    });


});
