export function distanceCalculation(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

export function getDistanceFromDestination(userLocation: any, destination: { lat: number, lng: number }): string {
  if (!userLocation || !destination) {
    return "0";
  }
  else {
    // console.log("userLocation: ", userLocation);
    // console.log("destination: ", destination);
    return distanceCalculation(userLocation.lat, userLocation.lng, destination.lat, destination.lng).toFixed(1);
  }
}

export function getDistanceFromSource(destination: { lat: number, lng: number }, source: { lat: number, lng: number }): string {
  if (!destination || !source) {
    return "";
  }
  else {
    // console.log("userLocation: ", destination);
    // console.log("source: ", source);
    return distanceCalculation(destination.lat, destination.lng, source.lat, source.lng).toFixed(1);
  }
}