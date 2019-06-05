import { TimelineMax, Power0 } from 'gsap';

export default class ScrollingProjects {
	constructor() {
		this.currentOffset = '';
		this.originOffset = '';
		this.container = document.querySelector('.thing-holder');
		this.current = window.getComputedStyle(this.container);
		
		// THIS WILL BE WRONG AS THE PAGE LOADS FONT AFTERWARDS
		// USE onLoad, PROMISE OR OTHER METHOD TO ENSURE TYPEKIT FONT HAS BEEN LOADED AND CORRECT HEIGHT RECORDED
		this.maxHeight = (this.current.getPropertyValue('height').split('px'))[0];
		
		this.tl = {};
		this.loopSeconds = 20;
		this.loopLength = this.loopSeconds * 1920 / window.innerWidth;

		this.start = null;
		this.loopTimeout;
		this.resizeTimeout

		this.handleWheel = this.handleWheel.bind(this);
		this.handleResize = this.handleResize.bind(this);

		this.initSliding();
		this.bindEvents();
	}

	bindEvents() {
		this.originOffset = this.getYTranslate(this.current);

		window.addEventListener('wheel', e => {
			this.handleWheel(e);
		});

		window.addEventListener('resize', e => {
			this.handleResize(e);
		});
	}

	handleResize(e) {
		clearTimeout(this.resizeTimeout);
		this.resizeTimeout = setTimeout(() => {
			this.loopLength = this.loopSeconds * 1920 / window.innerWidth;
			// RESET ANIMATION
		}, 100);
	}

	handleWheel(e) {
		this.currentOffset = this.getYTranslate(this.current);
		const percentOffset = +((this.currentOffset / this.maxHeight) * 100).toFixed(4);

		if (this.tl.isActive()) {
			this.tl.pause();
		}

		if (e.wheelDeltaY < 0) { // scrolling down
			this.container.style.transform = (this.currentOffset > (this.maxHeight * -0.75))
				? `translate(-50%, ${percentOffset - (e.deltaY * 0.01)}%)`
				: `translate(-50%, -25%)`;
		} else {
			// scrolling up
			this.container.style.transform = (this.currentOffset < (this.maxHeight * -0.25))
				? `translate(-50%, ${percentOffset - (e.deltaY * 0.01)}%)`
				: `translate(-50%, -75%)`;
		}

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

	initSliding() {
		this.tl = new TimelineMax();
		this.tl.
			fromTo(this.container, this.loopLength, { x: '-50%', y: '-25%' }, { x: '-50%', y: '-75%', ease: Power0.easeNone }, 0);
		this.tl.repeat(5);
	}

	getYTranslate(el) {
		return el.getPropertyValue('transform').replace(/[^0-9\-.,]/g, '').split(',')[5];
	}
}