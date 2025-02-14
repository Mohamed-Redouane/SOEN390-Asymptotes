import React, { useEffect, useContext, useState } from "react";
import Modal from "./Modal";
import { LocationContext } from "./LocationContext";
import { distanceCalculation } from "../utils/distanceCalculation";

function UserLocation() {
  const { location, setLocation, error, setError } = useContext(LocationContext);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(true);
  const [isOnCampus, setIsOnCampus] = useState<boolean | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [hasReceivedLocation, setHasReceivedLocation] = useState<boolean>(false);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  
  useEffect(() => {
    fetch("/Building.geojson")
      .then((response) => response.json())
      .then((data) => {
        setGeoJsonData(data);
      })
      .catch((error) => {
        console.error("Error loading GeoJSON data:", error);
      });
  }, []);

  
  const isFarFromCampusBuildings = (userLat: number, userLng: number): boolean => {
    if (!geoJsonData) return false; 

    const thresholdDistance = 0.5; 
    let isFar = true;

    geoJsonData.features.forEach((feature: any) => {
      const geometry = feature.geometry;
      if (geometry.type === "Polygon") {
        geometry.coordinates[0].forEach((coord: [number, number]) => {
          const [lng, lat] = coord;
          const distance = distanceCalculation(userLat, userLng, lat, lng);
          if (distance <= thresholdDistance) {
            isFar = false; 
          }
        });
      }
    });

    return isFar;
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const success = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      console.log(`New Location: Lat: ${latitude}, Lng: ${longitude}, Accuracy: ${accuracy}m`);

      setHasReceivedLocation(true);

      if (accuracy > 2000) {
        console.warn("Waiting for better accuracy...");
        if (isOnCampus === null) {
          setIsModalVisible(true);
        }
        return;
      }
      
      if (isFarFromCampusBuildings(latitude, longitude)) {
        console.warn("User is far from campus buildings.");
        setIsModalVisible(true);
        return;
      }

      setLocation({ lat: latitude, lng: longitude });
      setIsCalibrating(false);
      setError(null);
      setIsModalVisible(false);
    };

    const handleError = (err: GeolocationPositionError) => {
      setError("Failed to get location. Please allow access and try later.");
      console.error(err);
    };

    const id = navigator.geolocation.watchPosition(success, handleError, {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    });

    setWatchId(id);

    return () => {
      navigator.geolocation.clearWatch(id);
      console.log("Stopped watching location.");
    };
  }, [setLocation, setError, geoJsonData]);

  const handleConfirm = () => {
    setIsOnCampus(true);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsOnCampus(false);
    setIsModalVisible(false);
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      console.log("Location tracking stopped.");
    }
  };

  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : !hasReceivedLocation ? null : isModalVisible ? null : isOnCampus === false ? (
        <p>You are not on campus.</p>
      ) : isOnCampus === true ? (
        <p>Please move closer to a window or an open area to improve GPS accuracy.</p>
      ) : null}

      {isModalVisible && (
        <Modal
          message="Are you on campus?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default UserLocation;
