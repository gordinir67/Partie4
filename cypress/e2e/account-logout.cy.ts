describe('Account screen & Logout', () => {
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

  it('Account: displays admin info (no delete section)', () => {
    cy.uiLoginAsAdmin([]);

    cy.intercept('GET', '**/api/user/**', {
      statusCode: 200,
      body: {
        id: 1,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@studio.com',
        admin: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      },
    }).as('user');

    // IMPORTANT: no cy.visit('/me') (would reset in-memory session)
    spaGo('/me');

    // Ensure we are on /me (not redirected to /login)
    cy.location('pathname').should('eq', '/me');

    // Don't rely on exact tag (h1) – be flexible
    cy.contains(/user information/i).should('be.visible');
    cy.contains(/name:\s*admin\s*user/i).should('be.visible');
    cy.contains(/you are admin/i).should('be.visible');
    cy.contains(/delete my account/i).should('not.exist');
  });

  it('Account: non-admin can delete their account and is logged out', () => {
    cy.uiLoginAsUser([]);

    cy.intercept('GET', '**/api/user/**', {
      statusCode: 200,
      body: {
        id: 2,
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@studio.com',
        admin: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      },
    }).as('user');

    cy.intercept('DELETE', '**/api/user/**', { statusCode: 200 }).as('deleteUser');

    // IMPORTANT: no cy.visit('/me')
    spaGo('/me');
    cy.location('pathname').should('eq', '/me');

    cy.contains(/delete my account/i).should('be.visible');
    cy.contains('button', /delete/i).click();

    cy.wait('@deleteUser');

    // App redirects to /login after deletion
    cy.location('pathname').should('eq', '/login');
    cy.contains(/your account has been deleted/i).should('be.visible');

    cy.contains('a', 'Login').should('be.visible');
    cy.contains('a', 'Register').should('be.visible');
    cy.contains(/logout/i).should('not.exist');
  });

  it('Logout: returns to /login and hides authenticated navigation', () => {
    cy.uiLoginAsUser([]);

    cy.contains('span.link', 'Logout').click();
    cy.location('pathname').should('eq', '/login');

    cy.contains('span.link', 'Sessions').should('not.exist');
    cy.contains('span.link', 'Account').should('not.exist');
    cy.contains('span.link', 'Logout').should('not.exist');

    cy.contains('a', 'Login').should('be.visible');
    cy.contains('a', 'Register').should('be.visible');
  });
});