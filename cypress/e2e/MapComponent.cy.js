
describe("MapComponent Testing", () => {
    it("The Google Maps API is loaded", () => {
        // Changed the URL to the remote server
        cy.visit("http://localhost:5173/map")
        
        // The map component should exist
        cy.get('[data-testid="map"]').should("exist")
        // Check if the Google Maps API is loaded
        cy.window().should("have.property", "google")
    })

    it("The map has default of 17 on load", () => {
        // The map component should exist
        cy.visit("http://localhost:5173/map")

        cy.get('#map-container').should("exist")
        cy.get('#map-container').invoke('attr', 'data-zoom').should('eq','17')
    })


    it("The map should keep zoom setting when changing campuses", () => {

        cy.visit("http://localhost:5173/map") 
        cy.get('#map-container').invoke('attr', 'data-zoom', '12')
        cy.get('div#bottomNavBar').contains('Map').click()
        cy.get('#loyola-campus-option').contains('Loyola Campus').click()

        cy.get('#map-container').should("exist")
        cy.get('#map-container').invoke('attr', 'data-zoom').should('eq','12')

    })

    it("The navbar component shoud show which campus is selected when on the map page", () => {
        cy.visit("http://localhost:5173/map")

        //get which location the map is set to
        
        
        
    })
})

