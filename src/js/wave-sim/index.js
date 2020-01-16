import {
  Scene,
  PerspectiveCamera,
  Vector3,
  Vector2,
  Vector4,
  BoxBufferGeometry,
  PlaneBufferGeometry,
  ShaderMaterial,
  Mesh,
  MeshBasicMaterial,
  WebGLRenderer,
  DataTexture,
  TextureLoader,
  MeshPhongMaterial,
  PointLight,
  RGBFormat,
  RepeatWrapping,
  OrthographicCamera,
  DefaultLoadingManager,
} from 'three';

import {
  EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer';

import {
  RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass';

import {
  AdvectPassShader
} from './advectShader';

import {
  AdvectPass
} from './advectPass';
import { MeshLambertMaterial, MeshNormalMaterial } from 'three/build/three.module';


// import {
//   cross,
//   dot
// } from '../utils/math';
// // import 'DRACOLoader';

export default class WaterSim {
  constructor() {
    this.renderer;
    this.scene;
    this.camera;

    this.canvas = document.getElementById("Sandbox");
    this.dims = this.canvas.getBoundingClientRect();
    this.startTime = Date.now();

    this.file = `${ASSET_PATH}/assets/TestNormalMap.jpg`,

    this.texture = null;

    this.animate = this.animate.bind(this);
    this.render = this.render.bind(this);
    this.setup = this.setup.bind(this);
    this.initSim = this.initSim.bind(this);
    this.initMesh = this.initMesh.bind(this);
    this.processing = this.processing.bind(this);
    this.createTexture = this.createTexture.bind(this);

    this.bindEvents();
    this.init();
  }

  bindEvents() {
    window.addEventListener("resize", () => {
      this.onWindowResize();
    });
  }

  onWindowResize() {
    // this.camera.aspect = window.innerWidth / window.innerHeight;
    // this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  init() {
    this.initScene();
    this.initCamera();
    this.initSim();
  }
  initScene() {
    this.scene = new Scene();
  }
  initCamera() {
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // this.camera.position.set(0, 1, 0);
    // this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
  }

  initSim() {
    this.createTexture().then(res => {
      res.needsUpdate = true;
      this.velField = res;
      this.initMesh();
    });
  }

  initMesh() {
    this.tex;
    const texLoader = new TextureLoader();
    texLoader.load(this.file, texture => {
      this.tex = texture;
    });


    DefaultLoadingManager.onLoad = () => {
      const geo = new BoxBufferGeometry();
      // const mat = new ShaderMaterial({
      //   uniforms: {
      //     dataTex: {
      //       value: this.tex,
      //     }
      //   },
      //   vertexShader: document.getElementById('vertexshader').textContent,
      //   fragmentShader: document.getElementById('fragmentshader').textContent
      // });

      const mat = new MeshNormalMaterial({
      });

      this.mesh = new Mesh(geo, mat);
      this.mesh.rotation.x = -.5;
      this.mesh.rotation.z = -.5;
      this.mesh.position.z = -1;
      this.scene.add(this.mesh);
      this.setup();
    }
  }

  createTexture() {
    return new Promise(resolve => {
      const width = 512;
      const height = 512;

      const size = width * height;
      const data = new Uint8Array(size * 3);

      for (let i = 0; i < size; i++) {
        const xVal = i % width;
        const yVal = Math.floor(i / width);

        const stride = i * 3;
        // const colX = (256 / width) * xVal;
        // const colY = (256 / width) * yVal;

        const mapX = (xVal / width) * (2 * Math.PI);
        const mapY = (yVal / width) * (2 * Math.PI);

        // const colX = (Math.sin(mapX * 2) * 0.5 + 0.5) * 255;
        // const colY = (Math.sin(mapY * 2) * 0.5 + 0.5) * 255;

        const colX = ((Math.sin(xVal / 2) + Math.sin(yVal / 2)) * 0.25 + 0.5) * 10;
        const colY = ((Math.sin(xVal / 2) - Math.sin(yVal / 2)) * 0.25 + 0.5) * 10;

        // const curCol = (colX + colY) / 2;

        data[stride] = colX; // R channel
        data[stride + 1] = colY; // G channel
        data[stride + 2] = 255; // B channel
      }
      resolve(new DataTexture(data, width, height, RGBFormat));
	  });
  }

  setup() {
    // RENDERER
    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvas,
    });
    this.renderer.setSize(512, 512);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.mesh.material.uniforms['dataTex'].value.needsUpdate = true;

    console.log(this.mesh);

    this.processing();
    this.animate();
  }

  /**
   * Post-Processing
   * @function processing
   * @memberof wave.prototype
   */
  processing() {
    const {
      renderer,
      velField,
      scene,
      camera,
    } = this;

    this.composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    console.log(this.tex);

    const advectPass = new AdvectPass({
      velField,
      tOld: this.tex,
      timestep: 5.
    });

    advectPass.setSize(512,512);

    this.composer.addPass(advectPass);
  }

  animate() {
    requestAnimationFrame(this.animate);

    // this.controls.update();

    this.render();
  }
  render(time) {
    const delta = this.startTime - Date.now();

    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
}
