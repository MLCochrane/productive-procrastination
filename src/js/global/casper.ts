import { gsap, CSSPlugin } from 'gsap';

gsap.registerPlugin(CSSPlugin);
/**
 * Friendly wrapper over IntersectionObserver for
 * scroll based animations.
 *
 */
export default class Casper {
  config: { offset: number; timeStep: number; };
  options: { root: HTMLElement | null; threshold: any[]; };
  watchList: {
      el: Element,
      hasEntered: boolean,
      entering: boolean
      callback?: Function
    }[];
  observer: IntersectionObserver | null;
	constructor(
      parent: HTMLElement | null,
      offset: number
    ) {
		this.config = {
			offset,
			timeStep: 1.0,
		};

		this.options = {
			root: parent,
			threshold: [1, this.config.offset],
		};

    this.watchList = [];

    this.observer = null;

		this.createList = this.createList.bind(this);
		this.clearList = this.clearList.bind(this);
		this.startObserving = this.startObserving.bind(this);
		this.stopObserving = this.stopObserving.bind(this);
		this.onIntersection = this.onIntersection.bind(this);
		this.eneteringItem = this.eneteringItem.bind(this);
	}

	/**
	 * Initializes function order of setup.
	 * @function init
	 * @memberof Capser.prototype
	 */
	init() {
		const { createList, startObserving } = this;

		createList();
		startObserving();
	}

	/**
	 * Sets up watchlist for observer.
	 * @function createList
	 * @memberof Capser.prototype
	 */
	createList() {
		const els = Array.from(document.querySelectorAll('[data-scroll="reveal"]'));
		this.watchList = els.map((el, index) => {
			el.setAttribute('data-scroll-index', index.toString());
			return {
				el,
				hasEntered: false,
				entering: false,
				// callback: toBeMade() -- Have custom function for each animation?
			};
		});
	}

	/**
	 * Clears out watchlist and stops observing.
	 * @function clearList
	 * @memberof Casper.prototype
	 */
	clearList() {
		const { stopObserving } = this;

		stopObserving();
		this.watchList = [];
	}

	/**
	 * Creates a new IntersectionObserver and starts watching.
	 * @function startObserving
	 * @memberof Casper.prototype
	 */
	startObserving() {
		const { onIntersection, options, watchList } = this;

		this.observer = new IntersectionObserver(onIntersection, options) as IntersectionObserver;
		watchList.forEach((item) => this.observer?.observe(item.el));
	}

	/**
	 * Creates a new IntersectionObserver and starts watching.
	 * @function stopObserving
	 * @memberof Casper.prototype
	 */
	stopObserving() {
		const { watchList } = this;

		watchList.forEach((item) => this.observer?.unobserve(item.el));
	}

	/**
	 * Callback based to IntersectionObserver.
	 * @function onIntersection
	 * @memberof Capser.prototype
	 * @param {Object} entries - Array of intersection events?
	 */
	onIntersection(entries: any) {
		for (let i = 0; i < entries.length; i++) {
			const { isIntersecting, target, intersectionRatio } = entries[i];

			const { watchList, eneteringItem, config } = this;

			if (isIntersecting) {
				const currentIndex = target.getAttribute('data-scroll-index');

				if (intersectionRatio >= config.offset) {
					if (!watchList[currentIndex].hasEntered) eneteringItem(currentIndex);
				}
			}
		}
	}

	/**
	 * Called when item has first entered the root element.
	 * @function eneteringItem
	 * @memberof Casper.prototype
	 * @param {Number} index - Index of current item entering view.
	 */
	eneteringItem(index: number) {
		const { watchList, config } = this;

		const { el } = watchList[index];

		// Used to check earlier if this should be called or not
		watchList[index].hasEntered = true;

		gsap.fromTo(
			el,
			config.timeStep,
			{
				y: 100,
			},
			{
				autoAlpha: 1,
				y: 0,
			}
		);
	}
}
