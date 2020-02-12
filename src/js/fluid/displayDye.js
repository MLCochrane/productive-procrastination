import vertBase from './vertexShader';

export default {
  uniforms: {
    tDiffuse: {
      value: null,
    },
  },

  vertexShader: vertBase,

  fragmentShader: `
    varying highp vec2 vUv;
    uniform sampler2D tDiffuse;
    void main() {
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      // float a = max(c.r, max(c.g, c.b));
      gl_FragColor = vec4(c, 1.);
    }
  `,
};
