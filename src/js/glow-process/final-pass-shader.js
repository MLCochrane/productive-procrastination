const FinalShaderPass = {

  uniforms: {
    texOne: {
      value: null
    },
    glowTexture: {
      value: null
    },
    depthTex: {
      value: null,
    },
    cameraNear: {
      value: null,
    },
    cameraFar: {
      value: null,
    },
    intensity: {
      value: null,
    },
    fogColor: {
      value: null,
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
    "#include <packing>",
    "uniform sampler2D texOne;",
    "uniform sampler2D glowTexture;",
    "uniform sampler2D depthTex;",
    "uniform float cameraNear;",
    "uniform float cameraFar;",
    "uniform float intensity;",
    "uniform vec3 fogColor;",

    "varying highp vec2 vUv;",

    "float readDepth(sampler2D depthSampler, vec2 coord) {",
    "  float fragCoordZ = texture2D(depthSampler, coord).x;",
    "  float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );",
    "  //return (fragCoordZ - cameraNear) / (cameraFar - cameraNear);",
    "  return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );",
    "}",

    "vec4 getTexture(sampler2D texelToLinearTexture) {",
      "return mapTexelToLinear(texture2D(texelToLinearTexture , vUv));",
    "}",

    "void main(){",
      "vec4 diffuse = texture2D(texOne, vUv);",
      "vec3 dDiff = texture2D(depthTex, vUv).rgb;",
      "float depth = readDepth(depthTex, vUv);",
      "float fogLevel = clamp(depth * intensity, 0., 1.);",

      "vec4 otherMix = mix(diffuse, vec4(fogColor, 1.0), fogLevel);",
      //"vec4 mixed = (getTexture(texOne) + vec4(1.0) * getTexture(glowTexture));",
      //"gl_FragColor = mix(mixed, vec4(fogColor, 1.0), fogLevel);",
      "gl_FragColor = otherMix + texture2D(glowTexture, vUv);",
    "}"

  ].join("\n")
};

export {
  FinalShaderPass
};
