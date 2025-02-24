import React, { useState, useContext, useEffect } from 'react';
import { LocationContext } from '../Components/LocationContext';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RoomIcon from '@mui/icons-material/Room';
import { fetchPlacePredictions, fetchPlaceDetails, fetchPlaceIDfromCoords } from '../services/PlaceServices';
import { getDistanceFromDestination } from '../utils/distanceCalculation';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import {fetchDirections } from '../services/directionsServices';
import MapComponent from '../Components/MapComponent';

interface LocationType {
    name: string;
    address: string;
    place_id: string;
    lat: number;
    lng: number;
}


const Directions = () => {
    const [geoJsonData, setGeoJsonData] = useState<any>();
    const [isUserInsideBuilding, setIsUserInsideBuilding] = useState(false);
    const [userLocation, setUserLocation] = useState<any>();
    const { location } = useContext(LocationContext);

    console.log("Location: ", location?.lat === undefined ? "undefined" : location.lat, location?.lng === undefined ? "undefined" : location.lng);
    
    const [active, setActive] = useState<string>("");
    const [sourceQuery, setSourceQuery] = useState<any>("");
    const [destinationQuery, setDestinationQuery] = useState<string>("");
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<LocationType[]>([]);
    const [useLocation, setUseLocation] = useState<boolean>(false);
    const [transportationMode, setTransportationMode] = useState<"driving" | "transit" | "walking">("driving");

    const [source, setSource] = useState<LocationType>();
    const [destination, setDestination] = useState<LocationType>();
    const [routesAvailable, setRoutesAvailable] = useState<boolean>(false);
    const [routes, setRoutes] = useState<any>();

    // console.log("Location: ", location);
    useEffect(() => {
        setRoutes([]);
        setRoutesAvailable(false);
        // if (active === "start") {
        //     setSourceQuery(query);
        //     console.log("Start Location: ", query);
        // } else if (active === "end") {
        //     setDestinationQuery(query);
        //     console.log("End Location: ", query);
        // }


        //TODO: add --> if user has already selected a destination, then check if the selected value is in the suggestions list 
        fetchPlacePredictions(query, location)
            .then(predictions => {
                return Promise.all(
                    predictions.map(prediction =>
                        fetchPlaceDetails(prediction.place_id, prediction.description).then(details => ({
                            name: details.name || prediction.description,
                            address: details.address || prediction.description,
                            place_id: prediction.place_id,
                            lat: details.lat, // Placeholder until lat/lng is fetched
                            lng: details.lng // Placeholder until lat/lng is fetched
                        }))
                    )
                );
            })
            .then(results => setResults(results))
            .catch(error => console.error("Error fetching places:", error));
    }, [query]);

    useEffect(() => {
        setQuery(sourceQuery); 
        setRoutesAvailable(false);
    }, [sourceQuery]);

    useEffect(() => {
        setQuery(destinationQuery);
        setRoutesAvailable(false);
    }, [destinationQuery]);

    useEffect(() => {
        if (location?.lat !== undefined && location?.lng !== undefined) {
            setUserLocation({ lat: location.lat, lng: location.lng });
            setUseLocation(true);
        }
    }, [location]);

    useEffect(() => {
        if (location?.lat !== undefined && location?.lng !== undefined) {
            setUserLocation({ lat: location.lat, lng: location.lng });
            setUseLocation(true);
        }
    }, []);

    const handleSelect = async (index: number) => {
        const place = results[index];
        const placeDetails = await fetchPlaceDetails(place.place_id, place.name);
        console.log("Selected Place: ", placeDetails);


        if (active === "start") {
            setSourceQuery(placeDetails.name);
            setSource(placeDetails);


        } else if (active === "end") {
            setDestinationQuery(placeDetails.name);
            setDestination(placeDetails);

        }

        setResults([]);
    };

    const getDirections = async () => {
        console.log("Getting Directions...");

        if(sourceQuery === "" || destinationQuery === "") {
            console.error("Source or Destination is empty");
            console.log("Source: ", sourceQuery);
            console.log("Destination: ", destinationQuery);
            return;
        }
        if (!useLocation && location?.lat !== undefined && location?.lng !== undefined) {
            const temp = await fetchPlaceIDfromCoords({ lat: location.lat, lng: location.lng })
            console.log("user location info: ", location.lat, location.lng);
            const sourceDetails = await fetchPlaceDetails(temp);
            setSource(sourceDetails);

        } else {
            console.error("Location coordinates are undefined");
        }
        console.log("Source id: ", source?.place_id);
        console.log("Destination id: ", destination?.place_id);

        const routes = await fetchDirections(source!, destination!, transportationMode).then((result) => {
            // setRoutes(result.routes);
            console.log(" routes: ", result.routes);
            return result.routes;
        }).catch((error) => {
            console.error("Error fetching directions: ", error);
        });
        console.log("Routes: ", routes);
        setRoutes(routes);
        setRoutesAvailable(true);
    };


    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places", "geometry"]}>
            <div className="relative flex flex-col flex-shrink-0 w-full" >
                <div className=" fixed flex flex-col flex-shrink-0 w-full top-0 z-30 p-2  bg-white ">
                    <div className="flex flex-row items-center">
                        <MyLocationIcon />
                        <input
                            id="start-input"
                            type="text"
                            placeholder="Enter your starting location"
                            className=" p-2 m-2 border-2 border-gray-200 rounded-lg w-full"
                            value={/*active == "start" ? query :*/ useLocation ? 'Your Location' : sourceQuery}
                            onChange={(e) => {
                                setUseLocation(false); //if user type, we stop using thier location and let them type in the input
                                setActive("start");
                                setSourceQuery(e.target.value);
                            }}
                        >
                        </input>
                        <p onClick={() => setSourceQuery("")}>x</p>
                    </div>
                    <div className="flex flex-row items-center">
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
                        >
                        </input>
                        <p onClick={() => setDestinationQuery("")}>x</p>
                    </div>
                    {results &&
                        <div className="flex w-full ">
                            <ul className="w-full">
                                {results.map((result, index) => (
                                    <li key={index}
                                        onClick={() => {
                                            handleSelect(index);
                                            setResults([]);
                                            console.log("Selected: ", results[index]);
                                        }}
                                        className="flex flex-row items-center m-2 border-2 border-gray-200 rounded-lg w-full">
                                        <div className="flex flex-col items-center">
                                            <RoomIcon style={{ color: "gray" }} />
                                            <span className="truncate">{getDistanceFromDestination(userLocation, { lat: result.lat, lng: result.lng })} km</span>
                                        </div>
                                        <div className="flex flex-col border-2 border-gray-200 items-start truncate rounded-lg w-full">
                                            <span className='truncate'>{result.name}</span>
                                            <span className='truncate'>{result.address}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    }

                    {results.length == 0 &&
                        <div id='directions-request-container' className="flex flex-col items-center w-full">
                            <button
                                id="get-directions-button"
                                onClick={getDirections}
                                className="m-1 border-2 border-gray-200 rounded-lg w-full"
                            >
                                Get Directions
                            </button>

                            <div id="transport-mode-container" className="flex  flex-row justify-between w-full pl-4 pr-4 m-1">
                                <div id="car-option" className="flex flex-row items-center">
                                    <DirectionsCarIcon onClick={() => setTransportationMode("driving")} style={{ color: transportationMode === "driving" ? "#094F6d" : "gray" }} />
                                    <p style={{ color: transportationMode === "driving" ? "#094F6d" : "gray" }} >0 min</p>
                                </div>
                                <div id="transit-option" className="flex flex-row items-center">
                                    <DirectionsBusIcon onClick={() => setTransportationMode("transit")} style={{ color: transportationMode === "transit" ? "#094F6d" : "gray" }} />
                                    <p style={{ color: transportationMode === "transit" ? "#094F6d" : "gray" }}>0 min</p>
                                </div>
                                <div id="walking-option" className="flex flex-row items-center">
                                    <DirectionsWalkIcon onClick={() => setTransportationMode("walking")} style={{ color: transportationMode === "walking" ? "#094F6d" : "gray" }} />
                                    <p style={{ color: transportationMode === "walking" ? "#094F6d" : "gray" }} >0 min</p>
                                </div>
                                {/* <div id="shuttle-option" className="flex flex-row items-center">
                                    <AirportShuttleIcon onClick={() => setTransportMode("shuttle")} style={{ color: transportMode === "shuttle" ? "#094F6d" : "gray" }} />
                                    <p style={{ color: transportMode === "shuttle" ? "#094F6d" : "gray" }} >0 min</p>
                                </div> */}
                            </div>

                        </div>
                    }

                    {routesAvailable &&
                        <div id='routes-display' className='flex flex-col border-t-2 overflow-scroll '>
                            {routes?.map((route: any, index: number) => (
                                <div key={index}
                                    className="flex flex-row border-2 border-gray-200 rounded-lg w-full  mt-2 justify-between"
                                    onClick={() => {
                                        console.log("Selected Route: ", routes[index]);
                                    }}
                                >

                                    <div className="flex flex-col items-start pl-4 align-middle">
                                        <span className="font-bold">{route.legs[0].duration.text}</span>
                                        <div className="flex">
                                        <span className="text-xs">{route.legs[0].distance.text}</span>
                                        {index === 0 && <span className="text-xs ml-1">Fastest Route</span>}
                                        </div>
                                    </div>
                                    <div className="">
                                    <button>Go</button>
                                    </div>

                                    {/* <DirectionRenderer directions={route} /> */}
                                </div>
                            ))}
                        </div>
                    }

                </div>

                <div style={{ height: "86vh", width: "100vw" }}>
                    <Map
                        defaultZoom={17}
                        defaultCenter={{ lat: 45.4949, lng: -73.5779 }}
                        mapTypeControl={false}
                        fullscreenControl={false}
                    >
                        {geoJsonData && <MapComponent geoJsonData={geoJsonData} setIsUserInsideBuilding={setIsUserInsideBuilding} />}
                        {isUserInsideBuilding && userLocation && <Marker position={userLocation} />}
                    </Map>
                </div>

            </div>
        </APIProvider>

    );
}
export default Directions;