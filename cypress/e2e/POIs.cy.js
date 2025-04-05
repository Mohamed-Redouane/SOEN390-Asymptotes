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
      cy.get("button").contains("Explore").click();
  
      cy.get("#modal-title").should("be.visible");
  
      cy.get("#poimodal-overlay").click({ force: true });
  
      cy.get("#modal-title").should("not.exist");
    });

it("should change the radius and POI type", () => {
    cy.get('button').contains('Explore').click();
    cy.get('#radius').select('500 meters');
    cy.get('#radius').should('have.value', '500');
    cy.get('#poiType').select('Library');
    cy.get('#poiType').should('have.value', 'library');
});

it("should toggle the visibility of POIs", () => {

  cy.get("button").contains("Explore").click();
  
  cy.get("button")
    .contains("Show Points of Interest")
    .should("be.visible")
    .as("toggleButton");

  cy.get("@toggleButton").click();

  cy.get("#modal-title").should("not.exist");

  cy.get("button").contains("Explore").click();

  cy.get("button")
    .contains("Hide Points of Interest")
    .should("be.visible")
    .as("toggleButton");

  cy.get("@toggleButton").click();

  cy.get("#modal-title").should("not.exist");

  cy.get("button").contains("Explore").click();

  cy.get("button").contains("Show Points of Interest").should("be.visible");
});

});