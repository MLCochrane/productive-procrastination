const burger = document.getElementById('ToggleNav');
const menu = document.getElementById('MainNav');
const close = document.querySelector('.header__sec--right');

export function closeMenu() {
  if (menu.classList.contains('isactive') && burger.classList.contains('menu-open')) {
    menu.classList.toggle('isactive');
    burger.classList.toggle('menu-open');
  }
}

export function initMenu() {
  burger.addEventListener('click', (e) => {
    e.stopPropagation();

    menu.classList.toggle('isactive');
    burger.classList.toggle('menu-open');
  });

  close.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenu();
  });
}
