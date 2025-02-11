// App.tsx
import './App.css';
import BottomNavBar from './components/BottomNavBar';
import NavBar from './components/NavBar';
import { Routes, Route } from 'react-router-dom';
import { LocationProvider } from './components/LocationContext';
import MapWrapper from './MapWrapper';
import UserLocation from './components/UserLocation';

function App() {
  return (
    <div className="flex flex-col top-0 left-0 w-screen h-screen">
      <>
        <NavBar />
        <Routes>
          <Route
            path="/map"
            element={
              <LocationProvider>
                <MapWrapper />
                <UserLocation />
              </LocationProvider>
            }
          />
          {/* Other routes */}
        </Routes>
        <div className='fixed bottom-0 w-full'>
          <BottomNavBar />
        </div>
      </>
    </div>
  );
}

export default App;
