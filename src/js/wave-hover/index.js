// var width = window.offsetWidth;
// var height = window.offsetHeight;
// var playground = document.getElementsByClassName('project__display')[0];

// var canvas;

// var ratio = 150 / 830;

// var raf;


// var renderer = PIXI.autoDetectRenderer(512, 512, {
// 	transparent: true
// });
// renderer.autoResize = true;
// var tp, preview;
// var displacementSprite,
// 	displacementFilter,
// 	stage;

// function setScene(url) {
// 	playground.appendChild(renderer.view);

// 	stage = new PIXI.Container();

// 	tp = PIXI.Texture.fromImage(url);
// 	preview = new PIXI.Sprite(tp);

// 	preview.anchor.x = 0;

// 	displacementSprite = PIXI.Sprite.fromImage('images/displacement.png');
// 	displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

// 	displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);

// 	displacementSprite.scale.y = 1.5;
// 	displacementSprite.scale.x = 1.5;


// 	stage.addChild(displacementSprite);

// 	stage.addChild(preview);

// 	animate();
// }

// function removeScene() {
// 	cancelAnimationFrame(raf);
// 	stage.removeChildren();
// 	stage.destroy(true);
// 	playground.removeChild(canvas);
// }
// let timer = '';
// playground.interactive = true;

// let tween = function (a) {
// 	if (a == 'up') {
// 		TweenLite.to(delta, 1, {
// 			num: 5
// 		});
// 	}
// 	if (a == 'down') {
// 		TweenLite.to(delta, 1, {
// 			num: 2
// 		});
// 	}
// }
// playground.addEventListener('mouseenter', () => {
// 	tween('up');
// });
// playground.addEventListener('mouseleave', () => {
// 	tween('down');
// });
// playground.addEventListener('mouseover', () => {

// })
// var delta = {
// 	num: 1
// };

// function animate() {
// 	raf = requestAnimationFrame(animate);

// 	displacementSprite.x += delta.num;
// 	displacementSprite.y += delta.num;

// 	stage.filters = [displacementFilter];

// 	renderer.render(stage);

// 	canvas = playground.querySelector('canvas');
// }

// setScene('images/GalPal.png');


// function moveBtn() {
// 	let el = document.getElementsByClassName('project__button-text')[0];
// 	el.style.transform = 'translateX(5px)';
// }


export default () => {
	console.log('this would be the ting!');
}