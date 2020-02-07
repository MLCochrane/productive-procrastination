import {
  Scene,
  PerspectiveCamera,
  Vector3,
  Vector2,
  Mesh,
  WebGLRenderer,
  OrthographicCamera,
  WebGLRenderTarget,
  RGBAFormat,
  PlaneBufferGeometry,
  ShaderMaterial,
  LinearFilter,
  HalfFloatType,
  RGFormat,
  RedFormat,
  NearestFilter,
} from 'three';


import {
  advectShader,
}
from './advectShader';
import {
  divergenceShader,
}
from './divergenceShader';
import {
  pressureShader,
}
from './jacobiShader';
import {
  gradientSubtraction,
}
from './gradientSubtractionShader';

import {
  clearShader,
} from './clearShader';

import {
  displayShader,
} from './displayDye';

import {
  addForce,
}
from './addForce';


export default class WaterSim {
  constructor() {
    this.renderer;
    this.scene;
    this.camera;

    this.page = document.querySelector('.page-main');
    this.canvas = document.getElementById('Sandbox');
    this.dims = this.page.getBoundingClientRect();
    this.startTime = Date.now();

    this.file = `${ASSET_PATH}/assets/TestNormalMap.jpg`,

    this.texture = null;

    this.config = {
      simResolution: 128,
      dyeResolution: 1024,
      displayWidth: this.dims.width,
      displayHeight: this.dims.height,
      aspect: this.dims.width / this.dims.height,
      geo: new PlaneBufferGeometry(2, 2),
    };

    this.mouse = {
      x: 0.5,
      y: 0.5,
      Dx: 0.,
      Dy: 0.,
      color: new Vector3(0.1, 0.6, 0.1),
    };

    this.animate = this.animate.bind(this);
    this.render = this.render.bind(this);
    this.setup = this.setup.bind(this);
    this.step = this.step.bind(this);
    this.initSim = this.initSim.bind(this);
    // this.render = this.render.bind(this);

    this.bindEvents();
    this.init();
  }

  bindEvents() {
    // IMPROVE THE COPYING UPDATING OF VALUES HERE
    window.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth;
      const y = Math.abs((e.clientY / window.innerHeight) - 1.);
      if (!this.mouseDown) return;
      const curMouse = {
        x,
        y,
        // Dx: ((x - this.mouse.x) + 1.) / 2.,
        // Dy: ((y - this.mouse.y) + 1.) / 2.,
        Dx: x - this.mouse.x,
        Dy: y - this.mouse.y,
        color: this.mouse.color,
      };

      this.mouse = curMouse;
    });

    window.addEventListener('mousedown', () => {
      this.mouseDown = true;
    });

    window.addEventListener('mouseup', () => {
      this.mouseDown = false;

      this.mouse.color = new Vector3(Math.random(), Math.random(), Math.random());
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
    this.setup();
    this.initRenderTargets();
    this.initSim();
  }

  setup() {
    const {
      config,
      canvas,
    } = this;

    const ctx = canvas.getContext('webgl2');
    // RENDERER
    this.renderer = new WebGLRenderer({
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
      canvas: canvas,
      context: ctx,
    });

    this.renderer.extensions.get('EXT_color_buffer_float');
    // gl.getExtension();

    this.renderer.setSize(config.displayWidth, config.displayHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  initRenderTargets() {
    const {
      config,
    } = this;

    const simRes = config.simResolution;
    this.velocity = this.doubleTarget(
      simRes,
      simRes,
      {
        // format: RGFormat,
        // internalFormat: 'RGBA16F',
        type: HalfFloatType,
      },
      advectShader
    );

    this.divergence = this.singleTarget(
      simRes,
      simRes,
      {
        // format: RedFormat,
        // internalFormat: 'R16F',
        type: HalfFloatType,
      },
      divergenceShader
    );

    this.pressure = this.doubleTarget(
      simRes,
      simRes,
      {
        // format: RedFormat,
        // internalFormat: 'R16F',
        type: HalfFloatType,
      },
      pressureShader
    );

    this.dye = this.doubleTarget(1024, 1024, {
      type: HalfFloatType,
    },
    advectShader
    );
    this.clearProgram = this.programScene(clearShader);
    this.gradientSubtractionProgram = this.programScene(gradientSubtraction);
    this.addForceProgram = this.programScene(addForce);
  }

  programScene(shader, uniforms) {
    const prgScene = new Scene();
    const prgMat = new ShaderMaterial(shader);
    const prgMesh = new Mesh(this.config.geo, prgMat);
    prgScene.add(prgMesh);

    return {
      mat: prgMat,
      scene: prgScene
    }
  }

  doubleTarget(width, height, options, shader, uniforms) {
    let trg1 = new WebGLRenderTarget(width, height, options);
    let trg2 = new WebGLRenderTarget(width, height, options);

    const targetScene = new Scene();
    const targetMat = new ShaderMaterial(shader);
    const targetMesh = new Mesh(this.config.geo, targetMat);
    targetScene.add(targetMesh);

    return {
      width,
      height,
      texelSizeX: 1/width,
      texelSizeY: 1/height,
      scene: targetScene,
      mat: targetMat,
      get read() {
        return trg1;
      },
      set read(value) {
        trg1 = value;
      },
      get write() {
        return trg2;
      },
      set write(value) {
        trg2 = value;
      },
      swap() {
        let temp = trg1;
        trg1 = trg2;
        trg2 = temp;
      }
    }
  }

  singleTarget(width, height, options, shader, uniforms) {
    let trg1 = new WebGLRenderTarget(width, height, options);

    const targetScene = new Scene();
    const targetMat = new ShaderMaterial(shader);
    const targetMesh = new Mesh(this.config.geo, targetMat);
    targetScene.add(targetMesh);

    return {
      width,
      height,
      texelSizeX: 1 / width,
      texelSizeY: 1 / height,
      scene: targetScene,
      mat: targetMat,
      get target() {
        return trg1;
      },
      set target(value) {
        trg1 = value;
      }
    }
  }

  initSim() {
    this.displayScene();
    this.animate();
  }

  displayScene() {
    const {
      config,
    } = this;

    this.displayScene = new Scene();
    this.displayCamera = new OrthographicCamera(
      -1, // left
      1, // right
      1, // top
      -1, // bottom
      -1, // near,
      1, // far
    );

    this.displayScene.add(this.displayCamera);

    const displayMaterial = new ShaderMaterial(displayShader);
    this.displayQuad = new Mesh(config.geo, displayMaterial);
    this.displayScene.add(this.displayQuad);
  }

  step(delta) {
    const {
      mouse,
      renderer,
      config,
      displayCamera,
      velocity,
      divergence,
      pressure,
      clearProgram,
      gradientSubtractionProgram,
      addForceProgram,
      dye,
    } = this;

    const res = config.simResolution;

    const rdx = 1 / res;
    const halfRdx = rdx * 0.5;
    const alpha = -res * res;

    renderer.setViewport(0, 0, res, res);

    // ADVECTION
    renderer.setRenderTarget(velocity.write);
    velocity.mat.uniforms.uVelocity.value = velocity.read.texture;
    velocity.mat.uniforms.uSource.value = velocity.read.texture;
    velocity.mat.uniforms.uRdx.value = rdx;
    velocity.mat.uniforms.uTimeStep.value = 0.016;
    velocity.mat.uniforms.uTexelSize.value = new Vector2(velocity.texelSizeX, velocity.texelSizeY);
    velocity.mat.uniforms.uDissipation.value = 0.99;
    renderer.render(velocity.scene, displayCamera);
    renderer.setRenderTarget(null); // removes bound target so correctly swapped?
    velocity.swap();

    // FORCES
    renderer.setRenderTarget(velocity.write);
    addForceProgram.mat.uniforms.uDiffuse.value = velocity.read.texture;
    addForceProgram.mat.uniforms.uTexelSize.value = new Vector2(velocity.texelSizeX, velocity.texelSizeY);
    addForceProgram.mat.uniforms.uPoint.value = new Vector2(mouse.x, mouse.y);
    addForceProgram.mat.uniforms.uAspect.value = config.aspect;
    addForceProgram.mat.uniforms.uForces.value = new Vector3(mouse.Dx * 10000, mouse.Dy * 10000, 0.);
    addForceProgram.mat.uniforms.uMoved.value = 1;
    renderer.render(addForceProgram.scene, displayCamera);
    renderer.setRenderTarget(null); // removes bound target so correctly swapped?
    velocity.swap();

    // DIVERGENCE
    renderer.setRenderTarget(divergence.target);
    divergence.mat.uniforms.uVelocity.value = velocity.read.texture;
    divergence.mat.uniforms.uHalfRdx.value = halfRdx;
    divergence.mat.uniforms.uTexelSize.value = new Vector2(velocity.texelSizeX, velocity.texelSizeY);
    renderer.render(divergence.scene, displayCamera);

    // CLEAR PRESSURE
    renderer.setRenderTarget(pressure.write);
    clearProgram.mat.uniforms.uTexture.value = pressure.read.texture;
    clearProgram.mat.uniforms.uTexelSize.value = new Vector2(velocity.texelSizeX, velocity.texelSizeY);
    clearProgram.mat.uniforms.uValue.value = 0.;
    renderer.render(clearProgram.scene, displayCamera);
    renderer.setRenderTarget(null); // removes bound target so correctly swapped?
    pressure.swap();


    // PRESSURE SOLVER
    renderer.setRenderTarget(pressure.write); // unnecessary?
    pressure.mat.uniforms.uDivergence.value = divergence.target.texture;
    pressure.mat.uniforms.uTexelSize.value = new Vector2(velocity.texelSizeX, velocity.texelSizeY);
    pressure.mat.uniforms.uAlpha.value = alpha;

    for (let i = 0; i<30; i++) {
      renderer.setRenderTarget(pressure.write);
      pressure.mat.uniforms.uPressure.value = pressure.read.texture;
      renderer.render(pressure.scene, displayCamera);
      renderer.setRenderTarget(null);
      pressure.swap();
    }

    // GRADIENT SUBTRACTION
    renderer.setRenderTarget(velocity.write);
    gradientSubtractionProgram.mat.uniforms.uTexelSize.value = new Vector2(velocity.texelSizeX, velocity.texelSizeY);
    gradientSubtractionProgram.mat.uniforms.uVelocity.value = velocity.read.texture;
    gradientSubtractionProgram.mat.uniforms.uPressure.value = pressure.read.texture;
    gradientSubtractionProgram.mat.uniforms.uHalfRdx.value = halfRdx;
    renderer.render(gradientSubtractionProgram.scene, displayCamera);
    velocity.swap();

    // DYE FORCES
    renderer.setRenderTarget(dye.write);
    addForceProgram.mat.uniforms.uDiffuse.value = dye.read.texture;
    addForceProgram.mat.uniforms.uTexelSize.value = new Vector2(dye.texelSizeX, dye.texelSizeY);
    addForceProgram.mat.uniforms.uPoint.value = new Vector2(mouse.x, mouse.y);
    addForceProgram.mat.uniforms.uAspect.value = config.aspect;
    addForceProgram.mat.uniforms.uForces.value = mouse.color;
    addForceProgram.mat.uniforms.uMoved.value = this.mouseDown ? 1 : 0;
    addForceProgram.mat.uniforms.uRadius.value = 0.3 / 100;
    renderer.render(addForceProgram.scene, displayCamera);
    renderer.setRenderTarget(null); // removes bound target so correctly swapped?
    dye.swap();

    // DYE ADVECT
    renderer.setRenderTarget(dye.write);
    dye.mat.uniforms.uVelocity.value = velocity.read.texture;
    dye.mat.uniforms.uSource.value = dye.read.texture;
    dye.mat.uniforms.uRdx.value = rdx;
    dye.mat.uniforms.uTimeStep.value = 0.016;
    dye.mat.uniforms.uTexelSize.value = new Vector2(dye.texelSizeX, dye.texelSizeY);
    dye.mat.uniforms.uDissipation.value = .99;
    renderer.render(dye.scene, displayCamera);
    dye.swap();

    renderer.setViewport(0, 0, config.displayWidth, config.displayHeight);
    renderer.setRenderTarget(null);
  }

  animate() {
    requestAnimationFrame(this.animate);

    this.render();
  }

  render(time) {
    const {
      renderer,
      dye,
      displayCamera,
      displayScene,
      startTime,
      step
    } = this;

    const delta = Date.now() - startTime;

    step(delta);

    this.displayQuad.material.uniforms.tDiffuse.value = dye.write.texture;
    renderer.render(displayScene, displayCamera);
  }
}

/*
update() {
  const dt = calcDeltaTime();
  if (resizeCanvas()) initFramebuffers();
  updateColors(dt);
  applyInputs();
  step(dt);
  render(null);
  requestAnimationFrame(update);
}
*/
