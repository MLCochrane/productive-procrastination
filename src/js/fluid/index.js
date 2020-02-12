import {
  Scene,
  Vector3,
  Vector2,
  Mesh,
  WebGLRenderer,
  OrthographicCamera,
  WebGLRenderTarget,
  PlaneBufferGeometry,
  ShaderMaterial,
  HalfFloatType,
  CanvasTexture,
} from 'three';

import TextRender from './textCanvas';
import addTexture from './addTexture';

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


export default class Fluid {
  constructor() {
    this.renderer;
    this.scene;
    this.camera;

    this.page = document.querySelector('.page-main');
    this.canvas = document.getElementById('Sandbox');
    this.overlayCanvas = document.getElementById('OverlayCanvas');
    this.input = document.getElementById('LeInput');
    this.dims = this.page.getBoundingClientRect();
    this.startTime = Date.now();

    this.config = {
      simResolution: 128,
      dyeResolution: 1024,
      velDissipation: 0.99,
      dyeDissipation: 0.99,
      forceMultiplier: 2000,
      displayWidth: this.dims.width,
      displayHeight: this.dims.height,
      aspect: this.dims.width / this.dims.height,
      geo: new PlaneBufferGeometry(2, 2),
      useTyping: true,
    };

    this.forces = {
      mouse: {
        active: 1,
        x: 0.5,
        y: 0.5,
        Dx: 0.0,
        Dy: 0.0,
        color: new Vector3(0.1, 0.1, 0.1),
      },
      text: {
        active: 0,
        x: 0,
        y: 0,
        Dx: 0.0,
        Dy: 0.0,
      },
    };

    this.animate = this.animate.bind(this);
    this.step = this.step.bind(this);
    this.addTextTexture = this.addTextTexture.bind(this);
    this.generateTextForces = this.generateTextForces.bind(this);

    if (this.config.useTyping) {
      this.typing = true;
      this.text = new TextRender(
        this.overlayCanvas,
        this.dims.width,
        this.dims.height,
        this.addTextTexture,
      );
    }

    this.init();
    this.bindEvents();
  }

  bindEvents() {
    // IMPROVE THE COPYING UPDATING OF VALUES HERE
    window.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth;
      const y = Math.abs((e.clientY / window.innerHeight) - 1.0);
      if (!this.mouseDown) return;
      const curMouse = {
        active: 1,
        x,
        y,
        Dx: x - this.forces.mouse.x,
        Dy: y - this.forces.mouse.y,
        color: this.forces.mouse.color,
      };

      this.forces.mouse = curMouse;
    });

    window.addEventListener('mousedown', () => {
      this.mouseDown = true;
      // this.closeTyping();
    });

    window.addEventListener('mouseup', () => {
      this.mouseDown = false;

      this.forces.mouse.color = new Vector3(Math.random(), Math.random(), Math.random());
      this.forces.mouse.Dx = 0.0;
      this.forces.mouse.Dy = 0.0;
    });
  }

  addTextTexture(position) {
    const {
      dye,
      addTexProgram,
      renderer,
      overlayCanvas,
      displayCamera,
      generateTextForces,
    } = this;

    renderer.setRenderTarget(dye.write);
    addTexProgram.mat.uniforms.uDiffuse.value = dye.read.texture;
    addTexProgram.mat.uniforms.uNewTexture.value = new CanvasTexture(overlayCanvas);
    addTexProgram.mat.uniforms.uTexelSize.value = new Vector2(dye.texelSizeX, dye.texelSizeY);
    renderer.render(addTexProgram.scene, displayCamera);
    renderer.setRenderTarget(null);
    dye.swap();

    generateTextForces(position);
  }

  generateTextForces({ x, y }) {
    const {
      forces,
      config,
    } = this;

    forces.text.x = x / config.displayWidth;
    forces.text.y = y / config.displayHeight;
    forces.text.Dx = Math.random() * 2 - 1;
    forces.text.Dy = Math.random() * 2 - 1;
    forces.text.active = 1;
  }

  onWindowResize() {
    const {
      renderer,
      config,
    } = this;

    renderer.setSize(config.displayWidth, config.displayHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
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
      canvas,
      context: ctx,
    });

    this.renderer.extensions.get('EXT_color_buffer_float');
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
      simRes, {
        // format: RGFormat,
        // internalFormat: 'RGBA16F',
        type: HalfFloatType,
      },
      advectShader,
    );

    this.divergence = this.singleTarget(
      simRes,
      simRes, {
        // format: RedFormat,
        // internalFormat: 'R16F',
        type: HalfFloatType,
      },
      divergenceShader,
    );

    this.pressure = this.doubleTarget(
      simRes,
      simRes, {
        // format: RedFormat,
        // internalFormat: 'R16F',
        type: HalfFloatType,
      },
      pressureShader,
    );

    this.dye = this.doubleTarget(1024, 1024, {
      type: HalfFloatType,
    },
    advectShader);
    this.clearProgram = this.programScene(clearShader);
    this.gradientProgram = this.programScene(gradientSubtraction);
    this.addForceProgram = this.programScene(addForce);
    this.addTexProgram = this.programScene(addTexture);
  }

  programScene(shader) {
    const prgScene = new Scene();
    const prgMat = new ShaderMaterial(shader);
    const prgMesh = new Mesh(this.config.geo, prgMat);
    prgScene.add(prgMesh);

    return {
      mat: prgMat,
      scene: prgScene,
    };
  }

  doubleTarget(width, height, options, shader) {
    let trg1 = new WebGLRenderTarget(width, height, options);
    let trg2 = new WebGLRenderTarget(width, height, options);

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
        const temp = trg1;
        trg1 = trg2;
        trg2 = temp;
      },
    };
  }

  singleTarget(width, height, options, shader) {
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
      },
    };
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

  step() {
    const {
      useTyping,
      renderer,
      config,
      displayCamera,
      velocity,
      divergence,
      pressure,
      clearProgram,
      gradientProgram,
      addForceProgram,
      dye,
      forces,
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
    velocity.mat.uniforms.uDissipation.value = config.velDissipation;
    renderer.render(velocity.scene, displayCamera);
    renderer.setRenderTarget(null); // removes bound target so correctly swapped?
    velocity.swap();

    // FORCES
    renderer.setRenderTarget(velocity.write);
    addForceProgram.mat.uniforms.uTexelSize.value = new Vector2(velocity.texelSizeX, velocity.texelSizeY);
    addForceProgram.mat.uniforms.uAspect.value = config.aspect;
    for (let i = 0; i < 2; i++) {
      renderer.setRenderTarget(velocity.write);
      const force = i === 0 ? forces.mouse : forces.text; // PLEASE COME UP WITH SOMETHING ELSE!
      addForceProgram.mat.uniforms.uPoint.value = new Vector2(force.x, force.y);
      addForceProgram.mat.uniforms.uForces.value = new Vector3(
        force.Dx * config.forceMultiplier,
        force.Dy * config.forceMultiplier,
        0.0,
      );
      addForceProgram.mat.uniforms.uMoved.value = force.active;
      addForceProgram.mat.uniforms.uDiffuse.value = velocity.read.texture;
      renderer.render(addForceProgram.scene, displayCamera);
      renderer.setRenderTarget(null); // removes bound target so correctly swapped?
      velocity.swap();
    }

    forces.text.active = 0;

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
    clearProgram.mat.uniforms.uValue.value = 0.3;
    renderer.render(clearProgram.scene, displayCamera);
    renderer.setRenderTarget(null); // removes bound target so correctly swapped?
    pressure.swap();

    // PRESSURE SOLVER
    renderer.setRenderTarget(pressure.write); // unnecessary?
    pressure.mat.uniforms.uDivergence.value = divergence.target.texture;
    pressure.mat.uniforms.uTexelSize.value = new Vector2(velocity.texelSizeX, velocity.texelSizeY);
    pressure.mat.uniforms.uAlpha.value = alpha;

    for (let j = 0; j < 30; j++) {
      renderer.setRenderTarget(pressure.write);
      pressure.mat.uniforms.uPressure.value = pressure.read.texture;
      renderer.render(pressure.scene, displayCamera);
      renderer.setRenderTarget(null);
      pressure.swap();
    }

    // GRADIENT SUBTRACTION
    renderer.setRenderTarget(velocity.write);
    gradientProgram.mat.uniforms.uTexelSize.value = new Vector2(velocity.texelSizeX, velocity.texelSizeY);
    gradientProgram.mat.uniforms.uVelocity.value = velocity.read.texture;
    gradientProgram.mat.uniforms.uPressure.value = pressure.read.texture;
    gradientProgram.mat.uniforms.uHalfRdx.value = halfRdx;
    renderer.render(gradientProgram.scene, displayCamera);
    velocity.swap();

    // DYE FORCES
    if (!useTyping) {
      renderer.setRenderTarget(dye.write);
      addForceProgram.mat.uniforms.uDiffuse.value = dye.read.texture;
      addForceProgram.mat.uniforms.uTexelSize.value = new Vector2(dye.texelSizeX, dye.texelSizeY);
      addForceProgram.mat.uniforms.uPoint.value = new Vector2(forces.mouse.x, forces.mouse.y);
      addForceProgram.mat.uniforms.uAspect.value = config.aspect;
      addForceProgram.mat.uniforms.uForces.value = forces.mouse.color;
      addForceProgram.mat.uniforms.uMoved.value = this.mouseDown ? 1 : 0;
      addForceProgram.mat.uniforms.uRadius.value = 0.3 / 100;
      renderer.render(addForceProgram.scene, displayCamera);
      renderer.setRenderTarget(null); // removes bound target so correctly swapped?
      dye.swap();
    }

    // DYE ADVECT
    renderer.setRenderTarget(dye.write);
    dye.mat.uniforms.uVelocity.value = velocity.read.texture;
    dye.mat.uniforms.uSource.value = dye.read.texture;
    dye.mat.uniforms.uRdx.value = rdx;
    dye.mat.uniforms.uTimeStep.value = 0.016;
    dye.mat.uniforms.uTexelSize.value = new Vector2(dye.texelSizeX, dye.texelSizeY);
    dye.mat.uniforms.uDissipation.value = config.dyeDissipation;
    renderer.render(dye.scene, displayCamera);
    dye.swap();

    renderer.setViewport(0, 0, config.displayWidth, config.displayHeight);
    renderer.setRenderTarget(null);
  }

  animate() {
    requestAnimationFrame(this.animate);

    this.render();
  }

  render() {
    const {
      renderer,
      dye,
      displayCamera,
      displayScene,
      startTime,
      step,
    } = this;

    const delta = Date.now() - startTime;

    step(delta);

    this.displayQuad.material.uniforms.tDiffuse.value = dye.write.texture;
    renderer.render(displayScene, displayCamera);
  }
}
