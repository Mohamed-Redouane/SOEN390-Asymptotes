describe("Indoor directions", () => {
    beforeEach(() => {
        cy.intercept("GET", "/api/auth/me", {
            statusCode: 200,
            body: { user: { id: "test-user", email: "test@example.com" } }, // Fake authenticated user
        }).as("getCurrentUser");

        cy.visit("http://localhost:5173/indoordirections");
    });

    // Just testing that the Mappedin API is present
    it("The Mappedin API is present", () => {
        cy.wait("@getCurrentUser"); // Wait for mock authentication request
        cy.get('[data-testid="mappedin-map"]').should("exist"); //The page should have the mappedin map
    });
});


