const JacobiIterationShader = {

  uniforms: {
    "x": {
      value: null
    },
    "b": {
      value: null
    },
    "alpha": {
      value: null
    },
    "rBeta": {
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
    "uniform sampler2D x;",
    "uniform sampler2D b;",
    "varying highp vec2 vUv;",
    "uniform float alpha;",
    "uniform float rBeta;",

    "void main(){",
    "vec2 coords = vUv;",
    "vec4 xL = texture2D(x, coords - vec2(1., 0.));",
    "vec4 xR = texture2D(x, coords + vec2(1., 0.));",
    "vec4 xB = texture2D(x, coords - vec2(0., 1.));",
    "vec4 xT = texture2D(x, coords + vec2(0., 1.));",

    "vec4 bC = texture2D(b, coords);",

    "gl_FragColor = (xL + xR + xB + xT + alpha * bC) * rBeta;",
    "}"

  ].join("\n")
};

export {
  JacobiIterationShader
};
