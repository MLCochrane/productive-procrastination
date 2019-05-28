import { TimelineMax } from 'gsap';

export default () => {
	const burger = document.getElementById('ToggleNav');
	const menu = document.getElementById('MainNav');
	const burgOne = document.querySelector('.burger__element--top');
	const burgTwo = document.querySelector('.burger__element--bottom');

	const tl = new TimelineMax();
	let isOpen = false;

	tl.paused(true);

	tl
		.to(burgOne, .25, { y: '7.5', ease: Power3.easeInOut }, 0)
		.to(burgTwo, .25, { y: '-7.5', ease: Power3.easeInOut }, 0)
		.to(burgOne, .25, { rotation: 45, transformOrigin: "50% 50%", ease: Power3.easeInOut }, .25)
		.to(burgTwo, .25, { rotation: '-45', transformOrigin: "50% 50%", ease: Power3.easeInOut }, .25);

	burger.addEventListener('click', () => {
		!isOpen ? tl.play() : tl.reverse();
		isOpen = !isOpen;

		menu.classList.toggle('isactive');
		burger.classList.toggle('menu-open');
	});
}