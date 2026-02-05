describe('Authentication - error handling', () => {
  it('Login shows an error message on 401', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'Unauthorized' },
    }).as('login');

    cy.visit('/login');

    cy.get('input[formControlName=email]').type('wrong@studio.com');
    cy.get('input[formControlName=password]').type('wrongpassword');
    cy.get('button[type=submit]').click();

    cy.wait('@login');
    cy.contains(/an error occurred/i).should('be.visible');
  });

  it('Register shows an error message on 500', () => {
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
    cy.contains(/an error occurred/i).should('be.visible');
  });
});