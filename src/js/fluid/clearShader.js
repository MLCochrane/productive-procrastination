import { vertBase } from './vertexShader';
const clearShader = {

  uniforms: {
    uTexture: {
      value: null,
    },
    uValue: {
      value: 0,
    },
    uTexelSize: {
      value: null,
    },
  },

  vertexShader: vertBase,

  fragmentShader: `
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float uValue;

    void main() {
      vec4 tex = texture2D(uTexture, vUv);
      gl_FragColor = uValue * tex;
    }
  `
};

export {
  clearShader
};
