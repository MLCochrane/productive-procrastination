
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
  Material,
} from 'three';

import TextRender from './textCanvas';

import addTexture from './addTexture';
import advectShader from './advectShader';
import divergenceShader from './divergenceShader';
import pressureShader from './jacobiShader';
import gradientSubtraction from './gradientSubtractionShader';
import clearShader from './clearShader';
import displayShader from './displayDye';
import addForce from './addForce';

interface FBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  scene: Scene;
  mat: ShaderMaterial;
  target: WebGLRenderTarget;
}

interface DFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  scene: Scene;
  mat: ShaderMaterial;
  read: WebGLRenderTarget;
  write: WebGLRenderTarget;
  swap: Function;
}

interface Program {
  mat: ShaderMaterial;
  scene: Scene;
}

interface Shader {
  uniforms: Object;
  fragmentShader: string;
  vertexShader: string;
}

/**
 * Class handling fluid simulation.
 *
 */
export default class Fluid {
  canvas: HTMLCanvasElement;
  overlayCanvas: HTMLCanvasElement;
  input: HTMLElement | null;
  sidebarWidth: number;
  time: Date;
  startTime: number;
  config: { simResolution: number; dyeResolution: number; velDissipation: number; dyeDissipation: number; forceMultiplier: number; displayWidth: number; displayHeight: number; aspect: number; geo: PlaneBufferGeometry; useTyping: boolean; };
  forces: { mouse: { active: number; x: number; y: number; Dx: number; Dy: number; color: Vector3; }; text: { active: number; x: number; y: number; Dx: number; Dy: number; }; };
  typing!: boolean;
  text!: TextRender;
  renderer: WebGLRenderer;
  mouseDown!: boolean;
  velocity!: DFBO;
  divergence!: FBO;
  pressure!: DFBO;
  dye!: DFBO;
  clearProgram!: Program;
  gradientProgram!: Program;
  addForceProgram!: Program;
  addTexProgram!: Program;
  displayCamera!: OrthographicCamera;
  displayQuad!: Mesh;
  raf!: number;
  displayScene!: Scene;
  constructor() {
    this.canvas = document.getElementById('Fluid') as HTMLCanvasElement;
    this.overlayCanvas = document.getElementById('OverlayCanvas') as HTMLCanvasElement;
    this.input = document.getElementById('LeInput');
    this.sidebarWidth = window.innerWidth > 1024 ? 90 : 50;
    this.time = new Date();
    this.startTime = Date.now();

    const displayWidth = window.innerWidth - this.sidebarWidth;
    const displayHeight = window.innerHeight;

    this.config = {
      simResolution: 128,
      dyeResolution: 1024,
      velDissipation: 0.99,
      dyeDissipation: 0.99,
      forceMultiplier: 4000,
      displayWidth,
      displayHeight,
      aspect: displayWidth / displayHeight,
      geo: new PlaneBufferGeometry(2, 2),
      useTyping: false,
    };

    this.forces = {
      mouse: {
        active: 1,
        x: 0.5,
        y: 0.5,
        Dx: 0.0,
        Dy: 0.0,
        color: new Vector3(0.48, 0.77, 0.48),
      },
      text: {
        active: 0,
        x: 0,
        y: 0,
        Dx: 0.0,
        Dy: 0.0,
      },
    };

    this.setUpRenderer = this.setUpRenderer.bind(this);
    this.setDisplayScene = this.setDisplayScene.bind(this);
    this.animate = this.animate.bind(this);
    this.step = this.step.bind(this);
    this.addTextTexture = this.addTextTexture.bind(this);
    this.generateTextForces = this.generateTextForces.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    if (this.config.useTyping) {
      this.typing = true;
      this.text = new TextRender(
        this.overlayCanvas as HTMLCanvasElement,
        displayWidth,
        displayHeight,
        this.addTextTexture,
      );
    }

    this.renderer = this.setUpRenderer();
    this.init();
    this.bindEvents();
  }

  /**
   * Sets up event handlers.
   * @function bindEvents
   * @memberof Fluid.prototype
   */
  bindEvents() {
    const {
      onMouseDown,
      onMouseUp,
      onMouseMove,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onWindowResize,
    } = this;


    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', onWindowResize);
  }

  /**
   * Removes event listeners.
   * @function destroy
   * @memberof Fluid.prototype
   */
  destroy() {
    const {
      raf,
      onMouseDown,
      onMouseUp,
      onMouseMove,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onWindowResize,
      text,
    } = this;

    window.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('resize', onWindowResize);

    if (text) text.destroy();
    cancelAnimationFrame(raf);
  }

  /**
   * Callback for touchstart event.
   * @function onTouchStart
   * @memberof Fluid.prototype
   */
  onTouchStart() {
    this.mouseDown = true;
  }

  /**
   * Callback for mouseup event.
   * @function onTouchEnd
   * @memberof Fluid.prototype
   */
  onTouchEnd() {
    this.mouseDown = false;

    this.forces.mouse.color = new Vector3(Math.random(), Math.random(), Math.random());
    this.forces.mouse.Dx = 0.0;
    this.forces.mouse.Dy = 0.0;
  }

  /**
   * Callback for touchmove event
   * @function onTouchMove
   * @memberof Fluid.prototype
   */
  onTouchMove(e: TouchEvent) {
    const {
      clientX,
      clientY,
    } = e.touches[0];
    const x = clientX / window.innerWidth;
    const y = Math.abs((clientY / window.innerHeight) - 1.0);
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
  }

  /**
   * Callback for mousedown event.
   * @function onMouseDown
   * @memberof Fluid.prototype
   */
  onMouseDown() {
    this.mouseDown = true;
  }

  /**
   * Callback for mouseup event.
   * @function onMouseUp
   * @memberof Fluid.prototype
   */
  onMouseUp() {
    this.mouseDown = false;

    this.forces.mouse.color = new Vector3(Math.random(), Math.random(), Math.random());
    this.forces.mouse.Dx = 0.0;
    this.forces.mouse.Dy = 0.0;
  }

  /**
   * Callback for mousemove event.
   * @function onMouseMove
   * @memberof Fluid.prototype
   */
  onMouseMove(
    {
      clientX, // - Y component of pixel coordinate of mouse event.
      clientY // - X component of pixel coordinate of mouse event.
    }:
    {clientX: number, clientY: number}
    ) {
    const x = clientX / window.innerWidth;
    const y = Math.abs((clientY / window.innerHeight) - 1.0);
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
  }

  /**
   * Callback for resize event.
   * @function onWindowResize
   * @memberof Fluid.prototype
   */
  onWindowResize() {
    const {
      renderer,
      config,
    } = this;

    this.sidebarWidth = window.innerWidth > 1024 ? 90 : 50;
    const displayWidth = window.innerWidth - this.sidebarWidth;
    const displayHeight = window.innerHeight;

    config.displayWidth = displayWidth;
    config.displayHeight = displayHeight;
    config.aspect = displayWidth / displayHeight;

    renderer.setSize(config.displayWidth, config.displayHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  }

  /**
   * Callback passed to text render class to add the 2D canvas as a texture to dye.
   * @function addTextTexture
   * @memberof Fluid.prototype
   */
  addTextTexture(position: Vector2) {
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

  /**
   * Generate velocity forces to add based on rendered character position.
   * @function generateTextForces
   * @memberof Fluid.prototype
   */
  generateTextForces({ x, y }: Vector2) {
    const {
      forces,
      config,
    } = this;

    forces.text.x = x / config.displayWidth;
    forces.text.y = y / config.displayHeight;
    forces.text.Dx = Math.random() * 0.5 - 0.5;
    forces.text.Dy = Math.random() * 0.5 - 0.5;
    forces.text.active = 1;
  }

  /**
   * Sets order of method calls.
   * @function init
   * @memberof Fluid.prototype
   */
  init() {
    this.initRenderTargets();
    this.initSim();
  }

  /**
   * Creates new WebGLRenderer with various options.
   * @function setUpRenderer
   * @memberof Fluid.prototype
   */
  setUpRenderer(): WebGLRenderer {
    const {
      config,
      canvas,
    } = this;

    // const ctx = canvas.getContext('webgl2');
    // RENDERER
    const renderer = new WebGLRenderer({
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
      canvas,
      // context: ctx,
    });

    renderer.setSize(config.displayWidth, config.displayHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    return renderer;
  }

  /**
   * Creates all render targets and programs needed for simulation.
   * @function initRenderTargets
   * @memberof Fluid.prototype
   */
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

  /**
   * Generate shader material and scene to use in a render pass.
   * @function programScene
   * @memberof Fluid.prototype
   */
  programScene(shader: Shader) {
    const prgScene = new Scene();
    const prgMat = new ShaderMaterial(shader);
    const prgMesh = new Mesh(this.config.geo, prgMat);
    prgScene.add(prgMesh);

    return {
      mat: prgMat,
      scene: prgScene,
    };
  }

  /**
   * Create object with two render targets used as read/write buffers and method to swap.
   * @function doubleTarget
   * @memberof Fluid.prototype
   */
  doubleTarget(
    width: number,
    height: number,
    options: Object,
    shader: Shader
    ): DFBO {
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

  /**
   * Create object with single render target. Only difference between doubleTarget
   * is that there will be no need to use render result in subsequent calls and thus
   * no need for method to swap between.
   * @function singleTarget
   * @memberof Fluid.prototype
   */
  singleTarget(
    width: number,
    height: number,
    options: Object,
    shader: Shader
    ): FBO {
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

  /**
   * Sets up method order of actual simulation.
   * @function initSim
   * @memberof Fluid.prototype
   */
  initSim() {
    const {
      setDisplayScene,
      animate,
      text,
      time,
      config,
    } = this;

    setDisplayScene();
    const hours = time.getHours() % 12;
    let minutes = time.getMinutes();
    const minuteString: string = minutes < 10 ? `0${minutes}` : minutes.toString();
    if (config.useTyping) text.initialDraw([hours, minuteString].join(':'));
    animate();
  }

  /**
   * Sets up display camera for use in sim as well as materal and scene for final render pass.
   * @function setDisplayScene
   * @memberof Fluid.prototype
   */
  setDisplayScene() {
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

  /**
   * Sets up order of render passes for fluid simulation. Heart of the sim right here.
   * @function step
   * @memberof Fluid.prototype
   */
  step() {
    const {
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
    addForceProgram.mat.uniforms.uTexelSize.value = new Vector2(
      velocity.texelSizeX,
      velocity.texelSizeY,
    );
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
    divergence.mat.uniforms.uTexelSize.value = new Vector2(
      velocity.texelSizeX,
      velocity.texelSizeY,
    );
    renderer.render(divergence.scene, displayCamera);

    // CLEAR PRESSURE
    renderer.setRenderTarget(pressure.write);
    clearProgram.mat.uniforms.uTexture.value = pressure.read.texture;
    clearProgram.mat.uniforms.uTexelSize.value = new Vector2(
      velocity.texelSizeX,
      velocity.texelSizeY,
    );
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
    gradientProgram.mat.uniforms.uTexelSize.value = new Vector2(
      velocity.texelSizeX,
      velocity.texelSizeY,
    );
    gradientProgram.mat.uniforms.uVelocity.value = velocity.read.texture;
    gradientProgram.mat.uniforms.uPressure.value = pressure.read.texture;
    gradientProgram.mat.uniforms.uHalfRdx.value = halfRdx;
    renderer.render(gradientProgram.scene, displayCamera);
    velocity.swap();

    // DYE FORCES
    if (!config.useTyping) {
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

  /**
   * Creates RAF loop and calls render method.
   * @function animate
   * @memberof Fluid.prototype
   */
  animate() {
    this.raf = requestAnimationFrame(this.animate);
    this.render();
  }

  /**
   * Render loop.
   * @function render
   * @memberof Fluid.prototype
   */
  render() {
    const {
      renderer,
      dye,
      displayCamera,
      displayScene,
      startTime,
      displayQuad,
      step,
    } = this;

    // const delta = Date.now() - startTime;
    step();

    if (displayQuad.material) {
      const mat = <ShaderMaterial>displayQuad.material;
      mat.uniforms.tDiffuse.value = dye.write.texture;
    }
    renderer.render(displayScene, displayCamera);
  }
}
