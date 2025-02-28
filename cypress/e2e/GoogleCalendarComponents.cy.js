describe("Calendar Page", () => {
    beforeEach(() => {
        cy.intercept("GET", "/api/auth/me", {
            statusCode: 200,
            body: { user: { id: "test-user", email: "test@example.com" } }, // Fake authenticated user
        }).as("getCurrentUser");

        cy.visit("http://localhost:5173/schedule");

        
    });

    // go to schedule page 
    it("should navigate to the schedule page", () => {
        cy.get('button').contains('Schedule').click();
        cy.url().should('include', '/schedule');
    });
    //<div><button class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-colorPrimary MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-colorPrimary css-74d805-MuiButtonBase-root-MuiButton-root" tabindex="0" type="button">Sign In with Google<span class="MuiTouchRipple-root css-r3djoj-MuiTouchRipple-root"></span></button></div>
    // should have a button Called 'Sign In with Google'
    it("should have a button called 'Sign In with Google'", () => {
        cy.get('button').contains('Sign In with Google');
    });
    //clicking the button makes a request to the google auth endpoint
    it("clicking the button makes a request to the google auth endpoint", () => {
        cy.get('button').contains('Sign In with Google').click();
        cy.wait('@getCurrentUser').its('request.url').should('include', '/api/auth/me');
    });
    //simulate a successful login
    
    
    //<label for="calendar-select" class="block text-lg font-semibold text-gray-700 mb-2">Select a Calendar:</label>
    

    
});