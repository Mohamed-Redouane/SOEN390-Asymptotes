import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState, useRef } from "react";

interface LocationType {
    name: string;
    address: string;
    place_id: string;
    lat: number;
    lng: number;
}

// Campus coordinates
const CONCORDIA_POINTS = {
    SGW: { lat: 45.4949, lng: -73.5779, title: "Sir George Williams Campus" },
    LOYOLA: { lat: 45.4583, lng: -73.6403, title: "Loyola Campus" }
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
};

// Helper function to find nearest campus
const findNearestCampus = (lat: number, lng: number) => {
    const distToSGW = calculateDistance(lat, lng, CONCORDIA_POINTS.SGW.lat, CONCORDIA_POINTS.SGW.lng);
    const distToLoyola = calculateDistance(lat, lng, CONCORDIA_POINTS.LOYOLA.lat, CONCORDIA_POINTS.LOYOLA.lng);
    return distToSGW < distToLoyola ? CONCORDIA_POINTS.SGW : CONCORDIA_POINTS.LOYOLA;
};

function RouteRenderer({ source, destination, selectedRouteIndex, transportationMode }: {
    source: LocationType | undefined;
    destination: LocationType | undefined;
    selectedRouteIndex: number;
    transportationMode: "driving" | "transit" | "walking" | "bicycling" | "shuttle";
}) {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
    const shuttlePathRef = useRef<google.maps.DirectionsRenderer | null>(null);

    // Cleanup function for previous renderers
    const cleanupPreviousRoute = () => {
        if (directionsRenderer) {
            directionsRenderer.setMap(null);
        }
        if (shuttlePathRef.current) {
            shuttlePathRef.current.setMap(null);
        }
    };

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new google.maps.DirectionsService());
        const renderer = new google.maps.DirectionsRenderer({ map: map });
        setDirectionsRenderer(renderer);
        return () => {
            renderer.setMap(null);
            if (shuttlePathRef.current) {
                shuttlePathRef.current.setMap(null);
            }
        };
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsService || !directionsRenderer) {
            cleanupPreviousRoute();
            return;
        }

        if (!source || !destination) {
            cleanupPreviousRoute();
            return;
        }

        cleanupPreviousRoute();
        
        if (transportationMode === "shuttle") {
            directionsRenderer.setOptions({
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: '#912338', // Concordia maroon color
                    strokeOpacity: 1.0,
                    strokeWeight: 4,
                    icons: [{
                        icon: {
                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                            scale: 3,
                        },
                        offset: '50%',
                        repeat: '200px'
                    }]
                }
            });
            
            // Create a directions request for the shuttle route
            directionsService.route(
                {
                    origin: { lat: CONCORDIA_POINTS.SGW.lat, lng: CONCORDIA_POINTS.SGW.lng },
                    destination: { lat: CONCORDIA_POINTS.LOYOLA.lat, lng: CONCORDIA_POINTS.LOYOLA.lng },
                    travelMode: google.maps.TravelMode.DRIVING,
                    provideRouteAlternatives: false,
                    waypoints: [
                        {
                            location: "Sherbrooke Street West & Guy Street, Montreal, QC",
                            stopover: false
                        },
                        {
                            location: "Sherbrooke Street West & Atwater Avenue, Montreal, QC",
                            stopover: false
                        }
                    ]
                },
                (response, status) => {
                    if (status === "OK" && response) {
                        directionsRenderer.setDirections(response);
                        directionsRenderer.setMap(map);

                        // Show walking segments if needed
                        if (calculateDistance(source.lat, source.lng, CONCORDIA_POINTS.SGW.lat, CONCORDIA_POINTS.SGW.lng) > 0.1) {
                            directionsService.route(
                                {
                                    origin: { lat: source.lat, lng: source.lng },
                                    destination: { lat: CONCORDIA_POINTS.SGW.lat, lng: CONCORDIA_POINTS.SGW.lng },
                                    travelMode: google.maps.TravelMode.WALKING
                                },
                                (walkResponse, walkStatus) => {
                                    if (walkStatus === "OK" && walkResponse) {
                                        new google.maps.DirectionsRenderer({
                                            map: map,
                                            directions: walkResponse,
                                            suppressMarkers: true,
                                            polylineOptions: {
                                                strokeColor: '#4A90E2',
                                                strokeOpacity: 0.7,
                                                strokeWeight: 4
                                            }
                                        });
                                    }
                                }
                            );
                        }

                        if (calculateDistance(destination.lat, destination.lng, CONCORDIA_POINTS.LOYOLA.lat, CONCORDIA_POINTS.LOYOLA.lng) > 0.1) {
                            directionsService.route(
                                {
                                    origin: { lat: CONCORDIA_POINTS.LOYOLA.lat, lng: CONCORDIA_POINTS.LOYOLA.lng },
                                    destination: { lat: destination.lat, lng: destination.lng },
                                    travelMode: google.maps.TravelMode.WALKING
                                },
                                (walkResponse, walkStatus) => {
                                    if (walkStatus === "OK" && walkResponse) {
                                        new google.maps.DirectionsRenderer({
                                            map: map,
                                            directions: walkResponse,
                                            suppressMarkers: true,
                                            polylineOptions: {
                                                strokeColor: '#4A90E2',
                                                strokeOpacity: 0.7,
                                                strokeWeight: 4
                                            }
                                        });
                                    }
                                }
                            );
                        }

                        // Fit bounds to show the entire route
                        if (response.routes[0].bounds) {
                            const bounds = new google.maps.LatLngBounds(
                                response.routes[0].bounds.getSouthWest(),
                                response.routes[0].bounds.getNorthEast()
                            );
                            bounds.extend({ lat: source.lat, lng: source.lng });
                            bounds.extend({ lat: destination.lat, lng: destination.lng });
                            map?.fitBounds(bounds);
                        }
                    }
                }
            );
        } else {
            // Handle other transportation modes
            directionsRenderer.setOptions({
                suppressMarkers: false,
                polylineOptions: null
            });
            
            directionsService.route(
                {
                    origin: { lat: source.lat, lng: source.lng },
                    destination: { lat: destination.lat, lng: destination.lng },
                    travelMode: google.maps.TravelMode[transportationMode.toUpperCase() as keyof typeof google.maps.TravelMode],
                    provideRouteAlternatives: true,
                },
                (response, status) => {
                    if (status === "OK") {
                        directionsRenderer.setDirections(response);
                        directionsRenderer.setRouteIndex(selectedRouteIndex);
                    } else {
                        console.error("Directions request failed due to " + status);
                        directionsRenderer.setMap(null);
                    }
                }
            );
        }
    }, [directionsService, directionsRenderer, source, destination, selectedRouteIndex, transportationMode, map]);

    return null;
}

export default RouteRenderer;