import {describe, expect, test} from 'vitest';
import {calculateDistance} from '../../utils/distanceCalculation.js';
import { CONCORDIA_POINTS, getCoordinatesForPlaceId, isCampusPlaceId } from '../../services/maps_services/shuttleRouteService.js';
import { findNearestCampus } from '../../services/maps_services/shuttleRouteService.js';

describe('calculateDistance', () => {
    test('calculates distance between two points correctly', () => {
        const lat1 = 52.5200; 
        const lon1 = 13.4050;
        const lat2 = 48.8566; 
        const lon2 = 2.3522;

        const distance = calculateDistance(lat1, lon1, lat2, lon2);
        expect(distance).toBeCloseTo(877, 0); // Distance in km
    });

    test('returns 0 for the same coordinates', () => {
        const lat = 52.5200;
        const lon = 13.4050;

        const distance = calculateDistance(lat, lon, lat, lon);
        expect(distance).toBe(0);
    });
});

describe('isCampusPlaceId', () => {
    test('returns true for a valid LOYOLA place id', () => {
        const placeId = 'ChIJp3MoHy4XyUwRkr_5bwBScNw'; // Main Loyola ID
        expect(isCampusPlaceId(placeId, 'LOYOLA')).toBe(true);
      });

      test('returns false for an invalid LOYOLA place id', () => {
        const invalidPlaceId = 'InvalidPlaceId';
        expect(isCampusPlaceId(invalidPlaceId, 'LOYOLA')).toBe(false);
      });

      test('returns true for a valid SGW place id', () => {
        const validPlaceId = 'ChIJ19SC3jIbyUwRLPI2b48L-4k'; // Main SGW ID
        expect(isCampusPlaceId(validPlaceId, 'SGW')).toBe(true);
      });

      test('returns false if a valid LOYOLA place id is provided for SGW', () => {
        const validLoyolaPlaceId = 'ChIJp3MoHy4XyUwRkr_5bwBScNw';
        expect(isCampusPlaceId(validLoyolaPlaceId, 'SGW')).toBe(false);
      });

});

describe('getCoordinatesForPlaceId', () => {
    test('returns LOYOLA coordinates for a known LOYOLA place id', async () => {
      // Use a known LOYOLA campus place id
      const loyolaPlaceId = 'ChIJp3MoHy4XyUwRkr_5bwBScNw';
      const result = await getCoordinatesForPlaceId(loyolaPlaceId);
      expect(result).toEqual({
        lat: CONCORDIA_POINTS.LOYOLA.Latitude,
        lng: CONCORDIA_POINTS.LOYOLA.Longitude,
      });
    });

    test('returns SGW coordinates for a known SGW place id', async () => {
        // Use a known SGW campus place id
        const sgwPlaceId = 'ChIJ19SC3jIbyUwRLPI2b48L-4k';
        const result = await getCoordinatesForPlaceId(sgwPlaceId);
        expect(result).toEqual({
          lat: CONCORDIA_POINTS.SGW.Latitude,
          lng: CONCORDIA_POINTS.SGW.Longitude,
        });
      });

});

describe('findNearestCampus', () => {
    test('returns SGW campus when coordinate is exactly at SGW', () => {
      const { Latitude: lat, Longitude: lng } = CONCORDIA_POINTS.SGW;
      const result = findNearestCampus(lat, lng);
      expect(result).toEqual(CONCORDIA_POINTS.SGW);
    });

    test('returns LOYOLA campus when coordinate is exactly at LOYOLA', () => {
        const { Latitude: lat, Longitude: lng } = CONCORDIA_POINTS.LOYOLA;
        const result = findNearestCampus(lat, lng);
        expect(result).toEqual(CONCORDIA_POINTS.LOYOLA);
      });

      test('returns SGW campus when coordinate is closer to SGW than LOYOLA', () => {
        // Slightly offset from SGW campus
        const lat = CONCORDIA_POINTS.SGW.Latitude + 0.001; // slightly north of SGW
        const lng = CONCORDIA_POINTS.SGW.Longitude + 0.001; // slightly east of SGW
        const result = findNearestCampus(lat, lng);
        expect(result).toEqual(CONCORDIA_POINTS.SGW);
      });

      test('returns LOYOLA campus when coordinate is closer to LOYOLA than SGW', () => {
        // Slightly offset from LOYOLA campus
        const lat = CONCORDIA_POINTS.LOYOLA.Latitude - 0.001; // slightly south of LOYOLA
        const lng = CONCORDIA_POINTS.LOYOLA.Longitude - 0.001; // slightly west of LOYOLA
        const result = findNearestCampus(lat, lng);
        expect(result).toEqual(CONCORDIA_POINTS.LOYOLA);
      });
});





