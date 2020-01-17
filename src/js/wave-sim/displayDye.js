const DisplayDye = {

  uniforms: {
    'tDiffuse': {
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


    "void main(){",
    "vec2 coords = vUv;",
    "vec4 vel = texture2D(tDiffuse, coords);",
    // "float dist = smoothstep(.2, .25, distance(vUv, vec2(0.5)));",
    // "vec4 col = vec4(vec3(dist, dist, 0.), 1.);",

    "gl_FragColor = vel;",
    "}"

  ].join("\n")
};

export {
  DisplayDye
};
