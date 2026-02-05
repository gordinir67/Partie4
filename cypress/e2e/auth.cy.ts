describe('Auth screens (Login & Register)', () => {
  it('Login: success redirects to /sessions', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        admin: true,
      },
    }).as('login');

    cy.intercept('GET', '**/api/session*', { statusCode: 200, body: [] }).as('sessions');

    cy.visit('/login');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').should('not.be.disabled').click();

    cy.wait('@login');
    cy.wait('@sessions');
    cy.url().should('include', '/sessions');
  });

  it('Login: shows error on bad credentials', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'Unauthorized' },
    }).as('login');

    cy.visit('/login');
    cy.get('input[formControlName=email]').type('wrong@studio.com');
    cy.get('input[formControlName=password]').type('wrongpassword');
    cy.get('button[type=submit]').click();

    cy.wait('@login');
    cy.contains('An error occurred').should('be.visible');
  });

  it('Register: success navigates to /login', () => {
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 200,
      body: { message: 'Registered' },
    }).as('register');

    cy.visit('/register');

    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('john@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    cy.wait('@register');
    cy.url().should('include', '/login');
  });

  it('Register: shows error on server error', () => {
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 500,
      body: { message: 'Server error' },
    }).as('register');

    cy.visit('/register');

    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('john@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    cy.wait('@register');
    cy.contains('An error occurred').should('be.visible');
  });
});