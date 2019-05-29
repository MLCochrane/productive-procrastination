import './scss/app.scss';
import barba from '@barba/core';
import { TimelineLite } from 'gsap';

// import Loader from './js/loader';

import { initMenu, closeMenu, } from './js/global/header';
import Card from './js/global/card';

// Global header logic
initMenu();
let card;

const sketches = [
	{
		"namespace": "scroll",
		"path": 'js/scroll-loop/index'
	},
	{
		"namespace": "floating-text",
		"path": 'js/floating-text/index'
	}
]

barba.init({
	transitions: [
		{
			sync: true,
			appear: data => {
				// Initial load
				card = new Card();
				card.bindEvents(data.current.container);
				runSketch(data.current.namespace);
			},
			enter: ({current, next}) => {
				closeMenu();

				card.bindEvents(next.container);
				runSketch(next.namespace);
			},
			leave: async ({ current, next }) => {
				// Close drawer if open
				card.unbindEvents(current.container);

				await pageTransiton(current.container, next.container);
			}
		}
	]
});

async function runSketch(namespace) {
	const curSketch = sketches.find(el => el.namespace === namespace);
	if (curSketch) {
		
		await import('./' + curSketch.path + '.js').then(result => {
			return new result.default();
		});
	}
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
