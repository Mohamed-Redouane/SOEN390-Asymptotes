import { useEffect, useContext } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { LocationContext } from "./LocationContext";

interface MapComponentProps {
  geoJsonData: any;
  setIsUserInsideBuilding: (inside: boolean) => void;
}

// Assume that the GeoJSON is loaded in the map.
function initMapGeometry(map: any, userLocation: any): boolean {
  let userInsideBuilding = false;
  map.data.forEach((feature: any) => {
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
        if (google.maps.geometry.poly.containsLocation(userLatLng, polygon)) {
          userInsideBuilding = true;
          map.data.overrideStyle(feature, { fillColor: "red", fillOpacity: 0.8 });
        }
      }
    }
  });
  return userInsideBuilding;
}

function MapComponent({ geoJsonData, setIsUserInsideBuilding }: MapComponentProps) {
  const map = useMap();
  const { location: userLocation } = useContext(LocationContext);

  useEffect(() => {
    if (!map || !geoJsonData) return;

    map.data.forEach((feature) => map.data.remove(feature));
    
    // Load GeoJSON
    map.data.addGeoJson(geoJsonData);
    setIsUserInsideBuilding(initMapGeometry(map, userLocation));
    
    const infoWindow = new google.maps.InfoWindow();
    const listener = map.data.addListener("click", (event: google.maps.Data.MouseEvent) => {
      const name = event.feature.getProperty("name");
      const Address = event.feature.getProperty("address")
      const content = `
        <div style="
      max-width: 250px;
      background-color: #FFFFFF;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      color: #333;
      font-family: 'Roboto', sans-serif;
    ">
      <h3 style="
        margin: 0 0 8px 0;
        font-size: 16px;
        color: #5A2DA2; /* Purple accent color */
      ">
        ${name}
      </h3>
      <p style="margin: 0; font-size: 14px;">
        ${Address}
      </p>
    </div>
      `;
      infoWindow.setContent(content);
      infoWindow.setPosition(event.latLng);
      infoWindow.open(map)});
      
      return () => {
        google.maps.event.removeListener(listener);
      };
    }, [map, geoJsonData, userLocation, setIsUserInsideBuilding]);

  return <div></div>;
}

export default MapComponent;
