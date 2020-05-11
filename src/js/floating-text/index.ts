import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  MeshBasicMaterial,
  Mesh,
  BufferGeometryLoader,
}
from 'three';

/*
 *  Class for loading and rendering 3D text
 */

export default class FloatingText {
  renderer: WebGLRenderer | null;
  scene: Scene | null;
  camera: OrthographicCamera | null;
  mesh: Mesh | null;
  xVal: number;
  yVal: number;
  curX: number;
  curY: number;
  canvas: HTMLCanvasElement | null;
  dims: any;
  bufferFile: string;
  id: number = 0;
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
    this.canvas = document.getElementById('FloatingText') as HTMLCanvasElement;
    this.dims = this.canvas.getBoundingClientRect();
    this.bufferFile = `${ASSET_PATH}/assets/floating-text.json`;

    this.animate = this.animate.bind(this);
    this.setup = this.setup.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.bindEvents();
    this.init();
  }

  /**
   * Binds event listeners for DOM events
   * @function bindEvents
   * @memberof FloatingText.prototype
   */
  bindEvents() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('click', this.handleClick);
  }

  /**
   *
   * @function destroy
   * @memberof .prototype
   */
  destroy() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('click', this.handleClick);
    cancelAnimationFrame(this.id);
  }

  /**
   * Callback for click event
   * @function handleClick
   * @memberof FloatingText.prototype
   */
  handleClick() {
    const {
      renderer,
    } = this;

    (renderer as WebGLRenderer).setPixelRatio(window.devicePixelRatio);
  }

  /**
   * Callback for mousemove
   * @function handleMouseMove
   * @memberof FloatingText.prototype
   */
  handleMouseMove(e: MouseEvent) {
    this.xVal = (e.clientX / window.innerWidth) - 0.5;
    this.yVal = (e.clientY / window.innerHeight) - 0.5;
  }

  /**
   * Callback for resize event
   * @function handleResize
   * @memberof FloatingText.prototype
   */
  handleResize() {
    this.onWindowResize();
  }

  /**
   * Orders the methods calls for setting up and then rendering scene.
   * @function init
   * @memberof FloatingText.prototype
   */
  init() {
    this.initScene();
    this.initCamera();
    this.initText(this.bufferFile);
  }

  /**
   * Creates new threejs scene and assigns to class instance
   * @function initScene
   * @memberof FloatingText.prototype
   */
  initScene() {
    this.scene = new Scene();
  }

  /**
   * Creates new threejs camera and adds to scene
   * @function initCamera
   * @memberof FloatingText.prototype
   */
  initCamera() {
    const {
      scene,
    } = this;
    const distance = 3.5;
    const aspect = (window.innerWidth / 2) / (window.innerWidth / 4);

    this.camera = new OrthographicCamera(
      (distance * aspect) / -2,
      (distance * aspect) / 2,
      distance / 2,
      distance / -2,
      0.8,
      20,
    );

    this.camera.position.z = 8;
    (scene as Scene).add(this.camera);
  }

  /**
   * Creates new threejs camera and adds to scene
   * @function initText
   * @memberof FloatingText.prototype
   * @param {String} bufferFile - String representing path to buffer geometry file to load
   */
  initText(bufferFile: string) {
    const {
      scene,
      setup,
    } = this;

    const loader = new BufferGeometryLoader();
    loader.load(bufferFile, (geo) => {
      // Add the loaded object to the scene
      const mat1 = new MeshBasicMaterial({ color: 0xffffff });
      const mat2 = new MeshBasicMaterial({ color: 0x000000 });

      // Materials passed in to group materialIndex
      const object = new Mesh(geo, [mat1, mat2]);
      this.mesh = object;
      (scene as Scene).add(object);
      setup();
    }, (xhr) => {
      // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, (err) => {
      console.error(err);
    });
  }

  /**
   * Callback passed to resize event to handle updating camera and renderer size
   * @function onWindowResize
   * @memberof FloatingText.prototype
   */
  onWindowResize() {
    const {
      camera,
      renderer,
    } = this;

    // (camera as OrthographicCamera).aspect = (window.innerWidth / 2) / (window.innerWidth / 4);
    (camera as OrthographicCamera).updateProjectionMatrix();
    (renderer as WebGLRenderer).setSize(window.innerWidth / 2, window.innerWidth / 4);
  }

  /**
   *
   * @function setup
   * @memberof FloatingText.prototype
   */
  setup() {
    const {
      canvas,
      animate,
      dims,
    } = this;

    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: canvas as HTMLCanvasElement,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(dims.width, dims.height);
    animate();
  }

  /**
   * Creates animation loop
   * @function animate
   * @memberof FloatingText.prototype
   */
  animate() {
    const {
      xVal,
      yVal,
      mesh,
      render,
      animate,
    } = this;

    this.id = requestAnimationFrame(animate);

    if (mesh) {
      mesh.rotation.x = (yVal);
      mesh.rotation.y = (xVal);
    }
    render();
  }

  /**
   * Simply renders scene with instance's scene and camera
   * @function render
   * @memberof FloatingText.prototype
   */
  render() {
    const {
      renderer,
      scene,
      camera,
    } = this;

    renderer?.render(
      scene as Scene,
      camera as OrthographicCamera
    );
  }
}
