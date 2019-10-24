/**
 * Adapted from Pixel Shader in ThreeJS examples by wongbryan / http://wongbryan.github.io
 *
 * TODO: Add uniform for picking whites vs blacks and update shader logic to use this
 *
 */

const GlowShaderVert = {

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
    "uniform sampler2D texTwo;",
    "uniform vec2 resolution;",
    "uniform float u_kernel[25];",
    "const float samples = 50.;",

    "varying highp vec2 vUv;",

    "void main(){",

    "vec2 onePixel = vec2(1.0, 1.0) / resolution;",
    "vec4 init = texture2D(texTwo, vUv);",
    "vec4 texel0 = texture2D(texOne, vUv);",
    // "vec4 test = texture2D(texOne, vec2(vUv.x + .2, vUv.y + .2));",
    "vec4 col = vec4(vec3(0.), 1.);",

    "for (float index = 0.; index < samples; index++) {",
      "vec2 theUv = vUv + vec2(0., (index/samples - 0.5) * 0.1);\
      col += texture2D(texOne, theUv);\
    }",

    //"gl_FragColor = vec4(texel0);",
    "col/=samples;",
    //"gl_FragColor = vec4(gl_FragColor.a) * gl_FragColor + vec4(1.0 - gl_FragColor.a) * col;",
    //"gl_FragColor = col;",
    "gl_FragColor = col;",
    "}"

  ].join("\n")
};

export {
  GlowShaderVert
};
