describe('Access control (admin vs user)', () => {
  /**
   * Navigate inside the SPA without full reload.
   * This is required because SessionService is in-memory only (no persistence),
   * and cy.visit() would reset the session state => AuthGuard redirects to /login.
   */
  const spaGo = (path: string) => {
    cy.window().then((win) => {
      win.history.pushState({}, '', path);
      win.dispatchEvent(new PopStateEvent('popstate'));
    });
  };

  it('Non-admin is redirected away from /sessions/create', () => {
    cy.uiLoginAsUser([]);

    // Navigate without reload
    spaGo('/sessions/create');

    // FormComponent redirects non-admin users to /sessions
    cy.location('pathname').should('eq', '/sessions');

    // Optional: ensure the create form is not displayed
    cy.get('input[formControlName=name]').should('not.exist');
  });

  it('Non-admin is redirected away from /sessions/update/:id', () => {
    cy.uiLoginAsUser([]);

    // Navigate without reload
    spaGo('/sessions/update/1');

    cy.location('pathname').should('eq', '/sessions');

    // Optional: ensure the update form is not displayed
    cy.get('input[formControlName=name]').should('not.exist');
  });
});
