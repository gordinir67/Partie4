describe('Auth screens (Login & Register)', () => {
  it('Login: success redirects to /sessions', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        admin: true,
      },
    }).as('login');

    cy.intercept('GET', '/api/session', { statusCode: 200, body: [] }).as('sessions');

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
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Unauthorized' },
    }).as('login');

    cy.visit('/login');
    cy.get('input[formControlName=email]').type('wrong@studio.com');
    cy.get('input[formControlName=password]').type('wrong');
    cy.get('button[type=submit]').click();

    cy.wait('@login');
    cy.get('p.error').should('contain.text', 'An error occurred');
    cy.url().should('include', '/login');
  });

  it('Register: submit disabled until all required fields are filled', () => {
    cy.visit('/register');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=firstName]').type('Jane');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=email]').type('jane.doe@studio.com');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').should('not.be.disabled');
  });

  it('Register: success calls API and redirects to /login', () => {
    cy.intercept('POST', '/api/auth/register', { statusCode: 200 }).as('register');

    cy.visit('/register');
    cy.get('input[formControlName=firstName]').type('Jane');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('jane.doe@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    cy.wait('@register');
    cy.url().should('include', '/login');
  });

  it('Register: shows error when API returns an error', () => {
    cy.intercept('POST', '/api/auth/register', { statusCode: 409, body: { message: 'Conflict' } }).as('register');

    cy.visit('/register');
    cy.get('input[formControlName=firstName]').type('Jane');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('jane.doe@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    cy.wait('@register');
    cy.get('span.error').should('contain.text', 'An error occurred');
    cy.url().should('include', '/register');
  });
});
