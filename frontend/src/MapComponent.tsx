import './App.css'
import {APIProvider, Map, MapCameraChangedEvent} from '@vis.gl/react-google-maps';



function MapComponent() {
 

  return (

      <APIProvider apiKey={'AIzaSyAlwcko-mshwhZCheZpMjEJCwVBZ8Hhb-Q'} onLoad={() => console.log('Maps API has loaded.')}>
      <Map
      defaultZoom={10}
      defaultCenter={ { lat: -33.860664, lng: 151.208138 } }
      onCameraChanged={ (ev: MapCameraChangedEvent) =>
        console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
      }>
      </Map>
      </APIProvider>

    
  );
}

export default MapComponent