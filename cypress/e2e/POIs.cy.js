    describe("CampusMap POI Feature", () => {
        beforeEach(() => {
          
          cy.intercept("GET", "/api/auth/me", {
            statusCode: 200,
            body: { user: { id: "test-user", email: "test@example.com" } }, 
          }).as("getCurrentUser");
      
          cy.visit("/map"); 
          cy.wait("@getCurrentUser");
        });

    it("should open and close the modal", () => {
        cy.get('button').contains('Explore').click();
        cy.get('#poimodal-content').should('be.visible');
        cy.get('#poimodal-overlay').click({ force: true });
        cy.get('#poimodal-content').should('not.exist');
    });

    it("should change the radius and POI type", () => {
        cy.get('button').contains('Explore').click();
        cy.get('#radius').select('500 meters');
        cy.get('#radius').should('have.value', '500');
        cy.get('#poiType').select('Library');
        cy.get('#poiType').should('have.value', 'library');
    });

    it("should toggle the visibility of POIs", () => {
        cy.get('button').contains('Explore').click();
        cy.get('button').contains('Show POIs').click();
        cy.get('button').contains('Hide POIs').should('exist');
        cy.get('button').contains('Hide POIs').click();
        cy.get('button').contains('Show POIs').should('exist');
    });

});