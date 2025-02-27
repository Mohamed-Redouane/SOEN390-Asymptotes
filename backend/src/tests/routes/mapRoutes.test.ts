import express, { query } from 'express';
import mapRoutes from '../../routes/mapRoutes.js';
import { describe, test, expect, it, beforeEach } from 'vitest';
import request from 'supertest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { after } from 'node:test';

const app = express();
app.use(express.json());
app.use('/maps', mapRoutes);


describe('GET /maps/test', () => {
    test('should return 200 and "test works"', async () => {
        const response = await request(app).get('/maps/test');
        expect(response.status).toBe(200);
        expect(response.text).toBe('maps works');
    });
});

describe('GET /maps/placePredictions', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    after(() => {
        mock.restore();
    });

    it("should return detailed place predictions", async () => {
        const searchQuery = "Montreal";

        // Mock the autocomplete API response
        mock.onGet("https://maps.googleapis.com/maps/api/place/autocomplete/json").reply(200, {
            status: "OK",
            predictions: [
                {
                    place_id: "1234",
                    description: "Montreal, QC, Canada",
                },
            ],
        });

        // Mock the place details API response
        mock.onGet("https://maps.googleapis.com/maps/api/place/details/json").reply(200, {
            status: "OK",
            result: {
                name: "Montreal",
                formatted_address: "Montreal, QC, Canada",
                place_id: "1234",
                geometry: {
                    location: {
                        lat: 45.5017,
                        lng: -73.5673,
                    },
                },
            },
        });

        const response = await request(app).get("/maps/placesPredictions").query({ searchQuery });

        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                name: "Montreal",
                address: "Montreal, QC, Canada",
                place_id: "1234",
                lat: 45.5017,
                lng: -73.5673,
            },
        ]);
    });

    it("should return 400 if search query is missing", async () => {
        const response = await request(app).get("/maps/placesPredictions");
        expect(response.status).toBe(400);
        expect(response.text).toBe("Search query is required");
    });

    it("should retrun 500 if there was an error getting predictions", async () => {
        mock.onGet("https://maps.googleapis.com/maps/api/place/autocomplete/json").reply(500);
        const response = await request(app).get("/maps/placesPredictions").query({ searchQuery: "Montreal" });
        expect(response.status).toBe(500);
        expect(response.text).toBe("Error getting place predictions");
        }
    );
});

describe('GET /maps/placeDetails', () => {
    let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  after(() => {
    mock.reset();
  });

  it("should return place details", async () => {
    const placeId = "ChIJN1t_tDeuEmsRUsoyG83frY4";

    // Mock the API response
    mock.onGet("https://maps.googleapis.com/maps/api/place/details/json").reply(200, {
      status: "OK",
      result: {
        name: "Sydney Opera House",
        formatted_address: "Bennelong Point, Sydney NSW 2000, Australia",
        place_id: placeId,
        geometry: {
          location: {
            lat: -33.8568,
            lng: 151.2153,
          },
        },
      },
    });

    const response = await request(app).get("/maps/placeDetails").query({ placeId });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      name: "Sydney Opera House",
      address: "Bennelong Point, Sydney NSW 2000, Australia",
      place_id: placeId,
      lat: -33.8568,
      lng: 151.2153,
    });
  });

  it("should return 400 if placeId is missing", async () => {
    const response = await request(app).get("/maps/placeDetails");

    expect(response.status).toBe(400);
    expect(response.text).toBe("Place ID is required");
  });

  it("should return 500 if API response is not OK", async () => {
    const placeId = "InvalidID";

    mock.onGet("https://maps.googleapis.com/maps/api/place/details/json").reply(200, {
      status: "INVALID_REQUEST",
    });

    const response = await request(app).get("/maps/placeDetails").query({ placeId });

    expect(response.status).toBe(500);
    expect(response.text).toBe("Error getting place details");
  });

  it("should return 500 if API request fails", async () => {
    const placeId = "ChIJN1t_tDeuEmsRUsoyG83frY4";

    mock.onGet("https://maps.googleapis.com/maps/api/place/details/json").networkError();

    const response = await request(app).get("/maps/placeDetails").query({ placeId });

    expect(response.status).toBe(500);
    expect(response.text).toBe("Error getting place details");
  });
});

describe("GET /maps/directions", () => {
    let mock: MockAdapter;
  
    beforeEach(() => {
      mock = new MockAdapter(axios);
    });
  
    after(() => {
      mock.reset();
    });
  
    it("should return route directions", async () => {
      const source = "ChIJN1t_tDeuEmsRUsoyG83frY4"; // Example Place ID
      const destination = "ChIJsXU6z5lZwokRdsjKc_UGGWA"; // Example Place ID
      const travelMode = "driving";
  
      // Mock the API response
      mock.onGet("https://maps.googleapis.com/maps/api/directions/json").reply(200, {
        status: "OK",
        routes: [
          {
            summary: "Main Street",
            legs: [
              {
                start_address: "Start Location",
                end_address: "End Location",
                distance: { text: "5 km", value: 5000 },
                duration: { text: "10 mins", value: 600 },
              },
            ],
          },
        ],
      });
  
      const response = await request(app)
        .get("/maps/directions")
        .query({ source, destination, travelMode });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          summary: "Main Street",
          legs: [
            {
              start_address: "Start Location",
              end_address: "End Location",
              distance: { text: "5 km", value: 5000 },
              duration: { text: "10 mins", value: 600 },
            },
          ],
        },
      ]);
    });
  
    it("should return 400 if source or destination is missing", async () => {
      const response = await request(app).get("/maps/directions");
  
      expect(response.status).toBe(400);
      expect(response.text).toBe("Source, destination, and travel mode are required");
    });
  
    it("should return 500 if API response is not OK", async () => {
      const source = "ChIJN1t_tDeuEmsRUsoyG83frY4";
      const destination = "ChIJsXU6z5lZwokRdsjKc_UGGWA";
      const travelMode = "driving";
  
      mock.onGet("https://maps.googleapis.com/maps/api/directions/json").reply(200, {
        status: "ZERO_RESULTS",
      });
  
      const response = await request(app)
        .get("/maps/directions")
        .query({ source, destination, travelMode });
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("Error getting directions");
    });
  
    it("should return 500 if API request fails", async () => {
      const source = "ChIJN1t_tDeuEmsRUsoyG83frY4";
      const destination = "ChIJsXU6z5lZwokRdsjKc_UGGWA";
      const travelMode = "driving";
  
      mock.onGet("https://maps.googleapis.com/maps/api/directions/json").networkError();
  
      const response = await request(app)
        .get("/maps/directions")
        .query({ source, destination, travelMode });
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("Error getting directions");
    });
  });
