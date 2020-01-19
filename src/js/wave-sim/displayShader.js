const DisplayShader = {

  uniforms: {
    'tNew': {
      value: null
    },
    'tTest': {
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
    "varying highp vec2 vUv;",
    "uniform sampler2D tNew;",
    "uniform sampler2D tTest;",

		"vec4 when_gt( vec4 x, float y ) {",

		"return max( sign( x - y ), 0.0 );",

    "}",

    "void main(){",
    "vec2 coords = vUv;",
    "vec4 tex1 = texture2D(tNew, coords);",
    "vec4 tex2 = texture2D(tTest, coords);",

			"tex2 *= 0.98 * when_gt( tex2, 0.1 );",

    // "float dist = smoothstep(.2, .25, distance(vUv, vec2(0.5)));",
    // "vec4 col = vec4(vec3(0.2, 0.3, 1.), 1.);",

    // "gl_FragColor = tex1;",
    "gl_FragColor = max(tex1, tex2);",

    "}"

  ].join("\n")
};

export {
  DisplayShader
};
