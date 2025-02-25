import { useEffect } from "react";
import { fetchDirectionRenders } from "../services/directionsServices";
import {APIProvider, useMap} from "@vis.gl/react-google-maps";

interface DirectionViewMapProps {
    directionsInfo: google.maps.DirectionsResult;
}

function DirectionsViewMap({ directionsInfo }: DirectionViewMapProps) {
    const map = useMap();
    
    return (
       null
    );
}

export default DirectionsViewMap;

