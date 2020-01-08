import './scss/app.scss';
import barba from '@barba/core';
import { TimelineLite } from 'gsap';

import { initMenu, closeMenu, } from './js/global/header';
import Card from './js/global/card';

// Global header logic
initMenu();
let card;
let activeSketch;

const sketches = [
	{
		'namespace': 'scroll-loop',
		'path': 'js/scroll-loop/index',
		'constructor': []
	},
	{
		'namespace': 'floating-text',
		'path': 'js/floating-text/index',
		'constructor': []
	},
	{
		'namespace': 'wave-hover',
		'path': 'js/wave-hover/index',
		'constructor': []
	},
	{
		'namespace': 'cutout-slider',
		'path': 'js/cutout-slider/index',
		'constructor': []
	},
	{
		'namespace': 'inverse-scroll',
		'path': 'js/inverse-scroll/index',
		'constructor': []
	},
	{
		'namespace': 'post-process',
		'path': 'js/post-process/index',
		'constructor': []
	},
	{
		'namespace': 'glow-process',
		'path': 'js/glow-process/index',
		'constructor': []
	},
	{
		'namespace': 'wave-sim',
		'path': 'js/wave-sim/index',
		'constructor': []
	},
	{
		'namespace': 'fog',
		'path': 'js/fog/index',
		'constructor': []
	},
]

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
				closeMenu();
				runSketch(next);
			},
			leave: async ({ current, next }) => {
				// Close drawer if open
				if (current.namespace !== 'home') card.unbindEvents(current.container);

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
	const curSketch = sketches.find(el => el.namespace === route.namespace);
	if (!curSketch) return;
	return await import('./' + curSketch.path + '.js').then(result => {
		card.bindEvents(route.container);

		// assigns class instance to variable so we can call destroy method on leave lifecycle hook
		activeSketch = new result.default(curSketch.constructor);
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
