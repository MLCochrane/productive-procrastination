describe('Card', () => {
  beforeEach(() => {
    cy.visit('localhost:8080/fluid/');
  });

  it('display and opens and closes properly', () => {
    cy.get('.card__content').should('be.visible');
    cy.get('.card__toggle').should('have.class', 'isactive').click();
    cy.get('.card__content').should('not.be.visible');
    cy.get('.card__toggle').should('not.have.class', 'isactive').click();
    cy.get('.card__content').should('be.visible');
  });
});
