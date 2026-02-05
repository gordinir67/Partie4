/// <reference types="cypress" />

type LoginUser = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  token: string;
  type: string;
};

declare global {
  namespace Cypress {
    interface Chainable {
      uiLogin(user: LoginUser, sessions?: unknown[]): Chainable<void>;
      uiLoginAsAdmin(sessions?: unknown[]): Chainable<void>;
      uiLoginAsUser(sessions?: unknown[]): Chainable<void>;
    }
  }
}

const DEFAULT_ADMIN: LoginUser = {
  id: 1,
  username: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  admin: true,
  token: 'fake-jwt-admin',
  type: 'Bearer',
};

const DEFAULT_USER: LoginUser = {
  id: 2,
  username: 'user',
  firstName: 'Regular',
  lastName: 'User',
  admin: false,
  token: 'fake-jwt-user',
  type: 'Bearer',
};

const DEFAULT_SESSIONS = [
  {
    id: 1,
    name: 'Morning Flow',
    date: '2025-01-15T00:00:00.000Z',
    teacher_id: 1,
    description: 'A gentle morning yoga flow.',
    users: [2],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
  },
];

Cypress.Commands.add('uiLogin', (user: LoginUser, sessions = DEFAULT_SESSIONS) => {
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: user,
  }).as('login');

  // Intercept list sessions (this call happens right after login redirect)
  cy.intercept('GET', '**/api/session*', {
    statusCode: 200,
    body: sessions,
  }).as('getSessions');

  cy.visit('/login');
  cy.get('input[formControlName=email]').type('yoga@studio.com');
  cy.get('input[formControlName=password]').type('test!1234');
  cy.get('button[type=submit]').click();

  cy.wait('@login');
  cy.wait('@getSessions');

  cy.location('pathname').should('eq', '/sessions');
});

Cypress.Commands.add('uiLoginAsAdmin', (sessions = DEFAULT_SESSIONS) => {
  cy.uiLogin(DEFAULT_ADMIN, sessions);
});

Cypress.Commands.add('uiLoginAsUser', (sessions = DEFAULT_SESSIONS) => {
  cy.uiLogin(DEFAULT_USER, sessions);
});

export {};