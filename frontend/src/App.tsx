import './App.css'
import MapComponent from './MapComponent';



function App() {
 

  return (
        // The div needs a constant height and width to display the map
      <div style={{height: '85vh', width: '75vw'}}>
        <MapComponent />
      </div>
  );
}

export default App