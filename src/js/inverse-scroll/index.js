import $ from 'jquery';

/*
 *  Class for scroll inverse scroll sketch
 */
export default class InverseScroll {
	/**
	 * Initlaizes variables for class instance.
	 */
	constructor() {
		this.animationTime = 400;

		this.leftPanel = $('.content__section--left');
		this.rightPanel = $('.content__section--right');
		this.$wrap = $('.content-wrap');
		this.$container = $('.scrolling-container');

		this.isAnimating = false;

		this.init();
	}

	/**
	 * Sets order of method calls
	 * @function init
	 * @memberof InverseScroll.prototype
	 */
	init() {
		this.fillSlides();
		this.bindEvents();
		this.setHeights();
	}

	/**
	 * Binds event listeners for DOM events and defines callback logic
	 * @function bindEvents
	 * @memberof InverseScroll.prototype
	 */
	bindEvents() {
		$(window).on('resize', () => {
			this.setHeights();
		});

		let scrollEnded;
		this.$container.on('scroll', e => {
			e.preventDefault();
			clearTimeout(scrollEnded);
			scrollEnded = setTimeout(() => {
				this.straightenUp();
			}, 500);
			this.scrollPanel(this.$container.scrollTop() * -1);
		});
	}

	/**
	 * Sets heights for content on page load and resize
	 * @function setHeights
	 * @memberof InverseScroll.prototype
	 */
	setHeights() {
		this.winHeight = $('.content').innerHeight();
		$('.panel').height(this.winHeight);
		this.$wrap.height(this.winHeight * this.slideLength);
	}

	/**
	 * Adjusts height of side panels and resets scroll after user scroll as ended
	 * @function straightenUp
	 * @memberof InverseScroll.prototype
	 */
	straightenUp() {
		this.isAnimating = true;
		// Straightens up both panels after scrolling has ended
		const curHeight = +$('.content__section').css('top').replace(/\D/g, '');
		const diff = curHeight % this.winHeight;
		let scrollAmount = curHeight + (this.winHeight - diff);

		if (diff > this.winHeight / 2) {
			this.leftPanel.animate({
				top: `-${scrollAmount}px`
			}, this.animationTime);
			this.rightPanel.animate({
				bottom: `-${scrollAmount}px`
			}, this.animationTime);
			this.$container.scrollTop(scrollAmount);
			this.animating = false;
		} else {
			this.leftPanel.animate({
				top: `-${curHeight - diff}px`
			}, this.animationTime);
			this.rightPanel.animate({
				bottom: `-${curHeight - diff}px`
			}, this.animationTime);
			this.$container.scrollTop((curHeight - diff));
			this.animating = false;
		}
	}

	/**
	 * Binds event listeners for DOM events
	 * @function scrollPanel
	 * @memberof InverseScroll.prototype
	 * @param {Number} amt - Number representing pixel value to set panel position at
	 */
	scrollPanel(amt) {
		this.leftPanel.css('top', amt);
		this.rightPanel.css('bottom', amt);
	}

	/**
	 * Appends images to both panel containers
	 * @function fillSlides
	 * @memberof InverseScroll.prototype
	 */
	fillSlides() {
		for (let i = 0; i < 4; i++) {
			this.leftPanel.find('.placeholder').append(`<div class="panel"><img src="${ASSET_PATH}/assets/images/hp-left-${i + 1}.jpg"></div>`);
		}
		for (let i = 4; i > 0; i--) {
			this.rightPanel.find('.placeholder').append(`<div class="panel"><img src="${ASSET_PATH}/assets/images/hp-right-${5 - i}.jpg"></div>`);
		}

		this.slideLength = ($('.panel').length / 2);
	}
}
