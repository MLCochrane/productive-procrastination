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
  RepeatWrapping
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import {
  cross,
  dot
} from '../utils/math';
// import 'DRACOLoader';

export default class WaterSim {
  constructor() {
    this.renderer;
    this.scene;
    this.camera;

    this.canvas = document.getElementById("Sandbox");
    this.dims = this.canvas.getBoundingClientRect();
    this.startTime = Date.now();


    this.animate = this.animate.bind(this);
    this.render = this.render.bind(this);
    this.setup = this.setup.bind(this);
    this.initBox = this.initBox.bind(this);
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
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  init() {
    this.initScene();
    this.initCamera();
    this.initBox();
  }
  initScene() {
    this.scene = new Scene();
  }
  initCamera() {
    this.camera = new PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.2,
      300
    );

    this.camera.position.set(3, 30, -60);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
  }

  initBox() {
    const waterLoader = new TextureLoader();
    // copies direction camera is looking in world space
    const lightDir = new Vector3(0,0,0);
    this.camera.getWorldDirection(lightDir);

    const ambientCol = new Vector3(1.0, .5, .1);
    const diffuseCol = new Vector3(1.0, 0.5, 0.1);
    const specularCol = new Vector3(.5, .5, .5);

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
          ambient: new Vector3(0.1, 0.55, 1.),
          diffuse: new Vector3(0.1, 0.55, 1.),
          specular: specularCol,
          shininess: 32.0
        }
      },
      spotLight: {
        value: {
          position: new Vector3(this.camera.position),
          direction: lightDir,
          ambient: new Vector3(0.13, 0.375, 0.61),
          diffuse: new Vector3(0.13, 0.375, 0.61),
          specular: specularCol,
          constant: 1.0,
          linear: 0.09,
          quadratic: 0.032,
          innerCutOff: Math.cos(Math.PI / 12),
          outerCutOff: Math.cos(Math.PI / 7),
        }
      },
      pointLights: {
        value: [
          {
            position: new Vector3(-13.0, 2.5, -5.31),
            ambient: new Vector3(1., 0.1, .0),
            diffuse: new Vector3(1., 0.1, .0),
            specular: specularCol,
            constant: 1.0,
            linear: 0.09,
            quadratic: 0.032,
          },
          {
            position: new Vector3(3.0, 3.5, 0.31),
            ambient: new Vector3(.6, 0.3, 0.2),
            diffuse: new Vector3(0.6, 0.3, 0.2),
            specular: specularCol,
            constant: 1.0,
            linear: 0.09,
            quadratic: 0.032,
          },
          {
            position: new Vector3(12.0, 3.0, 2.0),
            ambient: new Vector3(0., 0., 0.),
            diffuse: diffuseCol,
            specular: specularCol,
            constant: 1.0,
            linear: 0.09,
            quadratic: 0.032,
          }
        ]
      },
      dirLight: {
        value: {
          direction: new Vector3(0.2, -5.0, 0.5),
          ambient: new Vector3(0., 0.33, 0.39),
          diffuse: new Vector3(0., 0.33, 0.39),
          specular: new Vector3(.5, .5, .5),
        }
      },
      normalMap: {
        value: null
      },
    };


    const box = new BoxBufferGeometry(2, 2, 2, 3, 3, 3);
    const geo = new PlaneBufferGeometry(100, 100, 50, 50);

    waterLoader.load('/src/assets/wave-normal.jpeg', (res) => {
      uniforms['normalMap'].value = res;
      uniforms['normalMap'].value.wrapT = RepeatWrapping;
      uniforms['normalMap'].value.wrapS = RepeatWrapping;
    });

    const mat = new ShaderMaterial({
      defines: {
        NR_POINT_LIGHTS: uniforms.pointLights.value.length,
        USE_TANGENT: true
      },
      uniforms: uniforms,
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent
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
    this.scene.add(floorMesh);
    this.setup();
  }

  createTexture(time) {
    const width = 256;
    const height = 256;

    const size = width * height;
    const data = new Uint8Array(3 * size);

    const interval = 2 * Math.PI / 256;

    for (let i = 0; i < size; i++) {

      const stride = i * 3;

      let col = [0, 0, 0];

      // for (let j = 0; j < 2; j++) {
        const dirX = 0.5;
        const dirY = 0.8;
        const xVal = i % width;
        const yVal = Math.floor(i / width);

        const binormal = partialDer([dirX, dirY], xVal, yVal, time, 1.5, .5, 0);
        const tangent = partialDer([dirX, dirY], xVal, yVal, time, 1.5, .5, 1);

        const curCol = cross(
          [1, 0, binormal],
          [0, 1, tangent]
        );

        // Adding wave value to x, y, z color components
        col[0] += curCol[0];
        col[1] += curCol[1];
        col[2] += curCol[2];
      // }

      data[stride] = Math.round((col[0] * 0.5 + 0.5) * 255);
      data[stride + 1] = Math.round((col[1] * 0.5 + 0.5) * 255);
      data[stride + 2] = Math.round((col[2] * 0.5 + 0.5) * 255);
    }

    // Calculates partial derivative in x and y direction based on wave function
    function partialDer(windDir, x, y, t, k, speed, direction) {
      const w = 2.0;
      const amp = 0.5;
      const internalWave = dot(windDir, [x, y]) * w + t * speed;
      return k * windDir[`${direction}`] * w * amp * (Math.pow((Math.sin(internalWave) + 1.0) / 2., k - 1.0)) * Math.cos(internalWave);
    }

    return new DataTexture(data, width, height, RGBFormat);
  }

  setup() {
    // RENDERER
    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvas,
    });
    this.renderer.setSize(this.dims.width, this.dims.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.animate();
  }
  animate() {
    requestAnimationFrame(this.animate);

    this.controls.update();

    this.render();
  }
  render(time) {
    const delta = this.startTime - Date.now();
    const z = 10 * Math.sin(delta * 0.0001);
    const x = -10 * Math.cos(delta * 0.0001);

    const lightDir = new Vector3(0, 0, 0);
    this.camera.getWorldDirection(lightDir);

    this.mesh.material.uniforms['time'].value = delta * 0.001;
    this.mesh.material.uniforms['spotLight'].value.position = this.camera.position;
    this.mesh.material.uniforms['spotLight'].value.direction = lightDir;
    this.mesh.material.uniforms['pointLights'].value[0].position = new Vector3(x, 3.0, z);

    this.renderer.render(this.scene, this.camera);
  }
}
