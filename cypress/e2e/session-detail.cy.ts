describe('Session detail screen', () => {
  const teacher = { id: 1, firstName: 'Ben', lastName: 'Test', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-02T00:00:00.000Z' };

  const baseSession = {
    id: 1,
    name: 'Yoga test session',
    date: '2025-01-15T00:00:00.000Z',
    teacher_id: 1,
    description: 'a yoga test.',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
  };

  it('Admin: shows Delete button and deletes the session', () => {
    cy.uiLoginAsAdmin([]);

    cy.intercept('GET', '/api/session/1', {
      statusCode: 200,
      body: { ...baseSession, users: [2] },
    }).as('detail');

    cy.intercept('GET', '/api/teacher/1', { statusCode: 200, body: teacher }).as('teacher');

    cy.intercept('DELETE', '/api/session/1', { statusCode: 200 }).as('delete');
    cy.intercept('GET', '/api/session', { statusCode: 200, body: [] }).as('sessionsAfterDelete');

    cy.visit('/sessions/detail/1');
    cy.wait('@detail');
    cy.wait('@teacher');

    cy.contains('h1', /Yoga test session/i).should('be.visible');
    cy.contains('Delete').should('be.visible').click();

    cy.wait('@delete');
    cy.wait('@sessionsAfterDelete');
    cy.url().should('include', '/sessions');
    cy.contains('Session deleted !').should('be.visible');
  });

  it('User: can participate and un-participate (buttons toggle)', () => {
    // user id = 2 in the custom command.
    cy.uiLoginAsUser([]);

    let detailCalls = 0;
    cy.intercept('GET', '/api/session/1', () => {
      detailCalls += 1;
      if (detailCalls === 1) {
        return { statusCode: 200, body: { ...baseSession, users: [] } };
      }
      if (detailCalls === 2) {
        return { statusCode: 200, body: { ...baseSession, users: [2] } };
      }
      return { statusCode: 200, body: { ...baseSession, users: [] } };
    }).as('detail');

    cy.intercept('GET', '/api/teacher/1', { statusCode: 200, body: teacher }).as('teacher');

    cy.intercept('POST', '/api/session/1/participate/2', { statusCode: 200 }).as('participate');
    cy.intercept('DELETE', '/api/session/1/participate/2', { statusCode: 200 }).as('unparticipate');

    cy.visit('/sessions/detail/1');
    cy.wait('@detail');
    cy.wait('@teacher');

    cy.contains('Delete').should('not.exist');
    cy.contains('button', 'Participate').should('be.visible').click();
    cy.wait('@participate');
    cy.wait('@detail');
    cy.contains('button', 'Do not participate').should('be.visible');

    cy.contains('button', 'Do not participate').click();
    cy.wait('@unparticipate');
    cy.wait('@detail');
    cy.contains('button', 'Participate').should('be.visible');
  });
});
