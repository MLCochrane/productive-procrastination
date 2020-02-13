/**
 * Class handling homepage animations.
 *
 */
export default class Home {
  constructor() {
    this.items = [];
    this.outOfView = [];
    this.parent = document.getElementsByClassName('landing')[0];
    this.pagePos = 0;

    this.bindEvents = this.bindEvents.bind(this);
    this.onWidowResize = this.onWidowResize.bind(this);
    this.onScroll = this.onScroll.bind(this);

    this.getItemPositions = this.getItemPositions.bind(this);
    this.checkInView = this.checkInView.bind(this);

    this.init();
  }

  /**
   * Sets up call order
   * @function init
   * @memberof Home.prototype
   */
  init() {
    const {
      bindEvents,
      getItemPositions,
      checkInView,
    } = this;

    bindEvents();
    getItemPositions(true);
    checkInView();
  }

  /**
   * Binds events
   * @function bindEvents
   * @memberof Home.prototype
   */
  bindEvents() {
    window.addEventListener('resize', this.onWidowResize);
    this.parent.addEventListener('scroll', this.onScroll);
  }

  /**
   * Resize event callback
   * @function onWidowResize
   * @memberof Home.prototype
   */
  onWidowResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.getItemPositions(true);
      this.checkInView();
    }, 100);
  }

  /**
   * Scroll event
   * @function onScroll
   * @memberof Home.prototype
   */
  onScroll() {
    this.pagePos = this.parent.scrollTop + window.innerHeight;
    this.checkInView();
  }

  /**
   * Checks item array against page pos for any items now in view
   * @function checkInView
   * @memberof Home.prototype
   */
  checkInView() {
    const {
      pagePos,
    } = this;

    let tempOutOfView = this.outOfView;
    // Check outOfView array instead of all items
    // Once in view, move to inView array/take out of outOfView
    for (let i = 0; i < this.outOfView.length; i++) {
      if (this.outOfView[i].offset < pagePos) {
        // ANIMATE LOGIC HERE

        // console.log(this.outOfView[i]);
        this.outOfView[i].el.classList.add('in-view');

        tempOutOfView = this.outOfView.slice(i + 1); // slice index is start index for return array
      }
    }

    // Update outOfView with remaining items
    this.outOfView = tempOutOfView;
  }

  /**
   * Gets initial positions for scroll items
   * @function getItemPositions
   * @memberof Home.prototype
   */
  getItemPositions(isInitial) {
    const {
      parent,
    } = this;

    const els = Array.from(document.querySelectorAll('[data-scroll="reveal"]'));

    this.items = els.map((el) => {
      const data = el.getBoundingClientRect();
      return {
        el,
        data,
        offset: (data.height * 0.10) + data.top,
      };
    });

    this.pagePos = parent.scrollTop + window.innerHeight;

    if (isInitial) {
      // Copy over all items before checking if in view
      this.outOfView = this.items;
    }
  }
}
