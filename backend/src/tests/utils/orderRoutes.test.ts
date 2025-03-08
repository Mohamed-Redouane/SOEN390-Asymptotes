import {describe, expect, test} from 'vitest';
import {orderRoutes} from '../../utils/orderRoutes.js';

describe('orderRoutes function', () => {
    test('orders routes by their duration', () => {
        const route = {
            status: 'OK',
            data: {
            routes: [
                {
                    legs: [
                        {
                            duration: {
                                value:200
                            }
                        }
                    ]
                },
                {
                    legs: [
                        {
                            duration: {
                                value: 100
                            }
                        }
                    ]
                }
                ,{
                    legs: [
                        {
                            duration: {
                                value: 50
                            }
                        }
                    ]
                },
                {
                    legs: [
                        {
                            duration: {
                                value: 250
                            }
                        }
                    ]
                }
            ]
        }
        }

        expect(orderRoutes(route)).toEqual({
            status: 'OK',
            data: {
            routes: [
                {
                    legs: [
                        {
                            duration: {
                                value:50
                            }
                        }
                    ]
                },
                {
                    legs: [
                        {
                            duration: {
                                value: 100
                            }
                        }
                    ]
                }
                ,{
                    legs: [
                        {
                            duration: {
                                value: 200
                            }
                        }
                    ]
                },
                {
                    legs: [
                        {
                            duration: {
                                value: 250
                            }
                        }
                    ]
                }
            ]
        }
            
        });              
    });

    test('throws error if routes object is invalid', () => {
        const route = {
            status: 'OK',
            data: {}
        }

        expect(() => orderRoutes(route)).toThrowError('Invalid routes object, cannot order the routes');
    });
      
});