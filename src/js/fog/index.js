import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
    this.canvas = document.getElementById('Fog');
    this.dims = this.canvas.getBoundingClientRect();

    this.animate = this.animate.bind(this);
    this.setup = this.setup.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.setupPost = this.setupPost.bind(this);

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
   * @memberof .prototype
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
    this.setupPost();
    this.initGeo();
  }

  /**
   * Creates new threejs scene and assigns to class instance
   * @function initScene
   * @memberof Fog.prototype
   */
  initScene() {
    this.scene = new THREE.Scene();

    this.target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    this.target.texture.format = THREE.RGBFormat;
    this.target.texture.minFilter = THREE.NearestFilter;
    this.target.texture.magFilter = THREE.NearestFilter;
    this.target.texture.generateMipmaps = false;
    this.target.stencilBuffer = false;
    this.target.depthBuffer = true;
    this.target.depthTexture = new THREE.DepthTexture();
    this.target.depthTexture.type = THREE.UnsignedShortType;
  }

  /**
   * Creates new threejs camera and adds to scene
   * @function initCamera
   * @memberof Fog.prototype
   */
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 70);

    this.camera.position.z = 30;
    this.scene.add(this.camera);
  }

  /**
   * Init geos
   * @function initGeo
   * @memberof Fog.prototype
   */
  initGeo() {
    const geo = new THREE.TorusKnotBufferGeometry(1, 0.3, 128, 64);
    const mat = new THREE.MeshLambertMaterial({
      color: 0x0000ff
    });

    const count = 10;
    const scale = 10;

    for (let i = 0; i < count; i++) {
      const r = Math.random() * 2.0 * Math.PI;
      const z = (Math.random() * 2.0) - 1.0;
      const zScale = Math.sqrt(1.0 - z * z) * scale;
      const mesh = new THREE.Mesh(geo, mat);
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

  initLights() {
    this.light = new THREE.PointLight(0xf57d7d, .6, 20, .5);
    this.light2 = new THREE.PointLight(0xf57d7d, .4, 20, .5);

    this.light.position.set(2, 0, -5);
    this.light2.position.set(-0.5, 3, 5);

    this.light.lookAt(0, 0, 0);
    this.light2.lookAt(0, 0, 0);

    this.scene.add(this.light);
    this.scene.add(this.light2);

    this.light3 = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.light3);
  }

  setupPost() {
    const {
      camera,
      target
    } = this;
    // Setup post processing stage
    this.postCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    var postMaterial = new THREE.ShaderMaterial( {
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent,
      uniforms: {
        cameraNear: { value: camera.near },
        cameraFar: { value: camera.far },
        tDiffuse: { value: target.texture },
        tDepth: { value: target.depthTexture }
      }
    });
    var postPlane = new THREE.PlaneBufferGeometry( 2, 2 );
    var postQuad = new THREE.Mesh( postPlane, postMaterial );
    this.postScene = new THREE.Scene();
    this.postScene.add( postQuad );
  }

  /**
   *
   * @function setup
   * @memberof Fog.prototype
   */
  setup() {
    this.renderer = new THREE.WebGLRenderer({
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
