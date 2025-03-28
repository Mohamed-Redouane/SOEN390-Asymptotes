// Constants for Concordia campus locations
export const CONCORDIA_POINTS = {
    LOYOLA: {
        ID: "GPLoyola",
        Latitude: 45.4583,
        Longitude: -73.6403,
        Title: "Loyola Campus",
        place_ids: [
            "ChIJp3MoHy4XyUwRkr_5bwBScNw",  // Main Loyola ID
            "ChIJk5Bx5kkXyUwRHLCpsk_QqeM"   // Alternative Loyola ID
        ]
    },
    SGW: {
        ID: "GPSirGeorge",
        Latitude: 45.4949,
        Longitude: -73.5779,
        Title: "SGW Campus",
        place_ids: [
            "ChIJ19SC3jIbyUwRLPI2b48L-4k",  // Main SGW ID
            "ChIJCT3qZGoayUwRmPk37VHZSRY",  // Alternative SGW ID
            "ChIJOx0fzmsayUwR_rq19AxGGm8",  // Another SGW variant
            "ChIJ139JrWsayUwRbNrrU4yfp04"   // John Molson School of Business
        ]
    }
};

// Helper function to calculate distance between two coordinates in kilometers
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
};

// Helper function to check if a place ID belongs to a campus
const isCampusPlaceId = (placeId: string, campus: 'LOYOLA' | 'SGW'): boolean => {
    return CONCORDIA_POINTS[campus].place_ids.includes(placeId);
};

// Function to get coordinates from a place_id using Google Maps API
const getCoordinatesForPlaceId = async (placeId: string): Promise<{lat: number, lng: number} | null> => {
    try {
        // First check if it's a known campus place ID
        if (isCampusPlaceId(placeId, 'LOYOLA')) {
            return { lat: CONCORDIA_POINTS.LOYOLA.Latitude, lng: CONCORDIA_POINTS.LOYOLA.Longitude };
        } else if (isCampusPlaceId(placeId, 'SGW')) {
            return { lat: CONCORDIA_POINTS.SGW.Latitude, lng: CONCORDIA_POINTS.SGW.Longitude };
        }
        
        // For non-campus locations, make a call to Google Places API
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch place details');
        }
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.result.geometry) {
            return {
                lat: data.result.geometry.location.lat,
                lng: data.result.geometry.location.lng
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error getting coordinates for place ID:', error);
        return null;
    }
};

// Helper function to find the nearest campus to a location
const findNearestCampus = (lat: number, lng: number): typeof CONCORDIA_POINTS.SGW | typeof CONCORDIA_POINTS.LOYOLA => {
    const distanceToSGW = calculateDistance(lat, lng, CONCORDIA_POINTS.SGW.Latitude, CONCORDIA_POINTS.SGW.Longitude);
    const distanceToLoyola = calculateDistance(lat, lng, CONCORDIA_POINTS.LOYOLA.Latitude, CONCORDIA_POINTS.LOYOLA.Longitude);
    return distanceToSGW < distanceToLoyola ? CONCORDIA_POINTS.SGW : CONCORDIA_POINTS.LOYOLA;
};

// Determine if a route is between Concordia campuses for shuttle eligibility
export const isRouteBetweenConcordiaCampuses = async (source: string, destination: string): Promise<boolean> => {
    // Get coordinates for source and destination
    const sourceCoords = await getCoordinatesForPlaceId(source);
    const destCoords = await getCoordinatesForPlaceId(destination);
    
    if (!sourceCoords || !destCoords) {
        return false;
    }

    // Calculate distances to each campus
    const sourceToSGW = calculateDistance(sourceCoords.lat, sourceCoords.lng, CONCORDIA_POINTS.SGW.Latitude, CONCORDIA_POINTS.SGW.Longitude);
    const sourceToLoyola = calculateDistance(sourceCoords.lat, sourceCoords.lng, CONCORDIA_POINTS.LOYOLA.Latitude, CONCORDIA_POINTS.LOYOLA.Longitude);
    const destToSGW = calculateDistance(destCoords.lat, destCoords.lng, CONCORDIA_POINTS.SGW.Latitude, CONCORDIA_POINTS.SGW.Longitude);
    const destToLoyola = calculateDistance(destCoords.lat, destCoords.lng, CONCORDIA_POINTS.LOYOLA.Latitude, CONCORDIA_POINTS.LOYOLA.Longitude);

    // If both points are very close to the same campus (within 1km), no need for shuttle
    const isNearSameCampus = (
        (sourceToSGW < 1 && destToSGW < 1) ||
        (sourceToLoyola < 1 && destToLoyola < 1)
    );

    if (isNearSameCampus) {
        return false;
    }

    // If either point is within reasonable walking distance of a campus (2km)
    // and the other point is closer to the other campus, show shuttle route
    const isViableShuttleRoute = (
        (sourceToSGW < 2 && destToLoyola < destToSGW) ||
        (sourceToLoyola < 2 && destToSGW < destToLoyola) ||
        (destToSGW < 2 && sourceToLoyola < sourceToSGW) ||
        (destToLoyola < 2 && sourceToSGW < sourceToLoyola)
    );

    console.log("Checking if route could use shuttle:", isViableShuttleRoute);
    console.log("Distances - Source to SGW:", sourceToSGW, "Source to Loyola:", sourceToLoyola);
    console.log("Distances - Dest to SGW:", destToSGW, "Dest to Loyola:", destToLoyola);

    return isViableShuttleRoute;
};

// Generate shuttle route between campuses with estimated time
export const generateShuttleRoute = async (source: string, destination: string) => {
    // Get coordinates for source and destination
    const sourceCoords = await getCoordinatesForPlaceId(source);
    const destCoords = await getCoordinatesForPlaceId(destination);
    
    if (!sourceCoords || !destCoords) {
        console.log('Could not get coordinates for source or destination');
        return [];
    }

    // Find nearest campuses to source and destination
    const nearestToSource = findNearestCampus(sourceCoords.lat, sourceCoords.lng);
    const nearestToDest = findNearestCampus(destCoords.lat, destCoords.lng);

    // Calculate distances
    const distanceToFirstCampus = calculateDistance(
        sourceCoords.lat, sourceCoords.lng,
        nearestToSource.Latitude, nearestToSource.Longitude
    );
    
    const distanceBetweenCampuses = calculateDistance(
        CONCORDIA_POINTS.SGW.Latitude, CONCORDIA_POINTS.SGW.Longitude,
        CONCORDIA_POINTS.LOYOLA.Latitude, CONCORDIA_POINTS.LOYOLA.Longitude
    );
    
    const distanceFromLastCampus = calculateDistance(
        nearestToDest.Latitude, nearestToDest.Longitude,
        destCoords.lat, destCoords.lng
    );

    // Estimate travel times
    // Walking: 5 km/h = 12 mins per km
    // Shuttle: 30 km/h = 2 mins per km during non-peak hours
    const walkingTimeToFirstCampus = Math.round(distanceToFirstCampus * 12);
    const shuttleTime = Math.round(distanceBetweenCampuses * 2);
    const walkingTimeFromLastCampus = Math.round(distanceFromLastCampus * 12);

    // Total duration
    const totalDuration = walkingTimeToFirstCampus + shuttleTime + walkingTimeFromLastCampus;
    const totalDistance = distanceToFirstCampus + distanceBetweenCampuses + distanceFromLastCampus;

    // Create a multi-leg route
    const shuttleRoute = {
        bounds: {
            northeast: {
                lat: Math.max(sourceCoords.lat, destCoords.lat, CONCORDIA_POINTS.SGW.Latitude, CONCORDIA_POINTS.LOYOLA.Latitude),
                lng: Math.max(sourceCoords.lng, destCoords.lng, CONCORDIA_POINTS.SGW.Longitude, CONCORDIA_POINTS.LOYOLA.Longitude)
            },
            southwest: {
                lat: Math.min(sourceCoords.lat, destCoords.lat, CONCORDIA_POINTS.SGW.Latitude, CONCORDIA_POINTS.LOYOLA.Latitude),
                lng: Math.min(sourceCoords.lng, destCoords.lng, CONCORDIA_POINTS.SGW.Longitude, CONCORDIA_POINTS.LOYOLA.Longitude)
            }
        },
        copyrights: "Concordia University",
        fare: { currency: "CAD", text: "Free with student ID", value: 0 },
        duration: {
            text: `${totalDuration} mins`,
            value: totalDuration * 60
        },
        distance: {
            text: `${totalDistance.toFixed(1)} km`,
            value: Math.round(totalDistance * 1000)
        },
        start_location: {
            lat: sourceCoords.lat,
            lng: sourceCoords.lng
        },
        end_location: {
            lat: destCoords.lat,
            lng: destCoords.lng
        },
        start_address: "Your Location",
        end_address: "Your Destination",
        legs: [
            {
                distance: {
                    text: `${totalDistance.toFixed(1)} km`,
                    value: Math.round(totalDistance * 1000)
                },
                duration: {
                    text: `${totalDuration} mins`,
                    value: totalDuration * 60
                },
                end_address: "Your Destination",
                end_location: {
                    lat: destCoords.lat,
                    lng: destCoords.lng
                },
                start_address: "Your Location",
                start_location: {
                    lat: sourceCoords.lat,
                    lng: sourceCoords.lng
                },
                steps: [
                    {
                        distance: {
                            text: `${distanceToFirstCampus.toFixed(1)} km`,
                            value: Math.round(distanceToFirstCampus * 1000)
                        },
                        duration: {
                            text: `${walkingTimeToFirstCampus} mins`,
                            value: walkingTimeToFirstCampus * 60
                        },
                        travel_mode: "WALKING",
                        html_instructions: `Walk to ${nearestToSource.Title}`
                    },
                    {
                        distance: {
                            text: `${distanceBetweenCampuses.toFixed(1)} km`,
                            value: Math.round(distanceBetweenCampuses * 1000)
                        },
                        duration: {
                            text: `${shuttleTime} mins`,
                            value: shuttleTime * 60
                        },
                        travel_mode: "TRANSIT",
                        html_instructions: "Take the Concordia Shuttle Bus",
                        transit_details: {
                            arrival_stop: {
                                location: {
                                    lat: CONCORDIA_POINTS.LOYOLA.Latitude,
                                    lng: CONCORDIA_POINTS.LOYOLA.Longitude
                                },
                                name: CONCORDIA_POINTS.LOYOLA.Title
                            },
                            departure_stop: {
                                location: {
                                    lat: CONCORDIA_POINTS.SGW.Latitude,
                                    lng: CONCORDIA_POINTS.SGW.Longitude
                                },
                                name: CONCORDIA_POINTS.SGW.Title
                            },
                            line: {
                                agencies: [{ name: "Concordia University" }],
                                name: "Concordia Shuttle",
                                short_name: "SHUTTLE",
                                color: "#912338",
                                text_color: "#FFFFFF",
                                vehicle: {
                                    name: "Shuttle Bus",
                                    type: "BUS",
                                    icon: "//maps.gstatic.com/mapfiles/transit/iw2/6/bus2.png"
                                }
                            },
                            num_stops: 1
                        }
                    },
                    {
                        distance: {
                            text: `${distanceFromLastCampus.toFixed(1)} km`,
                            value: Math.round(distanceFromLastCampus * 1000)
                        },
                        duration: {
                            text: `${walkingTimeFromLastCampus} mins`,
                            value: walkingTimeFromLastCampus * 60
                        },
                        travel_mode: "WALKING",
                        html_instructions: "Walk to your destination"
                    }
                ]
            }
        ],
        overview_polyline: { points: "" },
        summary: "Concordia Shuttle + Walking",
        warnings: [
            "Shuttle schedule may vary. Please check the Concordia Shuttle page for exact times.",
            "This route includes walking segments."
        ]
    };

    return [shuttleRoute];
};