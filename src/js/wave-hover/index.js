import * as PIXI from 'pixi.js';

export default class HoverMap {
	constructor() {
		this.app = new PIXI.Application({
			autoResize: true,
			width: 512,
			height: 512,
			resolution: devicePixelRatio
		});
		this.playground = document.getElementsByClassName('project__display')[0];
		this.container;

		this.displacementSprite;
		this.displacementFitler;

		this.delta = {
			num: 1
		}

		this.setScene = this.setScene.bind(this);
		this.removeScene = this.removeScene.bind(this);

		this.setScene('./src/assets/hover/GalPal.png');
	}

	setScene(url) {
		this.playground.appendChild(this.app.view);
		this.container = new PIXI.Container();

		this.app.stage.addChild(this.container);

		const tp = PIXI.Texture.from(url);
		const image = new PIXI.Sprite(tp);

		image.anchor.x = 0;

		this.displacementSprite = PIXI.Sprite.from('./src/assets/hover/displacement.png');
		this.displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
		this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);

		this.container.addChild(this.displacementSprite);
		this.container.addChild(image);

		this.displacementFilter.scale.x = 20;
		this.displacementFilter.scale.y = 30;

		this.container.filters = [this.displacementFilter];
		this.animate();
	}

	removeScene() {
		cancelAnimationFrame(raf);
		app.stage.removeChildren();
		app.stage.destroy(true);
		playground.removeChild(this.container);
	}

	animate() {
		this.app.ticker.add(() => {
			this.displacementSprite.x += this.delta.num;
			this.displacementSprite.y += this.delta.num;
		});
	}
}
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