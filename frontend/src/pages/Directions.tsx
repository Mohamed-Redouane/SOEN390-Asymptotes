import React, { useState, useRef, useEffect, useContext } from 'react';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RoomIcon from '@mui/icons-material/Room';
import { getSuggestions, getPlaceDetails } from '../services/PlaceServices';
import { fetchDirections } from '../services/directionsServices';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import { LocationContext } from '../components/LocationContext';

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
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<LocationType[]>([]);
    const [transportationMode, setTransportationMode] = useState<"driving" | "transit" | "walking">("driving");

    const [source, setSource] = useState<LocationType>();
    const [destination, setDestination] = useState<LocationType>();
    const [routesAvailable, setRoutesAvailable] = useState<boolean>(false);
    const [routes, setRoutes] = useState<any>();
    // const [directions, setDirections] = useState<google.maps.DirectionsResult>();
    const {location: userLocation} = useContext(LocationContext);

    const [selectedResultIndex, setSelectedResultIndex] = useState<number>(-1); // for keyboard navigation of results
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown") {
            setSelectedResultIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (event.key === "ArrowUp") {
            setSelectedResultIndex((prev) => Math.max(prev - 1, 0));
        } else if (event.key === "Enter" && selectedResultIndex !== -1) {
            handleSelect(selectedResultIndex);
        }
    };

    const isProgrammaticChange = useRef(false); // Used to prevent infinite loop when setting the value of the input field programmatically

    useEffect(() => {
        if (userLocation && userLocation.address && !sourceQuery) {
            setSourceQuery(userLocation.address);
            setSource(userLocation); // Set the source to userLocation
        }
    }, [userLocation]);

    useEffect(() => {
        if (!isProgrammaticChange.current && (active === "end" || active === "start") && userLocation || !isProgrammaticChange.current && !userLocation) {
            setRoutes([]);
            setRoutesAvailable(false);

            if (query === "") {
                setResults([]);
                return;
            }

            const predictionsResults = async () => {
                const predictions = await getSuggestions(query, 45.5049, -73.5779);
                console.log("Predictions: ", predictions);
                setResults(predictions as LocationType[]);
            }
            predictionsResults();

        }
        isProgrammaticChange.current = false;
    }, [query]);

    useEffect(() => {
        setQuery(sourceQuery);
        setRoutesAvailable(false);
    }, [sourceQuery]);

    useEffect(() => {
        setQuery(destinationQuery);
        setRoutesAvailable(false);
    }, [destinationQuery]);


    const handleSelect = async (index: number) => {
        const place = results[index];
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

        } else if (active === "end") {
            setDestinationQuery((placeDetails as LocationType).name);
            setDestination(placeDetails as LocationType);

        }

        //after selecting a place, we clear the results
        setResults([]);
    };

    const getDirections = async () => {
        console.log("Getting Directions...");

        if (sourceQuery === "" || destinationQuery === "") {
            console.error("Source or Destination is empty");
            console.log("Source: ", sourceQuery);
            console.log("Destination: ", destinationQuery);
            return;
        }

        // console.log("Source id: ", source?.place_id);
        // console.log("Destination id: ", destination?.place_id);

        //you get back a result of type google.maps.DirectionsResult
        // const directionRequest = await fetchDirections(source!, destination!, transportationMode).then((result) => {
        //     // setRoutes(result.routes);
        //     // console.log(" routes: ", result.routes);
        //     return result;
        // }).catch((error) => {
        //     console.error("Error fetching directions: ", error);
        // });
        const directionRequest = await fetchDirections(source!, destination!, transportationMode);
        // console.log("driection object ", directionRequest);

        if (directionRequest) {
            setRoutes(directionRequest); // set the routes for displaying
            // setDirections(directionRequest); //store the directions for the map
        }

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


    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places", "geometry"]}>
            <div className="relative flex flex-col flex-shrink-0 w-full" >
                <div className=" fixed flex flex-col flex-shrink-0 w-full top-55 z-30 bg-white ">
                    <div className="flex flex-row items-center pl-2 pr-2">
                        <MyLocationIcon />
                        <input
                            id="start-input"
                            type="text"
                            placeholder="Enter your starting location"
                            className=" p-2 m-2 border-2 border-gray-200 rounded-lg w-full"
                            value={sourceQuery}
                            onChange={(e) => {
                                    setActive("start");
                                    setSourceQuery(e.target.value);
                                 //if user type, we stop using thier location and let them type in the input
                            }}
                            onKeyDown={handleKeyDown}
                        >
                        </input>
                        <button className="text-l font-bold text-gray-700 bg-white p-1" onClick={() => {
                            setSourceQuery("");
                            setSource(undefined);}}>x</button>
                    </div>
                    <div className="flex flex-row items-center pl-2 pr-2">
                        <RoomIcon style={{ color: "red" }} />
                        <input
                            id="end-input"
                            type="text"
                            placeholder="Enter your starting location"
                            className=" p-2 m-2 border-2 border-gray-200 rounded-lg w-full"
                            value={/*active === "end" ? query :*/ destinationQuery}
                            onChange={(e) => {
                                setActive("end");
                                setDestinationQuery(e.target.value);
                            }}
                            onKeyDown={handleKeyDown}
                        >
                        </input>
                        <button className="text-l font-bold text-gray-700 bg-white p-1" onClick={() => setDestinationQuery("")}>x</button>
                    </div>
                    {results && (
                        <div className="flex w-full " >
                            <ul className="w-full" id="suggestions-container">
                                {results.map((result, index) => (
                                    <li key={index}
                                        id="suggestion-item-container"
                                        onKeyDown={(e) => e.key === "Enter" && handleSelect(index)}
                                        onClick={() => {
                                            handleSelect(index);

                                            console.log("Selected: ", results[index]);
                                        }}
                                        className="flex flex-row items-center m-2 border-2 border-gray-200 rounded-lg w-full pr-4">
                                        <div className="flex flex-col items-center">
                                            <RoomIcon style={{ color: "gray" }} />
                                            {/* <span className="truncate">{getDistanceFromDestination(userLocation, { lat: result.lat, lng: result.lng })} km</span> */}
                                        </div>
                                        <div id="name-address-container" className="flex flex-col p-2 items-start truncate rounded-lg w-full">
                                            <span className='truncate font-semibold '>{result.name}</span>
                                            <span className='truncate text-xs'>{result.address}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {results.length == 0 &&
                        <div id='directions-request-container' className="flex flex-col items-center w-full">
                            <button
                                id="get-directions-button"
                                onClick={getDirections}
                                className="m-1 border-2 border-gray-200 rounded-lg w-full bg-blue-600 text-white font-bold"
                                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && console.log("Getting directions...")}
                            >
                                Get Directions
                            </button>



                        </div>
                    }

                    {routesAvailable &&
                        <div>
                            {/* TODO: implement the different travel modes */}
                            <div id="transport-mode-container" className="flex  flex-row justify-between w-full pl-4 pr-4 m-1" tabIndex={0}
                                onKeyDown={handleTransportKeyDown}>
                                <div id="car-option" className="flex flex-row items-center">
                                    <DirectionsCarIcon onClick={() => setTransportationMode("driving")} style={{ color: transportationMode === "driving" ? "#094F6d" : "gray" }} />
                                    <p id='driving-duration' style={{ color: transportationMode === "driving" ? "#094F6d" : "gray" }} ></p>
                                </div>
                                <div id="transit-option" className="flex flex-row items-center">
                                    <DirectionsBusIcon onClick={() => setTransportationMode("transit")} style={{ color: transportationMode === "transit" ? "#094F6d" : "gray" }} />
                                    <p id='transit-duration' style={{ color: transportationMode === "transit" ? "#094F6d" : "gray" }}></p>
                                </div>
                                <div id="walking-option" className="flex flex-row items-center">
                                    <DirectionsWalkIcon onClick={() => setTransportationMode("walking")} style={{ color: transportationMode === "walking" ? "#094F6d" : "gray" }} />
                                    <p id='walking-duration' style={{ color: transportationMode === "walking" ? "#094F6d" : "gray" }} ></p>
                                </div>
                                {/* <div id="shuttle-option" className="flex flex-row items-center">
                        <AirportShuttleIcon onClick={() => setTransportMode("shuttle")} style={{ color: transportMode === "shuttle" ? "#094F6d" : "gray" }} />
                        <p style={{ color: transportMode === "shuttle" ? "#094F6d" : "gray" }} >0 min</p>
                    </div> */}
                            </div>
                            <div id='routes-display' className='flex flex-col border-t-2 overflow-scroll '>
                                {routes?.map((route: any, index: number) => (
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
                                                {index === 0 && <span className="text-xs ml-1">Fastest Route</span>}
                                            </div>
                                        </div>
                                        <div className="selecting-route-button">
                                            <button className='bg-green-900 text-white font-bold'>Go</button>
                                        </div>

                                        {/* <DirectionRenderer directions={route} /> */}
                                    </div>
                                ))}
                            </div>
                        </div>
                    }


                    <div
                        id="map-container"
                        // className="relative top-55 flex flex-col border-3 border-red-800 flex-shrink-0 w-full h-full z-30">
                        style={{ height: '86vh', width: '100vw' }}
                    >
                        <Map
                            defaultZoom={15}
                            defaultCenter={{ lat: 45.4949, lng: -73.5779 }}
                            mapTypeControl={false}
                            fullscreenControl={false}
                        >


                        </Map>
                    </div>

                </div>


            </div>
        </APIProvider>

    );
}
export default Directions;