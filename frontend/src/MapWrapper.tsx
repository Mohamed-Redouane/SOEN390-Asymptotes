// MapWrapper.tsx
import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import IntegratedMapComponent from './MapComponent';

const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function MapWrapper() {
  return (
    <APIProvider
      apiKey={googleKey}
      libraries={["geometry"]}
      onLoad={() => console.log("Maps API has loaded.")}
    >
      <IntegratedMapComponent />
    </APIProvider>
  );
}

export default MapWrapper;
