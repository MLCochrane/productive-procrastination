import {
  Scene,
  PerspectiveCamera,
  MeshBasicMaterial,
  Mesh,
  PlaneBufferGeometry,
  TextureLoader,
  WebGLRenderer,
  Vector2,
  RepeatWrapping,
  NearestFilter,
  MeshLambertMaterial,
  PointLight,
  DefaultLoadingManager,
} from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

/*
 *  Class for loading and rendering 3D text
 */

export default class Sample {
  renderer: WebGLRenderer | null;
  scene: Scene | null;
  camera: PerspectiveCamera | null;
  mesh: Mesh | null;
  xVal: number;
  yVal: number;
  curX: number;
  curY: number;
  canvas: HTMLElement | null;
  dims: any;
  bufferFile: string;
  buttons: { smaller: HTMLElement | null; bigger: HTMLElement | null; invert: HTMLElement | null; texture: HTMLElement | null; toggle: HTMLElement | null; };
  params: { pixelSize: number; invert: boolean; textureIndex: number; enabled: boolean; };
  texturesLoaded: boolean;
  light: PointLight | null;
  textures: any;
  pixelPass: any | null;
  raf: number | null;
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
    this.canvas = document.getElementById('') as HTMLCanvasElement;
    this.dims = this.canvas.getBoundingClientRect();
    this.bufferFile = `${ASSET_PATH}/assets/skull.obj `;

    this.animate = this.animate.bind(this);
    this.setup = this.setup.bind(this);
    this.initBackground = this.initBackground.bind(this);
    this.initLights = this.initLights.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.destroy = this.destroy.bind(this);

    this.buttons = {
      smaller: document.getElementById('Smaller'),
      bigger: document.getElementById('Bigger'),
      invert: document.getElementById('Invert'),
      texture: document.getElementById('Texture'),
      toggle: document.getElementById('Toggle'),
    };

    this.params = {
      pixelSize: 10,
      invert: true,
      textureIndex: 1,
      enabled: true,
    };

    this.light = null;
    this.raf = null;

    this.texturesLoaded = false;

    this.bindEvents();
    this.init();
  }

  /**
   * Binds event listeners for DOM events
   * @function bindEvents
   * @memberof PostProcess.prototype
   */
  bindEvents() {
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  /**
   * Callback for handling mouse movements
   * @function handleMouseMove
   * @memberof PostProcess.prototype
   */
  handleMouseMove(e: MouseEvent) {
    console.log(e);
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
    this.scene?.add(this.camera);
  }

  /**
   * Creates lights and adds to scene
   * @function initLights
   * @memberof PostProcess.prototype
   */
  initLights() {
    this.light = new PointLight(0xffffff, 10, 10, 2);
    this.light.position.set(-5, 5, 5);
    this.light.lookAt(0, 0, 0);
    this.scene?.add(this.light);
  }

  /**
   * Creates new threejs camera and adds to scene
   * @function initModel
   * @memberof PostProcess.prototype
   * @param {String} bufferFile - String representing path to buffer geometry file to load
   */
  initModel(bufferFile: string) {
    const loader = new OBJLoader();
    loader.load(bufferFile, (res) => {
      [this.mesh] = res.children as Mesh[];
      this.mesh.material = new MeshLambertMaterial({
        color: 0xeeeeee,
      });
      this.mesh.position.set(0, -2, 0);
      this.scene?.add(this.mesh);
      this.setup();
    }, (xhr) => {
      // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, (err) => {
      console.error(err);
    });
  }

  /**
   * Adding in background to scene
   * @function initBackground
   * @memberof PostProcess.prototype
   */
  initBackground() {
    const geo = new PlaneBufferGeometry(50, 20, 3, 3);
    const mat = new MeshBasicMaterial({
      color: this.params.invert ? 0xffffff : 0x000000,
    });
    const mesh = new Mesh(geo, mat);
    mesh.position.z = -2;
    this.scene?.add(mesh);
  }

  /**
   * Callback passed to resize event to handle updating camera and renderer size
   * @function onWindowResize
   * @memberof PostProcess.prototype
   */
  onWindowResize() {
    this.camera?.updateProjectionMatrix();
    this.renderer?.setSize(this.curX, this.curY);
  }

  /**
   * Sets up renderer, calls any other necessary methods and then starts loop
   * @function setup
   * @memberof PostProcess.prototype
   */
  setup() {
    DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (itemsLoaded === itemsTotal) this.texturesLoaded = true;
    };

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
   * @memberof PostProcess.prototype
   */
  animate() {
    this.raf = requestAnimationFrame(this.animate);

    if (this.mesh) this.mesh.rotation.x = (this.yVal);
    if (this.mesh) this.mesh.rotation.y = (this.xVal) - 1.574;
    this.render();
  }

  /**
   * Simply renders scene with instance's scene and camera
   * @function render
   * @memberof PostProcess.prototype
   */
  render() {
    this.renderer?.render(this.scene as Scene, this.camera as PerspectiveCamera);
  }

  /**
   * Cancels RAF loop and unbinds event handlers
   * @function destroy
   * @memberof PostProcess.prototype
   */
  destroy() {
    const {
      buttons,
      raf,
      handleMouseMove,
      onWindowResize,
    } = this;

    cancelAnimationFrame(raf as number);
    window.addEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', onWindowResize);
  }
}
