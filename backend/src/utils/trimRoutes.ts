export function trimRoutes(directionsResponse:any):any{
    if (directionsResponse.data.routes.length > 3) {
        return directionsResponse.data.routes.slice(0, 3);
    }
    else {
        return directionsResponse.data.routes;
    }
}