import {
  Scene,
  PerspectiveCamera,
  MeshBasicMaterial,
  Mesh,
  PlaneBufferGeometry,
  WebGLRenderer,
  Vector2,
  Vector3,
  MeshLambertMaterial,
  PointLight,
  MeshPhongMaterial,
  DoubleSide,
  AmbientLight,
  TextureLoader,
  LoadingManager,
  DefaultLoadingManager,
  WebGLRenderTarget,
  RGBFormat,
  NearestFilter,
  DepthTexture,
  UnsignedShortType,
} from 'three';
import {
  OBJLoader
} from 'three/examples/jsm/loaders/OBJLoader';
import {
  EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
  RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {
  ShaderPass
} from 'three/examples/jsm/postprocessing/ShaderPass.js';
// import {
//   GlowShaderHori
// } from './glow-shader-x';
// import {
//   GlowShaderVert
// } from './glow-shader-y';
import {
  FogShader
} from './fog-shader';


import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls';

/*
 *  Class for loading and rendering 3D text
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
    this.xVal = 0;
    this.yVal = 0;
    this.curX = window.innerWidth;
    this.curY = window.innerHeight;
    this.canvas = document.getElementById('Fog');
    this.dims = this.canvas.getBoundingClientRect();
    this.bufferFile = `${ASSET_PATH}/assets/building.obj`;

    this.SCENE_LAYER = 0;
    this.GLOW_LAYER = 1;

    this.animate = this.animate.bind(this);
    this.render = this.render.bind(this);
    this.setup = this.setup.bind(this);
    this.processing = this.processing.bind(this);
    this.initLights = this.initLights.bind(this);
    this.updateShader = this.updateShader.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.destroy = this.destroy.bind(this);

    this.init();
  }

  /**
   * Binds event listeners for DOM events
   * @function bindEvents
   * @memberof Fog.prototype
   */
  bindEvents() {
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  /**
   * Callback for mouse move event
   * @function handleMouseMove
   * @memberof Fog.prototype
   */
  handleMouseMove(e) {
    this.xVal = (e.clientX / window.innerWidth) - 0.5;
    this.yVal = (e.clientY / window.innerHeight) - 0.5;
  }

  /**
   * Orders the methods calls for setting up and then rendering scene.
   * @function init
   * @memberof Fog.prototype
   */
  init() {
    this.bindEvents();
    this.initScene();
    this.initCamera();
    this.initLights();
    this.initModel();

    DefaultLoadingManager.onLoad = () => {
      this.setup();
    }
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
    this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.2, 100);

    this.camera.position.z = 40;
    this.camera.position.y = 30;
    this.camera.layers.enable(1);
    this.scene.add(this.camera);
  }

  /**
   * Creates lights and adds to scene
   * @function initLights
   * @memberof Fog.prototype
   */
  initLights() {
    this.light = new PointLight(0xf57dff, .6, 20, .5);
    this.light2 = new PointLight(0xf57d7d, .4, 20, .5);

    this.light.position.set(2, 0, 15);
    this.light2.position.set(-0.5, 3, 5);

    this.light.lookAt(0, 0, 0);
    this.light2.lookAt(0, 0, 0);

    this.scene.add(this.light);
    this.scene.add(this.light2);

    this.light3 = new AmbientLight(0xffffff, 0.5);
    this.scene.add(this.light3);
  }

  /**
   * Creates model for scene
   * @function initModel
   * @memberof Fog.prototype
   */
  initModel() {
    const {
      bufferFile,
      scene,
    } = this;

    const modelLoader = new OBJLoader();

    modelLoader.load(bufferFile, res => {
      [this.mesh] = res.children;
      this.mesh.material = new MeshLambertMaterial({
        color: 0xffffff,
      });
      scene.add(this.mesh);
    }, xhr => {
      // console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    }, err => {
      console.error(err);
    });
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
   * Sets up renderer, calls any other necessary methods and then starts loop
   * @function setup
   * @memberof Fog.prototype
   */
  setup() {
    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvas,
    });

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 10;
    this.controls.maxDistance = 100;

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.curX, this.curY);
    this.processing();
    this.animate();
  }

  /**
   * Sets up post processing of scene
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
        value: 2.0,
      },
      fogColor: {
        value: new Vector3(.8, .8, .8),
      }
    }

    this.fogPass = new ShaderPass(FogShader, 'tDiffuse');

    // Find it nicer to add/update uniforms in object above vs. dot notation
    // tDiffuse texture is already defined when creating pass hence obj.assign
    this.fogPass.uniforms = Object.assign(this.fogPass.uniforms, uniforms);
    this.composer.addPass(this.fogPass);
  }

  /**
   * Updates shader with relevant uniforms
   * @function updateShader
   * @memberof Fog.prototype
   */
  updateShader() {
    this.glowPass.uniforms['texOne'].value.needsUpdate = true;
  }

  /**
   * Creates animation loop
   * @function animate
   * @memberof Fog.prototype
   */
  animate() {
    this.raf = requestAnimationFrame(this.animate);
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
      camera,
      scene,
      composer,
    } = this;
    // this.camera.layers.set(this.GLOW_LAYER);
    // this.glowComposer.render();
    // this.camera.layers.set(this.SCENE_LAYER);
    // this.finalComposer.render();
    composer.render();
  }

  /**
   * Cancels RAF loop and unbinds event handlers
   * @function destroy
   * @memberof Fog.prototype
   */
  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }
}
