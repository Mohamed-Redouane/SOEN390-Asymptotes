
describe("MapComponent", () => {
    it("The Google Maps API is loaded", () => {
        // Changed the URL to the remote server
        cy.visit("http://localhost:5173/")
        // The map component should exist
        cy.get('[data-testid="map"]').should("exist")
        // Check if the Google Maps API is loaded
        cy.window().should("have.property", "google")

})
})

