import {
  Scene,
  PerspectiveCamera,
  Mesh,
  Geometry,
  WebGLRenderer,
  Vector3,
  PointLight,
  DefaultLoadingManager,
  PointsMaterial,
  Points,
} from 'three';

interface ParticleAttribs {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
}


interface ParticleOptions {
  count: number;
}

/**
 * Particle System
 */
export default class ParticleSytem {
  mesh: Points | null;
  count: number;
  particles: Array<ParticleAttribs>;
  constructor(options: ParticleOptions) {
    this.mesh = null;
    this.count = options.count || 100;
    this.particles = [];

    this.init = this.init.bind(this);
    this.updateTick = this.updateTick.bind(this);

    this.init();
  }

  init() {
    const {
      count,
      particles,
    } = this;

    const geo = new Geometry();
    for(let i = 0; i < count; i++) {
      const particle = {
        position: new Vector3(
          (Math.random() * 2) - 1,
          (Math.random() * 2) - 1,
          (Math.random() * 2) - 3),
        velocity: new Vector3(
          ((Math.random() * 2) - 1) * 0.001,
            0.06,
          ((Math.random() * 2) - 1) * 0.001,
        ),
        acceleration: new Vector3(0, -0.001, 0),
      }
      particles.push(particle);
      geo.vertices.push(particle.position)
    }
    const mat = new PointsMaterial({
      color:0x000000,
      size: 0.1,
    });
    this.mesh = new Points(geo, mat);
    this.mesh.position.z = -4
  }

  /**
   * To be called on each render tick.
   */
  updateTick() {
    this.particles.forEach(p => {
      p.velocity.add(p.acceleration)
      p.position.add(p.velocity)
   });

   if (!this.mesh) return;
   (this.mesh.geometry as Geometry).verticesNeedUpdate = true;
  }
}