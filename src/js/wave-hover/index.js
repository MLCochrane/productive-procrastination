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
		this.container = new PIXI.Container();

		this.displacementSprite;
		this.displacementFitler;
		this.isHovered = false;

		this.delta = {
			num: 1
		}

		this.setScene = this.setScene.bind(this);
		this.bindEvents = this.bindEvents.bind(this);
		this.removeScene = this.removeScene.bind(this);
		this.handleMouseover = this.handleMouseover.bind(this);
		this.handleMouseout = this.handleMouseout.bind(this);

		this.setScene('./src/assets/hover/GalPal.png');
		this.bindEvents();
	}
	
	bindEvents() {
		this.container.on('pointerover', this.handleMouseover);
		this.container.on('pointerout', this.handleMouseout);
	}

	handleMouseover() {
		this.isHovered = true;
	}

	handleMouseout() {
		this.isHovered = false;
	}

	setScene(url) {
		this.playground.appendChild(this.app.view);
		this.app.stage.addChild(this.container);
		this.container.interactive = true;

		const tp = PIXI.Texture.from(url);
		const image = new PIXI.Sprite(tp);

		image.anchor.x = 0;

		this.displacementSprite = PIXI.Sprite.from('./src/assets/hover/displacement.png');
		this.displacementSprite.scale.x = 5;
		this.displacementSprite.scale.y = 5;
		this.displacementSprite.anchor.x = 0.5;

		this.displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
		this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
		this.container.filters = [this.displacementFilter];
		
		this.container.addChild(this.displacementSprite);
		this.container.addChild(image);

		this.animate();
	}

	removeScene() {
		cancelAnimationFrame(raf);
		app.stage.removeChildren();
		app.stage.destroy(true);
		playground.removeChild(this.container);
	}

	animate() {
		this.app.ticker.add((time) => {

			if (this.isHovered) {
				this.delta.num = (this.delta.num < 5) ? this.delta.num + (time / 10) : 5;
			} else {
				this.delta.num = (this.delta.num > 1) ? this.delta.num - (time / 10 ) : 1;
			}

			this.displacementSprite.x -= this.delta.num;
			this.displacementSprite.y += this.delta.num;
		});
	}
}