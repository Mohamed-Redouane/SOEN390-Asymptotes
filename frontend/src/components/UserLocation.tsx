import React, { useEffect, useContext, useState } from "react";
import Modal from "./Modal";
import { LocationContext } from "./LocationContext";

function UserLocation() {
  const { location, setLocation, error, setError } = useContext(LocationContext);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(true);
  const [isOnCampus, setIsOnCampus] = useState<boolean | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const success = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      console.log(`New Location: Lat: ${latitude}, Lng: ${longitude}, Accuracy: ${accuracy}m`);

      if (accuracy > 2000) {
        console.warn("Waiting for better accuracy...");
        if (isOnCampus === null) {
          setIsModalVisible(true);
        }
        return;
      }

      // Update the shared context with the new location.
      setLocation({ lat: latitude, lng: longitude });
      setIsCalibrating(false);
      setError(null);
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
  }, [setLocation, setError, isOnCampus]);

  const handleConfirm = () => {
    setIsOnCampus(true);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsOnCampus(false);
    setIsCalibrating(false);
    setIsModalVisible(false);
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      console.log("Location tracking stopped.");
    }
  };

  return (
    <div>
      <h2>Your Location</h2>
      {error ? (
        <p>{error}</p>
      ) : isCalibrating ? (
        <p>Waiting for better accuracy...</p>
      ) : location ? (
        <p>Latitude: {location.lat}, Longitude: {location.lng}</p>
      ) : isOnCampus === false ? (
        <p>You are not on campus.</p>
      ) : (
        <p>Fetching your location...</p>
      )}

      {isModalVisible && (
        <Modal
          message="Are you on campus? If yes, please move closer to a window or an open area to improve GPS accuracy."
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default UserLocation;
