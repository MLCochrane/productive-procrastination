import {
  vertBase
} from './vertexShader';
const addForce = {

  uniforms: {
    uDiffuse: {
      value: null,
    },
    uPoint: {
      value: null,
    },
    uTexelSize: {
      value: null,
    },
    uForces: {
      value: null,
    },
    uRadius: {
      value: 0.1 / 100,
    },
    uMoved: {
      value: 0,
    },
  },

  vertexShader: vertBase,

  fragmentShader: `
    varying highp vec2 vUv;
    uniform sampler2D uDiffuse;
    uniform vec2 uPoint;
    uniform vec3 uForces;
    uniform float uRadius;
    // uniform float uAspect;
    uniform float uMoved;

    float guass(vec2 pos, float r) {
      return exp(-dot(pos, pos) / r);
    }

    void main() {
      vec2 coords = vUv;
      vec2 p = coords - uPoint.xy;
      // p.x *= uAspect;
      float r = uRadius;

      vec3 base = texture2D(uDiffuse, coords).xyz;
      vec3 force = uForces * guass(p, r);
      vec3 result = mix(vec3(0.), force, uMoved);

      gl_FragColor = vec4(base + result, 1.0);
    }
  `
};

export {
  addForce
};
