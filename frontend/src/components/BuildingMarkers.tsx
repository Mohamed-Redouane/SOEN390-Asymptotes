// src/Components/GeoJsonBuildingMarkers.tsx
import React, { useState } from "react";
import { Marker, useMap } from "@vis.gl/react-google-maps";
import getCentral from "../utils/CoordinateBuilding";
import { useNavigate } from "react-router-dom";

interface GeoJsonBuildingMarkersProps {
  geoJsonData: any;
}


const BuildingMarkers: React.FC<GeoJsonBuildingMarkersProps> = ({ geoJsonData }) => {
  const map = useMap();
  const [activeInfoWindow, setActiveInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const navigate = useNavigate();
  // For each feature, compute a marker position using the centroid of the polygon's first ring.
  const markers = geoJsonData.features.map((feature: any, index: number) => {
    if (feature.geometry.type === "Polygon") {
      // GeoJSON coordinates are in [lng, lat] order.
      const coordinates = feature.geometry.coordinates[0]; // First ring
      if (!coordinates || coordinates.length === 0) return null;
      // Convert coordinates to {lat, lng} objects.
      const points = coordinates.map((coord: [number, number]) => ({
        lat: coord[1],
        lng: coord[0],
      }));
      
      const position = getCentral(points);

      return (
        <Marker
          key={index}
          position={position}
          title={feature.properties.name || "Building"}
          label = {feature.properties.label || ""}
          onClick={() => {
            
            if (activeInfoWindow) {
              activeInfoWindow.close();
            }
            
            const houseNumber = feature.properties["addr:housenumber"] || "";
            const street = feature.properties["addr:street"] || "";
            const city = feature.properties["addr:city"] || "";
            //const fullAddress = `${houseNumber} ${street}, ${city}`.trim();
            const address = feature.properties.address || `${houseNumber} ${street}, ${city}`.trim();;
            const content = `
              <div class="max-w-[250px] bg-white rounded-lg p-3 shadow-md text-gray-800 font-sans" >
                <h3 class="text-xl font-bold text-[#5A2DA2] mb-2">${feature.properties.name || "Building"}</h3>
                <p class="m-0">${address}</p>
                <button id="get-directions-building-button"
                  class="mt-3 rounded-lg bg-[#5A2DA2] text-white font-bold px-4 py-2 cursor-pointer hover:bg-[#4b29f1]">
                  Get Directions
                </button>
              </div>
            `;
            const infoWindow = new google.maps.InfoWindow({
              content,
              position,
            });
            infoWindow.open(map);
            setActiveInfoWindow(infoWindow);
            // Optionally close after a delay:
            google.maps.event.addListener(infoWindow, "domready", () => {
              const button = document.getElementById("get-directions-building-button");
              if (button) {
                button.addEventListener("click", () => {
                  // Navigate to the directions page and pass the building address as state
                  navigate("/directions", { state: { destination: address } });
                  infoWindow.close();
                  setActiveInfoWindow(null);
                });
              }
            });

            setTimeout(() => {
              infoWindow.close();
              setActiveInfoWindow(null);
            }, 5000);
          }}
        />
      );
    }
    return null;
  });

  return <>{markers}</>;
};

export default BuildingMarkers;
