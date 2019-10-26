import {
  Scene,
  PerspectiveCamera,
  MeshBasicMaterial,
  Mesh,
  PlaneBufferGeometry,
  VideoTexture,
  TextureLoader,
  WebGLRenderer,
  Vector2,
  RepeatWrapping,
  NearestFilter,
  MeshLambertMaterial,
  PointLight,
  DefaultLoadingManager,
  BoxBufferGeometry,
  MeshNormalMaterial,
  WebGLRenderTarget,
} from 'three';
import {
  EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
  RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {
  ShaderPass
} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {
  GlowShaderHori
} from './glow-shader-x';
import {
  GlowShaderVert
} from './glow-shader-y';
import {
  FinalShaderPass
} from './final-pass-shader';

/*
 *  Class for loading and rendering 3D text
 */

export default class GlowProcess {
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
    this.canvas = document.getElementById('GlowProcess');
    this.dims = this.canvas.getBoundingClientRect();

    this.SCENE_LAYER = 0;
    this.GLOW_LAYER = 1;

    this.animate = this.animate.bind(this);
    this.setup = this.setup.bind(this);
    this.processing = this.processing.bind(this);
    this.initLights = this.initLights.bind(this);
    this.updateShader = this.updateShader.bind(this);

    this.bindEvents();
    this.init();
  }

  /**
   * Binds event listeners for DOM events
   * @function bindEvents
   * @memberof GlowProcess.prototype
   */
  bindEvents() {
    window.addEventListener('resize', () => {
      this.onWindowResize();
    });

    // window.addEventListener('mousemove', e => {
    //   this.xVal = (e.clientX / window.innerWidth) - 0.5;
    //   this.yVal = (e.clientY / window.innerHeight) - 0.5;
    // });
  }

  /**
   * Orders the methods calls for setting up and then rendering scene.
   * @function init
   * @memberof GlowProcess.prototype
   */
  init() {
    this.initScene();
    this.initCamera();
    this.initLights();
    this.initModel();
  }

  /**
   * Creates new threejs scene and assigns to class instance
   * @function initScene
   * @memberof GlowProcess.prototype
   */
  initScene() {
    this.scene = new Scene();
  }

  /**
   * Creates new threejs camera and adds to scene
   * @function initCamera
   * @memberof GlowProcess.prototype
   */
  initCamera() {
    this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 50);

    this.camera.position.z = 15;
    this.camera.layers.enable(1);
    this.scene.add(this.camera);
  }

  /**
   * Creates lights and adds to scene
   * @function initLights
   * @memberof GlowProcess.prototype
   */
  initLights() {
    this.light = new PointLight(0xffffff, 10, 10, 2);
    this.light.position.set(-5, 5, 5);
    this.light.lookAt(0, 0, 0);
    this.scene.add(this.light);
  }

  /**
   * Creates model for scene
   * @function initModel
   * @memberof GlowProcess.prototype
   */
  initModel() {
    const geo = new BoxBufferGeometry(5, 5, 5, 5);
    const mat = new MeshBasicMaterial({color: 0xf23232});
    this.mesh = new Mesh(geo, mat);
    this.mesh.layers.enable(this.GLOW_LAYER);


    this.scene.add(this.mesh);

    const geo2 = new PlaneBufferGeometry(12, 12, 5, 5);
    const mat2 = new MeshBasicMaterial({color: 0x434b53});
    this.mesh2 = new Mesh(geo2, mat2);

    this.scene.add(this.mesh2);

    this.setup();
  }

  /**
   * Callback passed to resize event to handle updating camera and renderer size
   * @function onWindowResize
   * @memberof GlowProcess.prototype
   */
  onWindowResize() {
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.curX, this.curY);
  }

  /**
   * Sets up renderer, calls any other necessary methods and then starts loop
   * @function setup
   * @memberof GlowProcess.prototype
   */
  setup() {
    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvas,
      // alpha: true
    });
    // this.renderer.autoClear = false;

    this.renderTarget = new WebGLRenderTarget(this.curX, this.curY);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.curX, this.curY);
    this.processing();
    this.animate();
  }

  /**
   * Sets up post processing of scene
   * @function processing
   * @memberof GlowProcess.prototype
   */
  processing() {
    const {
      renderer,
      camera,
      scene
    } = this;

    this.glowComposer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    this.glowComposer.addPass(renderPass);

    const glowPass = new ShaderPass(GlowShaderHori, 'texOne');
    glowPass.uniforms['resolution'].value = new Vector2(window.innerWidth, window.innerHeight);
    glowPass.uniforms['resolution'].value.multiplyScalar(window.devicePixelRatio);

    const glowPassVert = new ShaderPass(GlowShaderVert, 'texOne');
    glowPassVert.uniforms['resolution'].value = new Vector2(window.innerWidth, window.innerHeight);
    glowPassVert.uniforms['resolution'].value.multiplyScalar(window.devicePixelRatio);

    // this.updateShader();
    this.glowComposer.renderToScreen = false;
    this.glowComposer.addPass(glowPass);
    this.glowComposer.addPass(glowPassVert);

    const finalPass = new ShaderPass(FinalShaderPass, 'texOne');
    finalPass.uniforms['glowTexture'].value = this.glowComposer.renderTarget2.texture;
    finalPass.needsSwap = true;

    this.finalComposer = new EffectComposer(renderer);
    this.finalComposer.addPass(renderPass);
    this.finalComposer.addPass(finalPass);
  }

  /**
   * Updates shader with relevant uniforms
   * @function updateShader
   * @memberof GlowProcess.prototype
   */
  updateShader() {
    this.glowPass.uniforms['texOne'].value.needsUpdate = true;
  }

  /**
   * Creates animation loop
   * @function animate
   * @memberof GlowProcess.prototype
   */
  animate() {
    requestAnimationFrame(this.animate);

    // this.updateShader();
    this.render();
  }

  /**
   * Simply renders scene with instance's scene and camera
   * @function render
   * @memberof GlowProcess.prototype
   */
  render() {
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.z += 0.01;

    this.camera.layers.set(this.GLOW_LAYER);
    this.glowComposer.render();
    this.camera.layers.set(this.SCENE_LAYER);
    this.finalComposer.render();
  }
}
