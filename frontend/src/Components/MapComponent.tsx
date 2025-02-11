import { useLocation } from 'react-router-dom';
import '../App.css'
import { APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';


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


function MapComponent() {
  
  const location = useLocation(); //this is the location of the current page ( not related to the campus locations)
  const [center, setCenter] = useState(CAMPUS_COORDINATES.SGW);
  const [zoomSetting, setZoomSetting] = useState(17);

  useEffect(() => {
    console.log("location: ", location);
    if (location.state?.campus) {
      //this sets the center of the map to the campus location specified by the state
      setCenter(CAMPUS_COORDINATES[location.state.campus as keyof typeof CAMPUS_COORDINATES]);
      if (location.state.resetZoom) {
        setZoomSetting(17);
      }

    }
  }, [location]);

  return (
     <div  id="map-container" data-zoom={zoomSetting} data-location ={getCampusKey(center)} className="flex flex-col top-0 left-0 w-screen h-screen">
      <APIProvider apiKey={googleKey} onLoad={() => console.log('Maps API has loaded.')}>

        <Map
         zoom={zoomSetting}
          center={center}
          gestureHandling="greedy"
          onCameraChanged={(ev: MapCameraChangedEvent) =>{
            console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom);
            setZoomSetting(ev.detail.zoom);
            setCenter(ev.detail.center);
          }
          }>
        </Map>
      </APIProvider>
    </div>
  );
}

export default MapComponent