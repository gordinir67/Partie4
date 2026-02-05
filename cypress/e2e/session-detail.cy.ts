describe('Session detail screen', () => {
  const spaGo = (path: string) => {
    cy.window().then((win) => {
      win.history.pushState({}, '', path);
      win.dispatchEvent(new PopStateEvent('popstate'));
    });
  };

  const teacher = {
    id: 1,
    firstName: 'Ben',
    lastName: 'Test',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  };

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

    // Match /api/session/1 OR /api/sessions/1 (and absolute URLs too)
    cy.intercept('GET', '**/api/session/1*', {
      statusCode: 200,
      body: { ...baseSession, users: [2] },
    }).as('detail');
    cy.intercept('GET', '**/api/sessions/1*', {
      statusCode: 200,
      body: { ...baseSession, users: [2] },
    });

    // Match teacher endpoint singular/plural too
    cy.intercept('GET', '**/api/teacher/1*', { statusCode: 200, body: teacher }).as('teacher');
    cy.intercept('GET', '**/api/teachers/1*', { statusCode: 200, body: teacher });

    cy.intercept('DELETE', '**/api/session/1*', { statusCode: 200 }).as('delete');
    cy.intercept('DELETE', '**/api/sessions/1*', { statusCode: 200 });

    cy.intercept('GET', '**/api/session*', { statusCode: 200, body: [] }).as('sessionsAfterDelete');
    cy.intercept('GET', '**/api/sessions*', { statusCode: 200, body: [] });

    spaGo('/sessions/detail/1');
    cy.location('pathname').should('eq', '/sessions/detail/1');

    cy.wait('@detail');
    cy.wait('@teacher');

    cy.contains(/yoga test session/i).should('be.visible');
    cy.contains('Delete').should('be.visible').click();

    cy.wait('@delete');
    cy.wait('@sessionsAfterDelete');

    cy.location('pathname').should('eq', '/sessions');
    cy.contains(/session deleted/i).should('be.visible');
  });

  it('User: can participate and un-participate', () => {
    cy.uiLoginAsUser([]);

    let calls = 0;

    const replyDetail = () => {
      calls++;
      if (calls === 1) return { ...baseSession, users: [] };
      if (calls === 2) return { ...baseSession, users: [2] };
      return { ...baseSession, users: [] };
    };

    cy.intercept('GET', '**/api/session/1*', (req) => req.reply({ statusCode: 200, body: replyDetail() })).as('detail');
    cy.intercept('GET', '**/api/sessions/1*', (req) => req.reply({ statusCode: 200, body: replyDetail() }));

    cy.intercept('GET', '**/api/teacher/1*', { statusCode: 200, body: teacher }).as('teacher');
    cy.intercept('GET', '**/api/teachers/1*', { statusCode: 200, body: teacher });

    // Participate endpoints can vary too → cover both
    cy.intercept('POST', '**/api/session/1/participate/2*', { statusCode: 200 }).as('participate');
    cy.intercept('POST', '**/api/sessions/1/participate/2*', { statusCode: 200 });

    cy.intercept('DELETE', '**/api/session/1/participate/2*', { statusCode: 200 }).as('unparticipate');
    cy.intercept('DELETE', '**/api/sessions/1/participate/2*', { statusCode: 200 });

    spaGo('/sessions/detail/1');
    cy.location('pathname').should('eq', '/sessions/detail/1');

    cy.wait('@detail');
    cy.wait('@teacher');

    cy.contains('Delete').should('not.exist');

    cy.contains('button', 'Participate').click();
    cy.wait('@participate');
    cy.wait('@detail');
    cy.contains('button', 'Do not participate').should('be.visible');

    cy.contains('button', 'Do not participate').click();
    cy.wait('@unparticipate');
    cy.wait('@detail');
    cy.contains('button', 'Participate').should('be.visible');
  });
});