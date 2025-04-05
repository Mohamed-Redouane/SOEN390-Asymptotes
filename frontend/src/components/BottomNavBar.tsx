import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bus, Map, Navigation, Calendar, MapPin, Building } from 'lucide-react';

const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDirectionOptions, setShowDirectionOptions] = useState(false);
  const [directionType, setDirectionType] = useState<'indoor' | 'outdoor'>('indoor');

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.nav-button, .direction-options')) {
        setShowDirectionOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setShowDirectionOptions(false);
  }, [location.pathname]);


  const directionLabel = useMemo(() => {
    if (location.pathname === '/directions') return 'Directions: Outdoor';
    if (location.pathname === '/indoordirections') return 'Directions: Indoor';
    return 'Directions';
  }, [location.pathname]);

  // Determine if the current path is the directions page (indoor or outdoor)
  const isDirectionsActive = (location.pathname === '/directions' || location.pathname === '/indoordirections');

  const handleNavigation = (value: string) => {
    if (value === '/map') {
      navigate(value);
    } else if (value === '/directions' || value === '/indoordirections') {

      if (!(location.pathname === '/directions' || location.pathname === '/indoordirections'))
        navigate(value);
      // Only toggle direction options if already on directions page
      if (isDirectionsActive) {
        setShowDirectionOptions((prev) => !prev);
      }
    } else {
      navigate(value);
    }
  };


  // Handle direction type selection
  const handleDirectionTypeChange = (type: 'outdoor' | 'indoor') => {
    setDirectionType(type);

    // Use a more robust state management approach
    // Dispatch a custom event with the selected direction type
    const event = new CustomEvent('directionTypeChanged', {
      detail: { type, timestamp: Date.now() }
    });
    window.dispatchEvent(event);

    // In here I want to switch the URL to the other direction type

    console.log('Direction type changed to:', type);
    // Navigate to : /directions or /indoordirections
    navigate(type === 'indoor' ? '/indoordirections' : '/directions');


    // Don't automatically close the menu to allow for easier toggling
  };

  const NavButton = ({
    icon: Icon,
    label,
    value,
    isActive,
    onClick
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    isActive: boolean;
    onClick?: () => void;
  }) => (
    <button
      onClick={() => {
        handleNavigation(value);
        onClick?.();
      }}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={`nav-button rounded-none flex flex-1 flex-col items-center justify-center px-2 py-1 transition-all duration-300
        ${isActive ? 'text-white bg-[#4c3ee2]' : 'text-gray-500'}
        hover:text-white hover:bg-gradient-to-r hover:from-[#4361ee] hover:to-[#7209b7] hover:bg-opacity-80
        relative`}
    >
      <Icon className={`h-6 w-6 mb-1 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Direction Type Toggle */}
      {isDirectionsActive && (
        <div className={`absolute bottom-16 left-0 right-0 flex justify-center transition-all duration-300 transform ${showDirectionOptions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <div className="widget rounded-lg shadow-lg overflow-hidden flex w-11/12 max-w-md border border-[#4c3ee2]/20">
            <button
              onClick={() => handleDirectionTypeChange('indoor')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all duration-200
                ${directionType === 'indoor'
                  ? 'bg-[#4c3ee2] text-white'
                  : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Building className="h-5 w-5" />
              <span className="font-medium">Indoor</span>
            </button>
            <div className="w-px bg-gray-200"></div>
            <button
              onClick={() => handleDirectionTypeChange('outdoor')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all duration-200
                ${directionType === 'outdoor'
                  ? 'bg-[#4c3ee2] text-white'
                  : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <MapPin className="h-5 w-5" />
              <span className="font-medium">Outdoor</span>
            </button>
          </div>
        </div>
      )}


      <nav className="widget flex h-16 shadow-lg backdrop-blur-md">
        <NavButton icon={Bus} label="Shuttle" value="/shuttle" isActive={location.pathname === '/shuttle'} />
        <NavButton icon={Map} label="Map" value="/map" isActive={location.pathname === '/map' || location.pathname === '/LOYcampus'} />
        {/* Need to disable the button if we are on /indoordirections or in /directions */}

        <NavButton
          icon={Navigation}
          label={directionLabel}
          value="/directions"
          isActive={isDirectionsActive}


          onClick={() => {

            if (isDirectionsActive) {
              setShowDirectionOptions(!showDirectionOptions);
            }
          }}
        />
        <NavButton icon={Calendar} label="Schedule" value="/schedule" isActive={location.pathname === '/schedule'} />
      </nav>
    </div>
  );
};

export default BottomNavBar;