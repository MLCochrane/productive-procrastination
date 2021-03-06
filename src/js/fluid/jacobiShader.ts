import vertBase from './vertexShader';

export default {

  uniforms: {
    uDivergence: {
      value: null,
    },
    uPressure: {
      value: null,
    },
    uAlpha: {
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
    uniform sampler2D uDivergence;
    uniform float uAlpha;
    void main() {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float C = texture2D(uPressure, vUv).x;
      float divergence = texture2D(uDivergence, vUv).x;
      float pressure = (L + R + B + T + (uAlpha * divergence)) * 0.25;
      gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
    `,
};
