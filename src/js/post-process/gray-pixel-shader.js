const PixelShader = {

  uniforms: {

    "tDiffuse": {
      value: null
    },
    "resolution": {
      value: null
    },
    "pixelSize": {
      value: 1.
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

    "uniform sampler2D tDiffuse;",
    "uniform float pixelSize;",
    "uniform vec2 resolution;",

    "varying highp vec2 vUv;",
    "float Circle( in vec2 _st, in float _radius) {",
      "vec2 dist = _st - vec2(0.5);",
      "return 1. - smoothstep(_radius - (_radius * 0.01),",
        "_radius + (_radius * 0.01),",
        "dot(dist, dist) * 4.0);",
    "}",

    "void main(){",

    "vec2 dxy = pixelSize / resolution;",
    "vec2 coord = dxy * floor( vUv / dxy );",
    "vec4 testVec = texture2D(tDiffuse, coord);",
    "float checkAgainst = (testVec.x + testVec.y + testVec.z + testVec.w) / 4.;",
    "vec3 leCol = vec3(step(checkAgainst, 0.));",
    "gl_FragColor = vec4(leCol, 1.0);",
    "}"

  ].join("\n")
};

export {
  PixelShader
};
