import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { ClearPass } from 'three/examples/jsm/postprocessing/ClearPass.js';
import { MaskPass, ClearMaskPass } from 'three/examples/jsm/postprocessing/MaskPass.js';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { PixelShader } from './gray-pixel-shader';
import { DotShader } from './dot-screen-shader';


/*
 *  Class for loading and rendering 3D text
 */

export default class PostProcess {
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
    this.canvas = document.getElementById('PostProcess');
    this.dims = this.canvas.getBoundingClientRect();
    this.bufferFile = `${ASSET_PATH}/assets/floating-text.json`;
    this.textureFile = `${ASSET_PATH}/assets/hover/displacement.png`;

    this.animate = this.animate.bind(this);
    this.setup = this.setup.bind(this);
    this.processing = this.processing.bind(this);

    this.bindEvents();
    this.init();
  }

  /**
   * Binds event listeners for DOM events
   * @function bindEvents
   * @memberof PostProcess.prototype
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
   * @memberof PostProcess.prototype
   */
  init() {
    this.initScene();
    this.initCamera();
    this.initText(this.bufferFile);
  }

  /**
   * Creates new threejs scene and assigns to class instance
   * @function initScene
   * @memberof PostProcess.prototype
   */
  initScene() {
    this.scene = new THREE.Scene();
  }

  /**
   * Creates new threejs camera and adds to scene
   * @function initCamera
   * @memberof PostProcess.prototype
   */
  initCamera() {
    const distance = 3.5;
    const aspect = (window.innerWidth / 2) / (window.innerWidth / 4);

    this.camera = new THREE.OrthographicCamera(
      distance * aspect / -2,
      distance * aspect / 2,
      distance / 2,
      distance / -2, 0.8, 20
    );

    this.camera.position.z = 8;
    this.scene.add(this.camera);
  }

  /**
   * Creates new threejs camera and adds to scene
   * @function initText
   * @memberof PostProcess.prototype
   * @param {String} bufferFile - String representing path to buffer geometry file to load
   */
  initText(bufferFile) {
    const texture = new THREE.TextureLoader().load(this.textureFile);
    // texture.repeat.set(4,4);
    const loader = new THREE.BufferGeometryLoader();
    loader.load(bufferFile, geo => {
      // Add the loaded object to the scene
      const mat1 = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: texture
      });
      const mat2 = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
      });

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
   * @memberof PostProcess.prototype
   */
  onWindowResize() {
    this.camera.aspect = (window.innerWidth / 2) / (window.innerWidth / 4);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth / 2, window.innerWidth / 4);
  }

  /**
   *
   * @function setup
   * @memberof PostProcess.prototype
   */
  setup() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.dims.width, this.dims.height);
    this.processing();
    this.animate();
  }

  /**
   *
   * @function processing
   * @memberof PostProcess.prototype
   */
  processing() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const pixelPass = new ShaderPass(PixelShader);
    pixelPass.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
    pixelPass.uniforms['resolution'].value.multiplyScalar(window.devicePixelRatio);
    pixelPass.uniforms['pixelSize'].value = 15;
    this.composer.addPass(pixelPass);
  }

  /**
   * Creates animation loop
   * @function animate
   * @memberof PostProcess.prototype
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
   * @memberof PostProcess.prototype
   */
  render() {
    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
}
