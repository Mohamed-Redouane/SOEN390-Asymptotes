import type React from "react"

import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps"
import { useState, useContext, useEffect } from "react"
import { LocationContext } from "../components/LocationContext"
import MapComponent from "../components/MapComponent"
import ToggleCampus from "../components/ToggleCampusComponent"
import { FaStar, FaBuilding } from "react-icons/fa"
import ModalPOI from "../components/ModalPOI"
import BuildingMarkers from "../components/BuildingMarkers"
import { useNavigate } from "react-router-dom"

type CampusType = "SGW" | "LOYOLA"

// Define types for Google Maps Places API responses
interface PlaceResult {
  place_id: string
  name: string
  vicinity: string
  rating?: number
  geometry: {
    location: google.maps.LatLng
  }
  opening_hours?: {
    open_now: boolean
  }
  photos?: Array<{
    getUrl: (opts: { maxWidth: number; maxHeight: number }) => string
  }>
}

// Define PlacesServiceStatus enum type
type PlacesServiceStatus = 
  | "OK"
  | "ZERO_RESULTS"
  | "OVER_QUERY_LIMIT"
  | "REQUEST_DENIED"
  | "INVALID_REQUEST"
  | "UNKNOWN_ERROR"

const CAMPUS_COORDINATES: { [key in CampusType]: { lat: number; lng: number } } = {
  SGW: { lat: 45.4949, lng: -73.5779 },
  LOYOLA: { lat: 45.4583, lng: -73.6403 },
}

declare global {
  interface Window {
    google: any
  }
}

function CampusMap() {
  const [geoJsonData, setGeoJsonData] = useState<any>(null)
  const { location: userLocation } = useContext(LocationContext)
  const [isUserInsideBuilding, setIsUserInsideBuilding] = useState(false)
  const [campus, setCampus] = useState<CampusType>("SGW")
  const [pointsOfInterest, setPointsOfInterest] = useState<PlaceResult[]>([])
  const [radius, setRadius] = useState(100)
  const [prevRadius, setPrevRadius] = useState(100)
  const [poiType, setPoiType] = useState("restaurant")
  const [prevPoiType, setPrevPoiType] = useState("restaurant")
  const [loading, setLoading] = useState(false)
  const [selectedPoi, setSelectedPoi] = useState<PlaceResult | null>(null)
  const [showPOIs, setShowPOIs] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [center, setCenter] = useState(CAMPUS_COORDINATES.SGW)
  const [showBuildings, setShowBuildings] = useState(false)
  const navigate = useNavigate()
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0)

  // Track window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    fetch("/Building.geojson")
      .then((response) => response.json())
      .then((data) => {
        setGeoJsonData(data)
        console.log("CampusMap.tsx: setGeoJsonData")
      })
      .catch((error) => console.log("Error loading Campus GeoJSON:", error))
    console.log("CampusMap.tsx: fetch Building.geojson")
  }, [])

  useEffect(() => {
    setCenter(CAMPUS_COORDINATES[campus])
    console.log("CampusMap.tsx: campus changed to", campus, "center set to", CAMPUS_COORDINATES[campus])
  }, [campus])

  useEffect(() => {
    if (userLocation) {
      performNearbySearch(userLocation)
    }
  }, [radius, userLocation, poiType])

  const handleMapLoad = (event: any) => {
    const map = event.target as google.maps.Map
    if (userLocation) {
      performNearbySearch(userLocation, map)
    }
  }

  // Extracted handler for nearby search results
  const handleNearbySearchResults = (
    results: PlaceResult[] | null, 
    status: PlacesServiceStatus
  ) => {
    setLoading(false)
    if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results) {
      console.error("Nearby search failed:", status)
      return
    }

    const newPoints = results.filter(
      (newPoint) => !pointsOfInterest.some(
        (prevPoint) => prevPoint.place_id === newPoint.place_id
      )
    )
    setPointsOfInterest([...pointsOfInterest, ...newPoints])
  }

  const performNearbySearch = (location: { lat: number; lng: number }, map?: google.maps.Map) => {
    if (typeof window === "undefined" || !window.google?.maps?.places) {
      console.error("Google Maps API is not fully loaded.")
      return
    }

    setLoading(true)
    console.log("Performing nearby search with radius:", radius, "and type:", poiType)
    if (radius < prevRadius || poiType !== prevPoiType) {
      setPointsOfInterest([])
    }
    setPrevRadius(radius)
    setPrevPoiType(poiType)
    const service = new window.google.maps.places.PlacesService(map || document.createElement("div"))
    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: radius,
      type: poiType,
    }

    service.nearbySearch(request, handleNearbySearchResults)
  }

  const filterPointsOfInterest = () => {
    if (!userLocation) return pointsOfInterest

    const userLatLng = new window.google.maps.LatLng(userLocation.lat, userLocation.lng)
    return pointsOfInterest.filter((poi) => {
      const poiLocation = poi.geometry.location;
      const poiLatLng = new window.google.maps.LatLng(
        poiLocation.lat(), 
        poiLocation.lng()
      )
      return window.google.maps.geometry.spherical.computeDistanceBetween(
        userLatLng, 
        poiLatLng
      ) <= radius;
    })
  }

  function handleToggle() {
    setCampus((prevCampus) => {
      const newCampus = prevCampus === "SGW" ? "LOYOLA" : "SGW"
      setCenter(CAMPUS_COORDINATES[newCampus])
      return newCampus
    })
  }

  const onChange = (args: any) => {
    console.log(args.map.center)
    setCenter(args.map.center)
  }

  const handleRadiusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRadius(Number(event.target.value))
  }

  const handlePoiTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPoiType(event.target.value)
  }

  const togglePOIs = () => {
    setShowPOIs((prevShowPOIs) => !prevShowPOIs)
    setIsModalOpen(false)
  }

  const toggleModal = () => {
    setIsModalOpen((prevIsModalOpen) => !prevIsModalOpen)
  }

  // Responsive button styles
  const getButtonStyles = (isSmallScreen: boolean) => {
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: isSmallScreen ? "6px 12px" : "8px 16px",
      fontSize: isSmallScreen ? "12px" : "14px",
      fontWeight: "500",
      color: "white",
      borderRadius: "20px",
      background: "rgba(90, 45, 162, 0.7)", // Transparent violet color
      backdropFilter: "blur(4px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(31, 38, 135, 0.3)",
      transition: "all 0.3s ease",
      width: "auto",
      letterSpacing: "0.5px",
    }
  }

  // Common event handlers for hover/focus effects
  const handleElementEnter = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translateY(-2px)"
    e.currentTarget.style.boxShadow = "0 6px 15px rgba(31, 38, 135, 0.5)"
    e.currentTarget.style.background = "rgba(90, 45, 162, 0.85)"
  }

  const handleElementLeave = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translateY(0)"
    e.currentTarget.style.boxShadow = "0 4px 10px rgba(31, 38, 135, 0.3)"
    e.currentTarget.style.background = "rgba(90, 45, 162, 0.7)"
  }

  const getBuildingToggleText = (isSmallScreen: boolean, showBuildings: boolean) => {
    if (isSmallScreen) {
      return showBuildings ? "Hide" : "Show";
    }
    return showBuildings ? "Hide Buildings" : "Show Buildings";
  }

  // Determine if we're on a small screen
  const isSmallScreen = windowWidth < 768
  const buttonContainerTop = isSmallScreen ? "70px" : "80px"
  const buttonGap = isSmallScreen ? "6px" : "10px"

  return (
    <div>
      {loading && <div className="fixed w-full">Loading...</div>}

    <ModalPOI isOpen={isModalOpen} onClose={toggleModal} title="Explore">
      <div className="space-y-4">
        {/* Radius Selection */}
        <div className="space-y-2">
          <label htmlFor="radius" className="text-[#5A2DA2] font-medium text-sm">
            Search Radius
          </label>
          <div className="space-y-2">
            <select
              id="radius"
              value={radius}
              onChange={handleRadiusChange}
              className="w-full p-2 text-sm rounded-lg bg-white/70 border border-white/40 backdrop-blur-sm focus:border-[#5A2DA2]/50 focus:ring-1 focus:ring-[#5A2DA2]/20 outline-none transition-all"
            >
              <option value={100}>100 meters</option>
              <option value={200}>200 meters</option>
              <option value={500}>500 meters</option>
              <option value={1000}>1000 meters</option>
            </select>

            <div className="relative">
              <input
                type="number"
                min="1"
                placeholder="Custom radius"
                className="w-full p-2 text-sm pl-3 pr-7 rounded-lg bg-white/70 border border-white/40 backdrop-blur-sm focus:border-[#5A2DA2]/50 focus:ring-1 focus:ring-[#5A2DA2]/20 outline-none transition-all"
                onBlur={(e) => {
                  setRadius(+e.target.value > 0 ? Number(e.target.value) : 1)
                }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">m</span>
            </div>
          </div>
        </div>

        {/* POI Type Selection */}
        <div className="space-y-2">
          <label htmlFor="poiType" className="text-[#5A2DA2] font-medium text-sm">
            Point of Interest Type
          </label>
          <select
            id="poiType"
            value={poiType}
            onChange={handlePoiTypeChange}
            className="w-full p-2 text-sm rounded-lg bg-white/70 border border-white/40 backdrop-blur-sm focus:border-[#5A2DA2]/50 focus:ring-1 focus:ring-[#5A2DA2]/20 outline-none transition-all"
          >
            <option value="restaurant">Restaurant</option>
            <option value="cafe">Cafe</option>
            <option value="library">Library</option>
            <option value="park">Park</option>
            <option value="store">Store</option>
            <option value="gym">Gym</option>
            <option value="museum">Museum</option>
            <option value="hospital">Hospital</option>
            <option value="school">School</option>
          </select>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4">
        <button
          onClick={togglePOIs}
          className="w-full py-2 px-3 bg-[#5A2DA2] hover:bg-[#4b29f1] text-white font-medium rounded-lg transition-all duration-300 text-sm"
        >
          {showPOIs ? "Hide Points of Interest" : "Show Points of Interest"}
        </button>
      </div>
    </ModalPOI>
      <div style={{ height: "86vh", width: "100vw", zIndex: -1 }} id="map" data-center={campus}>
        <ToggleCampus campus={campus} onClick={handleToggle} data-testid="toggle-button" />

        <div
          style={{
            position: "absolute",
            top: buttonContainerTop,
            left: "15px",
            display: "flex",
            gap: buttonGap,
            zIndex: 999,
            maxWidth: "fit-content",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={toggleModal}
            style={getButtonStyles(isSmallScreen)}
            onMouseOver={handleElementEnter}
            onMouseOut={handleElementLeave}
            onFocus={handleElementEnter}
            onBlur={handleElementLeave}
            aria-label="Explore points of interest"
          >
            <FaStar style={{ marginRight: isSmallScreen ? "4px" : "6px", fontSize: isSmallScreen ? "10px" : "12px" }} />
            Explore
          </button>
          <button
            onClick={() => setShowBuildings((prev) => !prev)}
            style={getButtonStyles(isSmallScreen)}
            onMouseOver={handleElementEnter}
            onMouseOut={handleElementLeave}
            onFocus={handleElementEnter}
            onBlur={handleElementLeave}
            aria-label={showBuildings ? "Hide buildings" : "Show buildings"}
          >
            <FaBuilding
              style={{ marginRight: isSmallScreen ? "4px" : "6px", fontSize: isSmallScreen ? "10px" : "12px" }}
            />
            {getBuildingToggleText(isSmallScreen, showBuildings)}
          </button>
        </div>

        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["geometry", "places"]}>
          <Map
            defaultZoom={17}
            center={center}
            mapTypeControl={false}
            fullscreenControl={false}
            onCenterChanged={onChange}
            onTilesLoaded={handleMapLoad}
          >
            {geoJsonData && (
              <MapComponent geoJsonData={geoJsonData} setIsUserInsideBuilding={setIsUserInsideBuilding} />
            )}
            {isUserInsideBuilding && userLocation && <Marker position={userLocation} />}
            {showBuildings && geoJsonData && <BuildingMarkers geoJsonData={geoJsonData} />}

            {showPOIs &&
              filterPointsOfInterest().map((poi, index) => (
                <Marker
                  key={index}
                  position={poi.geometry.location}
                  onClick={() => {
                    console.log("Selected POI:", poi)
                    setSelectedPoi(poi)
                  }}
                />
              ))}
            {selectedPoi && (
              <InfoWindow position={selectedPoi.geometry.location} onCloseClick={() => setSelectedPoi(null)}>
                <div className="max-w-[250px] bg-white rounded-lg p-3 shadow-md text-gray-800 font-sans">
                  <h3 className="text-xl font-bold text-[#5A2DA2] mb-2">{selectedPoi.name}</h3>
                  <p style={{ margin: "0 0 5px 0", fontSize: "14px" }}>{selectedPoi.vicinity}</p>
                  <p style={{ margin: "0 0 5px 0", fontSize: "14px" }}>Rating: {selectedPoi.rating}</p>
                  {selectedPoi.opening_hours && (
                    <p style={{ margin: "0 0 5px 0", fontSize: "14px" }}>
                      {selectedPoi.opening_hours.open_now ? "Now Open" : "Closed"}
                    </p>
                  )}
                  {selectedPoi.photos && selectedPoi.photos.length > 0 && (
                    <img
                      src={selectedPoi.photos[0].getUrl({ maxWidth: 400, maxHeight: 200 })}
                      alt={selectedPoi.name}
                      style={{ width: "100%", height: "auto", borderRadius: "5px" }}
                    />
                  )}
                  <button
                    className="mt-3 rounded-lg bg-[#5A2DA2] text-white font-bold px-4 py-2 cursor-pointer hover:bg-[#4b29f1]"
                    onClick={() => {
                      const modifiedAddress = `${selectedPoi.vicinity} `
                      navigate("/directions", { state: { destination: modifiedAddress } })
                    }}
                  >
                    Get Directions
                  </button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>
    </div>
  )
}

export default CampusMap