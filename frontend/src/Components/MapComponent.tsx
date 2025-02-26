import React, { useEffect, useContext } from "react";
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
    if (!map || !geoJsonData || !userLocation) return;

    map.data.forEach((feature) => map.data.remove(feature));

    // Load GeoJSON
    map.data.addGeoJson(geoJsonData);

    const userLatLng = new google.maps.LatLng(userLocation.lat, userLocation.lng);
    let userInsideBuilding = false;

    map.data.forEach((feature) => {
      const geometry = feature.getGeometry();
      if (geometry?.getType() === "Polygon") {
        const polygon = new google.maps.Polygon({
          paths: geometry.getArray().map((path) =>
            path.getArray().map((coord) => ({ lat: coord.lat(), lng: coord.lng() }))
          ),
        });

        if (google.maps.geometry.poly.containsLocation(userLatLng, polygon)) {
          userInsideBuilding = true;
          map.data.overrideStyle(feature, { fillColor: "red", fillOpacity: 0.8 });
        } else {
          map.data.overrideStyle(feature, { fillColor: "blue", fillOpacity: 0.5 });
        }
      }
    });
    setIsUserInsideBuilding(userInsideBuilding);
    const infoWindow = new google.maps.InfoWindow();
    const listener = map.data.addListener("click", (event: google.maps.Data.MouseEvent) => {
      const name = event.feature.getProperty("name");
      const Address = event.feature.getProperty("address")
      const content = `
        <div style="max-width:250px;">
          <h3 style="margin:0 0 5px 0;">${name}</h3>
          <p style="margin:0;">${Address}</p>
        </div>
      `;
      infoWindow.setContent(content);
      infoWindow.setPosition(event.latLng);
      infoWindow.open(map)});
      
      return () => {
        google.maps.event.removeListener(listener);
      };
    }, [map, geoJsonData, userLocation, setIsUserInsideBuilding]);

  return null;
}

export default MapComponent