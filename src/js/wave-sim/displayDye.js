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
      vec4 tex = texture2D(tDiffuse, vUv);
      gl_FragColor = tex;
    }
  `
};

export {
  displayShader
};
