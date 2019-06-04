import { TimelineLite } from "gsap";

export default class CutoutSlider {
	constructor() {
		this.selectors = {
			box: document.getElementsByClassName('wrap')[0],
			title: document.getElementsByClassName('item'),
			border: document.getElementById('border'),
			button: document.getElementById('button'),
			button1: document.getElementById('button1'),
			one: document.getElementById('one'),
			two: document.getElementById('two'),
			three: document.getElementById('three'),
			shade: document.getElementById('shade'),
			image: document.getElementsByClassName('image')[0],
			circle: document.getElementsByClassName('circle-overlay')[0]
		}


		this.dims = {
			offset: window.innerWidth/3,
		}

		this.tl = new TimelineLite();

		this.init = this.init.bind(this);
		this.bindEvents = this.bindEvents.bind(this);
		this.initTimeline = this.initTimeline.bind(this);

		this.init();
	}

	bindEvents() {
    this.selectors.button.addEventListener('click', () => {
    	this.tl.play();
    });

    this.selectors.button1.addEventListener('click', () => {
    	this.tl.reverse();
    	// this.tl.pause();
    });

    this.selectors.box.addEventListener('mousemove', () => {
    	const xPos = event.clientX / window.innerWidth;
    	const yPos = event.clientY / window.innerHeight;

    	TweenMax.to(this.selectors.circle, 2, {
    		x: 200 * xPos,
    		y: 200 * yPos
    	});
    });
	}

	init() {
		this.bindEvents();
		this.initTimeline();
	}

	initTimeline() {
		this.tl
			.set(this.selectors.title, {x: this.dims.offset})
			.set(this.selectors.box, {backgroundColor: "rgb(231, 174, 0)"})
			.set(this.selectors.border, {fill: "rgb(231, 174, 0)"})
      .addPause()
      .to(this.selectors.title, 2, {x: 0, ease:Power3.easeOut})
      .to(this.selectors.box, 1, {css:{backgroundColor:"rgb(2, 120, 254)"}}, 0)
      .to(this.selectors.border, 1, {fill:"rgb(2, 120, 254)"}, 0)
      .to(this.selectors.one, 1, {width: "200px"}, 0)
			.to(this.selectors.two, 1, {width: "500px", x: "20px"}, 0)
			.to(this.selectors.three, 1, {width: "200px", x: "100px"}, 0)
      .to(this.selectors.shade, 1.75, {fill: "rgb(2, 120, 254)", x: "1500px"}, 0)
      .to(this.selectors.circle, 1.75, {backgroundColor: "rgba(2, 120, 254, 0.6)"}, 0)
      .set(this.selectors.image, {background: "url(src/assets/images/hp-left-1.jpg)"}, .5)
      .addPause()
      .to(this.selectors.title, 2, {x: -this.dims.offset, ease:Power3.easeOut})
      .to(this.selectors.box, 1, {css:{backgroundColor:"rgb(191, 175, 160)"}}, 2)
      .to(this.selectors.border, 1, {fill:"rgb(191, 175, 160)"}, 2)
      .to(this.selectors.one, 1, {width: "320px", x: "200px"}, 2)
			.to(this.selectors.two, 1, {width: "400px", x: "-50px"}, 2)
			.to(this.selectors.three, 1, {width: "500px", x: "0px"}, 2)
      .to(this.selectors.shade, 1.75, {fill: "rgb(191, 175, 160)", x: "0px"}, 2)
      .to(this.selectors.circle, 1.75, {backgroundColor: "rgba(191, 175, 160, 0.6)"}, 2)
      .set(this.selectors.image, {background: "url(src/assets/images/hp-left-2.jpg)"}, 2.5)
      .addPause()
      .to(this.selectors.title, 2, {x: -(2 * this.dims.offset), ease:Power3.easeOut})
      .to(this.selectors.box, 1, {css:{backgroundColor:"rgb(204, 165, 151)"}}, 4)
      .to(this.selectors.border, 1, {fill:"rgb(204, 165, 151)"}, 4)
      .to(this.selectors.one, 1, {width: "200px", x: "50px"}, 4)
			.to(this.selectors.two, 1, {width: "600px", x: "100px"}, 4)
			.to(this.selectors.three, 1, {width: "400px", x: "250px"}, 4)
      .to(this.selectors.shade, 1.75, {fill: "rgb(204, 165, 151)", x: "1500px"}, 4)
      .to(this.selectors.circle, 1.75, {backgroundColor: "rgba(204, 165, 151, 0.6)"}, 4)
      .set(this.selectors.image, {background: "url(src/assets/images/hp-left-3.jpg)"}, 4.5)
      .addPause()
      .to(this.selectors.title, 2, {x: -(3 * this.dims.offset), ease:Power3.easeOut})
      .to(this.selectors.box, 1, {css:{backgroundColor:"rgb(0, 255, 153)"}}, 6)
      .to(this.selectors.border, 1, {fill:"rgb(0, 255, 153)"}, 6)
			.to(this.selectors.one, 1, {width: "200px", x: "10px"}, 6)
			.to(this.selectors.two, 1, {width: "500px", x: "0px"}, 6)
			.to(this.selectors.three, 1, {width: "200px", x: "50px"}, 6)
			.to(this.selectors.shade, 1.75, {fill: "rgb(0, 255, 153)", x: "0px"}, 6)
      .to(this.selectors.circle, 1.75, {backgroundColor: "rgba(0, 255, 153, 0.6)"}, 6)
      .set(this.selectors.image, {background: "url(src/assets/images/hp-left-4.jpg)"}, 6.5);
	}
}