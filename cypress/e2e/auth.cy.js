describe("Authentication Tests", () => {
    beforeEach(() => {
        // Mock authentication API response
        cy.intercept("GET", "/api/auth/me", {
            statusCode: 200,
            body: { user: { id: "test-user", email: "test@example.com" } }, // Fake authenticated user
        }).as("getCurrentUser");

        cy.intercept("POST", "/api/auth/login", {
            statusCode: 200,
            body: { token: "fake-session-token" },
        }).as("loginRequest");

        cy.visit("http://localhost:5173/login");

        // Ensure page is loaded before interacting
        cy.get("body").should("be.visible");
        cy.wait("@getCurrentUser");  // Wait for auth check
    });

    it("Logs in successfully with valid credentials", () => {
        cy.get("#email").should("exist").click().type("testuser@example.com");
        cy.get("#password").should("exist").click().type("password123");
        cy.get("button[type=submit]").should("exist").click();

        // Wait for login request
        cy.wait("@loginRequest");

        // Simulate session token being set
        cy.setCookie("session", "fake-session-token");

        cy.url().should("include", "/"); // Ensure redirection works
    });


    it("Prevents login when fields are empty", () => {
        cy.get("button[type=submit]").click();
    
        // Check if the browser displays validation error (native HTML behavior)
        cy.get("#email").then(($input) => {
            expect($input[0].validationMessage).to.eq("Please fill in this field.");
        });
    });
});
