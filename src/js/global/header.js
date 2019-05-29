export default () => {
	const burger = document.getElementById('ToggleNav');
	const menu = document.getElementById('MainNav');

	burger.addEventListener('click', () => {
		menu.classList.toggle('isactive');
		burger.classList.toggle('menu-open');
	});
}