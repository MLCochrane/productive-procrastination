let box = document.getElementsByClassName('wrap')[0];
let title = document.getElementsByClassName('item');
let border = document.getElementById('border');
let button = document.getElementById('button');
let button1 = document.getElementById('button1');
let one = document.getElementById('one');
let two = document.getElementById('two');
let shade = document.getElementById('shade');
let image = document.getElementsByClassName('image')[0];
let tl = new TimelineMax()
let test = -(window.innerWidth) / 2
let count = 1;

window.addEventListener('load', () => {
	TweenMax.to(box, 0, {
		css: {
			backgroundColor: "rgb(231, 174, 0)"
		}
	});
	TweenMax.to(border, 0, {
		fill: "rgb(231, 174, 0)"
	});
	TweenMax.to(one, 0, {
		width: "417px"
	});
	TweenMax.to(two, 0, {
		width: "417px"
	});
});

tl
	.to(title, 0, {
		x: 0
	})
	.addPause()
	.to(title, 2, {
		x: -800,
		ease: Power3.easeOut
	})
	.to(box, 1, {
		css: {
			backgroundColor: "rgb(2, 120, 254)"
		}
	}, 0)
	.to(border, 1, {
		fill: "rgb(2, 120, 254)"
	}, 0)
	.to(one, 1, {
		width: "200px"
	}, 0)
	.to(two, 1, {
		width: "500px",
		x: "20px"
	}, 0)
	.to(shade, 1.75, {
		fill: "rgb(2, 120, 254)",
		x: "1500px"
	}, 0)
	.set(image, {
		background: "url(../reed_vr-sessions_cover.jpg)"
	}, .5)
	.addPause()
	.to(title, 2, {
		x: -1600,
		ease: Power3.easeOut
	})
	.to(box, 1, {
		css: {
			backgroundColor: "rgb(191, 175, 160)"
		}
	}, 2)
	.to(border, 1, {
		fill: "rgb(191, 175, 160)"
	}, 2)
	.to(one, 1, {
		width: "320px",
		x: "200px"
	}, 2)
	.to(two, 1, {
		width: "400px",
		x: "-50px"
	}, 2)
	.to(shade, 1.75, {
		fill: "rgb(191, 175, 160)",
		x: "0px"
	}, 2)
	.set(image, {
		background: "url(../reed_le-voyagist_cover.jpg)"
	}, 2.5)
	.addPause()
	.to(title, 2, {
		x: -2400,
		ease: Power3.easeOut
	})
	.to(box, 1, {
		css: {
			backgroundColor: "rgb(204, 165, 151)"
		}
	}, 4)
	.to(border, 1, {
		fill: "rgb(204, 165, 151)"
	}, 4)
	.to(one, 1, {
		width: "200px",
		x: "50px"
	}, 4)
	.to(shade, 1.75, {
		fill: "rgb(204, 165, 151)",
		x: "1500px"
	}, 4)
	.to(two, 1, {
		width: "600px",
		x: "100px"
	}, 4)
	.set(image, {
		background: "url(../reed_riftworld_cover.jpg)"
	}, 4.5)
	.addPause()
	.to(title, 2, {
		x: -3200,
		ease: Power3.easeOut
	})
	.to(box, 1, {
		css: {
			backgroundColor: "rgb(0, 255, 153)"
		}
	}, 6)
	.to(border, 1, {
		fill: "rgb(0, 255, 153)"
	}, 6)
	.to(one, 1, {
		width: "200px",
		x: "0px"
	}, 6)
	.to(shade, 1.75, {
		fill: "rgb(0, 255, 153)",
		x: "0px"
	}, 6);


button.addEventListener('click', () => {
	tl.play();
});

button1.addEventListener('click', () => {
	tl.time(0);
	tl.pause();
});
