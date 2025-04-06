import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState, useRef } from "react";

interface LocationType {
    name: string;
    address: string;
    place_id: string;
    lat: number;
    lng: number;
}

// Campus coordinates with Hall Building specifically defined
const CONCORDIA_POINTS = {
    SGW: { lat: 45.4949, lng: -73.5779, title: "Sir George Williams Campus" },
    HALL_BUILDING: { lat: 45.4973, lng: -73.5786, title: "Hall Building" },
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
    // Track additional renderers and markers
    const additionalRenderersRef = useRef<google.maps.DirectionsRenderer[]>([]);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const [googleMaps, setGoogleMaps] = useState<any>(null);

    // Create route styles after Google Maps is available
    const getRouteStyles = () => {
        if (!googleMaps) return null;
        
        return {
            shuttle: {
                strokeColor: '#912338', // Concordia maroon
                strokeOpacity: 1.0,
                strokeWeight: 5,
                icons: [{
                    icon: {
                        path: googleMaps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 3,
                        fillColor: '#912338',
                        fillOpacity: 1.0,
                        strokeWeight: 1
                    },
                    offset: '50%',
                    repeat: '150px'
                }]
            },
            walking: {
                strokeColor: '#4A90E2',
                strokeOpacity: 0.9,
                strokeWeight: 4,
                strokePattern: {
                    path: googleMaps.SymbolPath.CIRCLE,
                    scale: 3,
                    fillOpacity: 1,
                    strokeWeight: 1
                }
            },
            transit: {
                strokeColor: '#38761D',
                strokeOpacity: 0.9,
                strokeWeight: 5
            },
            driving: {
                strokeColor: '#FF8C00',
                strokeOpacity: 0.9,
                strokeWeight: 5
            },
            bicycling: {
                strokeColor: '#8B4513',
                strokeOpacity: 0.9,
                strokeWeight: 5
            }
        };
    };

    // Function to create custom markers (moved inside component)
    const createCustomMarker = (position: google.maps.LatLngLiteral, label: string, isStart: boolean) => {
        if (!map || !googleMaps) return null;
        
        const markerIcon = {
            path: googleMaps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: isStart ? '#4285F4' : '#34A853',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
        };
        
        const marker = new googleMaps.Marker({
            position,
            map,
            icon: markerIcon,
            label: {
                text: label[0], // First character of label
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 'bold'
            },
            animation: googleMaps.Animation.DROP,
            title: label
        });

        // Add tooltip on hover
        const infoWindow = new googleMaps.InfoWindow({
            content: `<div style="font-weight: bold; color: #333;">${label}</div>`,
            disableAutoPan: true
        });

        marker.addListener('mouseover', () => {
            infoWindow.open(map, marker);
        });

        marker.addListener('mouseout', () => {
            infoWindow.close();
        });

        return marker;
    };

    // Cleanup function for previous renderers and markers
    const cleanupPreviousRoute = () => {
        if (directionsRenderer) {
            directionsRenderer.setMap(null);
        }
        
        // Clean up any additional renderers
        additionalRenderersRef.current.forEach(renderer => {
            renderer.setMap(null);
        });
        additionalRenderersRef.current = [];
        
        // Clean up markers
        markersRef.current.forEach(marker => {
            marker.setMap(null);
        });
        markersRef.current = [];
    };

    // Initialize Google Maps services when libraries are loaded
    useEffect(() => {
        if (!routesLibrary || !map) return;
        
        // Now we have access to the Google Maps object
        setGoogleMaps(google.maps);
        setDirectionsService(new google.maps.DirectionsService());
        
        const renderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true // We'll handle markers separately
        });
        setDirectionsRenderer(renderer);
        
        return () => {
            cleanupPreviousRoute();
        };
    }, [routesLibrary, map]);

    // Render routes when parameters change
    useEffect(() => {
        if (!directionsService || !directionsRenderer || !map || !googleMaps) {
            cleanupPreviousRoute();
            return;
        }

        if (!source || !destination) {
            cleanupPreviousRoute();
            return;
        }

        cleanupPreviousRoute();
        const routeStyles = getRouteStyles();
        if (!routeStyles) return;

        // Create source marker
        if (source) {
            const sourceMarker = createCustomMarker(
                { lat: source.lat, lng: source.lng }, 
                source.name || "Start", 
                true
            );
            if (sourceMarker) markersRef.current.push(sourceMarker);
        }

        // Create destination marker
        if (destination) {
            const destMarker = createCustomMarker(
                { lat: destination.lat, lng: destination.lng }, 
                destination.name || "End", 
                false
            );
            if (destMarker) markersRef.current.push(destMarker);
        }

        if (transportationMode === "shuttle") {
            // Create Hall Building marker if not starting there
            if (calculateDistance(source.lat, source.lng, CONCORDIA_POINTS.HALL_BUILDING.lat, CONCORDIA_POINTS.HALL_BUILDING.lng) > 0.1) {
                const hallMarker = createCustomMarker(
                    { lat: CONCORDIA_POINTS.HALL_BUILDING.lat, lng: CONCORDIA_POINTS.HALL_BUILDING.lng }, 
                    "Hall Building", 
                    false
                );
                if (hallMarker) markersRef.current.push(hallMarker);
            }

            // Create Loyola marker if not ending there
            if (calculateDistance(destination.lat, destination.lng, CONCORDIA_POINTS.LOYOLA.lat, CONCORDIA_POINTS.LOYOLA.lng) > 0.1) {
                const loyolaMarker = createCustomMarker(
                    { lat: CONCORDIA_POINTS.LOYOLA.lat, lng: CONCORDIA_POINTS.LOYOLA.lng }, 
                    "Loyola Campus", 
                    false
                );
                if (loyolaMarker) markersRef.current.push(loyolaMarker);
            }

            directionsRenderer.setOptions({
                suppressMarkers: true,
                polylineOptions: routeStyles.shuttle
            });
            
            // Create a directions request for the shuttle route - starting from Hall Building
            directionsService.route(
                {
                    origin: { lat: CONCORDIA_POINTS.HALL_BUILDING.lat, lng: CONCORDIA_POINTS.HALL_BUILDING.lng },
                    destination: { lat: CONCORDIA_POINTS.LOYOLA.lat, lng: CONCORDIA_POINTS.LOYOLA.lng },
                    travelMode: googleMaps.TravelMode.DRIVING,
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

                        // Show walking segments if needed - using Hall Building instead of SGW
                        if (calculateDistance(source.lat, source.lng, CONCORDIA_POINTS.HALL_BUILDING.lat, CONCORDIA_POINTS.HALL_BUILDING.lng) > 0.1) {
                            directionsService.route(
                                {
                                    origin: { lat: source.lat, lng: source.lng },
                                    destination: { lat: CONCORDIA_POINTS.HALL_BUILDING.lat, lng: CONCORDIA_POINTS.HALL_BUILDING.lng },
                                    travelMode: googleMaps.TravelMode.WALKING
                                },
                                (walkResponse, walkStatus) => {
                                    if (walkStatus === "OK" && walkResponse) {
                                        // Create a new renderer with styled walking path
                                        const walkRenderer = new googleMaps.DirectionsRenderer({
                                            map: map,
                                            directions: walkResponse,
                                            suppressMarkers: true,
                                            polylineOptions: routeStyles.walking
                                        });
                                        additionalRenderersRef.current.push(walkRenderer);
                                    }
                                }
                            );
                        }

                        if (calculateDistance(destination.lat, destination.lng, CONCORDIA_POINTS.LOYOLA.lat, CONCORDIA_POINTS.LOYOLA.lng) > 0.1) {
                            directionsService.route(
                                {
                                    origin: { lat: CONCORDIA_POINTS.LOYOLA.lat, lng: CONCORDIA_POINTS.LOYOLA.lng },
                                    destination: { lat: destination.lat, lng: destination.lng },
                                    travelMode: googleMaps.TravelMode.WALKING
                                },
                                (walkResponse, walkStatus) => {
                                    if (walkStatus === "OK" && walkResponse) {
                                        // Create a new renderer with styled walking path
                                        const walkRenderer = new googleMaps.DirectionsRenderer({
                                            map: map,
                                            directions: walkResponse,
                                            suppressMarkers: true,
                                            polylineOptions: routeStyles.walking
                                        });
                                        additionalRenderersRef.current.push(walkRenderer);
                                    }
                                }
                            );
                        }
            
                        // Fit bounds to show the entire route
                        if (response.routes[0].bounds) {
                            const bounds = new googleMaps.LatLngBounds(
                                response.routes[0].bounds.getSouthWest(),
                                response.routes[0].bounds.getNorthEast()
                            );
                            bounds.extend({ lat: source.lat, lng: source.lng });
                            bounds.extend({ lat: destination.lat, lng: destination.lng });
                            
                            // Add some padding for better view
                            map?.fitBounds(bounds, 50); // 50 pixels of padding
                        }
                    }
                }
            );
        } else {
            // Handle other transportation modes with appropriate styles
            directionsRenderer.setOptions({
                suppressMarkers: true,
                polylineOptions: routeStyles[transportationMode] || null
            });
            
            directionsService.route(
                {
                    origin: { lat: source.lat, lng: source.lng },
                    destination: { lat: destination.lat, lng: destination.lng },
                    travelMode: googleMaps.TravelMode[transportationMode.toUpperCase() as keyof typeof google.maps.TravelMode],
                    provideRouteAlternatives: true,
                },
                (response, status) => {
                    if (status === "OK" && response) {
                        directionsRenderer.setDirections(response);
                        directionsRenderer.setRouteIndex(selectedRouteIndex);
                        
                        // Add intermediate point markers for longer routes
                        if (response.routes[selectedRouteIndex] && 
                            response.routes[selectedRouteIndex].legs[0].steps.length > 5) {
                            
                            const steps = response.routes[selectedRouteIndex].legs[0].steps;
                            // Add markers at major turning points (every 3 steps for clarity)
                            for (let i = 1; i < steps.length - 1; i += 3) {
                                const step = steps[i];
                                if (step.instructions && step.instructions.includes("Turn")) {
                                    const waypointMarker = new googleMaps.Marker({
                                        position: step.start_location,
                                        map: map,
                                        icon: {
                                            path: googleMaps.SymbolPath.CIRCLE,
                                            scale: 5,
                                            fillColor: '#FFA500',
                                            fillOpacity: 0.8,
                                            strokeColor: '#FFFFFF',
                                            strokeWeight: 1
                                        }
                                    });
                                    markersRef.current.push(waypointMarker);
                                }
                            }
                        }
                    } else {
                        console.error("Directions request failed due to " + status);
                        directionsRenderer.setMap(null);
                    }
                }
            );
        }
    }, [directionsService, directionsRenderer, source, destination, selectedRouteIndex, transportationMode, map, googleMaps]);

    return null;
}

export default RouteRenderer;