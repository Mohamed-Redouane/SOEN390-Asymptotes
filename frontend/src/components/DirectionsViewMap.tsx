import { useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

interface DirectionViewMapProps {
    directionsInfo: google.maps.DirectionsResult;
}

function DirectionsViewMap({ directionsInfo }: DirectionViewMapProps) {
    const map = useMap();

    useEffect(() => {
        if (map) {
            console.log("Map is available:", map);
        }
        console.log("Directions Info:", directionsInfo);
    }, [map, directionsInfo]);

    return null;
}

export default DirectionsViewMap;
