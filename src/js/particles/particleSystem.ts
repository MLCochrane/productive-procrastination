import {
  BufferGeometry,
  Color,
  Vector3,
  BufferAttribute,
  ShaderMaterial,
  Points,
  Object3D,
  NoBlending,
  NormalBlending,
  AdditiveBlending,
  SubtractiveBlending,
  MultiplyBlending,
  Texture,
  TextureLoader,
  RepeatWrapping,
} from 'three';

type BlendingOptions = typeof NoBlending | typeof NormalBlending | typeof AdditiveBlending | typeof SubtractiveBlending | typeof MultiplyBlending;

interface SpawnOptions {
  position?: Vector3;
  velocity?: Vector3;
  acceleration?: Vector3;
  color?: Color;
  endColor?: Color;
  lifeTime?: number;
  size?: number;
  sizeRandomness?: number;
}

interface ParticleOptions {
  maxParticles?: number;
  noiseTextureUrl?: string;
  blending?: BlendingOptions;
  fadeIn?: number;
  fadeOut?: number;
  onTick?: Function;
}

const UPDATEABLE_ATTRIBUTES = [
  'positionStart',
  'startTime',
  'velocity',
  'acceleration',
  'color',
  'endColor',
  'size',
  'lifeTime',
];

const vertexShader = `
  uniform float uTime;
  uniform float uScale;
  uniform sampler2D tNoise;
  uniform bool reverseTime;
  uniform float fadeIn;
  uniform float fadeOut;

  attribute vec3 positionStart;
  attribute float startTime;
  attribute vec3 velocity;
  attribute vec3 acceleration;
  attribute vec3 color;
  attribute vec3 endColor;
  attribute float size;
  attribute float lifeTime;

  varying vec4 vColor;
  varying vec4 vEndColor;
  varying float lifeLeft;
  varying float alpha;

  void main() {
    float turbulence = 50.0;
    vColor = vec4( color, 1.0 );
    vEndColor = vec4( endColor, 1.0);
    vec3 newPosition;
    float timeElapsed = uTime - startTime;
    lifeLeft = 1.0 - ( timeElapsed / lifeTime );

    newPosition = positionStart + (velocity * timeElapsed) + (acceleration * 0.5 * timeElapsed * timeElapsed);
    gl_PointSize = ( uScale * size * (newPosition.z * 10.));


    // Noise field
    vec3 noise = texture2D( tNoise, vec2( newPosition.x * 0.015 + ( uTime * 0.05 ), newPosition.y * 0.05 + ( uTime * 0.015 ) ) ).rgb;
    vec3 noiseVel = ( noise.rgb - 0.5 );
    newPosition = mix( newPosition, newPosition + vec3( noiseVel * turbulence ), ( timeElapsed / lifeTime ) );

    if (lifeLeft < 0.0) {
      lifeLeft = 0.0;
      gl_PointSize = 0.;
    }
    //while active use the new position
    if( timeElapsed < lifeTime ) {
      gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
    } else {
      //if dead use the initial position and set point size to 0
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      lifeLeft = 0.0;
      gl_PointSize = 0.;
    }
  }
`;

const fragmentShader = `
  varying vec4 vColor;
  varying vec4 vEndColor;
  varying float lifeLeft;
  varying float alpha;
  void main() {
    // color based on particle texture and the lifeLeft.
    // if lifeLeft is 0 then make invisible
    // vec4 tex = texture2D( tSprite, gl_PointCoord );
    vec4 color = mix(vColor, vEndColor, 1.0-lifeLeft);
    gl_FragColor = vec4( color.rgb, 1.0 * lifeLeft);
  }
`;

/**
 * Particle System
 */
export default class ParticleSytem extends Object3D {
  maxParticles: number;
  particleIndex: number;
  blending: BlendingOptions;
  geometry: BufferGeometry | null;
  material: ShaderMaterial | null;
  mesh: Points | null;
  noiseTextureUrl: string | null;
  noiseTexture: Texture | null;
  fadeIn: number;
  fadeOut: number;
  particleUpdate: boolean;
  rangeCount: number;
  rangeOffset: number;
  DPR: number;
  lookupTable: number[];
  lookupIndex: number;
  internalTime: number;
  onTick: Function | null;
  constructor(options: ParticleOptions) {
    super();

    this.maxParticles = options.maxParticles || 1000000;
    this.particleIndex = 0;
    this.blending = options.blending || NormalBlending;
    this.onTick = options.onTick || null;
    this.noiseTextureUrl = options.noiseTextureUrl || `${ASSET_PATH}/assets/perlin.png`;;
    this.DPR = window.devicePixelRatio;

    this.fadeIn = options.fadeIn || 1;
    if (this.fadeIn === 0) this.fadeIn = 0.001;
    this.fadeOut = options.fadeOut || 1;
    if (this.fadeOut === 0) this.fadeOut = 0.001;

    this.lookupTable = [];
    let i;
    for (i = 1e5; i > 0; i--) {
      this.lookupTable.push(Math.random() - 0.5);
    }
    this.lookupIndex = i;

    this.internalTime = 0;
    this.rangeCount = 0;
    this.rangeOffset = 0;
    this.noiseTexture = null;
    this.mesh = null;
    this.material = null;
    this.geometry = null;
    this.particleUpdate = false;

    this.init = this.init.bind(this);
    this.initMaterial = this.initMaterial.bind(this);
    this.initGeometry = this.initGeometry.bind(this);
    this.lookup = this.lookup.bind(this);
    this.spawnParticle = this.spawnParticle.bind(this);
    this.updateTick = this.updateTick.bind(this);
    this.updateGeo = this.updateGeo.bind(this);

    this.init();
  }

  init() {
    const {
      initMaterial,
      initGeometry,
    } = this;

    initMaterial();
    initGeometry();
  }

  /**
   * Initializes shader material.
   */
  initMaterial() {
    const {
      fadeIn,
      fadeOut,
      blending,
      noiseTextureUrl,
    } = this;
    // setup the texture
    // this.sprite = options.particleSpriteTex || null;
    // if (!this.sprite) throw new Error('No particle sprite texture specified');
    // this.sprite.wrapS = this.sprite.wrapT = RepeatWrapping;

    const textureLoader = new TextureLoader();
    this.noiseTexture = textureLoader.load(noiseTextureUrl as string);
    this.noiseTexture.wrapS = RepeatWrapping;
    this.noiseTexture.wrapT = RepeatWrapping;

    // setup the shader material
    this.material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: {
          value: 0.0,
        },
        uScale: {
          value: 1.0,
        },
        tNoise: {
          value: this.noiseTexture,
        },
        fadeIn: {
          value: fadeIn,
        },
        fadeOut: {
          value: fadeOut,
        },
      },
      blending,
      vertexShader,
      fragmentShader,
    });

    // define defaults for all values
    this.material.defaultAttributeValues.particlePositionsStartTime = [0, 0, 0, 0];
    this.material.defaultAttributeValues.particleVelColSizeLife = [0, 0, 0, 0];
  }

  /**
   * Initializes the geometry.
   */
  initGeometry() {
    const {
      maxParticles,
      material,
    } = this;

    this.geometry = new BufferGeometry();

    // Initializes buffer attributes with space for our max number of particles
    this.geometry.setAttribute('position', new BufferAttribute(new Float32Array(maxParticles * 3), 3));
    this.geometry.setAttribute('positionStart', new BufferAttribute(new Float32Array(maxParticles * 3), 3));
    this.geometry.setAttribute('velocity', new BufferAttribute(new Float32Array(maxParticles * 3), 3));
    this.geometry.setAttribute('acceleration', new BufferAttribute(new Float32Array(maxParticles * 3), 3));
    this.geometry.setAttribute('color', new BufferAttribute(new Float32Array(maxParticles * 3), 3));
    this.geometry.setAttribute('endColor', new BufferAttribute(new Float32Array(maxParticles * 3), 3));

    this.geometry.setAttribute('startTime', new BufferAttribute(new Float32Array(maxParticles), 1));
    this.geometry.setAttribute('size', new BufferAttribute(new Float32Array(maxParticles), 1));
    this.geometry.setAttribute('lifeTime', new BufferAttribute(new Float32Array(maxParticles), 1));


    this.mesh = new Points(this.geometry, material as ShaderMaterial);
    this.mesh.frustumCulled = false;
    this.add(this.mesh);
  }

  /**
   * Returns value from our lookup table of random numbers.
   */
  lookup() {
    const {
      lookupTable,
    } = this;

    return ++this.lookupIndex >= lookupTable.length
      ? lookupTable[this.lookupIndex = 1]
      : lookupTable[this.lookupIndex];
  }

  /**
   * Marks geometry attributes to be updated. Uses the buffer attribute "updateRange"
   * to limit the number of components updated.
   */
  updateGeo() {
    const {
      geometry,
      maxParticles,
      rangeCount,
      rangeOffset,
    } = this;
    if (this.particleUpdate === true) {
      this.particleUpdate = false;
      UPDATEABLE_ATTRIBUTES.forEach((name: string) => {
        const attr = geometry?.getAttribute(name) as BufferAttribute;
        if (rangeOffset + rangeCount < maxParticles) {
          attr.updateRange.offset = rangeOffset * attr.itemSize;
          attr.updateRange.count = rangeCount * attr.itemSize;
        } else {
          attr.updateRange.offset = 0;
          attr.updateRange.count = -1;
        }
        attr.needsUpdate = true;
      });

      this.rangeOffset = 0;
      this.rangeCount = 0;
    }
  }

  /**
   * To be called on each render tick.
   */
  updateTick(time: number) {
    const {
      mesh,
      updateGeo,
      onTick,
    } = this;

    if (!mesh) return;
    this.internalTime = time;
    (mesh.material as ShaderMaterial).uniforms.uTime.value = time;
    if (onTick) onTick(this, time);
    updateGeo();
  }

  /**
   * Spawns a new particle. To be called from outside the class.
   */
  spawnParticle(spawnOptions: SpawnOptions) {
    const {
      geometry,
      DPR,
      internalTime,
      lookup,
    } = this;

    let position = new Vector3();
    let velocity = new Vector3();
    let acceleration = new Vector3();
    let color = new Color();
    let endColor = new Color();
    let lifeTime = 0;
    let size = 0;
    let sizeRandomness = 0;

    if (!geometry) return;
    // Getting all our buffer attributes to fill
    const positionStartAttribute = geometry.getAttribute('positionStart');
    const startTimeAttribute = geometry.getAttribute('startTime');
    const velocityAttribute = geometry.getAttribute('velocity');
    const accelerationAttribute = geometry.getAttribute('acceleration');
    const colorAttribute = geometry.getAttribute('color');
    const endcolorAttribute = geometry.getAttribute('endColor');
    const sizeAttribute = geometry.getAttribute('size');
    const lifeTimeAttribute = geometry.getAttribute('lifeTime');

    // Sets any spawn options passed in and supplies defaults if none are set.
    position = spawnOptions.position ? position.copy(spawnOptions.position) : position.set(0, 0, 0);
    velocity = spawnOptions.velocity ? velocity.copy(spawnOptions.velocity) : velocity.set(0, 0, 0);
    acceleration = spawnOptions.acceleration ? acceleration.copy(spawnOptions.acceleration) : acceleration.set(0, 0, 0);
    color = spawnOptions.color ? color.copy(spawnOptions.color) : color.set(0xff0000);
    endColor = spawnOptions.endColor ? endColor.copy(spawnOptions.endColor) : endColor.copy(color);

    lifeTime = spawnOptions.lifeTime ? spawnOptions.lifeTime : 5;
    size = spawnOptions.size ? spawnOptions.size : 10;
    sizeRandomness = spawnOptions.sizeRandomness ? spawnOptions.sizeRandomness : 0;

    if (DPR) size *= this.DPR;

    const i = this.particleIndex;

    // Vectors
    (positionStartAttribute as BufferAttribute).set([position.x, position.y, position.z], i * 3);
    (velocityAttribute as BufferAttribute).set([velocity.x, velocity.y, velocity.z], i * 3);
    (accelerationAttribute as BufferAttribute).set([acceleration.x, acceleration.y, acceleration.z], i * 3);
    (colorAttribute as BufferAttribute).set([color.r, color.g, color.b], i * 3);
    (endcolorAttribute as BufferAttribute).set([endColor.r, endColor.g, endColor.b], i * 3);

    // Scalars
    (sizeAttribute as BufferAttribute).set([size + lookup() * sizeRandomness], i);
    (lifeTimeAttribute as BufferAttribute).set([lifeTime], i);
    (startTimeAttribute as BufferAttribute).set([internalTime + lookup() * 2e-2], i);

    // offset
    if (this.rangeOffset === 0) this.rangeOffset = this.particleIndex;

    // counter and cursor
    this.rangeCount++;
    this.particleIndex++;

    // wrap the cursor around
    if (this.particleIndex >= this.maxParticles) this.particleIndex = 0;
    this.particleUpdate = true;
  }
}