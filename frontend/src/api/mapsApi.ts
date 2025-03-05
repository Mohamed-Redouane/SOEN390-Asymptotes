import axios from "axios";
import {extractErrorMessage} from "./authApi";


// set up axios with the base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });



  // interface LocationType {
  //   name: string;
  //   address: string;
  //   place_id: string;
  //   lat: number;
  //   lng: number;
  // }


// get place predictions from the Google Maps API
export async function getPlacePredictions(searchQuery:string,  lat:number, lng:number, description?:string,) {
  try {
    const response = await api.get("/api/maps/placesPredictions", { params: { searchQuery, lat, lng, description } });
    return response.data;
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to get place predictions.");
    throw new Error(message);
  }
}

export async function getPlacesDetails(placeId: string) {
  try {
    const response = await api.get("/api/maps/placeDetails", { params: { placeId } });
    console.log("response from getPlacesDetails:" ,response.data);
    return response.data;
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to get place details.");
    throw new Error(message);
  }
}

export async function getDirections(source:string, destination: string, travelMode: string) {
  try {
    const response = await api.get("/api/maps/directions", { params: { source, destination, travelMode } });
    console.log("response from getDirections:" ,response);
    return response.data;
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to get directions.");
    throw new Error(message);
  }
}

export async function getAddressFromCoords(lat: number, lng: number){
  try{
    const response = await api.get("/api/maps/addressFromCoordinates", { params: { lat, lng } });
    console.log("response getAddressFromCoords:", response);
    return response.data;
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to get address.");
    throw new Error(message);
  }
}