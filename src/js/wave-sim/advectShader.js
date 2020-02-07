import {
  vertBase
} from './vertexShader';
const advectShader = {

  uniforms: {
    uVelocity: {
      value: null,
    },
    uSource: {
      value: null,
    },
    uRdx: {
      value: null,
    },
    uTimeStep: {
      value: 0,
    },
    uTexelSize: {
      value: null,
    },
    uDissipation: {
      value: null,
    },
  },

  vertexShader: vertBase,

  fragmentShader: `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform float uRdx;
    uniform float uTimeStep;
    uniform float uDissipation;

    void main() {
      vec2 coord = vUv - uTimeStep * texture2D(uVelocity, vUv).xy * uRdx;
      vec4 result = texture2D(uSource, coord);
      gl_FragColor = result * uDissipation;
    }
    `
};

export {
  advectShader
};
