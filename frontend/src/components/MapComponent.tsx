import React, { useState, useEffect, Suspense } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { useNavigate } from 'react-router-dom';
import { LocationContext } from "./LocationContext";
import type { MapMouseEvent } from '@vis.gl/react-google-maps';

// Lazy load non-critical components
const BuildingMarkers = React.lazy(() => import('./BuildingMarkers'));
const UserLocation = React.lazy(() => import('./UserLocation'));

interface MapComponentProps {
    geoJsonData: {
        features: Array<{
            geometry: {
                type: string;
                coordinates: Array<Array<[number, number]>>;
            };
            properties: {
                name?: string;
                label?: string;
            };
        }>;
    };
    onMapClick?: (e: MapMouseEvent) => void;
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

const MapComponent: React.FC<MapComponentProps> = ({ geoJsonData, onMapClick }) => {
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [visibleMarkers, setVisibleMarkers] = useState<typeof geoJsonData.features>([]);
    const navigate = useNavigate();
    const { location: userLocation } = React.useContext(LocationContext);
    const map = useMap();

    useEffect(() => {
        if (!geoJsonData?.features) return;

        // Progressive loading of markers
        const markers = geoJsonData.features;
        const batchSize = 10;
        let currentIndex = 0;

        const loadNextBatch = () => {
            const nextBatch = markers.slice(currentIndex, currentIndex + batchSize);
            setVisibleMarkers(prev => [...prev, ...nextBatch]);
            currentIndex += batchSize;

            if (currentIndex < markers.length) {
                setTimeout(loadNextBatch, 50);
            }
        };

        loadNextBatch();

        return () => {
            setVisibleMarkers([]);
        };
    }, [geoJsonData]);

    useEffect(() => {
        if (map) {
            setIsMapLoaded(true);
        }
    }, [map]);

    useEffect(() => {
        if (!map || !geoJsonData) return;

        map.data.forEach((feature) => map.data.remove(feature));
        
        // Load GeoJSON
        map.data.addGeoJson(geoJsonData);
        initMapGeometry(map, userLocation);
        
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
    }, [map, geoJsonData, userLocation]);

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <Map
                defaultCenter={{ lat: 45.4949, lng: -73.5779 }}
                defaultZoom={15}
                gestureHandling={'greedy'}
                disableDefaultUI={false}
                onClick={onMapClick}
                mapTypeControl={false}
                fullscreenControl={false}
            >
                {isMapLoaded && (
                    <>
                        <Suspense fallback={null}>
                            <UserLocation />
                        </Suspense>
                        
                        <Suspense fallback={null}>
                            {visibleMarkers.length > 0 && (
                                <BuildingMarkers geoJsonData={{ ...geoJsonData, features: visibleMarkers }} />
                            )}
                        </Suspense>
                    </>
                )}
            </Map>
        </APIProvider>
    );
};

export default MapComponent;
