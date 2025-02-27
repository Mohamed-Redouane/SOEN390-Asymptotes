

describe('Directions Page', () => {
    beforeEach(() => {
        cy.intercept("GET", "/api/auth/me", {
            statusCode: 200,
            body: { user: { id: "test-user", email: "test@example.com" } }, // Fake authenticated user
        }).as("getCurrentUser");

        cy.visit("http://localhost:5173/directions", { timeout: 20000 });
        
    
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
        
        cy.intercept("GET", "/api/maps/directions?source=45y54324rfvd&destination=4556rdfghytrx&travelMode=driving", {
            statusCode: 200,
            body: [
            
                    {
                        
                        duration: 10,
                        distance: 5,
                        steps: [
                            { instruction: "Step 1", distance: 1 },
                            { instruction: "Step 2", distance: 2 },
                        ],
                    },
                    {
                        
                        duration: 15,
                        distance: 10,
                        steps: [
                            { instruction: "Step 1", distance: 1 },
                            { instruction: "Step 2", distance: 2 },
                        ],
                    },
                
            ]
        }).as("getDirections");

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



});