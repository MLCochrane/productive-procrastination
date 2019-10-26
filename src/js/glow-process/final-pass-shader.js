/**
 * Adapted from Pixel Shader in ThreeJS examples by wongbryan / http://wongbryan.github.io
 *
 * TODO: Add uniform for picking whites vs blacks and update shader logic to use this
 *
 */

const FinalShaderPass = {

  uniforms: {
    "texOne": {
      value: null
    },
    "glowTexture": {
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
    "uniform sampler2D texOne;",
    "uniform sampler2D glowTexture;",

    "varying highp vec2 vUv;",

    "vec4 getTexture(sampler2D texelToLinearTexture) {",
      "return mapTexelToLinear(texture2D(texelToLinearTexture , vUv));",
    "}",

    "void main(){",
      "gl_FragColor = (getTexture(texOne) + vec4(1.0) * getTexture(glowTexture));",
      //"gl_FragColor = (texture2D(texOne, vUv));",
    "}"

  ].join("\n")
};

export {
  FinalShaderPass
};
