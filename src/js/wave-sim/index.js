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

} from 'three';
import {
  BufferGeometryUtils
} from 'three/examples/jsm/utils/BufferGeometryUtils';
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
    this.scene = new Scene();
  }
  initCamera() {
    this.camera = new PerspectiveCamera(
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
    const waterLoader = new TextureLoader();
    const nTex = this.createTexture();
    waterLoader.load('/src/assets/water-caustics.jpg', (res) => {
      const uniforms = {
        "u_resolution": {
          value: new Vector2(window.innerWidth, window.innerHeight),
        },
        "scale": {
          value: new Vector4(1, 1, 1, 1), // x, y, z, scale
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

      const geo = new PlaneBufferGeometry(10, 10, 50, 50);

      const mat = new ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent
      });

      // mat.uniforms['texOne'].value.wrapS = RepeatWrapping;
      // mat.uniforms['texOne'].value.wrapT = RepeatWrapping;
      // mat.uniforms['texOne'].value.magFilter = NearestFilter;
      mat.uniforms['texOne'].value.needsUpdate = true;

      this.mesh = new Mesh(geo, mat);
      this.mesh.rotation.x = -1.567;
      this.scene.add(this.mesh);
      this.setup();
    });
  }

  initBox() {
    const waterLoader = new TextureLoader();
    // copies direction camera is looking in world space
    const lightDir = new Vector3(0,0,0);
    this.camera.getWorldDirection(lightDir);

    const ambientCol = new Vector3(1.0, .5, .31);
    const diffuseCol = new Vector3(1.0, 0.5, 0.31);
    const specularCol = new Vector3(.5, .5, .5);

    const uniforms = {
      u_resolution: {
        value: new Vector2(window.innerWidth, window.innerHeight),
      },
      scale: {
        value: new Vector4(1, 1, 1, 1), // x, y, z, scale
      },
      time: {
        value: 1.0,
      },
      ambientStrength: {
      value: 0.1,
      },
      material: {
        value: {
          ambient: ambientCol,
          diffuse: diffuseCol,
          specular: specularCol,
          shininess: 64.0
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
          // {
          //   position: new Vector3(-3.0, 2.5, 17.31),
          //   ambient: new Vector3(0.9, 0.3, 1.0),
          //   diffuse: new Vector3(0.9, 0.3, 1.0),
          //   specular: specularCol,
          //   constant: 1.0,
          //   linear: 0.09,
          //   quadratic: 0.032,
          // },
          {
            position: new Vector3(3.0, 3.5, 0.31),
            ambient: new Vector3(0.4, 0.3, 0.9),
            diffuse: new Vector3(0.4, 0.3, 0.9),
            specular: specularCol,
            constant: 1.0,
            linear: 0.09,
            quadratic: 0.032,
          },
          {
            position: new Vector3(-2.0, 3.0, 2.0),
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
          ambient: new Vector3(0.2, 0.2, 0.2),
          diffuse: new Vector3(0.5, 0.5, 0.5),
          specular: new Vector3(.5, .5, .5),
        }
      },
      normalMap: {
        value: null
      },
    };

    const box = new BoxBufferGeometry(2, 2, 2, 3, 3, 3);
    const geo = new PlaneBufferGeometry(10, 10, 2, 2);

    waterLoader.load('/src/assets/normal_mapping_normal_map.png', (res) => {
      uniforms['normalMap'].value = res;
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

    uniforms.pointLights.value.forEach(el => {
      const mesh = new Mesh(box, new MeshBasicMaterial({color: 0xffffff}));
      mesh.position.set(el.position.x, el.position.y, el.position.z);
      mesh.scale.set(0.3, 0.3, 0.3);
      this.scene.add(mesh);
    });

    const floorMesh = new Mesh(geo, mat);
    floorMesh.rotation.x = -1;
    floorMesh.position.set(-2, 0, 0);
    this.scene.add(floorMesh);

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
    // const z = 3 * Math.sin(delta * 0.001);
    // const x = -3 * Math.cos(delta * 0.001);

   const lightDir = new Vector3(0, 0, 0);
    this.camera.getWorldDirection(lightDir);


    this.mesh.material.uniforms['time'].value = delta * 0.001;
    this.mesh.material.uniforms['spotLight'].value.position = this.camera.position;
    this.mesh.material.uniforms['spotLight'].value.direction = lightDir;

    this.renderer.render(this.scene, this.camera);
  }
}
