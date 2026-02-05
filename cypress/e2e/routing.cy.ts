describe('Routing', () => {
  it('shows Not Found page on unknown route', () => {
    cy.visit('/this-route-does-not-exist');
    cy.contains(/not found/i).should('be.visible');
  });
});