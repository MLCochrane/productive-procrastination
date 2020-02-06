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
  OrthographicCamera,
  WebGLRenderTarget,
  RGBAFormat,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  ShaderMaterial,
  BufferGeometry,
  BufferAttribute,
} from 'three';

import {
  smolShader,
} from './smolShader';

import {
  displayShader,
} from './displayDye';


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
    this.step = this.step.bind(this);
    this.initSim = this.initSim.bind(this);
    // this.render = this.render.bind(this);

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
    this.setup();
    this.initRenderTargets();
    this.initSim();
  }

  setup() {
    // RENDERER
    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvas,
    });
    this.renderer.setSize(this.config.cellSize, this.config.cellSize);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  initRenderTargets() {
    // this.target = new WebGLRenderTarget(this.config.cellSize, this.config.cellSize);
    this.target = this.doubleTarget(this.config.cellSize, this.config.cellSize);
  }

  doubleTarget(width, height) {
    let trg1 = new WebGLRenderTarget(width, height);
    let trg2 = new WebGLRenderTarget(width, height);

    return {
      width,
      height,
      texelSizeX: 1/width,
      texelSizeY: 1/height,
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

  initSim() {
    this.internalScene();
    this.displayScene();
    this.animate();
  }

  internalScene() {
    this.velScene = new Scene();
    const geo = new PlaneBufferGeometry(2, 2);
    this.velocityMat = new ShaderMaterial(smolShader);
    const mesh2 = new Mesh(geo, this.velocityMat);


    // this.velocityMat.uniforms.tLastFrame.value = this.target.read.texture;

    this.velScene.add(mesh2);
    this.simCamera = new OrthographicCamera(
      -1, // left
      1, // right
      1, // top
      -1, // bottom
      -1, // near,
      1, // far
    );
    this.simCamera.position.set(0, 0, 0);
    this.simCamera.lookAt(0, 0, 0);
    this.velScene.add(this.simCamera);
  }

  displayScene() {
    this.displayScene = new Scene();

    this.displayCamera = new OrthographicCamera(
      -1, // left
      1, // right
      1, // top
      -1, // bottom
      -1, // near,
      1, // far
    );
    this.displayCamera.position.set(0, 0, 0);
    this.displayCamera.lookAt(0, 0, 0);

    this.displayScene.add(this.displayCamera);

    const geo = new PlaneBufferGeometry(2, 2);
    const displayMaterial = new ShaderMaterial(displayShader);
    // displayMaterial.uniforms.tDiffuse.value = this.target.write.texture;

    this.displayQuad = new Mesh(geo, displayMaterial);

    this.displayScene.add(this.displayQuad);
  }

  step(delta) {
    const {
      renderer,
      target,
      velocityMat,
    } = this;

    renderer.setRenderTarget(target.write);
    velocityMat.uniforms.tLastFrame.value = target.read.texture;
    // this.velocityMat.uniforms.uDeltaTime.value = delta;
    renderer.render(this.velScene, this.simCamera);
    target.swap();


    renderer.setRenderTarget(null);
  }

  animate() {
    requestAnimationFrame(this.animate);

    this.render();
  }

  render(time) {
    const {
      renderer,
      target,
      displayCamera,
      displayScene,
      startTime,
      step
    } = this;

    const delta = Date.now() - startTime;

    step(delta);

    this.displayQuad.material.uniforms.tDiffuse.value = target.write.texture;
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
