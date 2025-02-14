describe("Bottom Navigation Bar", () => {
    beforeEach(() => {
        cy.intercept("GET", "/api/auth/me", {
            statusCode: 200,
            body: { user: { id: "test-user", email: "test@example.com" } }, // Fake authenticated user
        }).as("getCurrentUser");

        cy.visit("http://localhost:5173/");
        cy.wait("@getCurrentUser");
    });

    it("The bottom navigation bar should exist and be visible", () => {
        cy.get("nav").should("exist").should("be.visible");
    });

    it("The bottom navigation bar should have at least 4 main buttons", () => {
        cy.get("nav").find("button").should("have.length.at.least", 4);
    });


    it("The map button label should change based on the current path", () => {
        cy.visit("http://localhost:5173/");
        cy.get("nav").find("button").contains("Map: SGW").should("exist");

        cy.visit("http://localhost:5173/LOYcampus");
        cy.get("nav").find("button").contains("Map: Loyola").should("exist");

        cy.visit("http://localhost:5173/directions");
        cy.get("nav").find("button").contains("Map").should("exist");
    });

    
    it("Each navigation button should navigate correctly", () => {
        const navItems = [
            { label: "Shuttle", path: "/shuttle" },
            { label: "Map", path: "/" },
            { label: "Directions", path: "/directions" },
            { label: "Schedule", path: "/schedule" },
        ];

        navItems.forEach(({ label, path }) => {
            cy.get("nav").find("button").contains(label).click();
            cy.url().should("include", path);
        });
    });
});
