import MapRounded from '@mui/icons-material/MapRounded';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsRoundedIcon from '@mui/icons-material/DirectionsRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, ThemeProvider, createTheme } from '@mui/material';



const theme = createTheme({
  components: {
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: "#757575", // Default color
          "&.Mui-selected": {
            background: "#0096d7", // Accent color of background when selected
            color: "#fff", // Accent color of text when selected
          },
        },
      },
    },
  },
});



const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMapMenu, setOpenMapMenu] = useState(false);
  

  //on the navabr, if you are on the map page, it will display the campus name
  function addMapLabel() {
    if (location.pathname === '/map') {
      return `Map: ${location.state?.campus} `;
    } else {
      return "Map"
    }
  }

  function handleCampusNavigation(campus: 'SGW' | 'LOY') {
    
    const comingFromMap = location.pathname === '/map';
    navigate('/map', { state: { campus, resetZoom: !comingFromMap } });
    setOpenMapMenu(false);
  }

  return (

    <ThemeProvider theme={theme} >
      <div id="bottomNavBar" >

        {/* this is the menu that appears when the map icon is clicked */}
        {openMapMenu && (
          <div id='menu-map' className='flex flex-col justify-center items-center w-full  '>
            <li id='sgw-campus-option' className='flex justify-center w-full p-2 bg-white hover:bg-[#0096d7]' onClick={() => handleCampusNavigation('SGW')}>
              <a  className='w-full text-black hover:text-white'>
                SGW Campus
              </a>
            </li>
            <li id='loyola-campus-option' className='flex justify-center w-full p-2  bg-white hover:bg-[#0096d7]' onClick={() => handleCampusNavigation('LOY')}>
              <a  className='w-full text-black hover:text-white'>
                Loyola Campus
              </a>
            </li>
          </div>
        )}

        <BottomNavigation
          showLabels
          value={location.pathname}
          onChange={(event, newValue) => {
            if (newValue === '/map') {
              setOpenMapMenu((prev) => !prev);

            } else {
              setOpenMapMenu(false);
              navigate(newValue);
            }
          }}
        >

          <BottomNavigationAction
            test-id="shuttle-button"
            label="Shuttle"
            icon={<DirectionsBusIcon />}
            value="/shuttle" />

          <BottomNavigationAction
            test-id="map-button"
            label={location.pathname === "/" ? "Map: SGW" : addMapLabel()}
            icon={<MapRounded />}
            value="/map" />

          <BottomNavigationAction
            test-id="directions-button"
            label="Directions"
            value="/directions"
            icon={<DirectionsRoundedIcon />} />

          <BottomNavigationAction
            test-id="schedule-button"
            label="Schedule"
            value="/schedule"
            icon={<CalendarMonthRoundedIcon />} />

        </BottomNavigation>
      </div>
    </ThemeProvider>

  );
}

export default BottomNavBar;