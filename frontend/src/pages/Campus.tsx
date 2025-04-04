import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { useState, useContext, useEffect } from "react";
import { LocationContext } from "../components/LocationContext";
import MapComponent from "../components/MapComponent";
import ToggleCampus from "../components/ToggleCampusComponent";
import { FaStar } from "react-icons/fa";
import ModalPOI from "../components/ModalPOI";
import BuildingMarkers from "../components/BuildingMarkers";
import { useNavigate } from "react-router-dom"; // Import useNavigate

type CampusType = 'SGW' | 'LOYOLA'; // Define a type for campus to ensure only these two values are valid

// Define the coordinates for each campus
const CAMPUS_COORDINATES: { [key in CampusType]: { lat: number, lng: number } } = {
    SGW: { lat: 45.4949, lng: -73.5779 },
    LOYOLA: { lat: 45.4583, lng: -73.6403 }
};

function CampusMap() {
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const { location: userLocation } = useContext(LocationContext);
    //const [userLocation, setUserLocation] = useState(CAMPUS_COORDINATES.LOYOLA);   //TEST LOCATION
    const [isUserInsideBuilding, setIsUserInsideBuilding] = useState(false);
    const [campus, setCampus] = useState<CampusType>("SGW");
    const [pointsOfInterest, setPointsOfInterest] = useState<any[]>([]);
    const [radius, setRadius] = useState(100); // Store the selected radius
    const [prevRadius, setPrevRadius] = useState(100); // Store the previous radius
    const [poiType, setPoiType] = useState("restaurant"); // Store the selected POI type
    const [prevPoiType, setPrevPoiType] = useState("restaurant"); // Store the previous POI type
    const [loading, setLoading] = useState(false);
    const [selectedPoi, setSelectedPoi] = useState<any>(null);
    const [showPOIs, setShowPOIs] = useState(false); //POI visibility
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
    const [center, setCenter] = useState(CAMPUS_COORDINATES.SGW);
    const [showBuildings, setShowBuildings] = useState(false); // Visibility of building markers
    const [, setDestination] = useState<string>(""); // Store the destination address
    const navigate = useNavigate(); 

    useEffect(() => {
        fetch("/Building.geojson")
            .then((response) => response.json())
            .then((data) => { 
                setGeoJsonData(data); 
                console.log("CampusMap.tsx: setGeoJsonData"); 
            })
            .catch((error) => console.log("Error loading Campus GeoJSON:", error));
        console.log("CampusMap.tsx: fetch Building.geojson");
    }, []);

    useEffect(() => {
        setCenter(CAMPUS_COORDINATES[campus]);
        console.log("CampusMap.tsx: campus changed to", campus, "center set to", CAMPUS_COORDINATES[campus]);
    }, [campus]);

    useEffect(() => {
        if (userLocation) {
            performNearbySearch(userLocation);
        }
    }, [radius, userLocation, poiType]);

    const handleMapLoad = (event: any) => {
        const map = event.target as google.maps.Map; // target to google.maps.Map
        if (userLocation) {
            performNearbySearch(userLocation, map);
        }
    };

    const performNearbySearch = (location: { lat: number, lng: number }, map?: google.maps.Map) => {
        if (!google.maps || !google.maps.places) {
            console.error("Google Maps API is not fully loaded.");
            return;
        }

        setLoading(true);
        console.log("Performing nearby search with radius:", radius, "and type:", poiType);
        if (radius < prevRadius || poiType !== prevPoiType) {
            setPointsOfInterest([]); // Clear previous points of interest if new radius is smaller or change POI type
        }
        setPrevRadius(radius); // Update previous radius
        setPrevPoiType(poiType); // Update previous POI type
        const service = new google.maps.places.PlacesService(map || document.createElement('div'));
        const request = {
            location: new google.maps.LatLng(location.lat, location.lng),
            radius: radius,
            type: poiType
        };

        service.nearbySearch(request, (results, status) => {
            setLoading(false);
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                console.log("Nearby search results:", results);
                setPointsOfInterest((prevPoints) => {
                    const newPoints = results.filter((newPoint) => 
                        !prevPoints.some((prevPoint) => prevPoint.place_id === newPoint.place_id)
                    );
                    return [...prevPoints, ...newPoints];
                });
            } else {
                console.error("Nearby search failed:", status);
            }
        });
    };

    const filterPointsOfInterest = () => {
        if (!userLocation) return pointsOfInterest;

        const userLatLng = new google.maps.LatLng(userLocation.lat, userLocation.lng);
        return pointsOfInterest.filter((poi) => {
            const poiLatLng = new google.maps.LatLng(poi.geometry.location.lat(), poi.geometry.location.lng());
            const distance = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, poiLatLng);
            return distance <= radius;
        });
    };

    function handleToggle() {
        // console.log("CampusMap.tsx: 1 handleToggle--> campus: ", campus);
        // setCampus((prevCampus) => (prevCampus === "SGW" ? "LOYOLA" : "SGW"));
        // setCenter(CAMPUS_COORDINATES[campus as CampusType]);
        setCampus((prevCampus) => {
            const newCampus = prevCampus === "SGW" ? "LOYOLA" : "SGW";
            setCenter(CAMPUS_COORDINATES[newCampus]); // Ensure center updates correctly
            return newCampus;
        });
    }

    const onChange = (args: any) => {
        console.log(args.map.center);
        setCenter(args.map.center);
    };

    const handleRadiusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRadius(Number(event.target.value));
    };

    const handlePoiTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setPoiType(event.target.value);
    };

    const togglePOIs = () => {
        setShowPOIs((prevShowPOIs) => !prevShowPOIs);
        setIsModalOpen(false);
    };

    const toggleModal = () => {
        setIsModalOpen((prevIsModalOpen) => !prevIsModalOpen);
    };

    return (
        <div>
            {loading && <div className='fixed w-full'>Loading...</div>}

            <ModalPOI isOpen={isModalOpen} onClose={toggleModal}>
                <div>
                    <label htmlFor="radius">Select Radius: </label>
                    <div>
                        <select id="radius" className='w-full' value={radius} onChange={handleRadiusChange}>
                            <option value={100}>100 meters</option>
                            <option value={200}>200 meters</option>
                            <option value={500}>500 meters</option>
                            <option value={1000}>1000 meters</option>
                        </select>
                        <input
                            className='w-full'
                            type="number"
                            min='1'
                            placeholder="Enter custom radius"
                            onBlur={(e) => {
                                setRadius((+e.target.value) > 0 ? Number(e.target.value) : 1)
                            }}
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="poiType">Select POI Type: </label>
                    <select id="poiType" className='w-full' value={poiType} onChange={handlePoiTypeChange}>
                        <option value="restaurant">Restaurant</option>
                        <option value="cafe">Cafe</option>
                        <option value="library">Library</option>
                        <option value="park">Park</option>
                        <option value="store">Store</option>
                        <option value="gym">Gym</option>
                        <option value="museum">Museum</option>
                        <option value="hospital">Hospital</option>
                        <option value="school">School</option>
                    </select>
                </div>
                <button onClick={togglePOIs} className='bg-[#007bff] text-white transition duration-300 hover:bg-[#0056b3] w-full'>
                    {showPOIs ? "Hide POIs" : "Show POIs"}
                </button>
            </ModalPOI>
            <div
                style={{ height: '86vh', width: '100vw', zIndex: -1 }}
                id="map"
                data-center={campus}
            >
                <ToggleCampus
                    campus={campus}
                    onClick={handleToggle}
                    data-testid="toggle-button" 
                />
              
              <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'left', flexWrap: 'wrap' }}>
                <button 
                    onClick={toggleModal} 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginTop: '0px', 
                        marginLeft: '10px', 
                        padding: '7px 10px', 
                        fontSize: '15px' 
                    }}
                >
                    <FaStar style={{ marginRight: '5px' }} />
                    Explore
                </button>
                <button 
                    onClick={() => setShowBuildings(prev => !prev)} 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginTop: '0px', 
                        padding: '7px 10px', 
                        fontSize: '15px' 
                    }}
                >
                    {showBuildings ? "Hide Buildings" : "Show Buildings"}
                </button>
              </div>
              
                <APIProvider
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    libraries={["geometry", "places"]}
                >
                    <Map
                        defaultZoom={17}
                        center={center}
                        mapTypeControl={false}
                        fullscreenControl={false}
                        onCenterChanged={onChange}
                        onTilesLoaded={handleMapLoad}
                    >
                        {geoJsonData && <MapComponent geoJsonData={geoJsonData} setIsUserInsideBuilding={setIsUserInsideBuilding} />}
                        {isUserInsideBuilding && userLocation && <Marker position={userLocation} />}
                        {showBuildings && geoJsonData && <BuildingMarkers geoJsonData={geoJsonData} />}
                      
                       {showPOIs && filterPointsOfInterest().map((poi, index) => (     //Filter POIs based on radius
                            <Marker 
                                key={index} 
                                position={poi.geometry.location} 
                                onClick={() => {
                                    console.log("Selected POI:", poi);
                                    setSelectedPoi(poi);
                                }} 
                            />
                        ))}
                     {selectedPoi && (           //Info pop up for selected POI
                            <InfoWindow
                                position={selectedPoi.geometry.location}
                                onCloseClick={() => setSelectedPoi(null)}
                            >
                                <div className="max-w-[250px] bg-white rounded-lg p-3 shadow-md text-gray-800 font-sans">
                                    <h3 className="text-xl font-bold text-[#5A2DA2] mb-2">{selectedPoi.name}</h3>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{selectedPoi.vicinity}</p>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>Rating: {selectedPoi.rating}</p>
                                    {selectedPoi.opening_hours && (
                                        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                                            {selectedPoi.opening_hours.open_now ? 'Now Open' : 'Closed'}
                                        </p>
                                    )}
                                    {selectedPoi.photos && selectedPoi.photos.length > 0 && (
                                        <img
                                            src={selectedPoi.photos[0].getUrl({ maxWidth: 400, maxHeight: 200 })}
                                            alt={selectedPoi.name}
                                            style={{ width: '100%', height: 'auto', borderRadius: '5px' }}
                                        />
                                    )}
                                    <button
                                    className="mt-3 rounded-lg bg-[#5A2DA2] text-white font-bold px-4 py-2 cursor-pointer hover:bg-[#4b29f1]"
                                    onClick={() => {
                                        const modifiedAddress = `${selectedPoi.vicinity} `;
                                        setDestination(modifiedAddress); // Set the destination address
                                        navigate('/directions', { state: { destination: modifiedAddress } }); // Navigate to directions page with destination address
                                    }}
                                >
                                    Get Directions
                                </button>
                                </div>
                            </InfoWindow>
                        )}
                    </Map>
                </APIProvider>
            </div>
        </div>
    );
}

export default CampusMap;