import { MapView, useMapData } from "@mappedin/react-sdk";
import "@mappedin/react-sdk/lib/esm/index.css";
import { useState, useEffect } from "react";
import BuildingSelector from "../Components/IndoorDirections/BuildingSelector";
import Labels from "../Components/IndoorDirections/Labels";
import CameraEvents from "../Components/IndoorDirections/CameraEvents";
import FloorSelector from "../Components/IndoorDirections/FloorSelector";
import AccessibleToggle from "../Components/IndoorDirections/AccessibleToggle";
import IndoorPOI from "../Components/IndoorDirections/IndoorPOI";
import SearchNavigation from "../Components/IndoorDirections/SearchNavigation";

const BUILDINGS = {
  "Hall Building": "67b0241a845fda000bf299cb",
  "EV Building": "67b023355b54d7000b151b86",
};

export default function IndoorDirections() {
  const [accessible, setAccessible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState("Hall Building");
  const mapId = BUILDINGS[selectedBuilding]; 

  

  const { isLoading, error, mapData } = useMapData({
    key: import.meta.env.VITE_MAPPEDIN_KEY as string,
    secret: import.meta.env.VITE_MAPPEDIN_SECRET as string,
    mapId,
  });
  

  useEffect(() => {
    if (mapData) {
      console.log(" New Map Data Loaded:", mapData);
    }
  }, [mapData]);

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="flex-1 flex items-center justify-center text-red-500">Error loading map</div>;
  }

  return (
    <div className="flex flex-col relative h-[calc(100vh-128px)] w-full bg-gray-50">
      <BuildingSelector
        selectedBuilding={selectedBuilding}
        onBuildingSelect={setSelectedBuilding}
      />

      {mapData && (
        <MapView
          key={mapId} 
          mapData={mapData}
          className="flex-1 w-full relative"
          options={{ backgroundColor: "#f9fafb" , showWatermark: false }}
        >
          {/* Map children components */}
          

          <div className="absolute top-4 left-0 right-0 px-4 z-50">
            <SearchNavigation accessible={accessible} />
          </div>

          <div className="hidden md:block">
            <CameraEvents />
          </div>

          <div className="absolute bottom-4 left-0 right-0 px-4 z-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="md:hidden w-full">
                <CameraEvents />
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <FloorSelector />
                <AccessibleToggle setAccessible={setAccessible} />
                <IndoorPOI />
              </div>
            </div>
          </div>

          <Labels />
        </MapView>
      )}
    </div>
  );
}