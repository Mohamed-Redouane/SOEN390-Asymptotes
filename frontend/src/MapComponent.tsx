// IntegratedMapComponent.tsx
import { useLocation as useRouterLocation } from 'react-router-dom';
import { APIProvider, Map, Marker, MapCameraChangedEvent, useMap } from '@vis.gl/react-google-maps';
import { useContext, useEffect, useState } from 'react';
import { LocationContext } from './components/LocationContext';
import './App.css';

const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const CAMPUS_COORDINATES = {
  SGW: { lat: 45.4949, lng: -73.5779 },
  LOY: { lat: 45.4584, lng: -73.6405 },
};

const getCampusKey = (coordinates: { lat: number; lng: number }) => {
  return Object.keys(CAMPUS_COORDINATES).find(
    key =>
      CAMPUS_COORDINATES[key as keyof typeof CAMPUS_COORDINATES].lat === coordinates.lat &&
      CAMPUS_COORDINATES[key as keyof typeof CAMPUS_COORDINATES].lng === coordinates.lng
  ) || null;
};

function IntegratedMapComponent() {
  // Get campus info from router state.
  const routerLocation = useRouterLocation();
  // Get the user's geolocation from context.
  const { location: userLocation } = useContext(LocationContext);

  // The map center is based on campus if provided, otherwise on the user location.
  const [center, setCenter] = useState(CAMPUS_COORDINATES.SGW);
  const [zoomSetting, setZoomSetting] = useState(17);
  const [highlightedBuilding, setHighlightedBuilding] = useState<string | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Set the center based on router state or user location.
  // If a campus is specified, always use the campus coordinates.
  useEffect(() => {
    if (routerLocation.state?.campus) {
      const campus = routerLocation.state.campus as keyof typeof CAMPUS_COORDINATES;
      setCenter(CAMPUS_COORDINATES[campus]);
      if (routerLocation.state.resetZoom) {
        setZoomSetting(17);
      }
    } else if (userLocation) {
      setCenter(userLocation);
    }
  }, [routerLocation, userLocation]);

  // Fetch GeoJSON data.
  useEffect(() => {
    fetch("/Building.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("GeoJSON data fetched:", data);
        setGeoJsonData(data);
      })
      .catch((error) => {
        console.error("Error loading GeoJSON data:", error);
      });
  }, []);

  const map = useMap();

  // Only recenter on user location if no campus is specified.
  useEffect(() => {
    if (map && userLocation && !routerLocation.state?.campus) {
      console.log("Recentering map to user location:", userLocation);
      map.setCenter(userLocation);
    }
  }, [map, userLocation, routerLocation]);

  // Process GeoJSON to highlight buildings.
  useEffect(() => {
    if (map && geoJsonData) {
      const dataLayer = new google.maps.Data();
      dataLayer.addGeoJson(geoJsonData);
      dataLayer.setStyle({
        fillColor: "blue",
        strokeWeight: 2,
        strokeColor: "white",
        fillOpacity: 0.5,
      });
      if (userLocation) {
        const currentUserLocation = new google.maps.LatLng(userLocation.lat, userLocation.lng);
        dataLayer.forEach((feature) => {
          const geometry = feature.getGeometry();
          console.log("Feature geometry type:", geometry?.getType());
          if (geometry && geometry.getType() === "Polygon") {
            const polygonData = geometry as google.maps.Data.Polygon;
            const paths = polygonData.getArray().map((path) => path.getArray());
            const polygon = new google.maps.Polygon({ paths });
            if (google.maps.geometry.poly.containsLocation(currentUserLocation, polygon)) {
              const buildingName = feature.getProperty("name") as string;
              setHighlightedBuilding(buildingName);
              dataLayer.overrideStyle(feature, {
                fillColor: "red",
                fillOpacity: 0.8,
              });
            } else {
              dataLayer.overrideStyle(feature, {
                fillColor: "blue",
                fillOpacity: 0.5,
              });
            }
          }
        });
      }
      dataLayer.setMap(map);
    }
  }, [map, userLocation, geoJsonData, setHighlightedBuilding]);

  return (
    <div
      id="map-container"
      data-zoom={zoomSetting}
      data-location={getCampusKey(center)}
      className="flex flex-col top-0 left-0 w-screen h-screen"
    >
      <Map
        zoom={zoomSetting}
        center={center}
        gestureHandling="greedy"
        onCameraChanged={(ev: MapCameraChangedEvent) => {
          console.log("Camera changed:", ev.detail.center, "Zoom:", ev.detail.zoom);
          setZoomSetting(ev.detail.zoom);
          setCenter(ev.detail.center);
        }}
      >
        {/* Always render the user marker if available */}
        {userLocation && (
          <Marker
            position={userLocation}
            
          />
        )}
      </Map>
      {highlightedBuilding && <p>You are inside: {highlightedBuilding}</p>}
    </div>
  );
}

export default IntegratedMapComponent;
