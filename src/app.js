import './scss/app.scss';
import barba from '@barba/core';
import { TimelineLite } from 'gsap';

import { initMenu, closeMenu, } from './js/global/header';
import Card from './js/global/card';

// Global header logic
initMenu();
let card = null;
let activeSketch = null;

const sketches = SKETCH_PATHS;

barba.init({
	transitions: [
		{
			sync: true,
			once: data => {
				// Initial load
				card = new Card();
				runSketch(data.next);
			},
			enter: ({current, next}) => {
				if (next.namespace === 'homepage') activeSketch = null; // REMOVE ONCE HOMEPAGE LOGIC DONE
				closeMenu();
				runSketch(next);
			},
			leave: async ({ current, next }) => {
				// Close drawer if open
				if (current.namespace !== 'homepage') card.unbindEvents(current.container);

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

async function runSketch(route) {
	const curSketch = sketches.find(el => el === route.namespace);
	if (!curSketch) return;
	return await import(`./js/${curSketch}/index.js`).then(result => {
		if (curSketch !== 'homepage') card.bindEvents(route.container);

		// assigns class instance to variable so we can call destroy method on leave lifecycle hook
		activeSketch = new result.default();
	});
}

function pageTransiton(cur, next) {
	return new Promise(resolve => {
		// Animation handles both current and next pages
		let tl = new TimelineLite();
		tl
		.set(next, {immediateRender: true, autoAlpha: 0, y: -5}, 0)
		.to(cur, .5, {autoAlpha: 0, y: -5}, 0)
		.to(next, 1, { autoAlpha: 1, y: 0, onComplete: () => { resolve(); }}, 1);
	});
}
