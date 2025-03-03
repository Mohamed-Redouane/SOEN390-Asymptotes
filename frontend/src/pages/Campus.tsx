import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useState, useContext, useEffect } from "react";
import { LocationContext } from "../Components/LocationContext";
import MapComponent from "../Components/MapComponent";
import ToggleCampus from "../Components/ToggleCampusComponent";
import BuildingMarkers from "../Components/BuildingMarkers";

type CampusType = 'SGW' | 'LOYOLA'; // Define a type for campus to ensure only these two values are valid

// Define the coordinates for each campus
const CAMPUS_COORDINATES: { [key in CampusType]: { lat: number, lng: number } } = {
    SGW: { lat: 45.4949, lng: -73.5779 },
    LOYOLA: { lat: 45.4583, lng: -73.6403 }
};
/*
// Define the building data
const BUILDINGS = [
    { campus: 'LOYOLA', abbreviation: 'AD', name: 'Administration Building', lat: 45.457984, lng: -73.639834 },
    { campus: 'SGW', abbreviation: 'B', name: 'B Annex', lat: 45.497856, lng: -73.579588 },
    { campus: 'LOYOLA', abbreviation: 'BB', name: 'BB-BH Annex', lat: 45.459793, lng: -73.639174 },
    { campus: 'LOYOLA', abbreviation: 'BH', name: 'BB-BH Annex', lat: 45.459819, lng: -73.639152 },
    { campus: 'LOYOLA', abbreviation: 'CC', name: 'Central Building', lat: 45.458204, lng: -73.640300 },
    { campus: 'SGW', abbreviation: 'CI', name: 'CI Annex', lat: 45.497467, lng: -73.579925 },
    { campus: 'LOYOLA', abbreviation: 'CJA', name: 'Communication Studies and Journalism Building', lat: 45.457478, lng: -73.640354 },
    { campus: 'LOYOLA', abbreviation: 'CJN', name: 'Communication Studies and Journalism Building', lat: 45.457478, lng: -73.640354 },
    { campus: 'LOYOLA', abbreviation: 'CJS', name: 'Communication Studies and Journalism Building', lat: 45.457478, lng: -73.640354 },
    { campus: 'SGW', abbreviation: 'CL', name: 'CL Annex', lat: 45.494259, lng: -73.579007 },
    { campus: 'SGW', abbreviation: 'D', name: 'D Annex', lat: 45.497827, lng: -73.579409 },
    { campus: 'SGW', abbreviation: 'EN', name: 'EN Annex', lat: 45.496944, lng: -73.579555 },
    { campus: 'SGW', abbreviation: 'ER', name: 'ER Building', lat: 45.496428, lng: -73.579990 },
    { campus: 'SGW', abbreviation: 'ES', name: 'ES Building', lat: 45.496172, lng: -73.579922 },
    { campus: 'SGW', abbreviation: 'ET', name: 'ET Building', lat: 45.496163, lng: -73.579904 },
    { campus: 'SGW', abbreviation: 'EV', name: 'Engineering, Computer Science and Visual Arts Integrated Complex', lat: 45.495376, lng: -73.577997 },
    { campus: 'SGW', abbreviation: 'FA', name: 'FA Annex', lat: 45.496874, lng: -73.579468 },
    { campus: 'SGW', abbreviation: 'FB', name: 'Faubourg Building', lat: 45.494666, lng: -73.577603 },
    { campus: 'LOYOLA', abbreviation: 'FC', name: 'F.C. Smith Building', lat: 45.458493, lng: -73.639287 },
    { campus: 'SGW', abbreviation: 'FG', name: 'Faubourg Ste-Catherine Building', lat: 45.494381, lng: -73.578425 },
    { campus: 'SGW', abbreviation: 'GA', name: 'Grey Nuns Annex', lat: 45.494123, lng: -73.577870 },
    { campus: 'LOYOLA', abbreviation: 'GE', name: 'Centre for Structural and Functional Genomics', lat: 45.457017, lng: -73.640432 },
    { campus: 'SGW', abbreviation: 'GM', name: 'Guy-De Maisonneuve Building', lat: 45.495983, lng: -73.578824 },
    { campus: 'SGW', abbreviation: 'GNA', name: 'Grey Nuns Building', lat: 45.493622, lng: -73.577003 },
    { campus: 'SGW', abbreviation: 'GNB', name: 'Grey Nuns Building', lat: 45.493622, lng: -73.577003 },
    { campus: 'SGW', abbreviation: 'GNH', name: 'Grey Nuns Building', lat: 45.493622, lng: -73.577003 },
    { campus: 'SGW', abbreviation: 'GNL', name: 'Grey Nuns Building', lat: 45.493622, lng: -73.577003 },
    { campus: 'SGW', abbreviation: 'GS', name: 'Guy-Sherbrooke Building', lat: 45.496673, lng: -73.581409 },
    { campus: 'SGW', abbreviation: 'H', name: 'Henry F. Hall Building', lat: 45.497092, lng: -73.578800 },
    { campus: 'LOYOLA', abbreviation: 'HA', name: 'Hingston Hall, wing HA', lat: 45.459356, lng: -73.641270 },
    { campus: 'LOYOLA', abbreviation: 'HB', name: 'Hingston Hall, wing HB', lat: 45.459308, lng: -73.641849 },
    { campus: 'LOYOLA', abbreviation: 'HC', name: 'Hingston Hall, wing HC', lat: 45.459663, lng: -73.642080 },
    { campus: 'LOYOLA', abbreviation: 'HU', name: 'Applied Science Hub', lat: 45.458513, lng: -73.641921 },
    { campus: 'LOYOLA', abbreviation: 'JR', name: 'Jesuit Residence', lat: 45.458432, lng: -73.643235 },
    { campus: 'SGW', abbreviation: 'K', name: 'K Annex', lat: 45.497777, lng: -73.579531 },
    { campus: 'SGW', abbreviation: 'LB', name: 'J.W. McConnell Building', lat: 45.497050, lng: -73.578009 },
    { campus: 'SGW', abbreviation: 'LC', name: 'LC Building', lat: 45.496782, lng: -73.577358 },
    { campus: 'SGW', abbreviation: 'LD', name: 'LD Building', lat: 45.496697, lng: -73.577312 },
    { campus: 'SGW', abbreviation: 'M', name: 'M Annex', lat: 45.497368, lng: -73.579777 },
    { campus: 'SGW', abbreviation: 'MB', name: 'John Molson Building', lat: 45.495304, lng: -73.579044 },
    { campus: 'SGW', abbreviation: 'MI', name: 'MI Annex', lat: 45.497807, lng: -73.579261 },
    { campus: 'SGW', abbreviation: 'MK', name: 'MK Annex', lat: 45.496606, lng: -73.579025 },
    { campus: 'SGW', abbreviation: 'MM', name: 'MM Annex', lat: 45.494665, lng: -73.576365 },
    { campus: 'SGW', abbreviation: 'MN', name: 'MN Annex', lat: 45.494568, lng: -73.576315 },
    { campus: 'SGW', abbreviation: 'MT', name: 'Montefiore Building', lat: 45.494442, lng: -73.576108 },
    { campus: 'SGW', abbreviation: 'MU', name: 'MU Annex', lat: 45.497963, lng: -73.579506 },
    { campus: 'SGW', abbreviation: 'P', name: 'P Annex', lat: 45.496745, lng: -73.579113 },
    { campus: 'LOYOLA', abbreviation: 'PB', name: 'PB Building', lat: 45.456534, lng: -73.638106 },
    { campus: 'LOYOLA', abbreviation: 'PC', name: 'PERFORM centre', lat: 45.457088, lng: -73.637683 },
    { campus: 'SGW', abbreviation: 'PR', name: 'PR Annex', lat: 45.497066, lng: -73.579790 },
    { campus: 'LOYOLA', abbreviation: 'PS', name: 'Physical Services Building', lat: 45.459636, lng: -73.639758 },
    { campus: 'LOYOLA', abbreviation: 'PT', name: 'Oscar Peterson Concert Hall', lat: 45.459308, lng: -73.638941 },
    { campus: 'LOYOLA', abbreviation: 'PY', name: 'Psychology Building', lat: 45.458938, lng: -73.640467 },
    { campus: 'SGW', abbreviation: 'Q', name: 'Q Annex', lat: 45.496648, lng: -73.579094 },
    { campus: 'SGW', abbreviation: 'R', name: 'R Annex', lat: 45.496826, lng: -73.579389 },
    { campus: 'LOYOLA', abbreviation: 'RA', name: 'Recreation and Athletics Complex', lat: 45.456774, lng: -73.637610 },
    { campus: 'LOYOLA', abbreviation: 'RF', name: 'Loyola Jesuit Hall and Conference Centre', lat: 45.458489, lng: -73.641028 },
    { campus: 'SGW', abbreviation: 'RR', name: 'RR Annex', lat: 45.496796, lng: -73.579259 },
    { campus: 'SGW', abbreviation: 'S', name: 'S Annex', lat: 45.497423, lng: -73.579851 },
    { campus: 'SGW', abbreviation: 'SB', name: 'Samuel Bronfman Building', lat: 45.496600, lng: -73.586090 },
    { campus: 'LOYOLA', abbreviation: 'SC', name: 'Student Centre', lat: 45.459131, lng: -73.639251 },
    { campus: 'LOYOLA', abbreviation: 'SH', name: 'Solar House', lat: 45.459298, lng: -73.642478 },
    { campus: 'LOYOLA', abbreviation: 'SP', name: 'Richard J. Renaud Science Complex', lat: 45.457881, lng: -73.641565 },
    { campus: 'SGW', abbreviation: 'T', name: 'T Annex', lat: 45.496710, lng: -73.579270 },
    { campus: 'LOYOLA', abbreviation: 'TA', name: 'Terrebonne Building', lat: 45.459992, lng: -73.640897 },
    { campus: 'LOYOLA', abbreviation: 'TB', name: 'TB Annex', lat: 45.460051, lng: -73.640842 },
    { campus: 'SGW', abbreviation: 'TD', name: 'Toronto-Dominion Building', lat: 45.495103, lng: -73.578375 },
    { campus: 'SGW', abbreviation: 'TU', name: 'TU Tunnel', lat: 45.496480, lng: -73.578918 },
    { campus: 'SGW', abbreviation: 'V', name: 'V Annex', lat: 45.497101, lng: -73.579907 },
    { campus: 'SGW', abbreviation: 'VA', name: 'Visual Arts Building', lat: 45.495543, lng: -73.573795 },
    { campus: 'LOYOLA', abbreviation: 'VE', name: 'Vanier Extension', lat: 45.459026, lng: -73.638606 },
    { campus: 'LOYOLA', abbreviation: 'VL', name: 'Vanier Library Building', lat: 45.459026, lng: -73.638606 },
    { campus: 'SGW', abbreviation: 'X', name: 'X Annex', lat: 45.496940, lng: -73.579593 },
    { campus: 'SGW', abbreviation: 'Z', name: 'Z Annex', lat: 45.496981, lng: -73.579705 },
];
*/
function CampusMap() {
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const { location: userLocation } = useContext(LocationContext);
    const [isUserInsideBuilding, setIsUserInsideBuilding] = useState(false);
    const [campus, setCampus] = useState<CampusType>("SGW");
    const [center, setCenter] = useState(CAMPUS_COORDINATES.SGW);
    const [showBuildings, setShowBuildings] = useState(false); // Visibility of building markers

    useEffect(() => {
        fetch("/Building.geojson")
            .then((response) => response.json())
            .then((data) => { setGeoJsonData(data); console.log("CampusMap.tsx: setGeoJsonData"); })
            .catch((error) => console.log("Error loading Campus GeoJSON:", error));
        console.log("CampusMap.tsx: fetch Building.geojson");
    }, []);

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

    return (
        <div
            style={{ height: '86vh', width: '100vw', zIndex: -1 }}
            id="map"
            data-center={campus}
        >
            <ToggleCampus
                campus={campus}
                onClick={handleToggle}
            />
            <button 
                onClick={() => setShowBuildings(prev => !prev)} 
                style={{ padding: '5px 10px', fontSize: '12px' }}
            >
                {showBuildings ? "Hide Buildings" : "Show Buildings"}
            </button>
            <APIProvider
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                libraries={["geometry"]}>
                <Map
                    defaultZoom={17}
                    center={center}
                    mapTypeControl={false}
                    fullscreenControl={false}
                    onCenterChanged={onChange}
                >
                    {geoJsonData && (
            <MapComponent
              geoJsonData={geoJsonData}
              setIsUserInsideBuilding={setIsUserInsideBuilding}
            />
          )} 
                    {isUserInsideBuilding && userLocation && <Marker position={userLocation} />}
                    {showBuildings && geoJsonData && <BuildingMarkers geoJsonData={geoJsonData} />}
                    {/*}
                    {BUILDINGS.filter(building => building.campus === campus).map(building => (
                        <Marker
                            key={building.abbreviation}
                            position={{ lat: building.lat, lng: building.lng }}
                            title={building.name}
                            label={building.abbreviation}
                        />
                    ))}
                    {*/}
                </Map>
            </APIProvider>
        </div>
    );
}

export default CampusMap;