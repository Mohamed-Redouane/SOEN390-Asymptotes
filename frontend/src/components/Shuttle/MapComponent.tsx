
import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import type L from "leaflet"
import { Button } from "../../components/ui/button"
import { MapPin, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { MapControls } from "./MapControls"
import { MapLegend } from "./MapLegend"
import { MapController } from "./MapController"
import { createCustomIcon } from "../../utils/leaflet-utils"
import { getDisplayName } from "../../utils/display-utils"
import type { MapComponentProps } from "../types"

export const MapComponent = ({ busLocations, campusPoints, onCenterMap }: MapComponentProps) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([45.48469766613475, -73.6083984375])
  const [mapZoom, setMapZoom] = useState(13)
  const [mapType, setMapType] = useState("streets")
  const mapRef = useRef<L.Map | null>(null)
  const centerMapRef = useRef<(location: { lat: number; lng: number }) => void>(() => {})

  const getTileLayer = () => {
    switch (mapType) {
      case "satellite":
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      case "hybrid":
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
      case "terrain":
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
      default:
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    }
  }

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1)
    }
  }

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1)
    }
  }

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: [number, number] = [position.coords.latitude, position.coords.longitude]
          setMapCenter(userLocation)
          setMapZoom(15)
        },
        () => {
          alert("Could not get your location")
        },
      )
    }
  }

  const handleMapTypeChange = (type: string) => {
    setMapType(type)
  }

  useEffect(() => {

    centerMapRef.current = (location: { lat: number; lng: number }) => {
      setMapCenter([location.lat, location.lng])
      setMapZoom(16)
    }


    if (typeof onCenterMap === "function") {
      onCenterMap = centerMapRef.current
    }
  }, [])


  const routeLine =
    campusPoints.length === 2
      ? [
          [campusPoints[0].Latitude, campusPoints[0].Longitude],
          [campusPoints[1].Latitude, campusPoints[1].Longitude],
        ]
      : []

  return (
    <div
      className="relative w-full h-[calc(100vh-13rem)] md:h-[500px] rounded-lg overflow-hidden border border-gray-200"
      style={{ position: "relative", zIndex: 1 }}
    >
     <MapContainer
  center={mapCenter}
  zoom={mapZoom}
  style={{ height: "100%", width: "100%" }}
  zoomControl={false}
  whenReady={() => {

    if (mapRef && mapRef.current === null) {
      mapRef.current = (window as any).L?.map?.instance || undefined
    }
  }}
>


        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={getTileLayer()}
        />

        {/* Route line with updated color */}
        <Polyline
          positions={routeLine as L.LatLngExpression[]}
          color="#26a69a"
          weight={4}
          opacity={0.7}
          dashArray="10, 10"
        />

        {/* Campus markers */}
        {campusPoints.map((point) => (
          <Marker
            key={point.ID}
            position={[point.Latitude, point.Longitude]}
            icon={createCustomIcon("campus", point.ID === "GPLoyola" ? "loyola" : "sgw")}
          >
            <Popup className="rounded-lg shadow-lg">
              <div className="p-1">
                <h3 className="font-medium text-sm">{getDisplayName(point.ID)}</h3>
                <p className="text-xs text-gray-500 mt-1">Campus Location</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Bus markers */}
        {busLocations.map((bus) => (
          <Marker key={bus.ID} position={[bus.Latitude, bus.Longitude]} icon={createCustomIcon("bus")}>
            <Popup className="rounded-lg shadow-lg">
              <div className="p-1">
                <h3 className="font-medium text-sm">{getDisplayName(bus.ID)}</h3>
                <p className="text-xs text-gray-500 mt-1">Active Shuttle</p>
              </div>
            </Popup>
          </Marker>
        ))}


        <MapController center={mapCenter} zoom={mapZoom} />
      </MapContainer>


      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onMyLocation={handleMyLocation}
        onMapTypeChange={handleMapTypeChange}
      />


      <MapLegend />


      <div className="absolute bottom-3 left-3 flex flex-col gap-2 z-[1000]">
        {campusPoints.map((campus) => (
          <Button
            key={campus.ID}
            variant="secondary"
            size="sm"
            className={cn(
              "shadow-md text-xs font-medium transition-all hover:translate-x-1",
              campus.ID === "GPLoyola"
                ? "bg-white hover:bg-gray-50 text-teal-700 border border-teal-200"
                : "bg-white hover:bg-gray-50 text-orange-700 border border-orange-200",
            )}
            onClick={() => centerMapRef.current({ lat: campus.Latitude, lng: campus.Longitude })}
          >
            <MapPin className={cn("h-3 w-3 mr-1", campus.ID === "GPLoyola" ? "text-teal-600" : "text-orange-600")} />
            {getDisplayName(campus.ID)}
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        ))}
      </div>
    </div>
  )
}

