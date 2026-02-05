describe('Account screen & Logout', () => {
  it('Account: displays admin info (no delete section)', () => {
    cy.uiLoginAsAdmin([]);

    cy.intercept('GET', '/api/user/1', {
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

    cy.visit('/me');
    cy.wait('@user');

    cy.contains('h1', 'User information').should('be.visible');
    cy.contains('Name: Admin USER').should('be.visible');
    cy.contains('You are admin').should('be.visible');
    cy.contains('Delete my account:').should('not.exist');
  });

  it('Account: non-admin can delete their account and is logged out', () => {
    cy.uiLoginAsUser([]);

    cy.intercept('GET', '/api/user/2', {
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

    cy.intercept('DELETE', '/api/user/2', { statusCode: 200 }).as('deleteUser');

    cy.visit('/me');
    cy.wait('@user');

    cy.contains('Delete my account:').should('be.visible');
    // In the app, the delete action triggers DELETE /api/user/:id.
    // Use a permissive selector to avoid brittle wording/casing changes.
    cy.contains('button', /delete/i).click();

    cy.wait('@deleteUser');
    // The component navigates to '/' and the router redirects to '/login'.
    cy.url().should('include', '/login');
    cy.contains('Your account has been deleted !').should('be.visible');

    // Toolbar should show unauth links again.
    cy.contains('a', 'Login').should('be.visible');
    cy.contains('a', 'Register').should('be.visible');
    cy.contains('Logout').should('not.exist');
  });

  it('Logout: returns to /login and hides authenticated navigation', () => {
    cy.uiLoginAsUser([]);

    cy.contains('span.link', 'Logout').click();
    cy.url().should('include', '/login');

    cy.contains('span.link', 'Sessions').should('not.exist');
    cy.contains('span.link', 'Account').should('not.exist');
    cy.contains('span.link', 'Logout').should('not.exist');

    cy.contains('a', 'Login').should('be.visible');
    cy.contains('a', 'Register').should('be.visible');
  });
});
