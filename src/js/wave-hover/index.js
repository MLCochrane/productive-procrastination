import * as PIXI from 'pixi.js';

/*
 *  Class for simple PixiJS displacement map sketch
 */
export default class HoverMap {
	constructor() {
		/**
		 * Initlaizes variables for class instance.
		 */
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

		this.setScene(`${ASSET_PATH}/assets/hover/Hover-Image.jpg`);
		this.bindEvents();
	}

	/**
	 * Binds event listeners for DOM events
	 * @function bindEvents
	 * @memberof HoverMap.prototype
	 */
	bindEvents() {
		this.container.on('pointerover', () => this.isHovered = true);
		this.container.on('pointerout', () => this.isHovered = false);
	}

	/**
	 * Sets up scene, loads assets and starts animation
	 * @function setScene
	 * @memberof HoverMap.prototype
	 */
	setScene(url) {
		this.playground.appendChild(this.app.view);
		this.app.stage.addChild(this.container);
		this.container.interactive = true;

		const tp = PIXI.Texture.from(url);
		const image = new PIXI.Sprite(tp);

		image.anchor.x = 0;

		this.displacementSprite = PIXI.Sprite.from(`${ASSET_PATH}/assets/hover/displacement.png`);
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

	/**
	 * Updates displacement sprite based on time and hover status
	 * @function animate
	 * @memberof HoverMap.prototype
	 */
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

	/**
	 * Destroys app and children
	 * @function destroy
	 * @memberof HoverMap.prototype
	 */
	destroy() {
		this.app.destroy(false, {
			children: true,
		});
	}
}