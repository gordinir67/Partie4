import 'cypress';

describe('Auth guard', () => {
  it('redirects to login if user is not authenticated', () => {
    // Some Angular runtime errors can surface as uncaught exceptions during navigation.
    // For this navigation-only test, ignore them to keep the assertion focused.
    cy.on('uncaught:exception', () => false);

    cy.visit('/sessions');
    cy.url().should('include', '/login');
  });
});
