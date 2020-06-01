import { gsap, CSSPlugin } from 'gsap';

gsap.registerPlugin(CSSPlugin);

/*
 *  Class for cutout slider sketch
 */
export default class CutoutSlider {
  selectors: {[key: string]: any};
  dims: { offset: number; };
  tl: GSAPTimeline | null;

    /**
   * Initlaizes variables for class instance and binds methods
   */
  constructor() {
    this.selectors = {
      box: document.getElementsByClassName('wrap')[0],
      title: document.getElementsByClassName('item'),
      border: document.getElementById('border'),
      advance: document.getElementById('button'),
      reset: document.getElementById('button1'),
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
    this.handleAdvance = this.handleAdvance.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.destroy = this.destroy.bind(this);

    this.init();
  }

  /**
   * Binds event listeners for DOM events and defines callbacks
   * @function bindEvents
   * @memberof CutoutSlider.prototype
   */
  bindEvents() {
    this.selectors.advance.addEventListener('click', this.handleAdvance);
    this.selectors.reset.addEventListener('click', this.handleReset);
    this.selectors.box.addEventListener('mousemove', this.handleMouseMove);
  }

  /**
   * Callback for advancing slide
   * @function handleAdvance
   * @memberof CutoutSlider.prototype
   */
  handleAdvance() {
    this.tl?.play();
  }

  /**
   * Callback for reseting slider
   * @function handleReset
   * @memberof CutoutSlider.prototype
   */
  handleReset() {
    this.tl?.time(0);
    this.tl?.pause();
  }

  /**
   * Callback for mousemove
   * @function handleMouseMove
   * @memberof CutoutSlider.prototype
   */
  handleMouseMove(e: MouseEvent) {
    const xPos = e.clientX / window.innerWidth;
    const yPos = e.clientY / window.innerHeight;

    TweenMax.to(this.selectors.circle, 2, {
      x: 200 * xPos,
      y: 200 * yPos
    });
  }

  destroy() {
    this.selectors.advance.removeEventListener('click', this.handleAdvance);
    this.selectors.reset.removeEventListener('click', this.handleReset);
    this.selectors.box.removeEventListener('mousemove', this.handleMouseMove);
  }

  /**
   * Calls class methods
   * @function init
   * @memberof CutoutSlider.prototype
   */
  init() {
    this.bindEvents();
    this.initTimeline();
  }

  /**
   * Defines GSAP timeline for slider
   * @function initTimeline
   * @memberof CutoutSlider.prototype
   */
  initTimeline() {
    this.tl?.set(this.selectors.title, {x: this.dims.offset})
      .set(this.selectors.box, {backgroundColor: "rgb(190,254,251)"})
      .set(this.selectors.border, {fill: "rgb(190,254,251)"})
      .addPause()
      .to(this.selectors.title, 2, {x: 0, ease:Power3.easeOut})
      .to(this.selectors.box, 1, {css:{backgroundColor:"rgb(13,126,107)"}}, 0)
      .to(this.selectors.border, 1, {fill:"rgb(13,126,107)"}, 0)
      .to(this.selectors.one, 1, {width: "200px"}, 0)
      .to(this.selectors.two, 1, {width: "500px", x: "20px"}, 0)
      .to(this.selectors.three, 1, {width: "200px", x: "100px"}, 0)
      .to(this.selectors.shade, 1.75, {fill: "rgb(13, 126, 107)", x: "1500px"}, 0)
      .to(this.selectors.circle, 1.75, {backgroundColor: "rgba(13, 126, 107, 0.6)"}, 0)
      .set(this.selectors.image, {background: `url(${ASSET_PATH}/assets/images/hp-left-1.jpg)`}, .5)
      .addPause()
      .to(this.selectors.title, 2, {x: -this.dims.offset, ease:Power3.easeOut})
      .to(this.selectors.box, 1, {css:{backgroundColor:"rgb(244,229,94)"}}, 2)
      .to(this.selectors.border, 1, {fill:"rgb(244,229,94)"}, 2)
      .to(this.selectors.one, 1, {width: "320px", x: "200px"}, 2)
      .to(this.selectors.two, 1, {width: "400px", x: "-50px"}, 2)
      .to(this.selectors.three, 1, {width: "500px", x: "0px"}, 2)
      .to(this.selectors.shade, 1.75, {fill: "rgb(244,229,94)", x: "0px"}, 2)
      .to(this.selectors.circle, 1.75, {backgroundColor: "rgba(244, 229, 94, 0.6)"}, 2)
      .set(this.selectors.image, {background: `url(${ASSET_PATH}/assets/images/hp-left-2.jpg)`}, 2.5)
      .addPause()
      .to(this.selectors.title, 2, {x: -(2 * this.dims.offset), ease:Power3.easeOut})
      .to(this.selectors.box, 1, {css:{backgroundColor:"rgb(241,50,76)"}}, 4)
      .to(this.selectors.border, 1, {fill:"rgb(241,50,76)"}, 4)
      .to(this.selectors.one, 1, {width: "200px", x: "50px"}, 4)
      .to(this.selectors.two, 1, {width: "600px", x: "100px"}, 4)
      .to(this.selectors.three, 1, {width: "400px", x: "250px"}, 4)
      .to(this.selectors.shade, 1.75, {fill: "rgb(241,50,76)", x: "1500px"}, 4)
      .to(this.selectors.circle, 1.75, {backgroundColor: "rgba(241,50,76, 0.6)"}, 4)
      .set(this.selectors.image, {background: `url(${ASSET_PATH}/assets/images/hp-left-3.jpg)`}, 4.5)
      .addPause()
      .to(this.selectors.title, 2, {x: -(3 * this.dims.offset), ease:Power3.easeOut})
      .to(this.selectors.box, 1, {css:{backgroundColor:"rgb(26,186,84)"}}, 6)
      .to(this.selectors.border, 1, {fill:"rgb(26,186,84)"}, 6)
      .to(this.selectors.one, 1, {width: "200px", x: "10px"}, 6)
      .to(this.selectors.two, 1, {width: "500px", x: "0px"}, 6)
      .to(this.selectors.three, 1, {width: "200px", x: "50px"}, 6)
      .to(this.selectors.shade, 1.75, {fill: "rgb(26,186,84)", x: "0px"}, 6)
      .to(this.selectors.circle, 1.75, {backgroundColor: "rgba(26,186,84,0.6)"}, 6)
      .set(this.selectors.image, {background: `url(${ASSET_PATH}/assets/images/hp-left-4.jpg)`}, 6.5);
  }
}
