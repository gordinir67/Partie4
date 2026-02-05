describe('Sessions list screen', () => {
  const sessions = [
    {
      id: 1,
      name: 'Yoga test session',
      date: '2025-01-15T00:00:00.000Z',
      teacher_id: 1,
      description: 'a yoga test.',
      users: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-10T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Yoga test session2',
      date: '2025-02-10T00:00:00.000Z',
      teacher_id: 2,
      description: 'a yoga test2.',
      users: [],
      createdAt: '2025-01-02T00:00:00.000Z',
      updatedAt: '2025-01-11T00:00:00.000Z',
    },
  ];

  it('As admin: shows Create + Edit + Detail buttons', () => {
    cy.uiLoginAsAdmin(sessions);

    cy.contains('Rentals available').should('be.visible');
    cy.contains('button', 'Create').should('be.visible');

    cy.contains('mat-card.item', 'Morning Flow').within(() => {
      cy.contains('button', 'Detail').should('be.visible');
      cy.contains('button', 'Edit').should('be.visible');
    });
  });

  it('As user: hides Create + Edit, but keeps Detail', () => {
    cy.uiLoginAsUser(sessions);

    cy.contains('button', 'Create').should('not.exist');

    cy.contains('mat-card.item', 'Morning Flow').within(() => {
      cy.contains('button', 'Detail').should('be.visible');
      cy.contains('button', 'Edit').should('not.exist');
    });
  });
});
