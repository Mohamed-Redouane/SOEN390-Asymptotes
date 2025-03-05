import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useState, useContext, useEffect } from "react";
import { LocationContext } from "../components/LocationContext";
import MapComponent from "../components/MapComponent";
import ToggleCampus from "../components/ToggleCampusComponent";

type CampusType = 'SGW' | 'LOYOLA'; // Define a type for campus to ensure only these two values are valid

// Define the coordinates for each campus
const CAMPUS_COORDINATES: { [key in CampusType]: { lat: number, lng: number } } = {
    SGW: { lat: 45.4949, lng: -73.5779 },
    LOYOLA: { lat: 45.4583, lng: -73.6403 }
};

function CampusMap() {
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const { location: userLocation } = useContext(LocationContext);
    const [isUserInsideBuilding, setIsUserInsideBuilding] = useState(false);
    const [campus, setCampus] = useState<CampusType>("SGW");
    const [center, setCenter] = useState(CAMPUS_COORDINATES[campus]);
    const [pointsOfInterest, setPointsOfInterest] = useState<any[]>([]);
    const [radius, setRadius] = useState(100); // Store the selected radius
    const [prevRadius, setPrevRadius] = useState(100); // Store the previous radius
    const [poiType, setPoiType] = useState("restaurant"); // Store the selected POI type
    const [prevPoiType, setPrevPoiType] = useState("restaurant"); // Store the previous POI type
    const [loading, setLoading] = useState(false);

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

    const handleMapLoad = (map: google.maps.Map) => {
        if (userLocation) {
            performNearbySearch(userLocation, map);
        }
    };

    const performNearbySearch = (location: { lat: number, lng: number }, map?: google.maps.Map) => {
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
            setCenter(CAMPUS_COORDINATES[newCampus as CampusType]); // Ensure center updates correctly
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

    return (
        <div>
            {loading && <div>Loading...</div>}
            <div>
                <label htmlFor="radius">Select Radius: </label>
                <select id="radius" value={radius} onChange={handleRadiusChange}>
                    <option value={100}>100 meters</option>
                    <option value={200}>200 meters</option>
                    <option value={500}>500 meters</option>
                    <option value={1000}>1000 meters</option>
                </select>
                <input
                    type="number"
                    placeholder="Enter custom radius"
                    onBlur={(e) => setRadius(Number(e.target.value))}
                />
            </div>
            <div>
                <label htmlFor="poiType">Select POI Type: </label>
                <select id="poiType" value={poiType} onChange={handlePoiTypeChange}>
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
            <div
                style={{ height: '86vh', width: '100vw', zIndex: -1 }}
                id="map"
                data-center={campus}
            >
                <ToggleCampus
                    campus={campus}
                    onClick={handleToggle}
                />
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
                        onLoad={handleMapLoad}
                    >
                        {geoJsonData && <MapComponent geoJsonData={geoJsonData} setIsUserInsideBuilding={setIsUserInsideBuilding} />}
                        {isUserInsideBuilding && userLocation && <Marker position={userLocation} />}
                        {filterPointsOfInterest().map((poi, index) => (
                            <Marker key={index} position={poi.geometry.location} />
                        ))}
                    </Map>
                </APIProvider>
            </div>
        </div>
    );
}

export default CampusMap;