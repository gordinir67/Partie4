describe('Session create/update screens', () => {
  const spaGo = (path: string) => {
    cy.window().then((win) => {
      win.history.pushState({}, '', path);
      win.dispatchEvent(new PopStateEvent('popstate'));
    });
  };

  const teachers = [
    {
      id: 1,
      firstName: 'Ben',
      lastName: 'Test',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
    {
      id: 2,
      firstName: 'johanna',
      lastName: 'Noname',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
  ];

  it('Create: Save disabled until all fields are filled', () => {
    cy.uiLoginAsAdmin([]);

    cy.intercept('GET', '**/api/teacher*', {
      statusCode: 200,
      body: teachers,
    }).as('teachers');

    // Navigate SPA (no reload)
    spaGo('/sessions/create');
    cy.location('pathname').should('eq', '/sessions/create');

    cy.wait('@teachers');

    cy.get('input[formControlName=name]').should('be.visible');
    cy.contains('button', 'Save').should('be.disabled');
  });

  it('Create: creates a session and returns to /sessions', () => {
    cy.uiLoginAsAdmin([]);

    cy.intercept('GET', '**/api/teacher*', {
      statusCode: 200,
      body: teachers,
    }).as('teachers');

    cy.intercept('POST', '**/api/session*', (req) => {
      expect(req.body).to.have.property('name', 'New Session');
      expect(req.body).to.have.property('teacher_id', 2);
      expect(req.body).to.have.property('description', 'A brand new session.');
      expect(req.body).to.have.property('date', '2026-02-01');

      req.reply({
        statusCode: 200,
        body: {
          id: 99,
          ...req.body,
          users: [],
          createdAt: '2026-02-01T00:00:00.000Z',
          updatedAt: '2026-02-01T00:00:00.000Z',
        },
      });
    }).as('create');

    cy.intercept('GET', '**/api/session*', {
      statusCode: 200,
      body: [],
    }).as('sessionsAfterCreate');

    spaGo('/sessions/create');
    cy.location('pathname').should('eq', '/sessions/create');

    cy.wait('@teachers');

    cy.get('input[formControlName=name]').clear().type('New Session');
    cy.get('input[formControlName=date]').clear().type('2026-02-01');

    cy.get('mat-select[formControlName=teacher_id]').click();
    cy.contains('mat-option', /johanna\s+noname/i).click();

    cy.get('textarea[formControlName=description]').clear().type('A brand new session.');

    cy.contains('button', 'Save').should('not.be.disabled').click();

    cy.wait('@create');
    cy.wait('@sessionsAfterCreate');

    cy.location('pathname').should('eq', '/sessions');
    cy.contains(/session created/i).should('be.visible');
  });

  it('Update: updates a session and returns to /sessions', () => {
    cy.uiLoginAsAdmin([]);

    const existing = {
      id: 1,
      name: 'Yoga test session',
      date: '2025-01-15T00:00:00.000Z',
      teacher_id: 1,
      description: 'a yoga test.',
      users: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-10T00:00:00.000Z',
    };

    cy.intercept('GET', '**/api/teacher*', {
      statusCode: 200,
      body: teachers,
    }).as('teachers');

    cy.intercept('GET', '**/api/session/1*', {
      statusCode: 200,
      body: existing,
    }).as('detail');

    cy.intercept('PUT', '**/api/session/1*', (req) => {
      expect(req.body).to.have.property('name', 'Updated Name');
      expect(req.body).to.have.property('teacher_id', 1);
      expect(req.body).to.have.property('description', 'Updated description');
      expect(req.body).to.have.property('date', '2026-01-31');

      req.reply({
        statusCode: 200,
        body: { ...existing, ...req.body, updatedAt: '2026-01-31T00:00:00.000Z' },
      });
    }).as('update');

    cy.intercept('GET', '**/api/session*', {
      statusCode: 200,
      body: [],
    }).as('sessionsAfterUpdate');

    spaGo('/sessions/update/1');
    cy.location('pathname').should('eq', '/sessions/update/1');

    cy.wait('@teachers');
    cy.wait('@detail');

    cy.get('input[formControlName=name]').should('be.visible');

    cy.get('input[formControlName=name]').clear().type('Updated Name');
    cy.get('input[formControlName=date]').clear().type('2026-01-31');
    cy.get('textarea[formControlName=description]').clear().type('Updated description');

    cy.contains('button', 'Save').click();

    cy.wait('@update');
    cy.wait('@sessionsAfterUpdate');

    cy.location('pathname').should('eq', '/sessions');
    cy.contains(/session updated/i).should('be.visible');
  });
});