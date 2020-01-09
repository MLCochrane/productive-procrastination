const FogShader = {

  uniforms: {
    tDiffuse: {
      value: null
    },
    tDepth: {
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
    "uniform sampler2D tDiffuse;",
    "uniform sampler2D tDepth;",
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

    "void main(){",
    "vec3 diffuse = texture2D(tDiffuse, vUv).rgb;",
    "float depth = readDepth(tDepth, vUv);",
    "float fogLevel = clamp(depth * intensity, 0., 1.);",

    "gl_FragColor.rgb = mix(diffuse, fogColor, fogLevel);",
    "gl_FragColor.a = 1.0;",
    "//gl_FragColor = vec4(diffuse, 1.0);",
    "}"

  ].join("\n")
};

export {
  FogShader
};
