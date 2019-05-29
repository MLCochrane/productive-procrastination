const burger = document.getElementById('ToggleNav');
const menu = document.getElementById('MainNav');
const page = document.getElementsByClassName('page-main')[0];

export function initMenu() {
	burger.addEventListener('click', e => {
		e.stopPropagation();

		menu.classList.toggle('isactive');
		burger.classList.toggle('menu-open');
	});

	page.addEventListener('click', e => {
		// WILL ONLY WORK ON FIRST PAGE
		// Rebind page node on transition
		
		e.stopPropagation();

		closeMenu();
	});
}

export function closeMenu() {
	if (menu.classList.contains('isactive') && burger.classList.contains('menu-open')) {
		menu.classList.toggle('isactive');
		burger.classList.toggle('menu-open');
	}
}