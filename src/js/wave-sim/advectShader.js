const AdvectPassShader = {

  uniforms: {
    // "tDiffuse": {
    //   value: null
    // },
    // "tOld": {
    //   value: null
    // },
    "velField": {
      value: null
    },
    "timestep": {
      value: .3
    },
    "dissipation": {
      value: .9
    },
    "rdx": {
      value: 1 / 512
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
    "varying highp vec2 vUv;",
    "uniform float timestep;",
    "uniform float dissipation;",
    "uniform float rdx;",

    "void main(){",
    "vec2 coords = vUv;",
    "vec4 u = texture2D(velField, coords);",

    "vec2 pos = coords - timestep * rdx * u.xy;",
    "vec4 xNew = dissipation * texture2D(velField, pos);",

    //"gl_FragColor = vec4(vec3(u.x, u.y, u.z), 1.);",
    "gl_FragColor = xNew;",
    "}"

  ].join("\n")
};

export {
  AdvectPassShader
};
