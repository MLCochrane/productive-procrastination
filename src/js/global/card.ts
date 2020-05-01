export interface Card {
  bindEvents: Function;
  // unbindEvents: Function;
  toggleClasses: Function;
}

export function createCard(): Card {
  return {
    bindEvents(container: HTMLElement) {
      const toggle: HTMLElement = container.querySelector('.card__toggle') as HTMLElement;
      const card: HTMLElement = container.querySelector('.card') as HTMLElement;

      toggle.addEventListener('click', () => {
        this.toggleClasses(card, toggle);
      });
    },

    // unbindEvents(container: HTMLElement) {
    //   const toggle: HTMLElement = container.querySelector('.card__toggle') as HTMLElement;
    //   toggle.removeEventListener('click', this.toggleClasses);
    // },

    toggleClasses(card: HTMLElement, toggle: HTMLElement) : void {
      card.classList.toggle('isOpen');
      toggle.classList.toggle('isactive');
    },
  };
}
