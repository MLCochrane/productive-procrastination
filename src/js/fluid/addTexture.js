import { vertBase } from './vertexShader';

export default {
  uniforms: {
    uDiffuse: {
      value: null,
    },
    uNewTexture: {
      value: null,
    },
    uTexelSize: {
      value: null,
    },
  },

  vertexShader: vertBase,

  fragmentShader: `
    varying highp vec2 vUv;
    uniform sampler2D uDiffuse;
    uniform sampler2D uNewTexture;

    void main() {
      vec2 coords = vUv;
      vec3 base = texture2D(uDiffuse, coords).xyz;
      vec3 newTex = texture2D(uNewTexture, coords).xyz;

      gl_FragColor = vec4(base + newTex, 1.0);
    }
  `,
};
