import React, { useState, useRef, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RoomIcon from '@mui/icons-material/Room';
import { getSuggestions, getPlaceDetails } from '../services/PlaceServices';
import { fetchDirections } from '../services/directionsServices';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import { LocationContext } from '../components/LocationContext';
import { DirectionsBike } from '@mui/icons-material';
import RouteRenderer from '../components/RouteRenderer';
import { distanceCalculation } from '../utils/distanceCalculation';
import LocationCityIcon from '@mui/icons-material/LocationCity';

interface LocationType {
    name: string;
    address: string;
    place_id: string;
    lat: number;
    lng: number;
}

const CAMPUS_COORDINATES = {
    LOYOLA: {
        name: "Loyola Campus",
        lat: 45.4583,
        lng: -73.6403,
        address: "7141 Rue Sherbrooke O, Montréal, QC H4B 1R6, Canada",
        place_id: "ChIJk5Bx5kkXyUwRHLCpsk_QqeM", // Example placeholder
    },
    SGW: {
        name: "SGW Campus",
        lat: 45.4949,
        lng: -73.5779,
        address: "Sainte-Catherine / Guy, Montréal, QC H3H 2S7, Canada",
        place_id: "ChIJOx0fzmsayUwR_rq19AxGGm8", // Example placeholder
    },
};
interface MapclickListenerProps {
    onMapClick: (destination: LocationType) => void;
}



const MapClickListener: React.FC<MapclickListenerProps> = ({ onMapClick }) => {
    const map = useMap();
  useEffect(() => {
    if (map) {
      console.log("Map instance available in MapClickListener:", map);
      const clickListener = map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) {
          console.error("No latLng found in event", e);
          return;
        }
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        console.log("Map clicked at:", lat, lng);
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results && results.length > 0) {
            const result = results[0];
            const destinationLocation: LocationType = {
              name: result.formatted_address,
              address: result.formatted_address,
              place_id: result.place_id || "",
              lat,
              lng,
            };
            console.log("Reverse geocoded destination:", destinationLocation);
            onMapClick(destinationLocation);
          } else {
            console.error("Geocoder failed with status:", status);
          }
        });
      });
      return () => {
        google.maps.event.removeListener(clickListener);
      };
    }
  }, [map, onMapClick]);
  return null;
} ;

interface JumpingIconProps {
    onClick: () => void;
    label?: string;
    icon?: React.ReactNode;
    position?: { bottom: string; right: string };
  }
  
  const JumpingIcon: React.FC<JumpingIconProps> = ({ 
    onClick, 
    label = "Clear All", 
    icon = <MyLocationIcon style={{ fontSize: 20 }} />,
    position = { bottom: "20", right: "8" }
  }) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    };
  
    return (
      <button
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={`fixed bottom-${position.bottom} right-${position.right} cursor-pointer flex items-center justify-center bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
        style={{ zIndex: 1000 }}
        aria-label={label}
      >
        <span className="mr-2 font-bold">{label}</span>
        {icon}
      </button>
    );
  };
  interface BuildingIconProps {
    onClick: () => void;
    label?: string;
    icon?: React.ReactNode;
    position?: { bottom: string; right: string };
    className?: string;
  }
  
  const BuildingIcon: React.FC<BuildingIconProps> = ({
    onClick,
    label = 'Indoor View',
    icon = <LocationCityIcon style={{ fontSize: 20 }} />,
    position = { bottom: '32', right: '5' },
    className = ''
  }) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === ' ') {
            e.preventDefault();
            setTimeout(() => {
                onClick();
            }, 100); 
        }
    };
  
    return (
      <button
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={`fixed bottom-${position.bottom} right-${position.right} cursor-pointer flex items-center justify-center bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all animate-bounce focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
        style={{ zIndex: 1000 }}
        aria-label={label}
      >
        {icon}
        {label && <span className="ml-2 font-bold">{label}</span>}
      </button>
    );
  };

const Directions = () => {
    const location = useLocation(); //useLocation to get the state
    //const [userLocation, setUserLocation] = useState(CAMPUS_COORDINATES.SGW); // to be used to simulate being on campus
    const eventNameQuery = location.state?.eventName ?? ""; // Get event name from state
    const destinationFromState = location.state?.destination ?? ""; // Get destination from state
    const isFromSchedule = location.state?.isFromSchedule ?? false; // Check if direction is from schedule
    const [active, setActive] = useState<string>("");
    const [sourceQuery, setSourceQuery] = useState<string>("");
    const [destinationQuery, setDestinationQuery] = useState<string>(destinationFromState);
    const [sourceResults, setSourceResults] = useState<LocationType[]>([]);
    const [destinationResults, setDestinationResults] = useState<LocationType[]>([]);
    const [transportationMode, setTransportationMode] = useState<"driving" | "transit" | "walking" | "bicycling" | "shuttle">("driving");
    const [source, setSource] = useState<LocationType>();
    const [destination, setDestination] = useState<LocationType>();
    const [routesAvailable, setRoutesAvailable] = useState<boolean>(false);
    const [routes, setRoutes] = useState<any>();
    const [drivingRoutes, setDrivingRoutes] = useState<any>();
    const [transitRoutes, setTransitRoutes] = useState<any>();
    const [walkingRoutes, setWalkingRoutes] = useState<any>();
    const [bicyclingRoutes, setBicyclingRoutes] = useState<any>();
    const [shuttleRoutes, setShuttleRoutes] = useState<any[]>([]);
    const { location: userLocation } = useContext(LocationContext);
    const [isResettingStart, setIsResettingStart] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false); // Keep track of typing
    const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [selectedResultIndex, setSelectedResultIndex] = useState<number>(-1);
    const isProgrammaticChange = useRef(false);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(-1);
    const [selectedRoute, setSelectedRoute] = useState<any>();
    // Debounce ref
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    // Get debounce delay from environment variable, default to 300ms
    const DEBOUNCE_DELAY = parseInt(import.meta.env.VITE_DEBOUNCE_DELAY ?? "300");
    const [otherCampus, setOtherCampus] = useState<LocationType | null>(null);
    const [shouldFetchDirections, setShouldFetchDirections] = useState(false);
    
    const [hasArrived, setHasArrived] = useState<boolean>(false);

    const handleClearRouteAndPrompts = () => {
        setRoutes([]);
        setRoutesAvailable(false);
        setSourceQuery("");
        setDestinationQuery("");
        setSource(undefined);
        setDestination(undefined);
        setSelectedRouteIndex(-1);
        setHasArrived(false);
        navigate(location.pathname, {
            replace: true,
            state: {
                ...location.state,
                isFromSchedule: false  // Explicitly set to false
            }
        });   
    };


    const navigate = useNavigate();
    
    const handleSwitchToIndoorDirections = () => {
        navigate(`/indoordirections?dest=${encodeURIComponent(eventNameQuery)}`);
        // Logic to switch to indoor directions view
        console.log("Switching to indoor directions view", (eventNameQuery),destinationQuery , isFromSchedule);

        
        // Create a context to store the event name and destination
        // Use the context to display the event name and destination in the indoor directions view
        
    };


    // Debounced suggestion fetching function (KEY CHANGE)
    const handleDebouncedSuggestions = (query: string, activeField: string) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            if (query.trim().length > 0) {
                getSuggestions(query, 45.5049, -73.5779)
                    .then(predictions => {
                        if (activeField === "start") {
                            setSourceResults(predictions as LocationType[]);
                        } else {
                            setDestinationResults(predictions as LocationType[]);
                        }
                    })
                    .catch(error => console.error('Error fetching suggestions:', error));
            } else {
                if (activeField === "start") {
                    setSourceResults([]);
                } else {
                    setDestinationResults([]);
                }
            }
        }, DEBOUNCE_DELAY); // Use the environment variable here
    };
    

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown") {
            setSelectedResultIndex((prev) => Math.min(prev + 1, (active === "start" ? sourceResults : destinationResults).length - 1));
        } else if (event.key === "ArrowUp") {
            setSelectedResultIndex((prev) => Math.max(prev - 1, 0));
        } else if (event.key === "Enter" && selectedResultIndex !== -1) {
            handleSelect(selectedResultIndex);
        }
    };
    useEffect(() => {
        if (userLocation?.address && !sourceQuery && !isResettingStart && !isUserTyping) {
            setSourceQuery(userLocation.address);
            setSource(userLocation); // Set the source to userLocation
        }
    }, [userLocation, isResettingStart, isUserTyping]);
    
    useEffect(() => {
        // check if user is in any building campus
        if (userLocation?.address) {
            // calculate distance between userlocation and loyola campus
            const isLoyla = distanceCalculation(
                userLocation.lat,
                userLocation.lng,
                CAMPUS_COORDINATES.LOYOLA.lat,
                CAMPUS_COORDINATES.LOYOLA.lng
            ) <= 0.5;
            // if user in loyola set otherCampus to SGW
            if (isLoyla) {
                setOtherCampus(CAMPUS_COORDINATES.SGW);
            }
            else {
                setOtherCampus(CAMPUS_COORDINATES.LOYOLA);
            }
        }
    }, [userLocation]);

    const handleCampusDirection = () => {
        if (otherCampus) {
            // Update states
            setDestinationQuery(otherCampus.name);
            setDestination(otherCampus);
            setRoutesAvailable(false);
            setShouldFetchDirections(true);
            setOtherCampus(null); // Remove the button after fetching directions
        };
    }


    useEffect(() => {
        if (shouldFetchDirections && source && destination) {
            getDirections();
            setShouldFetchDirections(false); // Reset the flag
        }
    }, [source, destination, shouldFetchDirections]);


    useEffect(() => {
        if (destinationFromState) {
            setDestinationQuery(destinationFromState); // Set destination query
            // handleDebouncedSuggestions(destinationFromState, "end"); // Call debounced function
            
            // Automatically selecst the first suggestion
            const selectFirstSuggestion = async () => {
                const predictions = await getSuggestions(destinationFromState, 45.5049, -73.5779);
                if (predictions.length > 0) {
                    const placeDetails = await getPlaceDetails(predictions[0].place_id);
                    setDestination(placeDetails as LocationType);
                    setDestinationQuery((placeDetails as LocationType).name);
                    setDestinationResults([]); //clear destination results
                    setSourceResults([]); // Clear the source results
                    setActive(""); // Reset active field

                    // Select the first suggestion
                    handleSelect(0);
                }
            };

            selectFirstSuggestion().catch(error => console.error('Error selecting first suggestion:', error));
        }
    }, [destinationFromState]);

    // No longer need the useEffect for fetching suggestions.  It's handled by handleDebouncedSuggestions

    const handleSelect = async (index: number) => {
        const place = (active === "start" ? sourceResults : destinationResults)[index];
        const placeDetails = await getPlaceDetails(place.place_id);
        isProgrammaticChange.current = true;
        if (active === "start") {
            const s = document.getElementById("start-input") as HTMLInputElement;
            s.value = (placeDetails as LocationType).name;
            setSourceQuery((placeDetails as LocationType).name);
            setSource(placeDetails as LocationType);
            setSourceResults([]);
        } else if (active === "end") {
            setDestinationQuery((placeDetails as LocationType).name);
            setDestination(placeDetails as LocationType);
            setDestinationResults([]);
        }
        setActive("");
        setSourceResults([]);
        setDestinationResults([]);
    };

    useEffect(() => {
        if (transportationMode === "driving") {
            setRoutes(drivingRoutes);
        } else if (transportationMode === "transit") {
            setRoutes(transitRoutes);
        } else if (transportationMode === "walking") {
            setRoutes(walkingRoutes);
        } else if (transportationMode === "bicycling") {
            setRoutes(bicyclingRoutes);
        } else if (transportationMode === "shuttle") {
            setRoutes(shuttleRoutes);
        }
    }, [transportationMode, drivingRoutes, transitRoutes, walkingRoutes, bicyclingRoutes, shuttleRoutes]);


    const getDirections = async () => {
        setRoutesAvailable(false);
        console.log("Getting Directions...");
        setTransportationMode("driving");

        if (sourceQuery === "" || destinationQuery === "") {
            console.error("Source or Destination is empty");
            console.log("Source: ", sourceQuery);
            console.log("Destination: ", destinationQuery);
            return;
        }

        const directionRequest = await fetchDirections(source!, destination!).then((response: any) => {
            console.log("Response from fetchDirections: ", response);
            setRoutes(response.driving);
            setDrivingRoutes(response.driving);
            setTransitRoutes(response.transit);
            setWalkingRoutes(response.walking);
            setBicyclingRoutes(response.bicycling);
            setShuttleRoutes(response.shuttle ?? []);
            return response;
        }
        ).catch((error) => {
            console.error("Error getting directions: ", error);
        });
        console.log("Routes: ", directionRequest);
        setRoutesAvailable(true);
        setSourceResults([]); // Clear the source results
        setDestinationResults([]); // Clear the destination results
        setActive(""); // Reset active field
        setSelectedRouteIndex(0); // Select the first route so that its displayed
        setHasArrived(true);
    };

    // Ensure suggestions are hidden when the route is displayed
    // useEffect(() => {
    //     if (routesAvailable) {
    //         setSourceResults([]);
    //         setDestinationResults([]);
    //     }
    // }, [routesAvailable]);


    const handleTransportKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowRight") {
            setTransportationMode((prev) =>
                prev === "driving" ? "transit" : 
                prev === "transit" ? "walking" : 
                prev === "walking" ? "bicycling" : 
                prev === "bicycling" ? "shuttle" : "driving"
            );
        } else if (event.key === "ArrowLeft") {
            setTransportationMode((prev) =>
                prev === "shuttle" ? "bicycling" :
                prev === "bicycling" ? "walking" : 
                prev === "walking" ? "transit" : 
                prev === "transit" ? "driving" : "shuttle"
            );
        }
    };

    const handleClearStart = () => {
        setSourceQuery("");
        setSource(undefined);
        setIsResettingStart(true);
        setRoutesAvailable(false);
        setActive("");
        setSourceResults([]);
        setIsUserTyping(false); // Reset typing state
        setSelectedRouteIndex(-1); // reset the selected route index so route is not displayed

        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
        }

        resetTimeoutRef.current = setTimeout(() => {
            if (userLocation?.address) {
                isProgrammaticChange.current = true;
                setSourceQuery(userLocation.address);
                setSource(userLocation);
            }
            setIsResettingStart(false);
        }, 7000);
    };

    const handleClearDestination = () => {

        setDestinationQuery("");
        setDestination(undefined);
        setRoutesAvailable(false);
        setDestinationResults([]);
        setSelectedRouteIndex(-1);// reset the selected route index so route is not displayed
        setActive("");
        // Check if user is still on one of the campuses
        if (userLocation?.address) {
            const isLoyla = distanceCalculation(
                userLocation.lat,
                userLocation.lng,
                CAMPUS_COORDINATES.LOYOLA.lat,
                CAMPUS_COORDINATES.LOYOLA.lng
                ) <= 0.5;
                if (isLoyla) {
                    setOtherCampus(CAMPUS_COORDINATES.SGW);
                } else {
                    setOtherCampus(CAMPUS_COORDINATES.LOYOLA);
                }
            }
        }

    useEffect(() => {
        return () => {
            if (resetTimeoutRef.current) {
                clearTimeout(resetTimeoutRef.current);
            }
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const handleSelectedRoute = (index: number) => {
        //get the active transportation typpe
        if (transportationMode === "driving") {
            setSelectedRoute(drivingRoutes[index]);
        } else if (transportationMode === "transit") {
            setSelectedRoute(transitRoutes[index]);
        }
        else if (transportationMode === "walking") {
            setSelectedRoute(walkingRoutes[index]);
        }
        else if (transportationMode === "bicycling") {
            setSelectedRoute(bicyclingRoutes[index]);
        }
        else if (transportationMode === "shuttle") {
            setSelectedRoute(shuttleRoutes[index]);
        }
        console.log("Selected Route: ", selectedRoute, 'from ', transportationMode);
        setRoutesAvailable(false);

    }


    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places", "geometry"]}>
            <div className="relative flex flex-col flex-shrink-0 w-full" >
                <div className=" fixed flex flex-col flex-shrink-0 w-full top-55 z-30">
                    <div id="input-start-container"
                        className="flex flex-row items-center pl-2 pr-2">
                        <MyLocationIcon />
                        <input
                            id="start-input"
                            type="text"
                            placeholder="Enter your starting location"
                            className="p-2 m-2 border-2 rounded-lg w-full"
                            value={sourceQuery}
                            onChange={(e) => {
                                setActive("start");
                                setSourceQuery(e.target.value);
                                setIsUserTyping(true); // Set typing to true
                                setRoutes([]);
                                setRoutesAvailable(false);
                                handleDebouncedSuggestions(e.target.value, "start"); // Call debounced function
                                // Cancel the reset timeout if the user starts typing
                                if (resetTimeoutRef.current) {
                                    clearTimeout(resetTimeoutRef.current);
                                    resetTimeoutRef.current = null; // Reset the ref
                                }
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        {sourceQuery &&
                            <button
                                className="text-l font-bold text-gray-700 p-1"
                                onClick={handleClearStart}>
                                x
                            </button>
                        }
                    </div>
                    <div id="input-end-container"
                        className="flex flex-row items-center pl-2 pr-2">
                        <RoomIcon style={{ color: "red" }} />
                        <input
                            id="end-input"
                            type="text"
                            placeholder="Enter your destination location"
                            className="p-2 m-2 border-2 rounded-lg w-full"
                            value={destinationQuery}
                            onChange={(e) => {
                                setActive("end");
                                setDestinationQuery(e.target.value);
                                setRoutes([]);
                                setRoutesAvailable(false);
                                handleDebouncedSuggestions(e.target.value, "end"); // Call debounced function
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        {destinationQuery &&
                            <button
                                className="text-l font-bold text-gray-700 p-1"
                                onClick={handleClearDestination}
                            >
                                x
                            </button>
                        }
                    </div>

                    {(active === "start" ? sourceResults : destinationResults)?.length > 0 && (
                        <div className="flex w-full">
                            <ul className="w-full" id="suggestions-container">
                                {(active === "start" ? sourceResults : destinationResults)?.map((result, index) => (
                                    <li key={index}
                                        id="suggestion-item-container"
                                        onKeyDown={(e) => e.key === "Enter" && handleSelect(index)}
                                        onClick={() => {
                                            handleSelect(index);
                                            console.log("Selected: ", result);
                                        }}
                                        className="flex flex-row items-center m-2 border-2 rounded-lg w-full pr-4">
                                        <div className="flex flex-col items-center">
                                            <RoomIcon style={{ color: "gray" }} />
                                        </div>
                                        <div id="name-address-container" className="flex flex-col p-2 items-start truncate rounded-lg w-full">
                                            <span className='truncate font-semibold'>{result.name}</span>
                                            <span className='truncate text-xs'>{result.address}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {(active === "start" ? sourceResults : destinationResults)?.length === 0 && (
                        <div id='directions-request-container' className="flex flex-col items-center w-full">
                            <button
                                id="get-directions-button"
                                onClick={getDirections}
                                className="m-1 border-2 focus:outline-none rounded-lg w-full bg-blue-600 text-white font-bold"
                                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && console.log("Getting directions...")}
                            >
                                Get Directions
                            </button>
                            {otherCampus != null && <button
                                id="get-directions-to-campus-button"
                                onClick={handleCampusDirection}
                                className="m-1 border-2 focus:outline-none rounded-lg w-full bg-blue-600 text-white font-bold">
                                Get Directions to {otherCampus?.name}
                            </button>
                            }
                        </div>
                    )}


                    {routesAvailable && sourceQuery && destinationQuery &&
                        <div>
                            <div id="transport-mode-container" className="flex flex-row justify-between w-full pl-4 pr-4 m-1" tabIndex={0}
                                onKeyDown={handleTransportKeyDown}>
                                <button id="driving-option"
                                    onClick={() => setTransportationMode("driving")}
                                    className={`flex flex-row items-center justify-center  focus:outline-none m-2 p-1 truncate  rounded-full ${transportationMode === "driving" ? "flex-[2] sm:flex-1 bg-blue-500" : "flex-1"}`}>
                                    <DirectionsCarIcon
                                        style={{ color: transportationMode === "driving" ? "white" : "gray" }}
                                    />
                                    {transportationMode === "driving" &&
                                        <p id='driving-duration' className={`overflow-hidden text-ellipsis ml-1`} style={{ color: transportationMode === "driving" ? "white" : "gray" }} >
                                            {drivingRoutes?.length > 0 ? drivingRoutes[0].legs[0].duration.text : " none "}
                                        </p>
                                    }
                                </button>

                                <button id="transit-option"
                                    onClick={() => setTransportationMode("transit")}
                                    className={`flex flex-row items-center focus:outline-none  justify-center  p-2 m-2 truncate rounded-full ${transportationMode === "transit" ? "flex-[2] sm:flex-1 bg-blue-500" : "flex-1"}`}>
                                    <DirectionsBusIcon
                                        style={{ color: transportationMode === "transit" ? "white" : "gray" }}
                                    />
                                    {transportationMode === "transit" &&
                                        <p id='transit-duration' className={`overflow-hidden text-ellipsis ml-1`} style={{ color: transportationMode === "transit" ? "white" : "gray" }}>
                                            {transitRoutes?.length > 0 ? transitRoutes[0].legs[0].duration.text : " none "}
                                        </p>
                                    }
                                </button>
                                
                                <button id="walking-option"
                                    onClick={() => setTransportationMode("walking")}
                                    className={`flex flex-row items-center justify-center focus:outline-none p-2 m-2 truncate rounded-full ${transportationMode === "walking" ? "flex-[2] sm:flex-1  bg-blue-500" : "flex-1"}`}>
                                    <DirectionsWalkIcon
                                        style={{ color: transportationMode === "walking" ? "white" : "gray" }}
                                    />
                                    {transportationMode === "walking" &&
                                        <p id='walking-duration' className={`overflow-hidden text-ellipsis ml-1`} style={{ color: transportationMode === "walking" ? "white" : "gray" }} >
                                            {walkingRoutes?.length > 0 ? walkingRoutes[0].legs[0].duration.text : " none "}
                                        </p>
                                    }
                                </button>
                                
                                <button id="bicycling-option"
                                    onClick={() => setTransportationMode("bicycling")}
                                    className={`flex flex-row items-center justify-center focus:outline-none p-2 m-2 truncate rounded-full ${transportationMode === "bicycling" ? "flex-[2] sm:flex-1  bg-blue-500" : "flex-1"}`}
                                >
                                    <DirectionsBike
                                        style={{ color: transportationMode === "bicycling" ? "white" : "gray" }}
                                    />
                                    {transportationMode === "bicycling" &&
                                        <p id='bicycling-duration' className={`overflow-hidden text-ellipsis ml-1`} style={{ color: transportationMode === "bicycling" ? "white" : "gray" }} >
                                            {bicyclingRoutes?.length > 0 ? bicyclingRoutes[0].legs[0].duration.text : "-"}
                                        </p>
                                    }
                                </button>

                                <button id="shuttle-option"
                                    onClick={() => setTransportationMode("shuttle")}
                                    className={`flex flex-row items-center justify-center focus:outline-none p-2 m-2 truncate rounded-full ${transportationMode === "shuttle" ? "flex-[2] sm:flex-1 bg-blue-500" : "flex-1"}`}
                                >
                                    <AirportShuttleIcon
                                        style={{ color: transportationMode === "shuttle" ? "white" : "gray" }}
                                    />
                                    {transportationMode === "shuttle" &&
                                        <p id='shuttle-duration' className={`overflow-hidden text-ellipsis ml-1`} style={{ color: transportationMode === "shuttle" ? "white" : "gray" }} >
                                            {shuttleRoutes?.length > 0 ? (shuttleRoutes[0].duration?.text || shuttleRoutes[0].legs[0].duration.text) : "-"}
                                        </p>
                                    }
                                </button>
                            </div>
                            <div id='routes-display' className='flex flex-col border-t-2 mb-3 over'>
                                {routes?.map((route: any, index: number) => (
                                    route.legs ? (
                                        <div key={index}
                                            tabIndex={0}
                                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && console.log("Selected Route", index, ":", routes[index])}
                                            id="route-item-container"
                                            className="flex flex-row border-2 rounded-lg w-full mt-2 p-2 justify-between focus:outline-none align-middle shadow-sm"
                                        >
                                            <button id='route-item-duration-distance '
                                                className="flex flex-col items-start align-middle w-full"
                                                onClick={() => {
                                                    console.log("Selected Route ", index, ":",
                                                        routes[index]);
                                                    setSelectedRouteIndex(index); // Update selected route index
                                                }}
                                            >
                                                <span className="font-bold text-lg">{route.legs[0].duration.text}</span>
                                                {transportationMode !== "transit" &&
                                                    <div className="flex">
                                                        <span className="text-xs">{route.legs[0].distance.text}</span>
                                                        {index === 0 && <span className="text-xs ml-1">— Fastest Route</span>}
                                                    </div>
                                                }
                                                <div className="flex flex-wrap w-full">
                                                    {transportationMode === "transit" &&
                                                        <>
                                                            {route.legs[0].steps?.map((step: any, index: number) => (
                                                                // 
                                                                <React.Fragment key={0}>
                                                                    {step.travel_mode === "WALKING" && <span className="flex items-center text-xs ml-1">
                                                                        <DirectionsWalkIcon
                                                                            style={{ color: "gray", fontSize: "0.8rem" }}
                                                                        />
                                                                        {step.duration.text}
                                                                    </span>}
                                                                    {step.transit_details && <span className="text-xs ml-1 rounded-lg pl-1 pr-1"
                                                                        style={{ backgroundColor: step.transit_details.line.color, color: "white" }}>{step.transit_details.line.short_name}</span>}
                                                                    {index !== route.legs[0].steps.length - 1 && <span className="text-xs ml-1">{'>'}</span>}

                                                                </React.Fragment>
                                                                // )
                                                            ))}
                                                        </>
                                                    }
                                                    {transportationMode === "shuttle" &&
                                                        <>
                                                            {route.legs[0].steps?.map((step: any, index: number) => (
                                                                <React.Fragment key={index}>
                                                                    {step.travel_mode === "WALKING" && 
                                                                        <span className="flex items-center text-xs ml-1">
                                                                            <DirectionsWalkIcon style={{ color: "gray", fontSize: "0.8rem" }} />
                                                                            {step.duration.text}
                                                                        </span>
                                                                    }
                                                                    {step.travel_mode === "TRANSIT" && 
                                                                        <>
                                                                            <span className="text-xs ml-1 rounded-lg pl-1 pr-1"
                                                                                style={{ backgroundColor: "#6A0DAD", color: "white" }}>
                                                                                SHUTTLE
                                                                            </span>
                                                                            <span className="text-xs ml-1">{step.duration.text}</span>
                                                                        </>
                                                                    }
                                                                    {index !== route.legs[0].steps.length - 1 && <span className="text-xs ml-1">{'>'}</span>}
                                                                </React.Fragment>
                                                            ))}
                                                        </>
                                                    }
                                                </div>
                                            </button>
                                            <div id="selecting-route-button" className='flex flex-col justify-center'>
                                                <button
                                                    className='bg-green-900 text-white font-bold focus:outline-none'
                                                    onClick={() => handleSelectedRoute(index)}
                                                >
                                                    Go
                                                </button>

                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-blue-800"
                                            key={index}>No routes available
                                        </p>
                                    )
                                ))}

                                {routes?.length === 0 &&
                                    <p className=" flex items-center justify-center pt-3">No {transportationMode} routes  available</p>
                                }

                            </div>
                        </div>
                    }

                    <div id="map-container"
                        style={{ height: '86vh', width: '100vw' }}
                    >
                        <MapWrapper source={source} destination={destination} selectedRouteIndex={selectedRouteIndex}  transportationMode={transportationMode}  
                        onMapClick={(dest: LocationType) => {
                            setDestination(dest);
                            setDestinationQuery(dest.name);
                            setActive("end");
                        }}
                      />
                    
                    </div>
                    {hasArrived && <JumpingIcon onClick={handleClearRouteAndPrompts} />}
                    {hasArrived && isFromSchedule && <BuildingIcon onClick={handleSwitchToIndoorDirections} />}
                </div>
            </div>
        </APIProvider>
    );
}

interface MapWrapperProps {
    source: LocationType | undefined;
    destination: LocationType | undefined;
    selectedRouteIndex: number;
    transportationMode: "driving" | "transit" | "walking" | "bicycling" | "shuttle";
    onMapClick: (destination: LocationType) => void;
}

function MapWrapper({ source, destination, selectedRouteIndex, transportationMode, onMapClick }: MapWrapperProps) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const [mapKey, setMapKey] = useState(Date.now());

    useEffect(() => {
        setMapKey(Date.now()); // Update the key
    }, [source, destination, selectedRouteIndex, transportationMode]); //include transportationMode

    return (
        <APIProvider apiKey={apiKey} libraries={["places", "geometry"]}>
            <Map
                key={mapKey}  // Use the dynamic key here
                defaultZoom={15}
                defaultCenter={{ lat: 45.4949, lng: -73.5779 }}
                mapTypeControl={false}
                fullscreenControl={false}
            >
                {selectedRouteIndex !== -1 &&
                    <RouteRenderer
                        key={`${source?.place_id}-${destination?.place_id}-${selectedRouteIndex}`}
                        source={source}
                        destination={destination}
                        selectedRouteIndex={selectedRouteIndex}
                        transportationMode={transportationMode}
                    />
                    
                }
                <MapClickListener onMapClick={onMapClick} />
            </Map>
        </APIProvider>       
    );
}


export default Directions;