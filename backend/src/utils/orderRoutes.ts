export function orderRoutes(routesObject: any): any{
    if (!routesObject || !routesObject.data || !routesObject.data.routes){
       throw new Error('Invalid routes object, cannot order the routes');
    }
    //given the routes from the google maps api, sort them by duration
    for (let i = 0; i < routesObject.data.routes.length; i++){
        for (let j = i+1; j < routesObject.data.routes.length; j++){
            if (routesObject.data.routes[i].legs[0].duration.value > routesObject.data.routes[j].legs[0].duration.value){
                let temp = routesObject.data.routes[i];
                routesObject.data.routes[i] = routesObject.data.routes[j];
                routesObject.data.routes[j] = temp;
            }
        }
    }
   
    //return the sorted routes
    return routesObject;
    
}