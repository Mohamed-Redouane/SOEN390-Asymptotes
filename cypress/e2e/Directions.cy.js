

describe('Directions Page', () => {
    beforeEach(() => {
        cy.intercept("GET", "/api/auth/me", {
            statusCode: 200,
            body: { user: { id: "test-user", email: "test@example.com" } }, // Fake authenticated user
        }).as("getCurrentUser");

        cy.visit("http://localhost:5173/directions", { timeout: 5000 }); //set to 5000 due to rebounce
        
    
        cy.intercept("GET", "api/maps/placesPredictions*", {
            statusCode: 200,
            body: [
                {
                    name: "Place 1",
                    address: "1234 Test St, Montreal, QC",
                    place_id: "45y54324rfvd",
                    lat: 45.5017,
                    lng: -73.5673,
                },
                {
                    name: "Place 2",
                    address: "5678 Test Ave, Montreal, QC",
                    place_id: "4556rdfghytrx",
                    lat: 45.5018,
                    lng: -73.5674,
                },
            ],
            
        }).as("autocompletePredictions");

        cy.intercept("GET", "/api/maps/placeDetails?placeId=45y54324rfvd", {
            statusCode: 200,
            body: {
                name: "Place 1",
                address: "1234 Test St, Montreal, QC",
                place_id: "45y54324rfvd",
                lat: 45.5017,
                lng: -73.5673,
            },
        }).as("placeDetails1");

        cy.intercept("GET", "/api/maps/placeDetails?placeId=4556rdfghytrx", {
            statusCode: 200,
            body: {
                name: "Place 2",
                address: "5678 Test Ave, Montreal, QC",
                place_id: "4556rdfghytrx",
                lat: 45.5018,
                lng: -73.5674,
            },
        }).as("placeDetails1");
        
        // cy.intercept("GET", "/api/maps/directions*", {
        //          statusCode: 200,
        //             body: [
        //           {
        //             "summary": "Route 1",
        //             "legs": [
        //               {
        //                 "start_address": "Source Location",
        //                 "end_address": "Destination Location",
        //                 "distance": { "text": "10 km", "value": 10000 },
        //                 "duration": { "text": "15 mins", "value": 900 }
        //               }
        //             ],
        //             "overview_polyline": {
        //               "points": "abc123fakePolyline"
        //             }
        //           },
        //           {
        //             "summary": "Route 2",
        //             "legs": [
        //               {
        //                 "start_address": "Source Location",
        //                 "end_address": "Destination Location",
        //                 "distance": { "text": "12 km", "value": 12000 },
        //                 "duration": { "text": "18 mins", "value": 1080 }
        //               }
        //             ],
        //             "overview_polyline": {
        //               "points": "xyz456fakePolyline"
        //             }
        //           }
                
        //         ]
        // }).as("getDirectionsDriving");

        // cy.intercept(
        //     "GET",
        //     /https:\/\/maps\.googleapis\.com\/maps\/api\/directions\/json\?.*mode=walking.*/,
        //     (req) => {
        //       req.reply({
        //         status: "OK",
        //         routes: [
        //           {
        //             summary: "Shortest Walk",
        //             legs: [
        //               {
        //                 distance: { text: "3 km", value: 3000 },
        //                 duration: { text: "30 mins", value: 1800 },
        //                 start_address: "Start Location",
        //                 end_address: "End Location",
        //                 steps: [
        //                   { instructions: "Walk straight for 1 km", distance: { text: "1 km", value: 1000 } },
        //                   { instructions: "Turn left at Park Ave", distance: { text: "500 m", value: 500 } },
        //                 ],
        //               },
        //             ],
        //           },
        //           {
        //             summary: "Scenic Walk",
        //             legs: [
        //               {
        //                 distance: { text: "4 km", value: 4000 },
        //                 duration: { text: "40 mins", value: 2400 },
        //                 start_address: "Start Location",
        //                 end_address: "End Location",
        //                 steps: [
        //                   { instructions: "Walk along river", distance: { text: "2 km", value: 2000 } },
        //                   { instructions: "Turn right at Garden St", distance: { text: "1 km", value: 1000 } },
        //                 ],
        //               },
        //             ],
        //           },
        //         ],
        //       });
        //     }
        // //      "/https:\/\/maps\.googleapis\.com\/maps\/api\/directions\/travelMode=walking", {
        // //     statusCode: 200,
        // //     body: [
        // //   {
        // //     "summary": "Route 1",
        // //     "legs": [
        // //       {
        // //         "start_address": "Source Location",
        // //         "end_address": "Destination Location",
        // //         "distance": { "text": "10 km", "value": 10000 },
        // //         "duration": { "text": "15 mins", "value": 900 }
        // //       }
        // //     ],
        // //     "overview_polyline": {
        // //       "points": "abc123fakePolyline"
        // //     }
        // //   },
        // //   {
        // //     "summary": "Route 2",
        // //     "legs": [
        // //       {
        // //         "start_address": "Source Location",
        // //         "end_address": "Destination Location",
        // //         "distance": { "text": "12 km", "value": 12000 },
        // //         "duration": { "text": "18 mins", "value": 1080 }
        // //       }
        // //     ],
        // //     "overview_polyline": {
        // //       "points": "xyz456fakePolyline"
        // //     }
        // //   }
        
        // // ]
        // ).as("getDirectionsWalking");

        cy.intercept( "GET",
          "/api/maps/directions?*", 
          // /https:\/\/maps\.googleapis\.com\/maps\/api\/directions\/json\.*/,
          {fixture: "mockDirectionResponse.json"}
        ).as("getDirections");
        
        cy.window().then((win) => {
            cy.stub(win.navigator.geolocation, "watchPosition").callsFake((success) => {
                success({
                    coords: { latitude: 45.4949, longitude: -73.5779, accuracy: 10 },
                });
            });
        });
        
    });


    it("The Google Maps API is loaded", () => {
        cy.wait("@getCurrentUser"); // Wait for mock authentication request
        cy.get('[data-testid="map"]').should("exist");
        cy.window().should("have.property", "google");
    });

    it("should automatically set the user's current location as the starting point when on campus", () => {
        cy.wait("@getCurrentUser"); // Wait for mock authentication request

        const mockUserLocation = {
            name: "Current Location",
            address: "1234 Current St, Montreal, QC",
            place_id: "current_location_id",
            lat: 45.4949,
            lng: -73.5779,
        };
        cy.intercept("GET", "/api/maps/addressFromCoordinates*", {
            statusCode: 200,
            body: {
                formatted_address: mockUserLocation.address,
                place_id: mockUserLocation.place_id,
            },
        }).as("getAddressFromCoords");

        cy.wait("@getAddressFromCoords");

        // Verify that the source input field is populated with the user's current location
        cy.get('#start-input').should('have.value', mockUserLocation.address);
    });

    it("the directions page has a working input field for source location", () => {
        cy.get('#start-input').should("exist");
        cy.get('#start-input').type('1');
        cy.wait("@autocompletePredictions", { timeout: 20000 }).then((interception) => {
            console.log("line 64:Intercepted predictions request:", interception);
        });
        cy.get('#start-input').should('have.value', '1');
    });

    it("the directions page has a working input field for destination location", () => {
        cy.get('#end-input').should("exist");
        cy.get('#end-input').type('1');
        cy.wait("@autocompletePredictions", { timeout: 20000 }).then((interception) => {
            console.log("line 73: Intercepted predictions request:", interception);
        });
        cy.get('#end-input').should('have.value', '1');
    });

    it(" the directions page should show suggestions when typing in the source location input field", () => {
        cy.get('#start-input').type('1');
 
        
        cy.wait("@autocompletePredictions", { timeout: 20000 }).then((interception) => {
            console.log("line 83:Intercepted predictions request:", interception);
        });

        cy.get('#suggestions-container').should("exist");
        cy.get('#suggestion-item-container').should('exist');
        cy.get('#name-address-container').should('exist');
    });

    it(" the directions page should show suggestions when typing in the destination location input field", () => {
        cy.get('#end-input').type('1');
        cy.wait("@autocompletePredictions", { timeout: 20000 }).then((interception) => {
            console.log("line 73: Intercepted predictions request:", interception);
        });
        cy.get('#suggestions-container').should("exist");
        cy.get('#suggestion-item-container').should('exist');
        cy.get('#name-address-container').should('exist');
    });

    it("the directions page should display route options when the user requests ", () => {
        //type source and destination location and submit request
        cy.get('#start-input').type('1');
        cy.wait("@autocompletePredictions", { timeout: 20000 }).then((interception) => {
            console.log("line 73: Intercepted predictions request:", interception);
        });
        cy.get('#suggestion-item-container').click();
        cy.wait("@placeDetails1", { timeout: 20000 }).then((interception) => {
            console.log("line 73: Intercepted place details request:", interception);
        });

        cy.get('#end-input').type('5');
        cy.wait("@autocompletePredictions", { timeout: 20000 }).then((interception) => {
            console.log("line 73: Intercepted predictions request:", interception);
        });
        cy.get('#suggestion-item-container').click();
        cy.wait("@placeDetails1", { timeout: 20000 }).then((interception) => {
            console.log("line 73: Intercepted place details request:", interception);
        });
    });

    it("should support changing the travel mode to walking", () => {
        //type source and destination location and submit request
        cy.get('#start-input').type('1');
        cy.wait("@autocompletePredictions", { timeout: 20000 }).then((interception) => {
            console.log("line 73: Intercepted predictions request:", interception);
        });
        cy.get('#suggestion-item-container').click();
        cy.wait("@placeDetails1", { timeout: 20000 }).then((interception) => {
            console.log("line 73: Intercepted place details request:", interception);
        });

        cy.get('#end-input').type('5678');
        cy.wait(2000);
        cy.wait("@autocompletePredictions", { timeout: 20000 }).then((interception) => {
            console.log("line 73: Intercepted predictions request:", interception);
        });
        cy.get('#suggestions-container').children().last().click();
        cy.wait("@placeDetails1", { timeout: 20000 }).then((interception) => {
            console.log("line 73: Intercepted place details request:", interception);
        });

        cy.get("#get-directions-button").click();
        cy.wait("@getDirections", { timeout: 20000 }).then((interception) => {
            console.log("line 73: Intercepted directions request:", interception);
        });

        cy.get('#transport-mode-container').should("exist");
        cy.get('#driving-option').click();
        cy.get('#walking-option').click();
        cy.get('#bicycling-option').click();
        
    });
});