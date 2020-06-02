import './scss/app.scss';
import barba, { ISchemaPage } from '@barba/core';
import { gsap, CSSPlugin } from 'gsap';
import { initMenu, closeMenu, } from './js/global/header';
import {
	Card,
	createCard,
} from './js/global/card';
import Casper from './js/global/casper';
import LazyBoi from './js/global/lazyboi';

gsap.registerPlugin(CSSPlugin);

interface Sketch {
	destroy?: Function;
}

// Global header logic
initMenu();
const casper = new Casper(null, 0);
const lazyBoi = LazyBoi();
let card: Card | null = null;
let activeSketch: Sketch | null = null;

const sketches = SKETCH_PATHS;

barba.init({
	transitions: [
		{
			sync: true,
			once: ({ next }) => {
				// Initial load
				card = createCard();
				runSketch(next);
				if (next.namespace === 'homepage') {
					casper.init();
					lazyBoi.fillImages();
				}
			},
			enter: ({next}) => {
				if (next.namespace === 'homepage') {
					casper.init();
					lazyBoi.fillImages();
					activeSketch = null; // REMOVE ONCE HOMEPAGE LOGIC DONE
				}
				closeMenu();
				runSketch(next);
			},
			leave: async ({ current, next }) => {
				// Close drawer if open
				// if (current.namespace !== 'homepage') card.unbindEvents(current.container);

				if (casper.watchList.length !== 0) {
          casper.clearList();
          lazy.clearImages();
        }

				/*
				* Responsibility of each sketch to determine if
				* they have bindings or other that should be removed
				*/
				if (activeSketch && activeSketch.destroy) activeSketch.destroy();

				await pageTransiton(current.container, next.container);
			}
		}
	]
});

async function runSketch(route: ISchemaPage) {
	const curSketch = sketches.find(el => el === route.namespace);
	if (!curSketch) return;
	return await import(`./js/${curSketch}/index.ts`).then(result => {
		if (curSketch !== 'homepage' && card) card.bindEvents(route.container);

		// assigns class instance to variable so we can call destroy method on leave lifecycle hook
		activeSketch = new result.default();
	});
}

function pageTransiton(cur: HTMLElement, next: HTMLElement) {
	return new Promise(resolve => {
		// Animation handles both current and next pages
		let tl = gsap.timeline();
		tl
		.set(next, {immediateRender: true, autoAlpha: 0, y: -5}, 0)
		.to(cur, .5, {autoAlpha: 0, y: -5}, 0)
		.to(next, 1, { autoAlpha: 1, y: 0, onComplete: () => { resolve(); }}, 1);
	});
}
