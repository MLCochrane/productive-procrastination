import { gsap, CSSPlugin } from 'gsap';

gsap.registerPlugin(CSSPlugin);

/*
 *  Class for scroll loop sketch
 */
export default class ScrollingProjects {
  currentOffset: number;
  originOffset: number;
  container: HTMLElement;
  current: CSSStyleDeclaration;
  maxHeight: any;
  tl: GSAPTimeline | null;
  loopSeconds: number;
  loopLength: number;
  start: null;
  loopTimeout: number;
  resizeTimeout: number;
  /**
   * Initlaizes variables for class instance.
   */
  constructor() {
    this.currentOffset = 0;
    this.originOffset = 0;
    this.container = document.querySelector('.thing-holder') as HTMLElement;
    this.current = window.getComputedStyle(this.container);

    this.maxHeight = (this.current.getPropertyValue('height').split('px'))[0];

    this.tl = null;
    this.loopSeconds = 20;
    this.loopLength = (this.loopSeconds * 1920) / window.innerWidth;

    this.start = null;
    this.loopTimeout = 0;
    this.resizeTimeout = 0;

    this.initSliding = this.initSliding.bind(this);
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
    if (this.tl) {
      this.tl.kill();
      this.tl = null;
    }
    //console.log('Destroy has been called');
  }

  /**
   * Callback passed to resize event to update animation length based on screen size
   * @function handleResize
   * @memberof ScrollingProjects.prototype
   */
  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.loopLength = (this.loopSeconds * 1920) / window.innerWidth;
      // RESET ANIMATION
    }, 100);
  }

  /**
   * Callback passed to wheel event
   * @function handleWheel
   * @memberof ScrollingProjects.prototype
   * @param {WheelEvent} e - Wheel event passed from event handler
   */
  handleWheel(e: WheelEvent) {
    const {
      tl,
      currentOffset,
      maxHeight,
    } = this;

    this.currentOffset = this.getYTranslate(this.current);
    const percentOffset = +((currentOffset / maxHeight) * 100).toFixed(4);

    // Will pause timeline if currently running to handle next steps
    if (tl?.isActive()) {
      tl.pause();
    }

    if (e.deltaY < 0) {
      // scrolling down
      this.container.style.transform = (currentOffset > (maxHeight * -0.75))
        ? `translate(-50%, ${percentOffset - (e.deltaY * 0.01)}%)`
        : 'translate(-50%, -25%)';
    } else {
      // scrolling up
      this.container.style.transform = (currentOffset < (maxHeight * -0.25))
        ? `translate(-50%, ${percentOffset - (e.deltaY * 0.01)}%)`
        : 'translate(-50%, -75%)';
    }

    /*
    * Imitating a "debounce" to only update timeline
    * position in seconds and resume timeline after
    * user has stopped  scrolling.
    */

    clearTimeout(this.loopTimeout);
    this.loopTimeout = setTimeout(() => {
      /* The timeline position in seconds
      *  the current offset adds whatever the latest scroll amount would be, turns it positive
      *  and removes the starting percentage then divided by .5 as the total range of the
      *  transform is 50% which returns a value between 1-100 indicating
      *  the current position in the timeline. We then convert that to a percent
      *  and mulitply it by the loop time to get a value in seconds
      */
      const timelinePosition = (
        this.loopLength * (((((percentOffset - (e.deltaY * 0.01)) * -1) - 25) / 0.5))) / 100;
      if (e.deltaY < 0) {
        tl?.play(timelinePosition);
      } else {
        tl?.reverse(timelinePosition);
      }
    }, 300);
  }

  /**
   * Creates timeline and starts normal animation loop
   * @function initSliding
   * @memberof ScrollingProjects.prototype
   */
  initSliding() {
    const {
      container,
      loopLength,
    } = this;

    this.tl = gsap.timeline();
    this.tl.fromTo(
      container,
      { x: '-50%', y: '-25%' },
      { x: '-50%', y: '-75%', ease: Power0.easeNone, duration: loopLength },
      0,
    );
    this.tl.repeat(5);
  }

  /**
   * Returns current Y translate of element
   * @function getYTranslate
   * @memberof ScrollingProjects.prototype
   */
  getYTranslate(el: CSSStyleDeclaration): number {
    return +el.getPropertyValue('transform').replace(/[^0-9\-.,]/g, '').split(',')[5];
  }
}
