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

  it('navigates to and from light glow sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get(`[data-barba-namespace="home"]`).should('exist');
    cy.get(`[data-barba-namespace="glow-process"]`).should('not.exist');
    cy.get('.header__list-item a').contains('Light Glow').click();
    cy.get(`[data-barba-namespace="glow-process"]`).should('exist');
    cy.get(`[data-barba-namespace="home"]`, {timeout: 10000}).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Toon Post Process').click();
    cy.get(`[data-barba-namespace="glow-process"]`).should('not.exist');
  });

  it('navigates to and from post processing sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get(`[data-barba-namespace="home"]`).should('exist');
    cy.get(`[data-barba-namespace="post-process"]`).should('not.exist');
    cy.get('.header__list-item a').contains('Toon Post Process').click();
    cy.get(`[data-barba-namespace="post-process"]`).should('exist');
    cy.get(`[data-barba-namespace="home"]`, {timeout: 10000}).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Wave Hover').click();
    cy.get(`[data-barba-namespace="post-process"]`).should('not.exist');
  });

  it('navigates to and from wave hover sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get(`[data-barba-namespace="home"]`).should('exist');
    cy.get(`[data-barba-namespace="wave-hover"]`).should('not.exist');
    cy.get('.header__list-item a').contains('Wave Hover').click();
    cy.get(`[data-barba-namespace="wave-hover"]`).should('exist');
    cy.get(`[data-barba-namespace="home"]`, {timeout: 10000}).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Scroll Loop').click();
    cy.get(`[data-barba-namespace="wave-hover"]`).should('not.exist');
  });

  it('navigates to and from scroll loop sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get(`[data-barba-namespace="home"]`).should('exist');
    cy.get(`[data-barba-namespace="scroll-loop"]`).should('not.exist');
    cy.get('.header__list-item a').contains('Scroll Loop').click();
    cy.get(`[data-barba-namespace="scroll-loop"]`).should('exist');
    cy.get(`[data-barba-namespace="home"]`, {timeout: 10000}).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Floating Text').click();
    cy.get(`[data-barba-namespace="scroll-loop"]`).should('not.exist');
  });

  it('navigates to and from floating text sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get(`[data-barba-namespace="home"]`).should('exist');
    cy.get(`[data-barba-namespace="floating-text"]`).should('not.exist');
    cy.get('.header__list-item a').contains('Floating Text').click();
    cy.get(`[data-barba-namespace="floating-text"]`).should('exist');
    cy.get(`[data-barba-namespace="home"]`, {timeout: 10000}).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Inverse Scroll').click();
    cy.get(`[data-barba-namespace="floating-text"]`).should('not.exist');
  });

  it('navigates to and from inverse scroll sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get(`[data-barba-namespace="home"]`).should('exist');
    cy.get(`[data-barba-namespace="inverse-scroll"]`).should('not.exist');
    cy.get('.header__list-item a').contains('Inverse Scroll').click();
    cy.get(`[data-barba-namespace="inverse-scroll"]`).should('exist');
    cy.get(`[data-barba-namespace="home"]`, {timeout: 10000}).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Cutout Slider').click();
    cy.get(`[data-barba-namespace="inverse-scroll"]`).should('not.exist');
  });

  it('navigates to and from cutout slider sketch', () => {
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get(`[data-barba-namespace="home"]`).should('exist');
    cy.get(`[data-barba-namespace="cutout-slider"]`).should('not.exist');
    cy.get('.header__list-item a').contains('Cutout Slider').click();
    cy.get(`[data-barba-namespace="cutout-slider"]`).should('exist');
    cy.get(`[data-barba-namespace="home"]`, {timeout: 10000}).should('not.exist');
    cy.get('#ToggleNav').should('be.visible').click();
    cy.wait(300);
    cy.get('.header__list-item a').contains('Light Glow').click();
    cy.get(`[data-barba-namespace="cutout-slider"]`).should('not.exist');
  });



  // it('successfully navigates to each sketch and removes previous DOM', () => {
  //   cy.window().then((win) => {
  //     cy.spy(win.console, "log")
  //     cy.spy(win.console, "warn")
  //     cy.spy(win.console, "error")
  //   })
  //   cy.get('#ToggleNav').should('be.visible').click();
  //   cy.wait(300);
  //   cy.get('.header__list-item a').should('have.length', 7)
  //   .each(($li, index, $list) => {
  //     const link = $li.attr('href');
  //     const namespace = link.split('/')[1];
  //     let previous;

  //     cy.get('[data-barba="container"]').then($el => {
  //       // Checks not only that navigation works but barba correctly removing items from DOM
  //       previous = $el.attr('data-barba-namespace');

  //       cy.get(`[data-barba-namespace="${namespace}"]`).should('not.exist');
  //       cy.get($li).click();
  //       cy.get(`[data-barba-namespace="${namespace}"]`).should('exist');
  //       cy.url().should('eq', `http://localhost:8080${link}`);
  //       cy.get(`[data-barba-namespace="${previous}"]`, {timeout: 30000}).should('not.exist');
  //       cy.get('#ToggleNav').should('be.visible').click();
  //       cy.wait(300);

  //       // Returns home
  //       if (index === $list.length - 1) {
  //         cy.get(`[data-barba-namespace="home"]`).should('not.exist');
  //         cy.get('.brand__logo a').click();
  //         cy.get('[data-barba-namespace="home"]').should('exist');
  //         cy.url().should('eq', 'http://localhost:8080/');
  //         cy.get(`[data-barba-namespace="${previous}"]`).should('not.exist');
  //       }
  //     })
  //   })
  // });
});