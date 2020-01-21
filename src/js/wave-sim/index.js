import {
  Scene,
  PerspectiveCamera,
  Vector3,
  Vector2,
  BoxBufferGeometry,
  Mesh,
  WebGLRenderer,
  DataTexture,
  TextureLoader,
  RGBFormat,
  DefaultLoadingManager,
  MeshNormalMaterial,
  WebGLRenderTarget,
  RGBAFormat,
} from 'three';

import {
  EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer';

import {
  ShaderPass
} from 'three/examples/jsm/postprocessing/ShaderPass';

import {
  SavePass
} from 'three/examples/jsm/postprocessing/SavePass';

import {
  WEBGL
} from 'three/examples/jsm/WebGL.js';

import {
  JacobiIterationShader
} from './jacobiShader';

import {
  DivergenceShader
} from './divergenceShader';

import {
  AdvectPassShader
} from './advectShader';

import {
  GradientSubtractionShader
} from './gradientSubtractionShader';

import {
  DisplayDye
} from './displayDye';

import {
  AddForce
} from './addForce';


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

    this.config = {
      cellSize: 1024,
    };

    this.mouse = {
      x: 0.5,
      y: 0.5,
      Dx: 20.,
      Dy: 20.,
    };

    this.animate = this.animate.bind(this);
    this.render = this.render.bind(this);
    this.setup = this.setup.bind(this);
    this.initSim = this.initSim.bind(this);
    this.initMesh = this.initMesh.bind(this);
    this.processing = this.processing.bind(this);
    this.createVelField = this.createVelField.bind(this);
    this.createPressureField = this.createPressureField.bind(this);

    this.bindEvents();
    this.init();
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      if (!this.mouseDown) return;
      const x = e.clientX / window.innerWidth;
      const y = Math.abs((e.clientY / window.innerHeight) - 1.);
      const curMouse = {
        x,
        y,
        // Dx: ((x - this.mouse.x) + 1.) / 2.,
        // Dy: ((y - this.mouse.y) + 1.) / 2.,
        Dx: x - this.mouse.x,
        Dy: y - this.mouse.y,
      };

      this.mouse = curMouse;
    });

    window.addEventListener('mousedown', () => {
      this.mouseDown = true;
    });

    window.addEventListener('mouseup', () => {
      this.mouseDown = false;

      this.mouse.Dx = 0.;
      this.mouse.Dy = 0.;
    });
  }

  onWindowResize() {
    // this.camera.aspect = window.innerWidth / window.innerHeight;
    // this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  init() {
    if (WEBGL.isWebGL2Available() === false) {
      document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
    }

    this.initScene();
    this.initCamera();
    this.initSim();
  }
  initScene() {
    this.scene = new Scene();
  }

  initCamera() {
    this.camera = new PerspectiveCamera(
      50,
      1,
      0.2,
      10
    );

    // this.camera.position.set(0, 1, 0);
    // this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
  }

  initSim() {
    const velocity = this.createVelField();
    const pressuse = this.createPressureField();

    Promise.all([
      velocity,
      pressuse,
    ]).then(res => {
      res.needsUpdate = true;
      this.velField = res[0];
      this.presField = res[1];
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
      const mat = new MeshNormalMaterial({
      });

      this.mesh = new Mesh(geo, mat);
      this.mesh.position.z = -2;
      this.mesh.scale.set(0.1, 0.1, 0.1);
      this.scene.add(this.mesh);
      this.setup();
    }
  }

  createVelField() {
    const {
      config,
    } = this;
    return new Promise(resolve => {
      const width = config.cellSize;
      const height = config.cellSize;

      const size = width * height;
      const data = new Uint8Array(size * 3);

      for (let i = 0; i < size; i++) {
        const xVal = i % width;
        const yVal = Math.floor(i / width);

        const stride = i * 3;

        const mapX = (xVal / width) * (2 * Math.PI);
        const mapY = (yVal / width) * (2 * Math.PI);

        const colX = ((Math.sin(xVal / 2) + Math.sin(yVal / 2)) * 0.25 + 0.5) * 10;
        const colY = ((Math.sin(xVal / 2) - Math.sin(yVal / 2)) * 0.25 + 0.5) * 10;


        data[stride] = colX; // R channel
        data[stride + 1] = colY; // G channel
        data[stride + 2] = 255; // B channel
      }
      resolve(new DataTexture(data, width, height, RGBFormat));
	  });
  }

  createPressureField() {
    const {
      config,
    } = this;
    return new Promise(resolve => {
      const width = config.cellSize;
      const height = config.cellSize;

      const size = width * height;
      const data = new Uint8Array(size * 4);

      for (let i = 0; i < size / 4; i++) {
        // initialized to have no pressure
        data[i] = 0.0;
        data[i+1] = 0.0;
        data[i+2] = 0.0;
        data[i+3] = 1.0;
      }
      resolve(new DataTexture(data, width, height, RGBAFormat));
	  });
  }

  setup() {
    // RENDERER
    const context = this.canvas.getContext( 'webgl2', { alpha: false } );

    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvas,
      context,
    });
    this.renderer.setSize(this.config.cellSize, this.config.cellSize);
    this.renderer.setPixelRatio(window.devicePixelRatio);

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
      presField,
      config,
      scene,
      camera,
    } = this;

    const size = config.cellSize;

    this.velocityRenderTargetOne = new WebGLRenderTarget(size, size, {
      // internalFormat: 'RGB8_SNORM',
    });
    this.velocityRenderTargetTwo = new WebGLRenderTarget(size, size, {
      // internalFormat: 'RGB8_SNORM',
    });

    this.scalarRenderTargetOne = new WebGLRenderTarget(size, size, {
      // internalFormat: 'RGB8_SNORM',
    });
    // this.scalarRenderTargetTwo = new WebGLRenderTarget(512, 512);

    this.velocityRenderTargetTwo.texture = presField;

    this.velocityComposer = new EffectComposer(renderer);
    this.velocityComposer.renderToScreen = false;

    // 1. advectVelocity: takes in initial velField, returns new intermediate velocity field
    const advectPass = new ShaderPass(AdvectPassShader);
    advectPass.uniforms['velField'].value = this.velocityRenderTargetTwo.texture;
    advectPass.uniforms['toAdvect'].value = this.velocityRenderTargetTwo.texture;
    advectPass.uniforms['dissipation'].value = .02;
    this.velocityComposer.addPass(advectPass);

    // 2. applyForces: maybeUse initial dye shader to add? returns new velocity field
    const applyForces = new ShaderPass(AddForce, 'uDiffuse');
    applyForces.uniforms['point'].value = new Vector2(this.mouse.x, this.mouse.y);
    applyForces.uniforms['forces'].value = new Vector3(this.mouse.Dx, this.mouse.Dy, 0.0);
    this.velocityComposer.addPass(applyForces);
    this.velocityComposer.addPass(new SavePass(this.velocityRenderTargetOne));


    this.divergenceComposer = new EffectComposer(renderer);
    this.divergenceComposer.renderToScreen = false;

    // 3. computeDivergence: takes vel field and produces divergence
    const computeDivergence = new ShaderPass(DivergenceShader);
    computeDivergence.uniforms['w'].value = this.velocityRenderTargetOne.texture;
    computeDivergence.uniforms['halfRdx'].value = 0.5*(1 / size);

    this.divergenceComposer.addPass(computeDivergence);

    // 4. solvePressure: jacobi iterations with divergence and pressure field. returns pressure gradient
    const solvePressure = new ShaderPass(JacobiIterationShader, 'b');
    solvePressure.uniforms['x'].value = presField;
    solvePressure.uniforms['rBeta'].value = 1 / 4;
    solvePressure.uniforms['alpha'].value = -size * size;

    for (let i = 0; i < 40; i++) {
      this.divergenceComposer.addPass(solvePressure);
    }

    // 5. subtractPressure: takes pressure gradient and intermediate velocity field and returns new velocity field
    const subtractPressure = new ShaderPass(GradientSubtractionShader, 'p');
    subtractPressure.uniforms['w'].value = this.velocityRenderTargetOne.texture;
    subtractPressure.uniforms['halfRdx'].value = 0.5 * (1 / size);
    this.divergenceComposer.addPass(subtractPressure);
    this.divergenceComposer.addPass(new SavePass(this.velocityRenderTargetTwo));

    // Updating Dye
    this.dyeComposer = new EffectComposer(renderer);
    this.dyeComposer.renderToScreen = false;

    const addingDye = new ShaderPass(AddForce);
    addingDye.uniforms['uDiffuse'].value = this.scalarRenderTargetOne.texture;
    this.dyeComposer.addPass(addingDye);

    const advectDye = new ShaderPass(AdvectPassShader, 'toAdvect');
    advectDye.uniforms['velField'].value = this.velocityRenderTargetTwo.texture;
    advectDye.uniforms['dissipation'].value = .02;
    this.dyeComposer.addPass(advectDye);

    this.dyeComposer.addPass(new SavePass(this.scalarRenderTargetOne));


    // final display
    this.stageTwoComposer = new EffectComposer(renderer);
    const displayDye = new ShaderPass(DisplayDye);
    displayDye.uniforms['tMix'].value = this.scalarRenderTargetOne.texture;
    this.stageTwoComposer.addPass(displayDye);
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.render();
  }

  render(time) {
    const delta = this.startTime - Date.now();

    if (this.mouseDown) {
      this.velocityComposer.passes[1].uniforms.point.value = new Vector2(this.mouse.x, this.mouse.y);
      this.velocityComposer.passes[1].uniforms.forces.value = new Vector3(this.mouse.Dx * 6000, this.mouse.Dy * 6000, 0.0);

      this.dyeComposer.passes[0].uniforms['point'].value = new Vector2(this.mouse.x, this.mouse.y);
      this.dyeComposer.passes[0].uniforms['forces'].value = new Vector3(1., 1., 1.);
    } else {
      this.velocityComposer.passes[1].uniforms.point.value = new Vector2(this.mouse.x, this.mouse.y);
      this.velocityComposer.passes[1].uniforms.forces.value = new Vector3(0., 0., 0.0);

      this.dyeComposer.passes[0].uniforms['point'].value = new Vector2(this.mouse.x, this.mouse.y);
      this.dyeComposer.passes[0].uniforms['forces'].value = new Vector3(0.0, 0.0, 0.0);
    }


    this.velocityComposer.render();
    this.divergenceComposer.render();
    this.dyeComposer.render();
    this.stageTwoComposer.render();
  }
}
