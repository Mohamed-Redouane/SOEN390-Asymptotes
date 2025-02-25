interface LocationType {
   name: string;
   address: string;
   place_id: string;
   lat: number;
   lng: number;
}


export function fetchDirections( source: LocationType, destination: LocationType, transportationMode: string)
{
   
   console.log("Fetching Directions...", source, destination, transportationMode);
   const getTravelMode = (mode: string): google.maps.TravelMode => {
      const modeMap: Record<string, google.maps.TravelMode> = {
          car: google.maps.TravelMode.DRIVING,
          driving: google.maps.TravelMode.DRIVING,
          walking: google.maps.TravelMode.WALKING,
          bike: google.maps.TravelMode.BICYCLING,
          transit: google.maps.TravelMode.TRANSIT
      };
  
      return modeMap[mode.toLowerCase()] || google.maps.TravelMode.DRIVING; // Default to DRIVING
  };

   const travelMode = getTravelMode(transportationMode);


   return new Promise<google.maps.DirectionsResult>((resolve, reject) => {
         const directionsService = new google.maps.DirectionsService();
         const directionsResult = directionsService.route(
            {
                  origin: {lat: source.lat, lng: source.lng},
                  destination: {lat: destination.lat, lng: destination.lng},
                  travelMode: travelMode,
                  provideRouteAlternatives: true,

            },
            (result, status) => {
                  if (status === google.maps.DirectionsStatus.OK && result) {
                  //    const sortedRoutes = result.routes.sort((a, b) => {
                  //       const durationA = a.legs[0].duration?.value || Infinity; // duration in seconds
                  //       const durationB = b.legs[0].duration?.value || Infinity;
                  //       return durationA - durationB; // Ascending order (shortest first)
                  //   });
    

                  //    console.log("Directions: ", sortedRoutes);
                  //    resolve({
                  //       duration: sortedRoutes[0].legs[0].duration?.text,
                  //       distance: sortedRoutes[0].legs[0].distance?.text,
                  //       steps: sortedRoutes[0].legs[0].steps,
                        
                  //    });
                     resolve(result);
                  } else {
                     reject("Failed to fetch directions.");
                  }
               
            }
         );
         
      });
}


export function fetchDirectionRenders({directions, map}: {directions: any, map: google.maps.Map | null}) {
   if (!map) {
      return null;
   }
   const directionsRenderer = new google.maps.DirectionsRenderer({

   });
   directionsRenderer.setMap(map);
   directionsRenderer.setDirections(directions);
   return null;
}
