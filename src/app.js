import './scss/app.scss';
import barba from '@barba/core';
import { TimelineLite } from 'gsap';


let slider;

barba.init({
	transitions: [
		{
			sync: true,
			appear: data => {
				// Initial load
				header();

				if (data.current.namespace === 'contact') {
					return;
				}
			},
			enter: data => {
				if (data.current.namespace === 'contact') {
					return;
				}
			},
			leave: async ({ current, next }) => {
				// Close drawer if open
				document.getElementById('MobileNav').classList.remove('active');

				await pageTransiton(current.container, next.container);

				// Removed after transition done allowing slider events to fire again
				document.body.classList.replace('is-animating', 'not-animating');
			}
		}
	]
});

function pageTransiton(cur, next) {
	return new Promise(resolve => {
		// Used to ensure slider events not called between pages when the current Slider class is changing
		document.body.classList.replace('not-animating', 'is-animating');

		// Animation handles both current and next pages
		let tl = new TimelineLite();
		tl
		.set(next, {autoAlpha: 0, y: -5}, 0)
		.to(cur, .5, {autoAlpha: 0, y: -5}, 0)
		.to(next, 1, { autoAlpha: 1, y: 0, onComplete: () => { resolve(); }}, 1);
	});
}
