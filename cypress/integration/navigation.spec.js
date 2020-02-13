describe('Navigation', () => {
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

  it('navigates to and from fluid sim sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('[data-barba-namespace="homepage"]').should('exist');
    cy.get('[data-barba-namespace="fluid"]').should('not.exist');
    cy.get('.header__list-item a').contains('Fluid Sim').click();
    cy.get('[data-barba-namespace="fluid"]').should('exist');
    cy.get('[data-barba-namespace="homepage"]', {
      timeout: 20000,
    }).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Simple Waves').click();
    cy.get('[data-barba-namespace="fluid"]', {
      timeout: 20000,
    }).should('not.exist');
  });

  it('navigates to and from wave sim sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('[data-barba-namespace="homepage"]').should('exist');
    cy.get('[data-barba-namespace="wave-sim"]').should('not.exist');
    cy.get('.header__list-item a').contains('Simple Waves').click();
    cy.get('[data-barba-namespace="wave-sim"]').should('exist');
    cy.get('[data-barba-namespace="homepage"]', {
      timeout: 20000,
    }).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Light Glow').click();
    cy.get('[data-barba-namespace="wave-sim"]', {
      timeout: 20000,
    }).should('not.exist');
  });

  it('navigates to and from light glow sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('[data-barba-namespace="homepage"]').should('exist');
    cy.get('[data-barba-namespace="glow-process"]').should('not.exist');
    cy.get('.header__list-item a').contains('Light Glow').click();
    cy.get('[data-barba-namespace="glow-process"]').should('exist');
    cy.get('[data-barba-namespace="homepage"]', { timeout: 20000 }).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Toon Post Process').click();
    cy.get('[data-barba-namespace="glow-process"]', { timeout: 20000 }).should('not.exist');
  });

  it('navigates to and from post processing sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('[data-barba-namespace="homepage"]').should('exist');
    cy.get('[data-barba-namespace="post-process"]').should('not.exist');
    cy.get('.header__list-item a').contains('Toon Post Process').click();
    cy.get('[data-barba-namespace="post-process"]').should('exist');
    cy.get('[data-barba-namespace="homepage"]', { timeout: 20000 }).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Wave Hover').click();
    cy.get('[data-barba-namespace="post-process"]', { timeout: 20000 }).should('not.exist');
  });

  it('navigates to and from wave hover sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('[data-barba-namespace="homepage"]').should('exist');
    cy.get('[data-barba-namespace="wave-hover"]').should('not.exist');
    cy.get('.header__list-item a').contains('Wave Hover').click();
    cy.get('[data-barba-namespace="wave-hover"]').should('exist');
    cy.get('[data-barba-namespace="homepage"]', { timeout: 20000 }).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Scroll Loop').click();
    cy.get('[data-barba-namespace="wave-hover"]', { timeout: 20000 }).should('not.exist');
  });

  it('navigates to and from scroll loop sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('[data-barba-namespace="homepage"]').should('exist');
    cy.get('[data-barba-namespace="scroll-loop"]').should('not.exist');
    cy.get('.header__list-item a').contains('Scroll Loop').click();
    cy.get('[data-barba-namespace="scroll-loop"]').should('exist');
    cy.get('[data-barba-namespace="homepage"]', { timeout: 20000 }).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Floating Text').click();
    cy.get('[data-barba-namespace="scroll-loop"]', { timeout: 20000 }).should('not.exist');
  });

  it('navigates to and from floating text sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('[data-barba-namespace="homepage"]').should('exist');
    cy.get('[data-barba-namespace="floating-text"]').should('not.exist');
    cy.get('.header__list-item a').contains('Floating Text').click();
    cy.get('[data-barba-namespace="floating-text"]').should('exist');
    cy.get('[data-barba-namespace="homepage"]', { timeout: 20000 }).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Inverse Scroll').click();
    cy.get('[data-barba-namespace="floating-text"]', { timeout: 20000 }).should('not.exist');
  });

  it('navigates to and from inverse scroll sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('[data-barba-namespace="homepage"]').should('exist');
    cy.get('[data-barba-namespace="inverse-scroll"]').should('not.exist');
    cy.get('.header__list-item a').contains('Inverse Scroll').click();
    cy.get('[data-barba-namespace="inverse-scroll"]').should('exist');
    cy.get('[data-barba-namespace="homepage"]', { timeout: 20000 }).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Cutout Slider').click();
    cy.get('[data-barba-namespace="inverse-scroll"]', { timeout: 20000 }).should('not.exist');
  });

  it('navigates to and from cutout slider sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('[data-barba-namespace="homepage"]').should('exist');
    cy.get('[data-barba-namespace="cutout-slider"]').should('not.exist');
    cy.get('.header__list-item a').contains('Cutout Slider').click();
    cy.get('[data-barba-namespace="cutout-slider"]').should('exist');
    cy.get('[data-barba-namespace="homepage"]', { timeout: 20000 }).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Light Glow').click();
    cy.get('[data-barba-namespace="cutout-slider"]', { timeout: 20000 }).should('not.exist');
  });
});
