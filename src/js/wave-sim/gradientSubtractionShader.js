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
    "float offset = 1.0/1024.0;",
    // "float pL = (texture2D(p, coords - vec2(1. * offset, 0.)).x * 2.) - 1.;",
    // "float pR = (texture2D(p, coords + vec2(1. * offset, 0.)).x * 2.) - 1.;",
    // "float pB = (texture2D(p, coords - vec2(0., 1. * offset)).x * 2.) - 1.;",
    // "float pT = (texture2D(p, coords + vec2(0., 1. * offset)).x * 2.) - 1.;",

    "float pL = texture2D(p, coords - vec2(1. * offset, 0.)).x;",
    "float pR = texture2D(p, coords + vec2(1. * offset, 0.)).x;",
    "float pB = texture2D(p, coords - vec2(0., 1. * offset)).x;",
    "float pT = texture2D(p, coords + vec2(0., 1. * offset)).x;",

    "vec4 uNew = texture2D(w, coords);",
    // "uNew.xy -= halfRdx * vec2(pR - pL, pT - pB);",
    "uNew.xy -= vec2(pR - pL, pT - pB);",


    // "uNew.x = (uNew.x + 1.) / 2.;",
    // "uNew.y = (uNew.y + 1.) / 2.;",

    "gl_FragColor = uNew;",
    "}"

  ].join("\n")
};

export {
  GradientSubtractionShader
};


// void divergence(half2 coords: WPOS, // grid coordinates
//   out    half4 div : COLOR,  // divergence
//   uniform half halfrdx,   // 0.5 / gridscale
//   uniform samplerRECT w)  // vector field
//   {
//     half4 wL = h4texRECT(w, coords - half2(1, 0));
//     half4 wR = h4texRECT(w, coords + half2(1, 0));
//     half4 wB = h4texRECT(w, coords - half2(0, 1));
//     half4 wT = h4texRECT(w, coords + half2(0, 1));
//   div = halfrdx * ((wR.x - wL.x) + (wT.y - wB.y));
// }