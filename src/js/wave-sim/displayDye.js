const DisplayDye = {

  uniforms: {
    'tDiffuse': {
      value: null
    },
    'tNew': {
      value: null
    },
    'tMix': {
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
    "varying highp vec2 vUv;",
    "uniform sampler2D tDiffuse;",
    "uniform sampler2D tNew;",
    "uniform sampler2D tMix;",

    "void main(){",
    "vec2 coords = vUv;",
    "vec4 tex2 = texture2D(tMix, coords);",

    "gl_FragColor = tex2;",
    "}"

  ].join("\n")
};

export {
  DisplayDye
};
