const PixelShader = {

  uniforms: {

    "texOne": {
      value: null
    },
    "texTwo": {
      value: null
    },
    "resolution": {
      value: null
    },
    "pixelSize": {
      value: 1.
    },
    "innerRepeatLength": {
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

    "uniform sampler2D texOne;",
    "uniform sampler2D texTwo;",
    "uniform float pixelSize;",
    "uniform float innerRepeatLength;",
    "uniform vec2 resolution;",

    "varying highp vec2 vUv;",

    "void main(){",

    "vec2 dxy = pixelSize / resolution;",
    "vec2 newUv = vUv * (resolution / (pixelSize * innerRepeatLength));",
    "vec2 coord = dxy * floor( vUv / dxy );",
    "vec4 texel0 = texture2D(texOne, coord);",
    "vec4 texel1 = texture2D(texTwo, newUv);",

    // Averages RGB values of initial texture and turns to black or white
    "float checkAgainst = (texel0.x + texel0.y + texel0.z) / 3.;",
    "vec4 newTex = vec4(vec3(step(0.5, checkAgainst)), step(0.5, texel0.a));",

    "vec4 newCol = mix(newTex, texel1, step(0.5, newTex.a));",
    "gl_FragColor = vec4(newCol);",
    "}"

  ].join("\n")
};

export {
  PixelShader
};