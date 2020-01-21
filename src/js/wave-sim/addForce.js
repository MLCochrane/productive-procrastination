const AddForce = {

  uniforms: {
    'tDiffuse': {
      value: null
    },
    'uDiffuse': {
      value: null
    },
    'point': {
      value: null
    },
    'forces': {
      value: null
    },
    'radius': {
      value: 0.005
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
    "varying highp vec2 vUv;",
    "uniform sampler2D uDiffuse;",
    "uniform vec2 point;",
    "uniform vec3 forces;",
    "uniform float radius;",

    "void main(){",
    "vec2 coords = vUv;",
    "vec2 p = coords - point.xy;",
    "vec3 force = exp(-dot(p, p) / radius) * forces;",
    "vec3 base = texture2D(uDiffuse, coords).xyz;",

    "gl_FragColor = vec4(base + force, 1.0);",
    // "gl_FragColor = vec4(0.5, 0.2, 0.1, 1.0);",
    "}"

  ].join("\n")
};

export {
  AddForce
};
