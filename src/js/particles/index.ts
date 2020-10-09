import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  PointLight,
  DefaultLoadingManager,
  Points,
  Clock,
  Color,
  AdditiveBlending,
  Vector2,
} from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { BloomShader } from './bloom-shader';
import { BlendShader } from './blend-shader';
import ParticleSystem from './particleSystem';

/*
 *  Class for loading and rendering 3D text
 */

export default class Particles {
  renderer: WebGLRenderer | null;
  composer: EffectComposer | null;
  finalComposer: EffectComposer | null;
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
  tick: number;
  /**
   * Initlaizes variables for class instance.
   */
  constructor() {
    this.renderer = null;
    this.composer = null;
    this.finalComposer = null;
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
    this.tick = 0;

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
    this.xVal = e.pageX / this.curX;
    this.yVal = e.pageY / this.curY;
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
    this.particles = new ParticleSystem({
      maxParticles: 300000,
      blending: AdditiveBlending,
    });
    // this.particles.position.z = ;
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
    const {
      scene,
      camera,
      canvas,
    } = this;

    DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (itemsLoaded === itemsTotal) this.texturesLoaded = true;
    };

    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: canvas as HTMLCanvasElement,
      // alpha: true,
    });
    this.renderer?.setPixelRatio(window.devicePixelRatio);
    this.renderer?.setSize(this.curX, this.curY);

    this.composer = new EffectComposer(this.renderer as WebGLRenderer);
    this.composer.addPass(new RenderPass(scene as Scene, camera as PerspectiveCamera));

    // First pass...
    const horizontalPass = new ShaderPass(BloomShader, 'texOne');
		(horizontalPass.uniforms as any).resolution.value = new Vector2(
			window.innerWidth,
			window.innerHeight
		);
    (horizontalPass.uniforms as any).resolution.value.multiplyScalar(window.devicePixelRatio);
    (horizontalPass.uniforms as any).direction.value = 0;

    // Second pass...
    const verticalPass = new ShaderPass(BloomShader, 'texOne');
		(verticalPass.uniforms as any).resolution.value = new Vector2(
			window.innerWidth,
			window.innerHeight
		);
    (verticalPass.uniforms as any).resolution.value.multiplyScalar(window.devicePixelRatio);
    (verticalPass.uniforms as any).direction.value = 1;

    this.composer.renderToScreen = false;
    this.composer.addPass(horizontalPass);
    this.composer.addPass(verticalPass);

    const finalPass = new ShaderPass(BlendShader, 'texOne') as any;
    finalPass.uniforms.glowTexture.value = this.composer.renderTarget2.texture;
    finalPass.needsSwap = true;

    this.finalComposer = new EffectComposer(this.renderer as WebGLRenderer);
    this.finalComposer?.addPass(new RenderPass(scene as Scene, camera as PerspectiveCamera));
    this.finalComposer?.addPass(finalPass);

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
      xVal,
      yVal,
    } = this;
    this.raf = requestAnimationFrame(animate);

    const spawnerOptions = {
      spawnRate: 100,
      timeScale: 0.5,
    };

    const delta = clock.getDelta() * spawnerOptions.timeScale;
    this.tick += delta;

    if ( this.tick < 0 ) this.tick = 0;

    if (delta > 0) {
      /**
       * Spawns particles based on the spawn rate and delta. So in theory
       * it should spawn our number in spawnRate over 1 second.
       *
       * Note that with this current logic it will spawn at a MINIMUM
       * one particle every frame. Because of this, particles will be
       * overwritten if the MAX_PARTICLES is less than the spawn rate * life.
       *
       * Perhaps adding in a check with this.tick could skip the spawning
       *
       */
      for ( let x = 0; x < spawnerOptions.spawnRate; x++ ) {
        const theta = (particles as ParticleSystem).lookup() * 360;
        const phi = (particles as ParticleSystem).lookup() * 360;
        const radius = .5;

        const position = new Vector3(
          Math.cos(theta) * radius,
          Math.sin(theta) * radius,
          Math.sin(phi) * radius,
        );
        const emission = {
          position,
          velocity: new Vector3(position.x, position.y, position.z),
          acceleration: new Vector3(
            (particles as ParticleSystem).lookup(),
            (particles as ParticleSystem).lookup(),
            (particles as ParticleSystem).lookup(),
          ),
          color: new Color(
            position.y * 0.5 + 0.5,
            position.x * 0.5 + 0.5,
            1.0
          ),
          endColor: new Color(
            1.0,
            1.0,
            1.0,
          ),
          lifeTime: 3.,
          size: 40,
        };
        particles?.spawnParticle(emission);
      }
    }

    particles?.updateTick(this.tick);
    render();
  }

  /**
   * Simply renders scene with instance's scene and camera
   * @function render
   * @memberof Particles.prototype
   */
  render() {
    this.composer?.render();
    this.finalComposer?.render();
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
