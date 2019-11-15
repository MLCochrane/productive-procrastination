import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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
    this.initGeos = this.initGeos.bind(this);
    this.initBox = this.initBox.bind(this);

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
    // this.initGeos();
    this.initBox();
  }
  initScene() {
    this.scene = new THREE.Scene();
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.2,
      300
    );

    this.camera.position.set(3, 3, 7);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
  }

  initGeos() {
    const waterLoader = new THREE.TextureLoader();
    const nTex = this.createTexture();
    waterLoader.load('/src/assets/water-caustics.jpg', (res) => {
      const uniforms = {
        "u_resolution": {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        "scale": {
          value: new THREE.Vector4(1, 1, 1, 1), // x, y, z, scale
        },
        "time": {
          value: 2.7,
        },
        "texOne": {
          type: "t",
          value: nTex,
        },
        "texTwo": {
          type: "t",
          value: res,
        }
      };

      const geo = new THREE.PlaneBufferGeometry(10, 10, 50, 50);
      const mat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent
      });

      // mat.uniforms['texOne'].value.wrapS = THREE.RepeatWrapping;
      // mat.uniforms['texOne'].value.wrapT = THREE.RepeatWrapping;
      // mat.uniforms['texOne'].value.magFilter = THREE.NearestFilter;
      mat.uniforms['texOne'].value.needsUpdate = true;

      this.mesh = new THREE.Mesh(geo, mat);
      this.mesh.rotation.x = -1.567;
      this.scene.add(this.mesh);
      this.setup();
    });
  }

  initBox() {
    const lightPos = [-1.0, 2.0, 3.0];
    const uniforms = {
      u_resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      scale: {
        value: new THREE.Vector4(1, 1, 1, .6), // x, y, z, scale
      },
      ambientStrength: {
        value: 0.1,
      },
      material: {
        value: {
          ambient: new THREE.Vector3(1.0, .5, .31),
          diffuse: new THREE.Vector3(1.0, 0.5, 0.31),
          specular: new THREE.Vector3(.5, .5, .5),
          shininess: 32.0
        }
      },
      light: {
        value: {
          position: new THREE.Vector3(lightPos[0], lightPos[1], lightPos[2]),
          ambient: new THREE.Vector3(0.2, 0.2, 0.2),
          diffuse: new THREE.Vector3(0.5, 0.5, 0.5),
          specular: new THREE.Vector3(1.0, 1.0, 1.0)
        }
      }
    };


    const box = new THREE.BoxBufferGeometry(2,2,2,3,3,3);
    const geo = new THREE.PlaneBufferGeometry(10, 10, 50, 50);

    const mat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent
    });


    this.mesh2 = new THREE.Mesh(box, new THREE.MeshBasicMaterial({color: 0xffffff}));
    this.mesh2.position.set(lightPos[0], lightPos[1], lightPos[2]);
    this.mesh2.scale.set(0.3, 0.3, 0.3);
    this.scene.add(this.mesh2);

    this.mesh = new THREE.Mesh(box, mat);
    // this.mesh.rotation.x = -1.567;
    console.log(this.mesh.material);

    this.scene.add(this.mesh);

    this.setup();
  }

  createTexture() {
    const width = 256;
    const height = 256;

    const size = width * height;
    const data = new Uint8Array(3 * size);

    // const r = Math.floor(color.r * 255);
    // const g = Math.floor(color.g * 255);
    // const b = Math.floor(color.b * 255);
    const interval = 2 * Math.PI / 256;

    for (let i = 0; i < size; i++) {

      const stride = i * 3;

      const col = cross([1, 0, Math.cos(3 * (i * interval))], [0, 1, Math.cos(3 * (i * interval))]);

      data[stride] = Math.round((col[0] * 0.5 + 0.5) * 255);
      data[stride + 1] = Math.round((col[1] * 0.5 + 0.5) * 255);
      data[stride + 2] = Math.round((col[2] * 0.5 + 0.5) * 255);
    }

    function cross(vecA, vecB) {
      return [
        (vecA[1] * vecB[2]) - (vecA[2] * vecB[1]),
        (vecA[2] * vecB[0]) - (vecA[0] * vecB[2]),
        (vecA[0] * vecB[1]) - (vecA[1] * vecB[0])
      ];
    }

    return new THREE.DataTexture(data, width, height, THREE.RGBFormat);
  }

  setup() {
    // RENDERER
    this.renderer = new THREE.WebGLRenderer({
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

    const z = 3 * Math.sin(delta * 0.001);
    const x = -3 * Math.cos(delta * 0.001);

    this.mesh.material.uniforms['light'].value.position = new THREE.Vector3(x, 0.0, z);
    this.mesh2.position.set(x, 0.0, z);
    // this.camera.position.y = 2 * this.yVal / 2;
    // this.mesh.material.uniforms['time'].value = delta * 0.001;

    // this.mesh.rotation.z += 0.01;
    this.mesh.updateMatrix();
    this.renderer.render(this.scene, this.camera);
  }
}
