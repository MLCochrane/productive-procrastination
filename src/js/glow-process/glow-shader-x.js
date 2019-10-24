/**
 * Adapted from Pixel Shader in ThreeJS examples by wongbryan / http://wongbryan.github.io
 *
 * TODO: Add uniform for picking whites vs blacks and update shader logic to use this
 *
 */

const GlowShaderHori = {

  uniforms: {

    "texOne": {
      value: null
    },
    "resolution": {
      value: null
    },
    "u_kernel": {
      value: []
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
    "uniform vec2 resolution;",
    "uniform float u_kernel[25];\
    \
    varying highp vec2 vUv;\
    \
    void main(){\
    \
    vec2 onePixel = vec2(1.0, 1.0) / resolution;\
    vec4 texel0 = texture2D(texOne, vUv);\
    \
    vec4 col = vec4(vec3(0.), 1.);",
    "float sum = 0.;",

    "for (float index = 0.; index < 50.; index++) {",
      "float offset = (index/50. - 0.5) * 0.1 * (resolution.y / resolution.x);",
      "vec2 theUv = vUv + vec2(offset, 0.);\
      float spot = offset - 25.;\
      col += texture2D(texOne, theUv) * u_kernel[24];\
      sum += u_kernel[24];\
    }",
    "gl_FragColor = vec4(col/sum);",
    "}"

  ].join("\n")
};

export {
  GlowShaderHori
};
