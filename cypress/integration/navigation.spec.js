describe('Navigation', () => {
  before(() => {
    cy.visit('localhost:8080/');
  });

  it('opens and closes the menu', () => {
    cy.get('#MainNav').should('not.be.visible');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('#MainNav').should('be.visible');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('#MainNav').should('not.be.visible');
  });

  it('successfully navigates to each sketch and removes previous DOM', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').should('have.length', 7)
    .each(($li, index, $list) => {
      const link = $li.attr('href');
      const namespace = link.split('/')[1];

      let previous;
      cy.get('[data-barba="container"]').then($el => {
        // Checks not only that navigation works but barba correctly removing items from DOM
        previous = $el.attr('data-barba-namespace');

        cy.get(`[data-barba-namespace="${namespace}"]`).should('not.exist');
        cy.get($li).click();
        cy.get(`[data-barba-namespace="${namespace}"]`).should('exist');
        cy.url().should('eq', `http://localhost:8080${link}`);
        cy.get(`[data-barba-namespace="${previous}"]`).should('not.exist');
        cy.get('#ToggleNav').should('be.visible').click();
        cy.wait(300);

        // Returns home
        if (index === $list.length - 1) {
          cy.get(`[data-barba-namespace="home"]`).should('not.exist');
          cy.get('.brand__logo a').click();
          cy.get('[data-barba-namespace="home"]').should('exist');
          cy.url().should('eq', 'http://localhost:8080/');
          cy.get(`[data-barba-namespace="${previous}"]`).should('not.exist');
        }
      })
    })
  });
});