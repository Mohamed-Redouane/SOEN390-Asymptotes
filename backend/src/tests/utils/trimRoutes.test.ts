import {describe, expect, test} from 'vitest';
import {trimRoutes} from '../../utils/trimRoutes.js';

describe('trimRoutes() function', () => {
    test("should return an array of 3 routes for arrays that are too long", () => {
        const directions = {
            data: {
                routes: [
                    {duration: 100},
                    {duration: 200},
                    {duration: 300},
                    {duration: 400},
                    {duration: 500},
                ],
            },
        }

        const result = trimRoutes(directions);
        expect(result).toHaveLength(3);

    });
    test('should return the same array for arrays that are already of length <= 3', () => {
        const directions = {
            data: {
                routes: [
                    {duration: 100},
                    {duration: 200},
                    {duration: 300},
                ],
            },
        }

        const result = trimRoutes(directions);
        expect(result).toEqual(directions.data.routes);
    });
});