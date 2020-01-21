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
    "uniform sampler2D w;",
    "varying highp vec2 vUv;",
    "uniform float halfRdx;",

    "void main(){",
    "vec2 coords = vUv;",
    "float offset = 1.0/1024.0;",

    "vec2 leftCoord = coords - vec2(1. * offset, 0.);",
    "vec2 rightCoord = coords + vec2(1. * offset, 0.);",
    "vec2 bottomCoord = coords - vec2(0., 1. * offset);",
    "vec2 topCoord = coords + vec2(0., 1. * offset);",

    // "float wL = (texture2D(w, leftCoord).x * 2.) - 1.;",
    // "float wR = (texture2D(w, rightCoord).x * 2.) - 1.;",
    // "float wB = (texture2D(w, bottomCoord).y * 2.) - 1.;",
    // "float wT = (texture2D(w, topCoord).y * 2.) - 1.;",

    "float wL = texture2D(w, leftCoord).x;",
    "float wR = texture2D(w, rightCoord).x;",
    "float wB = texture2D(w, bottomCoord).y;",
    "float wT = texture2D(w, topCoord).y;",

    "vec2 C = texture2D(w, coords).xy;",
    // "C.x = (C.x * 2.) - 1.;",
    // "C.y = (C.y * 2.) - 1.;",

    // adding in bounds check thanks to https://github.com/PavelDoGreat
    "if (leftCoord.x < 0.0) { wL = -C.x; }",
    "if (rightCoord.x > 1.0) { wR = -C.x; }",
    "if (bottomCoord.y < 0.0) { wB = -C.y; }",
    "if (topCoord.y > 1.0) { wT = -C.y; }",

    "float div = halfRdx * ((wR - wL) + (wT - wB));",
    // "div = (div + 1.) / 2.;",
    "gl_FragColor = vec4(div, 0., 0., 1.);",
    "}"

  ].join("\n")
};

export {
  DivergenceShader
};
