import {
  Scene,
  WebGLRenderTarget,
  WebGLRenderer,
  RGBFormat,
  NearestFilter,
  DepthTexture,
  UnsignedShortType,
  PerspectiveCamera,
  PointLight,
  AmbientLight,
  TorusKnotBufferGeometry,
  MeshLambertMaterial,
  Mesh,
  Vector3,
} from 'three';
import {
  EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer';
import {
  RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass';
import {
  ShaderPass
} from 'three/examples/jsm/postprocessing/ShaderPass';
import {
  FogShader
} from './fog-shader';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/*
 *  Class for threejs fog scene
 */

export default class Fog {
  /**
   * Initlaizes variables for class instance.
   */
  constructor() {
    this.renderer;
    this.scene;
    this.camera;
    this.mesh;
    this.canvas = document.getElementById('Fog');
    this.dims = this.canvas.getBoundingClientRect();
    this.startTime = Date.now();

    this.animate = this.animate.bind(this);
    this.render = this.render.bind(this);
    this.setup = this.setup.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.processing = this.processing.bind(this);
    // this.initFog = this.initFog.bind(this);

    this.bindEvents();
    this.init();
  }

  /**
   * Binds event listeners for DOM events
   * @function bindEvents
   * @memberof Fog.prototype
   */
  bindEvents() {
    window.addEventListener('resize', this.handleResize);
  }

  /**
   *
   * @function destroy
   * @memberof Fog.prototype
   */
  destroy() {
    window.removeEventListener('resize', this.handleResize);
    cancelAnimationFrame(this.id);
  }

  /**
   * Callback for resize event
   * @function handleResize
   * @memberof Fog.prototype
   */
  handleResize() {
    this.onWindowResize();
  }

  /**
   * Callback passed to resize event to handle updating camera and renderer size
   * @function onWindowResize
   * @memberof Fog.prototype
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Orders the methods calls for setting up and then rendering scene.
   * @function init
   * @memberof Fog.prototype
   */
  init() {
    this.initScene();
    this.initCamera();
    this.initLights();
    // this.initFog();
    this.initGeo();
  }

  /**
   * Creates new threejs scene and assigns to class instance
   * @function initScene
   * @memberof Fog.prototype
   */
  initScene() {
    this.scene = new Scene();

    this.target = new WebGLRenderTarget(window.innerWidth, window.innerHeight);
    this.target.texture.format = RGBFormat;
    this.target.texture.minFilter = NearestFilter;
    this.target.texture.magFilter = NearestFilter;
    this.target.texture.generateMipmaps = false;
    this.target.stencilBuffer = false;
    this.target.depthBuffer = true;
    this.target.depthTexture = new DepthTexture();
    this.target.depthTexture.type = UnsignedShortType;
  }

  /**
   * Creates new threejs camera and adds to scene
   * @function initCamera
   * @memberof Fog.prototype
   */
  initCamera() {
    this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 70);

    this.camera.position.z = 30;
    this.scene.add(this.camera);
  }

  /**
   * Init geos
   * @function initGeo
   * @memberof Fog.prototype
   */
  initGeo() {
    const geo = new TorusKnotBufferGeometry(1, 0.3, 128, 64);
    const mat = new MeshLambertMaterial({
      color: 0xff0f00,
    });

    const count = 30;
    const scale = 10;

    for (let i = 0; i < count; i++) {
      const r = Math.random() * 2.0 * Math.PI;
      const z = (Math.random() * 2.0) - 1.0;
      const zScale = Math.sqrt(1.0 - z * z) * scale;
      const mesh = new Mesh(geo, mat);
      mesh.position.set(
        Math.cos(r) * zScale,
        Math.sin(r) * zScale,
        z * scale
      );
      mesh.rotation.set(Math.random(), Math.random(), Math.random());
      this.scene.add(mesh);
    }

    this.setup();
  }

  /**
   * Adds lights to the scene
   * @function initLights
   * @memberof Fog.prototype
   */
  initLights() {
    this.light = new PointLight(0xf57d7d, .6, 20, .5);
    this.light2 = new PointLight(0xf57d7d, .4, 20, .5);

    this.light.position.set(2, 0, -5);
    this.light2.position.set(-0.5, 3, 5);

    this.light.lookAt(0, 0, 0);
    this.light2.lookAt(0, 0, 0);

    this.scene.add(this.light);
    this.scene.add(this.light2);

    this.light3 = new AmbientLight(0xffffff, 0.5);
    this.scene.add(this.light3);
  }

  /**
   * Sets up renderer, controls, and starts animation loop
   * @function setup
   * @memberof Fog.prototype
   */
  setup() {
    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvas,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 10;
    this.controls.maxDistance = 100;

    this.processing();
    this.animate();
  }

  /**
   * Setting up effect composer and post processing passes
   * @function processing
   * @memberof Fog.prototype
   */
  processing() {
    const {
      renderer,
      scene,
      camera,
      target,
    } = this;

    this.composer = new EffectComposer(renderer, target);
    this.composer.addPass(new RenderPass(scene, camera));

    const uniforms = {
      cameraNear: {
        value: camera.near
      },
      cameraFar: {
        value: camera.far
      },
      tDepth: {
        value: this.composer.renderTarget2.depthTexture
      },
      intensity: {
        value: 1.0,
      },
      fogColor: {
        value: new Vector3(.1, .1, 0.1),
      }
    }

    this.fogPass = new ShaderPass(FogShader, 'tDiffuse');

    // Find it nicer to add/update uniforms in object above vs. dot notation
    // tDiffuse texture is already defined when creating pass hence obj.assign
    this.fogPass.uniforms = Object.assign(this.fogPass.uniforms, uniforms);
    this.composer.addPass(this.fogPass);
  }

  /**
   * Creates animation loop
   * @function animate
   * @memberof Fog.prototype
   */
  animate() {
    this.id = requestAnimationFrame(this.animate);

    this.controls.update();

    this.render();
  }

  /**
   * Simply renders scene with instance's scene and camera
   * @function render
   * @memberof Fog.prototype
   */
  render() {
    const {
      composer,
      fogPass,
    } = this;
    const delta = this.startTime - Date.now();


    // fogPass.uniforms['intensity'].value = Math.abs(Math.sin(delta * 0.0001)) * 2.0;
    composer.render();
  }
}
