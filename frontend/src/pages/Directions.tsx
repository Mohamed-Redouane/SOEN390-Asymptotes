import React, { useState, useRef, useEffect, useContext } from 'react';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RoomIcon from '@mui/icons-material/Room';
import { getSuggestions, getPlaceDetails } from '../services/PlaceServices';
import { fetchDirections } from '../services/directionsServices';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import { LocationContext } from '../components/LocationContext'; import { DirectionsBike } from '@mui/icons-material';
import { display } from '@mui/system';
import { getDirections } from '../api';


interface LocationType {
    name: string;
    address: string;
    place_id: string;
    lat: number;
    lng: number;
}


const Directions = () => {
    const [active, setActive] = useState<string>("");
    const [sourceQuery, setSourceQuery] = useState<any>("");
    const [destinationQuery, setDestinationQuery] = useState<string>("");
    const [sourceResults, setSourceResults] = useState<LocationType[]>([]); // Suggestions for source
    const [destinationResults, setDestinationResults] = useState<LocationType[]>([]);
    const [transportationMode, setTransportationMode] = useState<"driving" | "transit" | "walking" | "bicycling">("driving");

    const [source, setSource] = useState<LocationType>();
    const [destination, setDestination] = useState<LocationType>();
    const [routesAvailable, setRoutesAvailable] = useState<boolean>(false);
    const [routes, setRoutes] = useState<any>();

    const [drivingRoutes, setDrivingRoutes] = useState<any>();
    const [transitRoutes, setTransitRoutes] = useState<any>();
    const [walkingRoutes, setWalkingRoutes] = useState<any>();
    const [bicyclingRoutes, setBicyclingRoutes] = useState<any>();

    const { location: userLocation } = useContext(LocationContext);
    const [isResettingStart, setIsResettingStart] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [selectedResultIndex, setSelectedResultIndex] = useState<number>(-1); // for keyboard navigation of results
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown") {
            setSelectedResultIndex((prev) => Math.min(prev + 1, (active === "start" ? sourceResults : destinationResults).length - 1));
        } else if (event.key === "ArrowUp") {
            setSelectedResultIndex((prev) => Math.max(prev - 1, 0));
        } else if (event.key === "Enter" && selectedResultIndex !== -1) {
            handleSelect(selectedResultIndex);
        }
    };

    const isProgrammaticChange = useRef(false); // Used to prevent infinite loop when setting the value of the input field programmatically

    useEffect(() => {
        if (userLocation?.address && !sourceQuery && !isResettingStart && !isUserTyping) {
            setSourceQuery(userLocation.address);
            setSource(userLocation); // Set the source to userLocation
        }
    }, [userLocation, isResettingStart, isUserTyping]);

    useEffect(() => {
        if (!isProgrammaticChange.current && active && (active === "start" ? sourceQuery : destinationQuery)) {
            setRoutes([]);
            setRoutesAvailable(false);
            let query = "";
            if (active === "start") {
                query = sourceQuery;
            } else if (active === "end") {
                query = destinationQuery;
            }


            if (query === "") {
                if (active === "start") setSourceResults([]);
                else setDestinationResults([]);
                return;
            }

            const predictionsResults = async () => {
                const predictions = await getSuggestions(query, 45.5049, -73.5779);
                console.log("Predictions: ", predictions);
                if (active === "start") {
                    setSourceResults(predictions as LocationType[]);
                } else {
                    setDestinationResults(predictions as LocationType[]);
                }

            }
            predictionsResults();

        }
        isProgrammaticChange.current = false;
    }, [sourceQuery, destinationQuery, active]);


    const handleSelect = async (index: number) => {
        const place = (active === "start" ? sourceResults : destinationResults)[index];
        const placeDetails = await getPlaceDetails(place.place_id);
        console.log("Selected Place: ", placeDetails);
        // get the details of what was selected


        isProgrammaticChange.current = true;

        //checks which input field is active
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

        //after selecting a place, we clear the results
        //setResults([]);
        setActive("");
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
        }
    }, [transportationMode]);

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
            return response;
        }
        ).catch((error) => {
            console.error("Error getting directions: ", error);
        });
        console.log("Routes: ", directionRequest);
        setRoutesAvailable(true);
    };


    // for keyboard navigation of transportation modes
    const handleTransportKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowRight") {
            setTransportationMode((prev) =>
                prev === "driving" ? "transit" : prev === "transit" ? "walking" : "driving"
            );
        } else if (event.key === "ArrowLeft") {
            setTransportationMode((prev) =>
                prev === "walking" ? "transit" : prev === "transit" ? "driving" : "walking"
            );
        }
    };

    // handle the clear for the start input
    const handleClearStart = () => {
        setSourceQuery("");
        setSource(undefined);
        setIsResettingStart(true);
        setRoutesAvailable(false);
        setActive("");
        setSourceResults([]);
        setDestinationResults([]);
        setIsUserTyping(false);

        // Clear any existing timeout
        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
        }

        // Set a new timeout
        resetTimeoutRef.current = setTimeout(() => {
            if (userLocation?.address) {
                isProgrammaticChange.current = true;
                setSourceQuery(userLocation.address);
                setSource(userLocation);
            }
            setIsResettingStart(false);
        }, 7000); // 7 seconds delay
    };

    useEffect(() => {
        return () => {
            if (resetTimeoutRef.current) {
                clearTimeout(resetTimeoutRef.current);
            }
        };
    }, []);

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places", "geometry"]}>
            <div className="relative flex flex-col flex-shrink-0 w-full" >
                <div className=" fixed flex flex-col flex-shrink-0 w-full top-55 bg-white z-30">
                    <div className="flex flex-row items-center pl-2 pr-2">
                        <MyLocationIcon />
                        <input
                            id="start-input"
                            type="text"
                            placeholder="Enter your starting location"
                            className="p-2 m-2 border-2 border-gray-200 rounded-lg w-full"
                            value={sourceQuery}
                            onChange={(e) => {
                                setActive("start");
                                setSourceQuery(e.target.value);
                                setIsUserTyping(true);
                                if (resetTimeoutRef.current) {
                                    clearTimeout(resetTimeoutRef.current);
                                }
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        {sourceQuery &&
                            <button
                                className="text-l font-bold text-gray-700 bg-white p-1"
                                onClick={handleClearStart}>
                                x
                            </button>
                        }
                    </div>
                    <div className="flex flex-row items-center pl-2 pr-2">
                        <RoomIcon style={{ color: "red" }} />
                        <input
                            id="end-input"
                            type="text"
                            placeholder="Enter your destination location"
                            className="p-2 m-2 border-2 border-gray-200 rounded-lg w-full"
                            value={destinationQuery}
                            onChange={(e) => {
                                setActive("end");
                                setDestinationQuery(e.target.value);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        {destinationQuery &&
                            <button
                                className="text-l font-bold text-gray-700 bg-white p-1"
                                onClick={() => {
                                    setDestinationQuery("");
                                    setRoutesAvailable(false); // Hide routes when destination input is cleared
                                }}>
                                x
                            </button>
                        }
                    </div>
                    {(active === "start" ? sourceResults : destinationResults).length > 0 && (
                        <div className="flex w-full">
                            <ul className="w-full" id="suggestions-container">
                                {(active === "start" ? sourceResults : destinationResults).map((result, index) => (
                                    <li key={index}
                                        id="suggestion-item-container"
                                        onKeyDown={(e) => e.key === "Enter" && handleSelect(index)}
                                        onClick={() => {
                                            handleSelect(index);
                                            console.log("Selected: ", result);
                                        }}
                                        className="flex flex-row items-center m-2 border-2 border-gray-200 rounded-lg w-full pr-4">
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

                    {(active === "start" ? sourceResults : destinationResults).length === 0 && (
                        <div id='directions-request-container' className="flex flex-col items-center w-full">
                            <button
                                id="get-directions-button"
                                onClick={getDirections}
                                className="m-1 border-2 border-gray-200 focus:outline-none rounded-lg w-full bg-blue-600 text-white font-bold"
                                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && console.log("Getting directions...")}
                            >
                                Get Directions
                            </button>
                        </div>
                    )}

                    {routesAvailable && sourceQuery && destinationQuery && // Render only if both inputs are filled and routes are available
                        <div>
                            <div id="transport-mode-container" className="flex flex-row justify-between w-full pl-4 pr-4 m-1" tabIndex={0}
                                onKeyDown={handleTransportKeyDown}>
                                <button id="driving-option"
                                    onClick={() => setTransportationMode("driving")}
                                    className={`flex flex-row  bg-white items-center justify-center  focus:outline-none m-2 p-1 truncate  rounded-full ${transportationMode === "driving" ? "flex-[2] sm:flex-1 bg-blue-500" : "flex-1"}`}>
                                    <DirectionsCarIcon
                                        style={{ color: transportationMode === "driving" ? "white" : "gray" }}
                                    />
                                    <p id='driving-duration' className={`overflow-hidden text-ellipsis ml-1`} style={{ color: transportationMode === "driving" ? "white" : "gray" }} >
                                        {drivingRoutes.length > 0 ? drivingRoutes[0].legs[0].duration.text : " none "}
                                    </p>
                                </button>

                                <button id="transit-option"
                                    onClick={() => setTransportationMode("transit")}
                                    className={`flex flex-row items-center bg-white focus:outline-none  justify-center  p-2 m-2 truncate rounded-full ${transportationMode === "transit" ? "flex-[2] sm:flex-1  bg-blue-500" : "flex-1"}`}>
                                    <DirectionsBusIcon
                                        style={{ color: transportationMode === "transit" ? "white" : "gray" }}
                                    />
                                    <p id='transit-duration' className={`overflow-hidden text-ellipsis ml-1`} style={{ color: transportationMode === "transit" ? "white" : "gray" }}>
                                        {transitRoutes.length > 0 ? transitRoutes[0].legs[0].duration.text : " none "}
                                    </p>
                                </button>
                                <button id="walking-option"
                                    onClick={() => setTransportationMode("walking")}
                                    className={`flex flex-row  bg-white items-center justify-center focus:outline-none p-2 m-2 truncate rounded-full ${transportationMode === "walking" ? "flex-[2] sm:flex-1  bg-blue-500" : "flex-1"}`}>
                                    <DirectionsWalkIcon
                                        style={{ color: transportationMode === "walking" ? "white" : "gray" }}
                                    />
                                    <p id='walking-duration' className={`overflow-hidden text-ellipsis ml-1`} style={{ color: transportationMode === "walking" ? "white" : "gray" }} >
                                        {walkingRoutes.length > 0 ? walkingRoutes[0].legs[0].duration.text : " none "}
                                    </p>
                                </button>
                                <button id="bicycling-option"
                                    onClick={() => setTransportationMode("bicycling")}
                                    className={`flex flex-row items-center justify-center focus:outline-none  bg-white  p-2 m-2 truncate rounded-full ${transportationMode === "bicycling" ? "flex-[2] sm:flex-1  bg-blue-500" : "flex-1"}`}
                                >
                                    <DirectionsBike
                                        style={{ color: transportationMode === "bicycling" ? "white" : "gray" }}
                                    />
                                    <p id='bicycling-duration' className={`overflow-hidden text-ellipsis ml-1`} style={{ color: transportationMode === "bicycling" ? "white" : "gray" }} >
                                        {bicyclingRoutes.length > 0 ? bicyclingRoutes[0].legs[0].duration.text : "-"}
                                    </p>
                                </button>


                            </div>
                            <div id='routes-display' className='flex flex-col border-t-2 mb-3 over'>
                                <div id='routes-display' className='flex flex-col border-t-2 mb-3 over'>
                                    {routes?.map((route: any, index: number) => (
                                        route.legs ? (
                                            <div key={index}
                                                tabIndex={0}
                                                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && console.log("Selected Route: ", routes[index])}
                                                id="route-item-container"
                                                className="flex flex-row border-2 border-gray-200 rounded-lg w-full  mt-2 p-2 justify-between  align-middle shadow-sm"
                                                onClick={() => {
                                                    console.log("Selected Route: ", routes[index]);
                                                }}
                                            >
                                                <div id='route-item-duration-distance' className="flex flex-col items-start align-middle">
                                                    <span className="font-bold text-lg">{route.legs[0].duration.text}</span>
                                                    <div className="flex">
                                                        <span className="text-xs">{route.legs[0].distance.text}</span>
                                                        {index === 0 && <span className="text-xs ml-1">— Fastest Route</span>}
                                                        {transportationMode === "transit" && <span className="text-xs ml-1">— {route.legs[0].steps.length} stops</span>}
                                                    </div>
                                                </div>
                                                <div className="selecting-route-button">
                                                    <button
                                                        className='bg-green-900 text-white font-bold'
                                                        
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

                                </div>
                            </div>

                        </div>
                    }


                    <div id="map-container"
                        style={{ height: '86vh', width: '100vw' }}
                    >
                        <Map
                            defaultZoom={15}
                            defaultCenter={{ lat: 45.4949, lng: -73.5779 }}
                            mapTypeControl={false}
                            fullscreenControl={false}
                        />
                        <RenderRoutes
                            source={source}
                            destination={destination}
                            transportationMode={transportationMode}
                            routes={routes}
 />
                    </div>
                </div>
            </div>
        </APIProvider>
    );
}

function RenderRoutes({ source, destination, transportationMode }: {
    source: LocationType | undefined;
    destination: LocationType | undefined;
    transportationMode: "driving" | "transit" | "walking" | "bicycling";
    routes: any; 
}) {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
    const [displayedRoute, setDisplayedRoute] = useState<google.maps.DirectionsResult | null>(null);
    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new google.maps.DirectionsService());
        const renderer = new google.maps.DirectionsRenderer({ map: map });
        setDirectionsRenderer(renderer);
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsService || !directionsRenderer || !source || !destination) {
            return;
        }

        const travelModeMap = {
            driving: google.maps.TravelMode.DRIVING,
            transit: google.maps.TravelMode.TRANSIT,
            walking: google.maps.TravelMode.WALKING,
            bicycling: google.maps.TravelMode.BICYCLING,
        };

        directionsService.route(
            {
                origin: { lat: source.lat, lng: source.lng },
                destination: { lat: destination.lat, lng: destination.lng },
                travelMode: travelModeMap[transportationMode],
                provideRouteAlternatives: true,
            },
            (response, status) => {
                if (status === "OK") {
                    setDisplayedRoute(response);
                    directionsRenderer.setDirections(response);

                } else {
                    console.error("Directions request failed due to " + status);
                    setDisplayedRoute(null);
                    // Optionally display an error message to the user
                }
            }
        );
    }, [directionsService, directionsRenderer, source, destination, transportationMode]);

    console.log("Displayed Route: ", displayedRoute); //will use later, multi-route selection
    return null; // The renderer handles the display, so no need to return anything
}


export default Directions;