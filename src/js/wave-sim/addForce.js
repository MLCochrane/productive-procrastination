const AddForce = {

  uniforms: {
    'tDiffuse': {
      value: null
    },
    'point': {
      value: null
    },
    'forces': {
      value: null
    },
    'radius': {
      value: 0.1
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
    "uniform sampler2D tDiffuse;",
    "uniform vec2 point;",
    "uniform vec3 forces;",
    "uniform float radius;",

    "void main(){",
    "vec2 coords = vUv;",
    "vec2 p = vUv - point.xy;",
    "vec3 force = exp(-dot(p, p) / radius) * forces;",
    "vec3 base = texture2D(tDiffuse, coords).xyz;",

    "gl_FragColor = vec4(base + force, 1.0);",
    "}"

  ].join("\n")
};

export {
  AddForce
};
