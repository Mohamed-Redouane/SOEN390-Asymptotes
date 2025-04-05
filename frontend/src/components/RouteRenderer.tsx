import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState } from "react";

interface LocationType {
    name: string;
    address: string;
    place_id: string;
    lat: number;
    lng: number;
}

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

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new google.maps.DirectionsService());
        const renderer = new google.maps.DirectionsRenderer({ map: map });
        setDirectionsRenderer(renderer);
        return () => {
            renderer.setMap(null);
        };
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsService || !directionsRenderer || !source || !destination) {
            if(directionsRenderer) {
              directionsRenderer.setMap(null);
            }
            return;
        }

        if (transportationMode === "shuttle") {
            // Remove any existing directions
            directionsRenderer.setMap(null);
            
            // Concordia shuttle route coordinates
            const shuttleRouteCoordinates = [
                { lat: 45.4949, lng: -73.5779 }, // SGW Campus
                { lat: 45.4896, lng: -73.5847 }, // Along Sherbrooke
                { lat: 45.4892, lng: -73.5869 }, // Sherbrooke/Atwater
                { lat: 45.4889, lng: -73.5906 }, // Sherbrooke West
                { lat: 45.4869, lng: -73.6016 }, // Sherbrooke/Girouard
                { lat: 45.4762, lng: -73.6227 }, // Sherbrooke/West Broadway
                { lat: 45.4583, lng: -73.6403 }  // Loyola Campus
            ];
            
            // Create a new polyline for the shuttle route
            const shuttlePath = new google.maps.Polyline({
                path: shuttleRouteCoordinates,
                geodesic: true,
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
            });
            
            shuttlePath.setMap(map);
            
            // Fit bounds to show the entire route
            const bounds = new google.maps.LatLngBounds();
            shuttleRouteCoordinates.forEach(point => bounds.extend(point));
            map?.fitBounds(bounds);
            
            return () => {
                shuttlePath.setMap(null);
            };
        }

        // Handle other transportation modes
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
    }, [directionsService, directionsRenderer, source, destination, selectedRouteIndex, transportationMode, map]);

    return null;
}

export default RouteRenderer;