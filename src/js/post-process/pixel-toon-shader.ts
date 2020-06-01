/**
 * Adapted from Pixel Shader in ThreeJS examples by wongbryan / http://wongbryan.github.io
 *
 */

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
    "invert": {
      value: false
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
    "uniform bool invert;",

    "varying highp vec2 vUv;",

    "vec2 getRelation(in float check) {",
    "if (invert) {",
    "    return vec2(step(0.5, check), step(check, 0.5));",
    "  } else {",
    "    return vec2(step(check, 0.5), step(0.5, check));",
    "  }",
    "}",

    "void main(){",

    "vec2 dxy = pixelSize / resolution;",
    "vec2 newUv = vUv * (resolution / (pixelSize * innerRepeatLength));",
    "vec2 coord = dxy * floor( vUv / dxy );",
    "vec4 texel0 = texture2D(texOne, coord);",
    "vec4 texel1 = texture2D(texTwo, newUv);",

    // Averages RGB values of initial texture and turns to black or white
    "float checkAgainst = (texel0.x + texel0.y + texel0.z) / 3.;",
    "vec2 res = getRelation(checkAgainst);",
    "vec4 newTex = vec4(vec3(res.x), step(0.5, texel0.a));", // flip order of step(checkAgainst, 0.5) for selecting darks

    "vec4 newCol = mix(newTex, texel1, res.y);", // flip order of step(0.5, checkAgainst) for selecting darks
    "gl_FragColor = vec4(newCol);",
    "}"

  ].join("\n")
};

export {
  PixelShader
};


"vec2 getRelation(float check) {"
"if (invert) {"
"    return vec2(step(0.5, check), step(check, 0.5));"
"  } else {"
"    return vec2(step(check, 0.5), step(0.5, check));"
"  }"
"}"