export default class Homepage {
  constructor() {
    this.wraps = document.getElementsByClassName('grid-item__image-wrap');

    this.bindEvents.call(this);
  }

  /**
   * Init
   * @function init
   * @memberof Homepage.prototype
   */
  bindEvents() {
    Array.from(this.wraps).forEach((el) => {
      el.addEventListener('mouseover', this.scaleBorders(el));
    });
  }

  /**
   * Scales border element based on parent
   * @function scaleBorders
   * @memberof Homepage.prototype
   */
  scaleBorders(el) {
    return () => {
      const dims = el.getBoundingClientRect();
      console.log(dims);
    };
  }
}
