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
  MeshNormalMaterial,
  Vector3,
  MeshLambertMaterial,
  PointLight,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { PixelShader } from './gray-pixel-shader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

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
    this.video = document.getElementById('Video');
    this.dims = this.canvas.getBoundingClientRect();
    this.bufferFile = `${ASSET_PATH}/assets/skull.obj `;
    this.textureFile = `${ASSET_PATH}/assets/images/dot-2.jpg`;
    this.imageFile = `${ASSET_PATH}/assets/images/tex-ice.jpg`;

    this.animate = this.animate.bind(this);
    this.setup = this.setup.bind(this);
    this.withVideo = this.withVideo.bind(this);
    this.processing = this.processing.bind(this);
    this.withImage = this.withImage.bind(this);
    this.initBackground = this.initBackground.bind(this);
    this.initLights = this.initLights.bind(this);

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
    this.initBackground();
    this.initLights();
    // this.withImage();
    // this.video.play().then(() => {
    //     this.withVideo();
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
    this.initModel(this.bufferFile);
  }

  /**
   * Creates new threejs scene and assigns to class instance
   * @function initScene
   * @memberof PostProcess.prototype
   */
  initScene() {
    this.scene = new Scene();
  }

  /**
   * Creates new threejs camera and adds to scene
   * @function initCamera
   * @memberof PostProcess.prototype
   */
  initCamera() {
    this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 50);

    this.camera.position.z = 10;
    this.scene.add(this.camera);
  }

  /**
   * Creates lights and adds to scene
   * @function initLights
   * @memberof PostProcess.prototype
   */
  initLights() {
    this.light = new PointLight(0xffffff, 10, 10, 2);
    this.light.position.set(-5, 5, 5);
    this.light.lookAt(0,0,0);
    this.scene.add(this.light);
  }

  /**
   * Creates new threejs camera and adds to scene
   * @function initModel
   * @memberof PostProcess.prototype
   * @param {String} bufferFile - String representing path to buffer geometry file to load
   */
  initModel(bufferFile) {
    const loader = new OBJLoader();
    loader.load(bufferFile, res => {
      [this.mesh] = res.children;
      this.mesh.material = new MeshLambertMaterial({
        color: 0xeeeeee,
      });
      this.mesh.position.set(0, -2, 0);
      this.scene.add(this.mesh);
      this.setup();
    }, xhr => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, err => {
      console.error(err);
    });
  }

  /**
   * Adds plane with video texture
   * @function withVideo
   * @memberof PostProcess.prototype
   */
  withVideo() {
    this.vidTexture = new VideoTexture(this.video);
    const geo = new PlaneBufferGeometry(5, 3, 3, 3);
    const mat = new MeshBasicMaterial({
      color: 0xffffff,
      map: this.vidTexture,
    });
    this.mesh = new Mesh(geo, mat);
    this.scene.add(this.mesh);
    this.setup();
  }

  /**
   * Callback passed to resize event to handle updating camera and renderer size
   * @function withImage
   * @memberof PostProcess.prototype
   */
  withImage() {
    const texture = new TextureLoader().load(this.imageFile);
    const geo = new PlaneBufferGeometry(5, 3, 3, 3);
    const mat = new MeshBasicMaterial({
      color: 0xffffff,
      map: texture,
    });
    this.mesh = new Mesh(geo, mat);
    this.scene.add(this.mesh);
  }

  /**
   * Adding in background to scene
   * @function initBackground
   * @memberof PostProcess.prototype
   */
  initBackground() {
    const geo = new PlaneBufferGeometry(50, 20, 3, 3);
    const mat = new MeshBasicMaterial({
      color: 0xffffff, // Color here should be opposite of which color you'd like "textured"
    });
    const mesh = new Mesh(geo, mat);
    mesh.position.z = -2;
    this.scene.add(mesh);
  }

  /**
   * Callback passed to resize event to handle updating camera and renderer size
   * @function onWindowResize
   * @memberof PostProcess.prototype
   */
  onWindowResize() {
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.curX, this.curY);
  }

  /**
   * Sets up renderer, calls any other necessary methods and then starts loop
   * @function setup
   * @memberof PostProcess.prototype
   */
  setup() {
    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.curX, this.curY);
    this.processing();
    this.animate();
  }

  /**
   * Sets up post processing of scene
   * @function processing
   * @memberof PostProcess.prototype
   */
  processing() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const pixelPass = new ShaderPass(PixelShader, 'texOne');
    pixelPass.uniforms['resolution'].value = new Vector2(window.innerWidth, window.innerHeight);
    pixelPass.uniforms['resolution'].value.multiplyScalar(window.devicePixelRatio);
    pixelPass.uniforms['pixelSize'].value = 5;
    pixelPass.uniforms['innerRepeatLength'].value = 1;
    pixelPass.uniforms['texTwo'].value = new TextureLoader().load(this.textureFile);
    pixelPass.uniforms['texTwo'].value.wrapS = RepeatWrapping;
    pixelPass.uniforms['texTwo'].value.wrapT = RepeatWrapping;
    pixelPass.uniforms['texTwo'].value.magFilter = NearestFilter;
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
    this.mesh.rotation.y = (this.xVal) - 1.574;
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
