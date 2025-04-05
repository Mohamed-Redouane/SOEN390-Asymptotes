// src/Components/GeoJsonBuildingMarkers.tsx
import React, { useState } from "react";
import { Marker, useMap } from "@vis.gl/react-google-maps";
import getCentral from "../utils/CoordinateBuilding";
import { useNavigate } from "react-router-dom";
import { createInfoWindow, getAddress } from "../utils/infoBuilding";

interface BuildingMarkersProps {
  geoJsonData: any;
}


const BuildingMarkers: React.FC<BuildingMarkersProps> = ({ geoJsonData }) => {
  const map = useMap();
  const [activeInfoWindow, setActiveInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const navigate = useNavigate();


  const handleMarkerClick = (feature: any, position: google.maps.LatLngLiteral) =>{
    activeInfoWindow?.close();
  
const address = getAddress(feature);
const info = new google.maps.InfoWindow({
      content: createInfoWindow(feature.properties.name || "Building", address),
      position,
    });
    info.open(map);
    setActiveInfoWindow(info);

    google.maps.event.addListener(info, "domready", () => {
      
      const button = document.getElementById("get-directions-building-button");
      console.log("Found button:", button);
      if (button) {
        button.addEventListener("click", () => {
          console.log("Button clicked");
          // Navigate to the directions page and pass the building address as state
          navigate("/directions", { state: { destination: address } });
          info.close();
          setActiveInfoWindow(null);
        });
      }
    });
  }

  return (
    <>
    {geoJsonData.features.map((feature: any, index: number) => {
      
      if(feature.geometry.type !== "Polygon") return null;
      const coordinates = feature.geometry.coordinates[0];
      if(!coordinates?.length) return null;
      
      const points = coordinates.map(([lng, lat]: [number, number]) => ({ lat, lng }));
      const position = getCentral(points);
        return (
          <Marker
            key={index}
            position={position}
            title={feature.properties.name || "Building"}
            label = {feature.properties.label || ""}
            onClick={() => handleMarkerClick(feature, position)}
          />
        );
      })}
    </>
  );
  
};

export default BuildingMarkers;
