import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { fetchDirections } from '../../services/maps_services/directionsService.js';
import MockAdapter from 'axios-mock-adapter';
import { before } from 'node:test';

describe('fetchDirections', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(axios as any);
        vi.clearAllMocks();
    });

    afterEach(() => {
        mock.reset();
    });

    it('should return null if no routes are found for a given transport mode', async () => {
        const mockResponse = {
            status: 'OK',
            routes: [
                {
                    "walking": [],
                    "driving": [
                        {
                            "legs": [
                                {
                                    "steps": [
                                        { "start_location": { "lat": 45.5017, "lng": -73.5673 }, "end_location": { "lat": 45.5017, "lng": -73.5673 } }
                                    ]
                                }
                            ]
                        }
                    ],
                    "bicycling": [],
                    "transit": []
                }
            ],
        };

        const origin = 'ChIJs0-pQ_FzhlQRi_OBm-qWkbs';
        const destination = 'ChIJOwg_06VPwokRYv534QaPC8g';

        mock.onGet('https://maps.googleapis.com/maps/api/directions/json').reply(200, mockResponse);
        const result = await fetchDirections(origin, destination);

        expect(result.walking).toBeNull();
    });
});