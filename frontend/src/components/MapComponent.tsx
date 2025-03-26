import { useEffect, useContext } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { LocationContext } from "./LocationContext";

interface MapComponentProps {
  geoJsonData: any;
  setIsUserInsideBuilding: (inside: boolean) => void;
}

function MapComponent({ geoJsonData, setIsUserInsideBuilding }: MapComponentProps) {
  const map = useMap();
  const { location: userLocation } = useContext(LocationContext);

  useEffect(() => {
     if (!map || !geoJsonData) return;

    map.data.forEach((feature) => map.data.remove(feature));

    
    map.data.addGeoJson(geoJsonData);
    

    map.data.forEach((feature) => {
      const geometry = feature.getGeometry();
      if (geometry?.getType() === "Polygon") {
        const polygonPaths = (geometry as google.maps.Data.Polygon).getArray().map((path) =>
          (path as google.maps.Data.LinearRing).getArray().map((coord) => ({
            lat: (coord as google.maps.LatLng).lat(),
            lng: (coord as google.maps.LatLng).lng(),
          }))
        );
        map.data.overrideStyle(feature, { fillColor: "blue", fillOpacity: 0.5 });

        const polygon = new google.maps.Polygon({
          paths: polygonPaths,
        });
        if(userLocation){
          const userLatLng = new google.maps.LatLng(userLocation.lat, userLocation.lng);
          let userInsideBuilding = false;
          if (google.maps.geometry.poly.containsLocation(userLatLng, polygon)) {
            userInsideBuilding = true;
            setIsUserInsideBuilding(userInsideBuilding);
            map.data.overrideStyle(feature, { fillColor: "red", fillOpacity: 0.8 });
          }
        }
      }
    });
    
    
      
    }, [map, geoJsonData, userLocation, setIsUserInsideBuilding]);

  return null;
}

export default MapComponent;
