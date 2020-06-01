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
  WebGLRenderer,
  TextureLoader,
  RepeatWrapping,
} from 'three';

import {
  OrbitControls,
} from 'three/examples/jsm/controls/OrbitControls';

import {
  vert,
  frag,
} from './lighting-shader';


/*
 *  Class for wave simulation
 */
export default class WaterSim {
  constructor() {
    /**
     * Initlaizes variables for class instance.
     */
    this.renderer = null;
    this.scene = null;
    this.camera = null;

    this.canvas = document.getElementById('Sandbox');
    this.startTime = Date.now();

    this.init = this.init.bind(this);
    this.initWaves = this.initWaves.bind(this);
    this.initCamera = this.initCamera.bind(this);
    this.initScene = this.initScene.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.animate = this.animate.bind(this);
    this.render = this.render.bind(this);
    this.setup = this.setup.bind(this);
    this.destroy = this.destroy.bind(this);

    this.bindEvents();
    this.init();
  }

  /**
   * Binds event listeners for DOM events
   * @function bindEvents
   * @memberof WaterSim.prototype
   */
  bindEvents() {
    window.addEventListener('resize', this.onWindowResize);
  }

  /**
   * Callback passed to resize event to handle updating camera and renderer size
   * @function onWindowResize
   * @memberof WaterSim.prototype
   */
  onWindowResize() {
    const {
      camera,
      renderer,
    } = this;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Orders the methods calls for setting up and then rendering scene.
   * @function init
   * @memberof WaterSim.prototype
   */
  init() {
    const {
      initScene,
      initCamera,
      initWaves,
    } = this;

    initScene();
    initCamera();
    initWaves();
  }

  /**
   * Creates new threejs scene and assigns to class instance
   * @function initScene
   * @memberof WaterSim.prototype
   */
  initScene() {
    this.scene = new Scene();
  }

  /**
   * Creates new threejs camera and adds to scene
   * @function initCamera
   * @memberof WaterSim.prototype
   */
  initCamera() {
    const {
      scene,
    } = this;

    this.camera = new PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.2,
      300,
    );

    this.camera.position.set(3, 30, -60);
    this.camera.lookAt(0, 0, 0);
    scene.add(this.camera);
  }

  /**
   * Initializes water mesh, shader uniforms and adds to scene
   * @function processing
   * @memberof WaterSim.prototype
   */
  initWaves() {
    const {
      camera,
      scene,
      setup,
    } = this;

    const waterLoader = new TextureLoader();
    // copies direction camera is looking in world space
    const lightDir = new Vector3(0, 0, 0);
    camera.getWorldDirection(lightDir);

    // const ambientCol = new Vector3(1.0, 0.5, 0.1);
    // const diffuseCol = new Vector3(1.0, 0.5, 0.1);
    const specularCol = new Vector3(0.5, 0.5, 0.5);

    const uniforms = {
      u_resolution: {
        value: new Vector2(window.innerWidth, window.innerHeight),
      },
      scale: {
        value: new Vector4(1, 1, 1, 1), // x, y, z, scale
      },
      time: {
        value: 1.2,
      },
      ambientStrength: {
        value: 0.3,
      },
      material: {
        value: {
          ambient: new Vector3(0.1, 0.55, 1.0),
          diffuse: new Vector3(0.1, 0.55, 1.0),
          specular: specularCol,
          shininess: 128.0,
        },
      },
      spotLight: {
        value: {
          position: new Vector3(camera.position),
          direction: lightDir,
          ambient: new Vector3(0.13, 0.375, 0.61),
          diffuse: new Vector3(0.13, 0.375, 0.61),
          specular: specularCol,
          constant: 1.0,
          linear: 0.09,
          quadratic: 0.032,
          innerCutOff: Math.cos(Math.PI / 12),
          outerCutOff: Math.cos(Math.PI / 7),
        },
      },
      pointLights: {
        value: [{
          position: new Vector3(-13.0, 2.5, -5.31),
          ambient: new Vector3(1.0, 1.0, 0.0),
          diffuse: new Vector3(1.0, 1.0, 0.0),
          specular: specularCol,
          constant: 1.0,
          linear: 0.09,
          quadratic: 0.032,
        },
        {
          position: new Vector3(3.0, 3.5, 0.31),
          ambient: new Vector3(0.0, 1.0, 1.0),
          diffuse: new Vector3(0.0, 1.0, 1.0),
          specular: specularCol,
          constant: 1.0,
          linear: 0.09,
          quadratic: 0.032,
        },
        {
          position: new Vector3(12.0, 3.0, 2.0),
          ambient: new Vector3(1.0, 0.0, 1.0),
          diffuse: new Vector3(1.0, 0.0, 1.0),
          specular: specularCol,
          constant: 1.0,
          linear: 0.09,
          quadratic: 0.032,
        },
        ],
      },
      dirLight: {
        value: {
          direction: new Vector3(0.2, -5.0, 0.5),
          ambient: new Vector3(0.0, 0.33, 0.29),
          diffuse: new Vector3(0.0, 0.33, 0.29),
          specular: new Vector3(0.5, 0.5, 0.5),
        },
      },
      normalMap: {
        value: null,
      },
    };


    const box = new BoxBufferGeometry(2, 2, 2, 3, 3, 3);
    const geo = new PlaneBufferGeometry(200, 200, 50, 50);

    waterLoader.load(`${ASSET_PATH}/assets/images/wave-normal.jpg`, (res) => {
      uniforms.normalMap.value = res;
      uniforms.normalMap.value.wrapT = RepeatWrapping;
      uniforms.normalMap.value.wrapS = RepeatWrapping;
    });

    const mat = new ShaderMaterial({
      defines: {
        NR_POINT_LIGHTS: uniforms.pointLights.value.length,
        USE_TANGENT: true,
      },
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
    });
    this.mesh = new Mesh(box, mat);

    // uniforms.pointLights.value.forEach(el => {
    //   const mesh = new Mesh(box, new MeshBasicMaterial({color: 0xffffff}));
    //   mesh.position.set(el.position.x, el.position.y, el.position.z);
    //   mesh.scale.set(0.3, 0.3, 0.3);
    //   this.scene.add(mesh);
    // });

    const floorMesh = new Mesh(geo, mat);
    floorMesh.rotation.x = -1.567;
    floorMesh.position.set(-2, 0, 0);
    scene.add(floorMesh);
    setup();
  }

  /**
   * Sets up renderer, calls any other necessary methods and then starts loop
   * @function setup
   * @memberof WaterSim.prototype
   */
  setup() {
    const {
      canvas,
      camera,
      animate,
    } = this;

    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.controls = new OrbitControls(camera, this.renderer.domElement);
    this.controls.minDistance = 10;
    this.controls.maxDistance = 100;
    animate();
  }

  /**
   * Creates animation loop
   * @function animate
   * @memberof WaterSim.prototype
   */
  animate() {
    const {
      controls,
      render,
      animate,
    } = this;

    this.raf = requestAnimationFrame(animate);

    controls.update();

    render();
  }

  /**
   * Simply renders scene with instance's scene and camera
   * @function render
   * @memberof WaterSim.prototype
   */
  render() {
    const {
      camera,
      mesh,
      scene,
      renderer,
    } = this;

    const delta = this.startTime - Date.now();
    const z = 10 * Math.sin(delta * 0.0005);
    const x = -10 * Math.cos(delta * 0.0005);

    const lightDir = new Vector3(0, 0, 0);
    camera.getWorldDirection(lightDir);

    mesh.material.uniforms.time.value = delta * 0.001;
    mesh.material.uniforms.spotLight.value.position = camera.position;
    mesh.material.uniforms.spotLight.value.direction = lightDir;
    mesh.material.uniforms.pointLights.value[0].position = new Vector3(x, 3.0, z);
    mesh.material.uniforms.pointLights.value[1].position = new Vector3(x * 2, 3.0, x * 2);
    mesh.material.uniforms.pointLights.value[2].position = new Vector3(x * 4, 3.0, z * 4);

    renderer.render(scene, camera);
  }

  /**
   * Cancels RAF loop and unbinds event handlers
   * @function destroy
   * @memberof WaterSim.prototype
   */
  destroy() {
    const {
      onWindowResize,
      raf,
    } = this;

    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onWindowResize);
  }
}
