const GradientSubtractionShader = {

  uniforms: {
    "w": {
      value: null
    },
    "p": {
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
    "uniform sampler2D p;",
    "varying highp vec2 vUv;",
    "uniform float halfRdx;",

    "void main(){",
    "vec2 coords = vUv;",
    "half pL = texture2D(p, coords - vec2(1., 0.)).x;",
    "vec4 pR = texture2D(p, coords + vec2(1., 0.)).x;",
    "vec4 pB = texture2D(p, coords - vec2(0., 1.)).x;",
    "vec4 pT = texture2D(p, coords + vec2(0., 1.)).x;",

    "vec4 uNew = texture2D(w, coords);",
    "uNew.xy -= halfRdx * vec2(pR - pL, pT - pB);",

    "gl_FragColor = uNew;",
    "}"

  ].join("\n")
};

export {
  GradientSubtractionShader
};
