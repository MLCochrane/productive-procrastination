import * as THREE from 'three';

/*
 *  Class for loading and rendering 3D text
 */

export default class FloatingText {
	/**
	 * Initlaizes variables for class instance.
	 */
	constructor() {
		this.renderer;
		this.scene;
		this.camera;
		this.mesh;
		this.xVal = 0;
		this.yVal = 0;
		this.curX = window.innerWidth;
		this.curY = window.innerHeight;
		this.canvas = document.getElementById('FloatingText');
		this.dims = this.canvas.getBoundingClientRect();
		this.bufferFile = `${ASSET_PATH}/assets/floating-text.json`;

		this.animate = this.animate.bind(this);
		this.setup = this.setup.bind(this);

		this.bindEvents();
		this.init();
	}

	/**
	 * Binds event listeners for DOM events
	 * @function bindEvents
	 * @memberof FloatingText.prototype
	 */
	bindEvents() {
		window.addEventListener('resize', () => {
			this.onWindowResize();
		});

		window.addEventListener('mousemove', e => {
			this.xVal = (e.clientX / window.innerWidth) - 0.5;
			this.yVal = (e.clientY / window.innerHeight) - 0.5;
		});
		window.addEventListener('click', () => {
			this.renderer.setPixelRatio(window.devicePixelRatio);
		});
	}

	/**
	 * Orders the methods calls for setting up and then rendering scene.
	 * @function init
	 * @memberof FloatingText.prototype
	 */
	init() {
		this.initScene();
		this.initCamera();
		this.initText(this.bufferFile);
	}

	/**
	 * Creates new threejs scene and assigns to class instance
	 * @function initScene
	 * @memberof FloatingText.prototype
	 */
	initScene() {
		this.scene = new THREE.Scene();
	}

	/**
	 * Creates new threejs camera and adds to scene
	 * @function initCamera
	 * @memberof FloatingText.prototype
	 */
	initCamera() {
		const distance = 3.5;
		const aspect = (window.innerWidth / 2) / (window.innerWidth / 4);

		this.camera = new THREE.OrthographicCamera(
			distance * aspect / - 2,
			distance * aspect / 2,
			distance / 2,
			distance / - 2, 0.8, 20
		);

		this.camera.position.z = 8;
		this.scene.add(this.camera);
	}

	/**
	 * Creates new threejs camera and adds to scene
	 * @function initText
	 * @memberof FloatingText.prototype
	 * @param {String} bufferFile - String representing path to buffer geometry file to load
	 */
	initText(bufferFile) {
		var loader = new THREE.BufferGeometryLoader();
		loader.load(bufferFile, geo => {
			// Add the loaded object to the scene
			const mat1 = new THREE.MeshBasicMaterial({ color: 0xffffff });
			const mat2 = new THREE.MeshBasicMaterial({ color: 0x000000 });

			// Materials passed in to group materialIndex
			const object = new THREE.Mesh(geo, [mat1, mat2]);
			this.mesh = object;
			this.scene.add(object);
			this.setup(object);
		}, xhr => {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		}, err => {
			console.error(err);
		});
	}

	/**
	 * Callback passed to resize event to handle updating camera and renderer size
	 * @function onWindowResize
	 * @memberof FloatingText.prototype
	 */
	onWindowResize() {
		this.camera.aspect = (window.innerWidth / 2) / (window.innerWidth / 4);
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth / 2, window.innerWidth / 4);
	}

	/**
	 *
	 * @function setup
	 * @memberof FloatingText.prototype
	 */
	setup() {
		this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas, alpha: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.dims.width, this.dims.height);
		this.animate();
	}

	/**
	 * Creates animation loop
	 * @function animate
	 * @memberof FloatingText.prototype
	 */
	animate() {
		requestAnimationFrame(this.animate);

		this.mesh.rotation.x = (this.yVal);
		this.mesh.rotation.y = (this.xVal);
		this.render();
	}

	/**
	 * Simply renders scene with instance's scene and camera
	 * @function render
	 * @memberof FloatingText.prototype
	 */
	render() {
		this.renderer.render(this.scene, this.camera);
	}
}
