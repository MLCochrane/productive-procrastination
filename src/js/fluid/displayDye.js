const displayShader = {

  uniforms: {
    tDiffuse: {
      value: null,
    }
  },

  vertexShader: `
    #include <common>
    varying highp vec2 vUv;
    void main() {
      vUv = position.xy;
      gl_Position = vec4(position * 2. - 1., 1.);
    }
  `,

  fragmentShader: `
    varying highp vec2 vUv;
    uniform sampler2D tDiffuse;
    void main() {
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      // float a = max(c.r, max(c.g, c.b));
      gl_FragColor = vec4(c, 1.);
    }
  `
};

export {
  displayShader
};
