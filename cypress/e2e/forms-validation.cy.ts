describe('Forms - validation', () => {
  it('Login: submit is disabled until fields are filled', () => {
    cy.visit('/login');

    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').should('not.be.disabled');
  });

  it('Register: submit is disabled until all required fields are filled', () => {
    cy.visit('/register');

    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=firstName]').type('Jane');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=email]').type('jane@studio.com');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').should('not.be.disabled');
  });
});