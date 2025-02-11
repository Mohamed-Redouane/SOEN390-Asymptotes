describe("Testing bottom navigation bar", () => {
    it("The bottom navigation bar should exist and be visible", () => {
        // Changed the URL to the remote server
        cy.visit("http://localhost:5173/")
        // The bottom navigation bar should exist
        cy.get("div#bottomNavBar").should("exist").should("be.visible")
    })

    it("The bottom navigation bar should have 4 buttons", () => {
        // Changed the URL to the remote server
        cy.visit("http://localhost:5173/")
        // The bottom navigation bar should have 3 buttons
        cy.get("div#bottomNavBar").find("button").should("have.length", 4)
    })

    it("The map button of the navbar should display a menu at all paths", () => {
        // Changed the URL to the remote server
        cy.visit("http://localhost:5173/")
        // The bottom navigation bar should have a home button
        cy.get("div#bottomNavBar").find("button").contains("Map").should("exist")
        cy.get("div#bottomNavBar").find("button").contains("Map").click()
        cy.get("div#bottomNavBar").contains("SGW").should("exist")
        cy.get("div#bottomNavBar").contains("Loyola").should("exist")

        cy.visit("http://localhost:5173/directions")
        cy.get("div#bottomNavBar").find("button").contains("Map").should("exist")
        cy.get("div#bottomNavBar").find("button").contains("Map").click()
        cy.get("div#bottomNavBar").contains("SGW").should("exist")
        cy.get("div#bottomNavBar").contains("Loyola").should("exist")

        cy.visit("http://localhost:5173/shuttle")
        cy.get("div#bottomNavBar").find("button").contains("Map").should("exist")
        cy.get("div#bottomNavBar").find("button").contains("Map").click()
        cy.get("div#bottomNavBar").contains("SGW").should("exist")
        cy.get("div#bottomNavBar").contains("Loyola").should("exist")

        cy.visit("http://localhost:5173/schedule")
        cy.get("div#bottomNavBar").find("button").contains("Map").should("exist")
        cy.get("div#bottomNavBar").find("button").contains("Map").click()
        cy.get("div#bottomNavBar").contains("SGW").should("exist")
        cy.get("div#bottomNavBar").contains("Loyola").should("exist")



    });

    it("map menu appropriately handles navigation", () => {
        cy.visit("http://localhost:5173/directions")
        cy.get("div#bottomNavBar").find("button").contains("Map").should("exist")
        cy.get("div#bottomNavBar").find("button").contains("Map").click()
        cy.get("div#bottomNavBar").contains("SGW Campus").click()
        cy.get("div#bottomNavBar").contains("Map: SGW").click()
    });
});