import axios from 'axios';

interface GeocodingResponse {
    status: string;
    results: {
      formatted_address: string;
      geometry: {
        location: {
          lat: number;
          lng: number;
        };
      };
      place_id: string;
      types: string[];
    }[];
  }

export const fetchAddressFromCoordinates = async (lat: number, lng: number): Promise<{formatted_address: string, place_id: string}> => {
    try {
      const response = await axios.get<GeocodingResponse>('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          latlng: `${lat},${lng}`,
          key: process.env.GOOGLE_MAPS_API_KEY, 
        },
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        console.log(response.data.results[0].formatted_address);
        console.log(response.data.results[0].place_id);
        const {formatted_address, place_id} = response.data.results[0]
        return {formatted_address, place_id}; 
      } else if (response.data.status === 'ZERO_RESULTS') {
        throw new Error('No address found for the given coordinates.');
      } else {
        throw new Error('Failed to fetch address.');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error('Failed to fetch address.');
    }
  };