import {
  Scene,
  PerspectiveCamera,
  MeshBasicMaterial,
  Mesh,
  PlaneBufferGeometry,
  WebGLRenderer,
  Vector2,
  MeshLambertMaterial,
  PointLight,
  MeshNormalMaterial,
  MeshPhongMaterial,
  WebGLRenderTarget,
  DoubleSide,
  AmbientLight,
  TextureLoader,
  LoadingManager,
  DefaultLoadingManager
} from 'three';
import {
  GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader';
import {
  DRACOLoader
} from 'three/examples/jsm/loaders/DRACOLoader';
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
    this.bufferFile = `${ASSET_PATH}/assets/neon.glb`;

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

    window.addEventListener('mousemove', e => {
      this.xVal = (e.clientX / window.innerWidth) - 0.5;
      this.yVal = (e.clientY / window.innerHeight) - 0.5;
    });
  }

  /**
   * Orders the methods calls for setting up and then rendering scene.
   * @function init
   * @memberof GlowProcess.prototype
   */
  init() {
    this.bindEvents();
    this.initScene();
    this.initCamera();
    this.initLights();
    this.initModel();
    this.initBackground();

    DefaultLoadingManager.onLoad = () => {
      this.setup();
    }
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
    this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 70);

    this.camera.position.z = 40;
    this.camera.layers.enable(1);
    this.scene.add(this.camera);
  }

  /**
   * Creates lights and adds to scene
   * @function initLights
   * @memberof GlowProcess.prototype
   */
  initLights() {
    this.light = new PointLight(0xf57d7d, .3, 20, .5);
    this.light2 = new PointLight(0xf57d7d, .3, 20, .5);

    this.light.position.set(0.5, 0, 2);
    this.light2.position.set(-0.5, 0, 2);

    this.light.lookAt(0.5, 0, 0);
    this.light2.lookAt(-0.5, 0, 0);

    this.scene.add(this.light);
    this.scene.add(this.light2);

    this.light3 = new AmbientLight(0xffffff, 0.3);
    this.scene.add(this.light3);
  }

  /**
   * Creates model for scene
   * @function initModel
   * @memberof GlowProcess.prototype
   */
  initModel() {
    const {
      bufferFile,
      scene,
    } = this;

    const modelLoader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('three/examples/js/libs/draco');
    modelLoader.setDRACOLoader(dracoLoader);

    modelLoader.load(bufferFile, res => {
      this.mainTubes = res.scene.children.find(el => el.name === 'TopTubes');
      this.mainTubes.material = new MeshBasicMaterial({
        color: 0xf23232,
      });

      // Should probably just correct rotations in Blender but here we are
      this.mainTubes.rotation.x = 1.567;

      // Need to ensure meshs that should recieve effect are on separate layer
      this.mainTubes.layers.enable(this.GLOW_LAYER);
      scene.add(this.mainTubes);

      this.bottomTubes = res.scene.children.find(el => el.name === 'BottomTubes');
      this.bottomTubes.material = new MeshLambertMaterial({
        color: 0x313632,
        side: DoubleSide,
      });

      this.bottomTubes.rotation.x = 1.567;
      scene.add(this.bottomTubes);
    }, xhr => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    }, err => {
      console.error(err);
    });
  }

  initBackground() {
    const {
      scene,
    } = this;

    const texturesToLoad = [
      {
        type: 'map',
        url: `${ASSET_PATH}/assets/Concrete_Wall/CW_color_map2.jpg`,
      },
      {
        type: 'aoMap',
        url: `${ASSET_PATH}/assets/Concrete_Wall/CW_ao.jpg`,
      },
      {
        type: 'normalMap',
        url: `${ASSET_PATH}/assets/Concrete_Wall/CW_normal.jpg`,
      },
      {
        type: 'displacementMap',
        url: `${ASSET_PATH}/assets/Concrete_Wall/CW_roughness.jpg`,
      }
    ];

    const loadedTextures = {};
    const textureManager = new LoadingManager();

    textureManager.onLoad = () => {
      const geo2 = new PlaneBufferGeometry(80, 50, 5, 5);
      const mat2 = new MeshPhongMaterial(loadedTextures);

      this.mesh2 = new Mesh(geo2, mat2);
      this.mesh2.position.z = -2;

      scene.add(this.mesh2);

      const mat = new MeshLambertMaterial({
        transparent: true,
        opacity: 0.2,
      });
      const geo = new PlaneBufferGeometry(36, 20, 5, 5);
      const glass = new Mesh(geo, mat);

      glass.position.x = -1;

      scene.add(glass);
    }

    const texLoader = new TextureLoader(textureManager);
    texturesToLoad.forEach(el => {
      texLoader.load(el.url, texture => {
        loadedTextures[el.type] = texture;
      });
    });
  }

  /**
   * Callback passed to resize event to handle updating camera and renderer size
   * @function onWindowResize
   * @memberof GlowProcess.prototype
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
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
    });

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

    this.camera.position.x = 40 * Math.sin(this.xVal / 4);
    this.camera.position.z = 40 * Math.cos(this.xVal / 4);
    this.camera.position.y = 10 * this.yVal / 2;
    this.camera.lookAt(0,0,0);

    this.render();
  }

  /**
   * Simply renders scene with instance's scene and camera
   * @function render
   * @memberof GlowProcess.prototype
   */
  render() {
    this.camera.layers.set(this.GLOW_LAYER);
    this.glowComposer.render();
    this.camera.layers.set(this.SCENE_LAYER);
    this.finalComposer.render();
  }
}
