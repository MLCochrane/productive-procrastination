const smolShader = {

  uniforms: {
    uDeltaTime: {
      value: 0,
    },
    tLastFrame: {
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
    uniform float uDeltaTime;
    uniform sampler2D tLastFrame;


    void main() {
      vec4 tex = texture2D(tLastFrame, vUv);
      gl_FragColor = vec4(vUv * tex.xy + 0.02, 0., 1.);
    }
  `
};

export {
  smolShader
};
