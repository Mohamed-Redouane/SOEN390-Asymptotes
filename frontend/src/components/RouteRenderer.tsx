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
    transportationMode: "driving" | "transit" | "walking" | "bicycling";

}) {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
    const [/*displayedRoute*/, setDisplayedRoute] = useState<google.maps.DirectionsResult | null>(null);

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
         const travelModeMap = {
            driving: google.maps.TravelMode.DRIVING,
            transit: google.maps.TravelMode.TRANSIT,
            walking: google.maps.TravelMode.WALKING,
            bicycling: google.maps.TravelMode.BICYCLING,
        };

        directionsService.route(
            {
                origin: { lat: source.lat, lng: source.lng },
                destination: { lat: destination.lat, lng: destination.lng },
                travelMode: travelModeMap[transportationMode],
                provideRouteAlternatives: true,
            },
            (response, status) => {
                if (status === "OK") {
                    setDisplayedRoute(response);
                   directionsRenderer.setDirections(response);
                   directionsRenderer.setRouteIndex(selectedRouteIndex); // Set the selected route
                } else {
                    console.error("Directions request failed due to " + status);
                    setDisplayedRoute(null);
                }
            }
        );
    }, [directionsService, directionsRenderer, source, destination, selectedRouteIndex, transportationMode]); // Add selectedRouteIndex as a dependency

    return null;
}


export default RouteRenderer;