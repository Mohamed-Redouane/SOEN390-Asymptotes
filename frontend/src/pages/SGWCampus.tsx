import '../App.css'
import {APIProvider, Map, MapCameraChangedEvent} from '@vis.gl/react-google-maps';
const googleKey=import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function SGWCampus() {

    return (
    
          <APIProvider apiKey={googleKey} onLoad={() => console.log('SGW Maps API has loaded.')}>
          <Map
          defaultZoom={17}
          defaultCenter={ { lat: 45.494899791875476, lng: -73.577922853963 } }
          onCameraChanged={ (ev: MapCameraChangedEvent) =>
            console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
          }>
          </Map>
          </APIProvider>
    
        
      ); 
}