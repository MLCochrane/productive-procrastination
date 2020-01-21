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
    "float offset = 1.0/1024.0;",
    "float xL = texture2D(x, coords - vec2(1. * offset, 0.)).x;",
    "float xR = texture2D(x, coords + vec2(1. * offset, 0.)).x;",
    "float xB = texture2D(x, coords - vec2(0., 1. * offset)).y;",
    "float xT = texture2D(x, coords + vec2(0., 1. * offset)).y;",

    // Mapping back to signed values
    // "xL = (xL * 2.) - 1.;",
    // "xR = (xR * 2.) - 1.;",
    // "xB = (xB * 2.) - 1.;",
    // "xT = (xT * 2.) - 1.;",

    // stored divergence in x component in previous step
    "float bC = texture2D(b, coords).x;",
    "float pressure = (xL + xR + xB + xT + (alpha * bC)) * rBeta;",

    // "pressure = (pressure + 1.) * 2.;",

    "gl_FragColor = vec4(pressure, 0., 0., 1.0);",
    "}"

  ].join("\n")
};

export {
  JacobiIterationShader
};
