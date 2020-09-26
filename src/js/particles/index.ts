import {
  Scene,
  PerspectiveCamera,
  Mesh,
  Geometry,
  WebGLRenderer,
  Vector3,
  PointLight,
  DefaultLoadingManager,
  PointsMaterial,
  Points,
  Clock,
} from 'three';

import ParticleSystem from './particleSystem';

/*
 *  Class for loading and rendering 3D text
 */

export default class Particles {
  renderer: WebGLRenderer | null;
  scene: Scene | null;
  camera: PerspectiveCamera | null;
  mesh: Points | null;
  xVal: number;
  yVal: number;
  curX: number;
  curY: number;
  canvas: HTMLElement | null;
  particles: ParticleSystem | null;
  dims: any;
  bufferFile: string;
  texturesLoaded: boolean;
  light: PointLight | null;
  textures: any;
  pixelPass: any | null;
  raf: number | null;
  clock: Clock;
  /**
   * Initlaizes variables for class instance.
   */
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.mesh = null;
    this.xVal = 0;
    this.yVal = 0;
    this.curX = window.innerWidth;
    this.curY = window.innerHeight;
    this.canvas = document.getElementById('Particles') as HTMLCanvasElement;
    this.dims = this.canvas.getBoundingClientRect();
    this.bufferFile = `${ASSET_PATH}/assets/skull.obj `;

    this.animate = this.animate.bind(this);
    this.render = this.render.bind(this);
    this.setup = this.setup.bind(this);
    this.initLights = this.initLights.bind(this);
    this.initParticles = this.initParticles.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.destroy = this.destroy.bind(this);

    this.light = null;
    this.raf = null;
    this.particles = null;

    this.texturesLoaded = false;
    this.clock = new Clock(true);

    this.bindEvents();
    this.init();
  }

  /**
   * Binds event listeners for DOM events
   * @function bindEvents
   * @memberof Particles.prototype
   */
  bindEvents() {
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  /**
   * Callback for handling mouse movements
   * @function handleMouseMove
   * @memberof Particles.prototype
   */
  handleMouseMove(e: MouseEvent) {
    // console.log(e);
  }

  /**
   * Orders the methods calls for setting up and then rendering scene.
   * @function init
   * @memberof Particles.prototype
   */
  init() {
    this.initScene();
    this.initCamera();
    this.initParticles();
    // this.initLights();
  }

  /**
   * Creates new threejs scene and assigns to class instance
   * @function initScene
   * @memberof Particles.prototype
   */
  initScene() {
    this.scene = new Scene();
  }

  /**
   * Creates new threejs camera and adds to scene
   * @function initCamera
   * @memberof Particles.prototype
   */
  initCamera() {
    this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 50);

    this.camera.position.z = 5;
    this.scene?.add(this.camera);
  }

  /**
   * Creates particles.
   * @function initParticles
   * @memberof Particles.prototype
   */
  initParticles() {
    this.particles = new ParticleSystem({});
    this.scene?.add(this.particles);
    this.setup();
  }

  /**
   * Creates lights and adds to scene
   * @function initLights
   * @memberof Particles.prototype
   */
  initLights() {
    this.light = new PointLight(0xffffff, 10, 10, 2);
    this.light.position.set(-5, 5, 5);
    this.light.lookAt(0, 0, 0);
    this.scene?.add(this.light);
  }

  /**
   * Callback passed to resize event to handle updating camera and renderer size
   * @function onWindowResize
   * @memberof Particles.prototype
   */
  onWindowResize() {
    this.camera?.updateProjectionMatrix();
    // this.renderer?.setSize(this.curX, this.curY);
  }

  /**
   * Sets up renderer, calls any other necessary methods and then starts loop
   * @function setup
   * @memberof Particles.prototype
   */
  setup() {
    DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (itemsLoaded === itemsTotal) this.texturesLoaded = true;
    };

    console.log(this.particles);

    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvas as HTMLCanvasElement,
      alpha: true,
    });
    this.renderer?.setPixelRatio(window.devicePixelRatio);
    this.renderer?.setSize(this.curX, this.curY);
    this.animate();
  }

  /**
   * Creates animation loop
   * @function animate
   * @memberof Particles.prototype
   */
  animate() {
    const {
      animate,
      particles,
      clock,
      render,
    } = this;
    this.raf = requestAnimationFrame(animate);

    const spawnerOptions = {
      spawnRate: 10000,
      timeScale: 1,
    };

    const delta = clock.getDelta() * spawnerOptions.timeScale;
    // console.log(delta);
    const theta = Math.random() * 360;
    const phi = Math.random() * 360;
    const emission = {
      position: new Vector3(
        Math.cos(theta) * Math.sin(phi),
        Math.sin(theta) * Math.sin(phi),
        Math.sin(phi),
      ),
      velocity: new Vector3(0, -0.2, 0),
      acceleration: new Vector3(0, 0.1, 0),
    };

    if (delta > 0) {
      //spawn the correct number of particles for this frame based on the spawn rate
      for ( let x = 0; x < spawnerOptions.spawnRate * delta; x++ ) {
        particles?.spawnParticle(emission);
      }
    }

    particles?.updateTick(clock.getElapsedTime());

    render();
  }

  /**
   * Simply renders scene with instance's scene and camera
   * @function render
   * @memberof Particles.prototype
   */
  render() {
    const {
      scene,
      camera,
    } = this;

    this.renderer?.render(scene as Scene, camera as PerspectiveCamera);
  }

  /**
   * Cancels RAF loop and unbinds event handlers
   * @function destroy
   * @memberof Particles.prototype
   */
  destroy() {
    const {
      raf,
      handleMouseMove,
      onWindowResize,
    } = this;

    cancelAnimationFrame(raf as number);
    window.addEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', onWindowResize);
  }
}
