describe('Unauth guard', () => {
  const spaGo = (path: string) => {
    cy.window().then((win) => {
      win.history.pushState({}, '', path);
      win.dispatchEvent(new PopStateEvent('popstate'));
    });
  };

  it('allows access to /login when user is not authenticated', () => {
    cy.visit('/login');
    cy.location('pathname').should('eq', '/login');
    cy.contains(/login/i).should('be.visible');
  });

  it('redirects away from /login when user is authenticated', () => {
    cy.uiLoginAsUser([]);

    // Navigate SPA to avoid losing the in-memory session
    spaGo('/login');

    // Guard should prevent authenticated user from staying on /login
    cy.location('pathname').should('not.eq', '/login');

    // In your current guard, it redirects to "/rentals" which doesn't exist -> Not Found page
    cy.contains(/not found/i).should('be.visible');
  });
});