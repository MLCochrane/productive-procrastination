const AdvectPassShader = {

  uniforms: {
    // "tDiffuse": {
    //   value: null
    // },
    "toAdvect": {
      value: null
    },
    "velField": {
      value: null
    },
    "timestep": {
      value: .03
    },
    "dissipation": {
      value: 1.
    },
    "rdx": {
      value: 1 / 1024
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
    "uniform sampler2D velField;",
    "uniform sampler2D toAdvect;",
    "varying highp vec2 vUv;",
    "uniform float timestep;",
    "uniform float dissipation;",
    "uniform float rdx;",

    "void main(){",
    "vec2 coords = vUv;",
    "vec4 u = texture2D(velField, coords);",
    "vec4 test = texture2D(toAdvect, coords);",

    // "u.x = (u.x * 2.) - 1.;",
    // "u.y = (u.y * 2.) - 1.;",

    "vec2 pos = coords - (timestep * u.xy);",
    "vec4 xNew = texture2D(toAdvect, pos) / (1.0 + dissipation * timestep);",
    // "vec4 xNew = (1. - dissipation) * texture2D(toAdvect, pos);",

    // "xNew.x = (xNew.x + 1.) / 2.;",
    // "xNew.y = (xNew.y + 1.) / 2.;",


    "gl_FragColor = xNew;",
    "}"

  ].join("\n")
};

export {
  AdvectPassShader
};
