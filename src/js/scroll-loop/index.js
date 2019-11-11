import { TimelineMax, Power0 } from 'gsap';

/**
 * @typedef {object} WheelEvent
 */

/*
 *  Class for scroll loop sketch
 */
export default class ScrollingProjects {
  /**
   * Initlaizes variables for class instance.
   */
  constructor() {
    this.currentOffset = '';
    this.originOffset = '';
    this.container = document.querySelector('.thing-holder');
    this.current = window.getComputedStyle(this.container);

    this.maxHeight = (this.current.getPropertyValue('height').split('px'))[0];

    this.tl = {};
    this.loopSeconds = 20;
    this.loopLength = this.loopSeconds * 1920 / window.innerWidth;

    this.start = null;
    this.loopTimeout;
    this.resizeTimeout

    this.handleWheel = this.handleWheel.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.destroy = this.destroy.bind(this);

    this.initSliding();
    this.bindEvents();
  }

  /**
   * Binds event listeners for DOM events
   * @function bindEvents
   * @memberof ScrollingProjects.prototype
   */
  bindEvents() {
    this.originOffset = this.getYTranslate(this.current);

    window.addEventListener('wheel', this.handleWheel);
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * Removes event bindings
   * @function destroy
   * @memberof ScrollingProjects.prototype
   */
  destroy() {
    window.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('resize', this.handleResize);
    this.tl.kill();
    this.tl = null;
  }

  /**
   * Callback passed to resize event to update animation length based on screen size
   * @function handleResize
   * @memberof ScrollingProjects.prototype
   */
  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.loopLength = this.loopSeconds * 1920 / window.innerWidth;
      // RESET ANIMATION
    }, 100);
  }

  /**
   * Callback passed to wheel event
   * @function handleWheel
   * @memberof ScrollingProjects.prototype
   * @param {WheelEvent} e - Wheel event passed from event handler
   */
  handleWheel(e) {
    this.currentOffset = this.getYTranslate(this.current);
    const percentOffset = +((this.currentOffset / this.maxHeight) * 100).toFixed(4);

    // Will pause timeline if currently running to handle next steps
    if (this.tl.isActive()) {
      this.tl.pause();
    }

    if (e.wheelDeltaY < 0) {
      // scrolling down
      this.container.style.transform = (this.currentOffset > (this.maxHeight * -0.75))
        ? `translate(-50%, ${percentOffset - (e.deltaY * 0.01)}%)`
        : `translate(-50%, -25%)`;
    } else {
      // scrolling up
      this.container.style.transform = (this.currentOffset < (this.maxHeight * -0.25))
        ? `translate(-50%, ${percentOffset - (e.deltaY * 0.01)}%)`
        : `translate(-50%, -75%)`;
    }

    /*
    * Imitating a "debounce" to only update timeline
    * position in seconds and resume timeline after
    * user has stopped  scrolling.
    */

    clearTimeout(this.loopTimeout);
    this.loopTimeout = setTimeout(() => {

      /* The timeline position in seconds
      *  the current offset adds whatever the latest scroll amount would be, turns it positive and removes the starting percentage
      *  then divided by .5 as the total range of the transform is 50% which returns a value between 1-100 indicating
      *  the current position in the timeline. We then convert that to a percent and mulitply it by the loop time to get a value in seconds
      */
      const timelinePosition = this.loopLength * (((((percentOffset - (e.deltaY * 0.01)) * -1) - 25) / 0.5)) / 100;
      if (e.wheelDeltaY < 0) {
        this.tl.play(timelinePosition);
      } else {
        this.tl.reverse(timelinePosition);
      }
    }, 300);
  }

  /**
   * Creates timeline and starts normal animation loop
   * @function initSliding
   * @memberof ScrollingProjects.prototype
   */
  initSliding() {
    this.tl = new TimelineMax();
    this.tl.
      fromTo(this.container, this.loopLength, { x: '-50%', y: '-25%' }, { x: '-50%', y: '-75%', ease: Power0.easeNone }, 0);
    this.tl.repeat(5);
  }

  /**
   * Returns current Y translate of element
   * @function getYTranslate
   * @memberof ScrollingProjects.prototype
   * @param {CSSStyleDeclaration} el - object containing element's style declarations
   * @returns {string} - String repesenting current translation in Y axis
   */
  getYTranslate(el) {
    return el.getPropertyValue('transform').replace(/[^0-9\-.,]/g, '').split(',')[5];
  }
}