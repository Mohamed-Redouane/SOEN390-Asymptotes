

describe('Directions Page', () => {
    beforeEach(() => {
        cy.intercept("GET", "/api/auth/me", {
            statusCode: 200,
            body: { user: { id: "test-user", email: "test@example.com" } }, // Fake authenticated user
        }).as("getCurrentUser");

        cy.visit("http://localhost:5173/directions", { timeout: 20000 });
        cy.wait(2000); // Ensure app is fully loaded before waiting
        cy.wait("@getCurrentUser", { timeout: 20000 }).then((interception) => {
            console.log("Intercepted request:", interception);
        });


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
        cy.get('#start-input').type('1234');
        cy.get('#start-input').should('have.value', '1234');
    });

    it("the directions page has a working input field for destination location", () => {
        cy.get('#end-input').should("exist");
        cy.get('#end-input').type('1234');
        cy.get('#end-input').should('have.value', '1234');
    });

    it(" the directions page should show suggestions when typing in the source location input field", () => {
        cy.get('#start-input').type('1234');
        cy.get('#suggestions-container').should("exist");
        cy.get('#suggestions-container').children().should('have.length', 5);
        cy.get('#suggestion-item-container').should('exist');
    });

    it(" the directions page should show suggestions when typing in the destination location input field", () => {
        cy.get('#end-input').type('1234');
        cy.get('#suggestions-container').should("exist");
        cy.get('#suggestions-container').children().should('have.length', 5);
        cy.get('#suggestion-item-container').should('exist');
    });

    it("the directions page should display route options when the user requests ", () => {
        //type source and destination location and submit request
        cy.get('#start-input').type('1234');
        cy.get('#suggestions-container').children().first().click();

        cy.get('#end-input').type('5678');
        cy.get('#suggestions-container').children().first().click();

        cy.get('#get-directions-button').click();

        //check if route options are displayed
        cy.get('#routes-display').should('exist');
        cy.get('#routes-display').children().should("have.length.at.least", 1);
    });

    it("the routes options and the autocomplete suggestions should not be displayed at the same time", () => {
        //type source and destination location and submit request
        cy.get('#start-input').type('1234');
        cy.get('#suggestions-container').children().first().click();

        cy.get('#end-input').type('5678');
        cy.get('#suggestions-container').children().first().click();

        cy.get('#get-directions-button').click();

        //check if route options are displayed
        cy.get('#routes-display').should('exist');
        cy.get('#routes-display').children().should("have.length.at.least", 1);

        //check if suggestions are not displayed
        cy.get('#suggestions-container').should("be.hidden");
    });


});