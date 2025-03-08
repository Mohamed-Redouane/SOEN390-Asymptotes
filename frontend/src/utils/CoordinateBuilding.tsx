export default function getCentral(coords: { lat: number; lng: number }[]): { lat: number; lng: number } {
    const numPoints = coords.length;
    let latSum = 0;
    let lngSum = 0;
    coords.forEach((point) => {
      latSum += point.lat;
      lngSum += point.lng;
    });
    return { lat: latSum / numPoints, lng: lngSum / numPoints };
  }