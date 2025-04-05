import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  CONCORDIA_POINTS,
  calculateDistance,
  isCampusPlaceId,
  getCoordinatesForPlaceId,
  findNearestCampus,
  isRouteBetweenConcordiaCampuses,
  generateShuttleRoute
} from '../../services/maps_services/shuttleRouteService.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('calculateDistance', () => {
  it('should return 0 for same coordinates', () => {
    const dist = calculateDistance(45, -73, 45, -73);
    expect(dist).toBeCloseTo(0);
  });

  it('should calculate a reasonable distance between Loyola and SGW', () => {
    const dist = calculateDistance(
      CONCORDIA_POINTS.LOYOLA.Latitude,
      CONCORDIA_POINTS.LOYOLA.Longitude,
      CONCORDIA_POINTS.SGW.Latitude,
      CONCORDIA_POINTS.SGW.Longitude
    );
    // Expected distance between campuses should be between 6 and 7 km (approx.)
    expect(dist).toBeGreaterThan(6);
    expect(dist).toBeLessThan(7);
  });
});

describe('isCampusPlaceId', () => {
  it('should return true for a valid Loyola place id', () => {
    const result = isCampusPlaceId("ChIJp3MoHy4XyUwRkr_5bwBScNw", 'LOYOLA');
    expect(result).toBe(true);
  });

  it('should return false for an invalid campus place id', () => {
    const result = isCampusPlaceId("InvalidID", 'LOYOLA');
    expect(result).toBe(false);
  });
});

describe('getCoordinatesForPlaceId', () => {
  it('should return Loyola coordinates for a known Loyola place id', async () => {
    const coords = await getCoordinatesForPlaceId("ChIJp3MoHy4XyUwRkr_5bwBScNw");
    expect(coords).toEqual({
      lat: CONCORDIA_POINTS.LOYOLA.Latitude,
      lng: CONCORDIA_POINTS.LOYOLA.Longitude
    });
  });

  it('should return SGW coordinates for a known SGW place id', async () => {
    const coords = await getCoordinatesForPlaceId("ChIJ19SC3jIbyUwRLPI2b48L-4k");
    expect(coords).toEqual({
      lat: CONCORDIA_POINTS.SGW.Latitude,
      lng: CONCORDIA_POINTS.SGW.Longitude
    });
  });

  it('should fetch and return coordinates for a non-campus place id', async () => {
    const mockData = {
      status: 'OK',
      result: {
        geometry: { location: { lat: 45.0, lng: -73.0 } }
      }
    };

    // Create a real Response object with the JSON data.
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

    // Mock global.fetch to return the Response.
    global.fetch = vi.fn(() => Promise.resolve(mockResponse)) as unknown as typeof fetch;

    const coords = await getCoordinatesForPlaceId("NonCampusID");
    expect(coords).toEqual({ lat: 45.0, lng: -73.0 });
  });

  it('should return null if fetching coordinates fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));
    const coords = await getCoordinatesForPlaceId("NonCampusID");
    expect(coords).toBeNull();
  });
});

describe('findNearestCampus', () => {
  it('should return SGW when location is closer to SGW', () => {
    // Coordinates slightly offset from SGW
    const coordsNearSGW = {
      lat: CONCORDIA_POINTS.SGW.Latitude + 0.001,
      lng: CONCORDIA_POINTS.SGW.Longitude + 0.001
    };
    const campus = findNearestCampus(coordsNearSGW.lat, coordsNearSGW.lng);
    expect(campus).toEqual(CONCORDIA_POINTS.SGW);
  });

  it('should return Loyola when location is closer to Loyola', () => {
    // Coordinates slightly offset from Loyola
    const coordsNearLoyola = {
      lat: CONCORDIA_POINTS.LOYOLA.Latitude - 0.001,
      lng: CONCORDIA_POINTS.LOYOLA.Longitude - 0.001
    };
    const campus = findNearestCampus(coordsNearLoyola.lat, coordsNearLoyola.lng);
    expect(campus).toEqual(CONCORDIA_POINTS.LOYOLA);
  });
});

describe('isRouteBetweenConcordiaCampuses', () => {
  it('should return false when both source and destination are near the same campus', async () => {
    // Both points are known Loyola place ids so they return the same coordinates.
    const result = await isRouteBetweenConcordiaCampuses(
      "ChIJp3MoHy4XyUwRkr_5bwBScNw",
      "ChIJk5Bx5kkXyUwRHLCpsk_QqeM"
    );
    expect(result).toBe(false);
  });

  it('should return true for a route between different campuses', async () => {
    // One point is a Loyola campus and the other is SGW.
    const result = await isRouteBetweenConcordiaCampuses(
      "ChIJp3MoHy4XyUwRkr_5bwBScNw",
      "ChIJ19SC3jIbyUwRLPI2b48L-4k"
    );
    expect(result).toBe(true);
  });

  it('should return false if coordinates cannot be fetched', async () => {
    // For non-campus IDs, simulate a fetch failure.
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));
    const result = await isRouteBetweenConcordiaCampuses("NonCampusID", "AnotherNonCampusID");
    expect(result).toBe(false);
  });
});

describe('generateShuttleRoute', () => {
  it('should return an empty array if coordinates cannot be fetched', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));
    const route = await generateShuttleRoute("NonCampusID", "AnotherNonCampusID");
    expect(route).toEqual([]);
  });

  it('should generate a valid shuttle route for valid campus place ids', async () => {
    const route = await generateShuttleRoute(
      "ChIJp3MoHy4XyUwRkr_5bwBScNw",
      "ChIJ19SC3jIbyUwRLPI2b48L-4k"
    );
    expect(Array.isArray(route)).toBe(true);
    expect(route.length).toBe(1);
    const shuttleRoute = route[0];

    // Verify that the route object has the expected properties.
    expect(shuttleRoute).toHaveProperty("bounds");
    expect(shuttleRoute).toHaveProperty("duration");
    expect(shuttleRoute).toHaveProperty("distance");
    expect(shuttleRoute).toHaveProperty("legs");
    expect(Array.isArray(shuttleRoute.legs)).toBe(true);
    expect(shuttleRoute.legs.length).toBeGreaterThan(0);
  });
});
