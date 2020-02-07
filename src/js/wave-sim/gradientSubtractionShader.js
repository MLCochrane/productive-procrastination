import {
  vertBase
} from './vertexShader';
const gradientSubtraction = {

  uniforms: {
    uVelocity: {
      value: null,
    },
    uPressure: {
      value: null,
    },
    uHalfRdx: {
      value: null,
    },
    uTexelSize: {
      value: null,
    },
  },

  vertexShader: vertBase,

  fragmentShader: `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    uniform float uHalfRdx;
    void main() {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity.xy -= uHalfRdx * vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
    `
};

export {
  gradientSubtraction
};
