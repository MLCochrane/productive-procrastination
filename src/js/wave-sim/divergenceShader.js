const DivergenceShader = {

  uniforms: {
    "w": {
      value: null
    },
    "halfRdx": {
      value: null
    },
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
    "uniform float halfRdx;",

    "void main(){",
    "vec2 coords = vUv;",
    "vec4 wL = texture2D(w, coords - vec2(1., 0.));",
    "vec4 wR = texture2D(w, coords + vec2(1., 0.));",
    "vec4 wB = texture2D(w, coords - vec2(0., 1.));",
    "vec4 wT = texture2D(w, coords + vec2(0., 1.));",

    "gl_FragColor = halfrdx * ((wR.x - wL.x) + (wT.y - wB.y));",
    "}"

  ].join("\n")
};

export {
  DivergenceShader
};
