describe('Sidebar', () => {
  beforeEach(() => {
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

  it('navigates to all the sketch links from sidebar', () => {
    cy.get('[data-barba-namespace="homepage"]').should('exist');
    cy.get('.header__list-link').each(($el, index) => {
      cy.get('#ToggleNav').should('be.visible').click();
      cy.wait(300);
      cy.get(`.header__list-item:nth-child(${index + 1}) .header__list-link`).click();
      cy.wait(300);
      cy.get('[data-barba-namespace="homepage"]').should('not.exist');
      cy.get('.brand__logo a').click();
      cy.wait(300);
      cy.get('[data-barba-namespace="homepage"]').should('exist');
    });
  });
});

describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('localhost:8080/');
  });

  it('navigates to sketches from homepage links', () => {
    cy.get('[data-barba-namespace="homepage"]').should('exist');
    cy.get('.landing__grid-item .grid-item__link').each(($el, index) => {
      cy.get(`.landing__grid-item:nth-child(${index + 1})`).click();
      cy.wait(300);
      cy.get('[data-barba-namespace="homepage"]').should('not.exist');
      cy.get('.brand__logo a').click();
      cy.wait(300);
      cy.get('[data-barba-namespace="homepage"]').should('exist');
    });
  });
});
