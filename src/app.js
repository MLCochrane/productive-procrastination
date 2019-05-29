import './scss/app.scss';
import barba from '@barba/core';
import { TimelineLite } from 'gsap';

// import Loader from './js/loader';

import header from './js/global/header';
import Card from './js/global/card';
import ScrollingProjects from './js/scroll-loop/scroll-loop';

// Global header logic
header();
let card;

const sketches = [
	{
		"title": "scroll",
		"init": new ScrollingProjects()
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

			},
			enter: ({current, next}) => {
				card.bindEvents(next.container);
				sketches[0].init();
			},
			leave: async ({ current, next }) => {
				// Close drawer if open
				card.unbindEvents(current.container);

				await pageTransiton(current.container, next.container);
			}
		}
	]
});

function pageTransiton(cur, next) {
	return new Promise(resolve => {
		// Animation handles both current and next pages
		let tl = new TimelineLite();
		tl
		.set(next, {autoAlpha: 0, y: -5}, 0)
		.to(cur, .5, {autoAlpha: 0, y: -5}, 0)
		.to(next, 1, { autoAlpha: 1, y: 0, onComplete: () => { resolve(); }}, 1);
	});
}
