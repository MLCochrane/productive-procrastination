const BoundryShader = {

  uniforms: {
    "x": {
      value: null
    },
    "b": {
      value: null
    },
    "alpha": {
      value: null
    },
    "rBeta": {
      value: null
    }
  },

  vertexShader: [

    "varying highp vec2 vUv;",

    "void main() {",

    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [
    "uniform sampler2D x;",
    "varying highp vec2 vUv;",
    "uniform vec2 offset;",
    "uniform float scale;",

    "void main(){",
    "vec2 coords = vUv;",
    "gl_FragColor = scale * texture2D(x, coords + offset);",
    "}"

  ].join("\n")
};

export {
  BoundryShader
};
