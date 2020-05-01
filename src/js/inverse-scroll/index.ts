import { gsap, CSSPlugin } from 'gsap';
import { ASSET_PATH } from '../../contants';

gsap.registerPlugin(CSSPlugin);
/*
 *  Class for scroll inverse scroll sketch
 */
export default class InverseScroll {
  animationTime: number;
  leftPanel: HTMLElement;
  rightPanel: HTMLElement;
  panels: HTMLElement[];
  wrap: HTMLElement;
  container: HTMLElement;
  isAnimating: boolean;
  slideLength: number;
  winHeight: number;
  /**
   * Initlaizes variables for class instance.
   */
  constructor() {
    this.animationTime = 0.4;

    this.leftPanel = document.querySelector('.content__section--left') as HTMLElement;
    this.rightPanel = document.querySelector('.content__section--right') as HTMLElement;
    this.panels = Array.from(document.querySelectorAll('.content__section'));
    this.wrap = document.querySelector('.content-wrap') as HTMLElement;
    this.container = document.querySelector('.scrolling-container') as HTMLElement;

    this.isAnimating = false;
    this.slideLength = 4;
    this.winHeight = window.innerHeight;

    this.bindEvents = this.bindEvents.bind(this);
    this.scrollPanel = this.scrollPanel.bind(this);
    this.fillSlides = this.fillSlides.bind(this);
    this.setHeights = this.setHeights.bind(this);
    this.straightenUp = this.straightenUp.bind(this);

    this.init();
  }

  init() {
    this.fillSlides();
    this.bindEvents();
    this.setHeights();
  }


  bindEvents() {
    const {
      setHeights,
      container,
      straightenUp,
      scrollPanel,
    } = this;

    window.addEventListener('resize', () => {
      setHeights();
    });

    let scrollEnded: NodeJS.Timeout;
    container.addEventListener('scroll', (e) => {
      e.preventDefault();

      clearTimeout(scrollEnded);
      scrollEnded = setTimeout(() => {
        straightenUp();
      }, 500);

      scrollPanel(container.scrollTop * -1);
    });
  }

  setHeights() {
    const {
      winHeight,
      slideLength,
      wrap,
    } = this;

    const panels : NodeListOf<HTMLElement> = document.querySelectorAll('.panel');
    Array.from(panels).forEach(el => el.style.height = `${winHeight.toString()}px`);

    // console.log(panels[0].style.height);

    wrap.style.height = `${(winHeight * slideLength).toString()}px`;
  }

  straightenUp() {
    const {
      panels,
      leftPanel,
      rightPanel,
      container,
      winHeight,
      animationTime,
    } = this;

    this.isAnimating = true;
    // Straightens up both panels after scrolling has ended
    const curHeight: number = +panels[0].style.top.replace(/\D/g, '');
    const diff: number = curHeight % winHeight;
    const scrollAmount: number = curHeight + (winHeight - diff);
    const tl: GSAPTimeline = gsap.timeline();

    if (diff > this.winHeight / 2) {
      tl
        .to(leftPanel, {
          duration: animationTime,
          top: `-${scrollAmount}px`
        }, 0)
        .to(rightPanel, {
          duration: animationTime,
          bottom: `-${scrollAmount}px`
        }, 0)
        .call(() => {
          container.scrollTo(0, scrollAmount);
          this.isAnimating = false;
        });

    } else {
      const diffScroll: number = curHeight - diff;
      tl
        .to(leftPanel, {
          duration: animationTime,
          top: `-${diffScroll}px`
        }, 0)
        .to(rightPanel, {
          duration: animationTime,
          bottom: `-${diffScroll}px`
        }, 0)
        .call(() => {
          container.scrollTo(0, diffScroll);
          this.isAnimating = false;
        });

    }
  }

  scrollPanel(amt: Number) {
    const {
      leftPanel,
      rightPanel,
    } = this;
    leftPanel.style.top = `${amt.toString()}px`;
    rightPanel.style.bottom = `${amt.toString()}px`;
  }

  fillSlides() {
    const {
      leftPanel,
      rightPanel,
      slideLength
    } = this;

    const leftPlaceholder = leftPanel.querySelector('.placeholder') as HTMLElement;
    const rightPlaceholder = rightPanel.querySelector('.placeholder') as HTMLElement;

    for (let i = 0; i < slideLength; i++) {
      const templateLeft: HTMLTemplateElement = document.createElement('template');
      const templateRight: HTMLTemplateElement = document.createElement('template');
      templateLeft.innerHTML = `<div class="panel"><img src="${ASSET_PATH}/assets/images/hp-left-${i + 1}.jpg"></div>`;
      templateRight.innerHTML = `<div class="panel"><img src="${ASSET_PATH}/assets/images/hp-right-${i + 1}.jpg"></div>`;

      leftPlaceholder.append(templateLeft.content.firstChild as Node);
      rightPlaceholder.append(templateRight.content.firstChild as Node);
    }
  }
}
