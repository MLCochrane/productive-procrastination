export default function lazyBoi() {
	let images = [];

	const lazyImageObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const lazyImage = entry.target as HTMLImageElement;
				lazyImage.src = lazyImage.dataset.src as string;
				lazyImage.srcset = lazyImage.dataset.srcset as string;
				lazyImage.sizes = lazyImage.dataset.sizes as string;
				lazyImage.setAttribute('data-im-lazy', 'notlazy');
				lazyImageObserver.unobserve(lazyImage);
				lazyImage.removeAttribute('data-sizes');
				lazyImage.removeAttribute('data-srcset');
			}
		});
	});

	return {
		fillImages() {
			images = Array.from(document.querySelectorAll('[data-im-lazy="solazy"]'));
			images.forEach((item) => lazyImageObserver.observe(item));
		},
		clearImages() {
			images = [];
		},
	};
}
