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
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { PixelShader } from './pixel-toon-shader';

/*
 *  Class for loading and rendering 3D text
 */

export default class PostProcess {
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
  textureFileOne: string;
  textureFileTwo: string;
  textureFileThree: string;
  textureFileFour: string;
  imageFile: string;
  buttons: { smaller: HTMLElement | null; bigger: HTMLElement | null; invert: HTMLElement | null; texture: HTMLElement | null; toggle: HTMLElement | null; };
  params: { pixelSize: number; invert: boolean; textureIndex: number; enabled: boolean; };
  texturesLoaded: boolean;
  light: PointLight | null;
  textures: any;
  composer: EffectComposer | null;
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
    this.canvas = document.getElementById('PostProcess') as HTMLCanvasElement;
    this.dims = this.canvas.getBoundingClientRect();
    this.bufferFile = `${ASSET_PATH}/assets/skull.obj `;
    this.textureFileOne = `${ASSET_PATH}/assets/images/dot-2.jpg`;
    this.textureFileTwo = `${ASSET_PATH}/assets/images/bolt.jpg`;
    this.textureFileThree = `${ASSET_PATH}/assets/images/dot-3.jpg`;
    this.textureFileFour = `${ASSET_PATH}/assets/images/skull-tex.jpg`;
    this.imageFile = `${ASSET_PATH}/assets/images/tex-ice.jpg`;

    this.animate = this.animate.bind(this);
    this.setup = this.setup.bind(this);
    this.processing = this.processing.bind(this);
    this.initBackground = this.initBackground.bind(this);
    this.initLights = this.initLights.bind(this);
    this.updateShader = this.updateShader.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.handleButtonPress = this.handleButtonPress.bind(this);
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
    this.composer = null;
    this.pixelPass = null;

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

    if (this.buttons.smaller) {
      this.buttons.smaller.addEventListener('click', this.handleButtonPress('smaller'));
    }
    if (this.buttons.bigger) {
      this.buttons.bigger.addEventListener('click', this.handleButtonPress('bigger'));
    }
    if (this.buttons.invert) {
      this.buttons.invert.addEventListener('click', this.handleButtonPress('invert'));
    }
    if (this.buttons.texture) {
      this.buttons.texture.addEventListener('click', this.handleButtonPress('texture'));
    }
    if (this.buttons.toggle) {
      this.buttons.toggle.addEventListener('click', this.handleButtonPress('toggle'));
	  }
  }

  /**
   * Callback for handling mouse movements
   * @function handleMouseMove
   * @memberof PostProcess.prototype
   */
  handleMouseMove(e: MouseEvent) {
    this.xVal = (e.clientX / window.innerWidth) - 0.5;
    this.yVal = (e.clientY / window.innerHeight) - 0.5;
  }

  /**
   * Callback for click events
   * @function handleButtonPress
   * @memberof PostProcess.prototype
   * @param {String} type - Button type to pick which param should be changed
   */
  handleButtonPress(type: string) {
    return () => {
      switch (type) {
        case 'smaller':
          if (this.params.pixelSize > 10) this.params.pixelSize -= 5;
          break;
        case 'bigger':
          if (this.params.pixelSize < 50) this.params.pixelSize += 5;
          break;
        case 'invert':
          this.params.invert = !this.params.invert;
          break;
        case 'texture':
          this.params.textureIndex = this.params.textureIndex === 3
            ? 0
            : this.params.textureIndex += 1;
          break;
        case 'toggle':
          this.params.enabled = !this.params.enabled;
          break;
        default:
          break;
      }
    };
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
    this.processing();
    this.animate();
  }

  /**
   * Sets up post processing of scene
   * @function processing
   * @memberof PostProcess.prototype
   */
  processing() {
    const loader = new TextureLoader();
    this.textures = [
      loader.load(this.textureFileOne),
      loader.load(this.textureFileTwo),
      loader.load(this.textureFileThree),
      loader.load(this.textureFileFour),
    ];
    this.composer = new EffectComposer(this.renderer as WebGLRenderer);
    this.composer.addPass(new RenderPass(this.scene as Scene, this.camera as PerspectiveCamera));
    this.pixelPass = new ShaderPass(PixelShader, 'texOne');
    if (this.pixelPass.uniforms.resolution)
		this.pixelPass.uniforms.resolution.value = new Vector2(
			window.innerWidth,
			window.innerHeight
		);
    this.pixelPass.uniforms.resolution.value.multiplyScalar(window.devicePixelRatio);

    this.updateShader();

    this.composer.addPass(this.pixelPass);
  }

  /**
   * Updates shader with relevant uniforms
   * @function updateShader
   * @memberof PostProcess.prototype
   */
  updateShader() {
    const {
      pixelPass,
      params,
      texturesLoaded,
    } = this;

    if (!texturesLoaded || !pixelPass) return;
    pixelPass.enabled = params.enabled;
    pixelPass.uniforms.pixelSize.value = params.pixelSize;
    pixelPass.uniforms.innerRepeatLength.value = params.textureIndex === 3 ? 5 : 1;
    pixelPass.uniforms.invert.value = params.invert;
    pixelPass.uniforms.texTwo.value = this.textures[params.textureIndex];
    pixelPass.uniforms.texTwo.value.needsUpdate = true;
    pixelPass.uniforms.texTwo.value.wrapS = RepeatWrapping;
    pixelPass.uniforms.texTwo.value.wrapT = RepeatWrapping;
    pixelPass.uniforms.texTwo.value.magFilter = NearestFilter;
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
    this.updateShader();
    this.render();
  }

  /**
   * Simply renders scene with instance's scene and camera
   * @function render
   * @memberof PostProcess.prototype
   */
  render() {
    this.composer?.render();
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
      handleButtonPress,
      handleMouseMove,
      onWindowResize,
    } = this;

    cancelAnimationFrame(raf as number);
    window.addEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', onWindowResize);
    if (buttons.smaller) {
      buttons.smaller.removeEventListener('click', handleButtonPress('smaller'));
    }
    if (buttons.bigger) {
      buttons.bigger.removeEventListener('click', handleButtonPress('bigger'));
    }
    if (buttons.invert) {
    buttons.invert.removeEventListener('click', handleButtonPress('invert'));
    }
    if (buttons.texture) {
      buttons.texture.removeEventListener('click', handleButtonPress('texture'));
    }
    if (buttons.toggle) {
      buttons.toggle.removeEventListener('click', handleButtonPress('toggle'));
	  }
  }
}
