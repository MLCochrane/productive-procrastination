import {
  Scene,
  PerspectiveCamera,
  Mesh,
  BufferGeometry,
  WebGLRenderer,
  Vector3,
  AdditiveBlending,
  Float32BufferAttribute,
  ShaderMaterial,
  Points,
  Object3D,
} from 'three';

interface ParticleAttribs {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
}


interface ParticleOptions {
  count: number;
  positions: number[];
  velocities: number[];
  accelerations: number[];
}

const vertShader = `
uniform float time;
attribute vec3 velocity;
attribute vec3 acceleration;
void main() {
    vec3 acc = acceleration * 0.5 * time * time;
    vec3 vel = velocity * time;
    gl_Position = projectionMatrix
        * modelViewMatrix
        * vec4(acc + vel + position, 1.0);
    gl_PointSize = 10.0;
}
`;

const fragShader = `
void main() {
  gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}
`;

/**
 * Particle System
 */
export default class ParticleSytem extends Object3D {
  particles: Array<ParticleAttribs>;
  mesh: Points | null;
  count: number;
  positions: number[];
  velocities: number[];
  accelerations: number[];
  constructor(options: ParticleOptions) {
    super();
    this.mesh = null;
    this.count = options.count || 100;
    this.positions = options.positions;
    this.velocities = options.velocities;
    this.accelerations = options.accelerations;
    this.particles = [];

    this.init = this.init.bind(this);
    this.updateTick = this.updateTick.bind(this);

    this.init();
  }

  init() {
    const {
      count,
      particles,
      positions,
      velocities,
      accelerations,
    } = this;

    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('velocity', new Float32BufferAttribute(velocities, 3));
    geo.setAttribute('acceleration', new Float32BufferAttribute(accelerations, 3));
    const mat = new ShaderMaterial( {
      uniforms: {
        time: { value: 12.0}
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
      blending: AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true,
   });
    this.mesh = new Points(geo, mat);
    this.mesh.position.z = -4
  }

  /**
   * To be called on each render tick.
   */
  updateTick(time: number) {
    if (!this.mesh) return;
    console.log(this.mesh);

    (this.mesh.material as ShaderMaterial).uniforms.time.value = time;
  }
}