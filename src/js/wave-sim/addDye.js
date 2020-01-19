const AddDye = {

  uniforms: {
    'tDiffuse': {
      value: null
    },
    'tOld': {
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
    "uniform sampler2D tOld;",

    "void main(){",
    "vec2 coords = vUv;",
    "vec4 tNew = texture2D(tDiffuse, coords);",
    "vec4 tOld = texture2D(tOld, coords);",

    "gl_FragColor = tNew + tOld;",
    "}"

  ].join("\n")
};

export {
  AddDye
};
