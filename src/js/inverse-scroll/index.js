import $ from 'jquery';

export default class Slider {
	constructor() {
		this.animationTime = 400;

		this.leftPanel = $('.content__section--left');
		this.rightPanel = $('.content__section--right');

		this.isAnimating = false;

		this.init();
	}

	init() {
		this.fillSlides();
		this.setHeights();
		this.bindEvents();
	}

	bindEvents() {
		$(window).on('resize', e => {
			this.setHeights();
		});

		// MAYBE USE LODASH BEBOUNCE?
		let scrollEnded;
		$(window).on('scroll', e => {
			e.preventDefault();
			console.log(this.isAnimating);
			// if (this.isAnimating) {
			//   $(this.leftPanel).stop(false, false);
			//   $(this.rightPanel).stop(false, false);
			// }
			clearTimeout(scrollEnded);
			scrollEnded = setTimeout(() => {
				this.straightenUp();
			}, 500);
			this.scrollPanel($(window).scrollTop() * -1);
		});
	}

	setHeights() {
		this.winHeight = $('.content').innerHeight();
		$('.panel').height(this.winHeight);
		$('body').height(this.winHeight * this.slideLength);
	}

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
			window.scrollTo(0, scrollAmount);
			this.animating = false;
		} else {
			this.leftPanel.animate({
				top: `-${curHeight - diff}px`
			}, this.animationTime);
			this.rightPanel.animate({
				bottom: `-${curHeight - diff}px`
			}, this.animationTime);
			window.scrollTo(0, (curHeight - diff));
			this.animating = false;
		}
	}

	scrollPanel(amt) {
		this.leftPanel.css('top', amt);
		this.rightPanel.css('bottom', amt);
	}

	fillSlides() {
		for (let i = 0; i < 4; i++) {
			this.leftPanel.find('.placeholder').append(`<div class="panel"><img src="./src/assets/images/hp-left-${i + 1}.jpg"></div>`);
		}
		for (let i = 4; i > 0; i--) {
			this.rightPanel.find('.placeholder').append(`<div class="panel"><img src="./src/assets/images/hp-right-${5 - i}.jpg"></div>`);
		}

		this.slideLength = ($('.panel').length / 2);

		// for(let i = 0; i < this.slideLength; i++) {
		//   $('.counter').append('<div class="counter__single"></div>')
		// }

	}
}

// TODO:
// - cancel animation on scroll
// - add more content
// - logo animation
//   - same same -> same2 -> s2
// - what else should be included on the site?
