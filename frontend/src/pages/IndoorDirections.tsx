import { MapView, useMapData } from "@mappedin/react-sdk"
import "@mappedin/react-sdk/lib/esm/index.css"
import { useState, useEffect } from "react"
import BuildingSelector from "../components/IndoorDirections/BuildingSelector"
import Labels from "../components/IndoorDirections/Labels"
import CameraEvents from "../components/IndoorDirections/CameraEvents"
import FloorSelector from "../components/IndoorDirections/FloorSelector"
import AccessibleToggle from "../components/IndoorDirections/AccessibleToggle"
import IndoorPOI from "../components/IndoorDirections/IndoorPOI"
import SearchNavigation from "../components/IndoorDirections/SearchNavigation"

const BUILDINGS: Record<string, string> = {
  "SWG Campus": "67b0241a845fda000bf299cb",
  "Loyola Campus": "67b023355b54d7000b151b86",
}

export default function IndoorDirections() {
  const [accessible, setAccessible] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState<keyof typeof BUILDINGS>("SWG Campus")

  // Fetch map data for both buildings
  const {
    isLoading: isLoadingSWG,
    error: errorSWG,
    mapData: mapDataSWG,
  } = useMapData({
    key: import.meta.env.VITE_MAPPEDIN_KEY as string,
    secret: import.meta.env.VITE_MAPPEDIN_SECRET as string,
    mapId: BUILDINGS["SWG Campus"],
  })

  const {
    isLoading: isLoadingLoyola,
    error: errorLoyola,
    mapData: mapDataLoyola,
  } = useMapData({
    key: import.meta.env.VITE_MAPPEDIN_KEY as string,
    secret: import.meta.env.VITE_MAPPEDIN_SECRET as string,
    mapId: BUILDINGS["Loyola Campus"],
  })

  // Determine which map data to use based on the selected building
  const currentMapData = selectedBuilding === "SWG Campus" ? mapDataSWG : mapDataLoyola
  const isLoading = selectedBuilding === "SWG Campus" ? isLoadingSWG : isLoadingLoyola
  const error = selectedBuilding === "SWG Campus" ? errorSWG : errorLoyola

  useEffect(() => {
    if (currentMapData) {
      console.log("New Map Data Loaded:", currentMapData)
    }
  }, [currentMapData])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-128px)] bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          <div className="w-16 h-16 border-r-4 border-transparent border-solid rounded-full absolute top-0 animate-ping opacity-75"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading map data...</p>
        <p className="text-sm text-gray-400">Please wait while we prepare your navigation experience</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-128px)] bg-gray-50">
        <div className="text-red-500 text-xl mb-2">Error loading map</div>
        <p className="text-gray-600">Please try refreshing the page or select a different building</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col relative h-[calc(100vh-128px)] w-full bg-gray-50">
      <BuildingSelector selectedBuilding={selectedBuilding} onBuildingSelect={setSelectedBuilding} />

      {/* Render the MapView for the selected building */}
      {currentMapData && (
        <MapView
          key={selectedBuilding} // Use the building name as the key to force re-render
          mapData={currentMapData}
          className="flex-1 w-full relative"
        >
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
  )
}

