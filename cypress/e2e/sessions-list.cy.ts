describe('Sessions list', () => {
  const sessions = [
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
    {
      id: 2,
      name: 'Power Yoga',
      date: '2025-01-20T00:00:00.000Z',
      teacher_id: 2,
      description: 'A stronger practice.',
      users: [],
      createdAt: '2025-01-02T00:00:00.000Z',
      updatedAt: '2025-01-11T00:00:00.000Z',
    },
  ];

  it('Admin: lists sessions and shows Create button', () => {
    // uiLoginAsAdmin() already intercepts + waits for GET /api/session
    cy.uiLoginAsAdmin(sessions);

    cy.location('pathname').should('eq', '/sessions');
    cy.contains(/morning flow/i).should('be.visible');
    cy.contains(/power yoga/i).should('be.visible');
    cy.contains(/create/i).should('be.visible');
  });

  it('User: lists sessions and does NOT show Create button', () => {
    // uiLoginAsUser() already intercepts + waits for GET /api/session
    cy.uiLoginAsUser(sessions);

    cy.location('pathname').should('eq', '/sessions');
    cy.contains(/morning flow/i).should('be.visible');
    cy.contains(/power yoga/i).should('be.visible');
    cy.contains(/create/i).should('not.exist');
  });
});