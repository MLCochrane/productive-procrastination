export default function Card() {
  return {
    bindEvents(container) {
      const toggle = container.querySelector('.card__toggle');
      const card = container.querySelector('.card');

      toggle.addEventListener('click', () => {
        this.toggleClasses(card, toggle);
      });
    },

    unbindEvents(container) {
      const toggle = container.querySelector('.card__toggle');
      toggle.removeEventListener('click', this.toggleClasses);
    },

    toggleClasses(card, toggle) {
      card.classList.toggle('isOpen');
      toggle.classList.toggle('isactive');
    }
  }
}