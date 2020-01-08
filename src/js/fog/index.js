import {
  Scene,
  WebGLRenderTarget,
  WebGLRenderer,
  RGBFormat,
  NearestFilter,
  DepthTexture,
  UnsignedShortType,
  PerspectiveCamera,
  OrthographicCamera,
  PointLight,
  AmbientLight,
  TorusKnotBufferGeometry,
  PlaneBufferGeometry,
  MeshLambertMaterial,
  ShaderMaterial,
  Mesh,
  Vector3,
} from 'three';

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

    this.animate = this.animate.bind(this);
    this.setup = this.setup.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.initFog = this.initFog.bind(this);

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
    this.initFog();
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
      color: 0x0000ff
    });

    const count = 10;
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
   * Sets up fog post processing scene
   * @function initFog
   * @memberof Fog.prototype
   */
  initFog() {
    const {
      camera,
      target
    } = this;

    const uniforms = {
      cameraNear: {
          value: camera.near
        },
      cameraFar: {
        value: camera.far
      },
      tDiffuse: {
        value: target.texture
      },
      tDepth: {
        value: target.depthTexture
      },
      intensity: {
        value: 2.0,
      },
      fogColor: {
        value: new Vector3(0.3, 0.9, 0.3),
      }
    }
    // Setup post processing stage
    this.postCamera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    const postMaterial = new ShaderMaterial( {
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent,
      uniforms,
    });
    const postPlane = new PlaneBufferGeometry( 2, 2 );
    const postQuad = new Mesh( postPlane, postMaterial );
    this.postScene = new Scene();
    this.postScene.add( postQuad );
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
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 10;
    this.controls.maxDistance = 100;

    this.animate();
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
      renderer,
      scene,
      camera,
      target,
      postScene,
      postCamera
    } = this;

    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    // render post FX
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCamera);
  }
}
