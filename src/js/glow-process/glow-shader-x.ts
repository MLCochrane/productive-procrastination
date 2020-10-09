const GlowShaderHori = {

  uniforms: {
    texOne: {
      value: null
    },
    resolution: {
      value: null
    },
  },

  vertexShader:`
    varying highp vec2 vUv;

    void main() {

    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }
  `,
  fragmentShader: `
    #define PI 3.141592653589793
    #define E 2.718281828459045
    uniform sampler2D texOne;
    uniform vec2 resolution;

    varying highp vec2 vUv;
    float calcGauss(in float x, in float std) {
      float stdSq = std * std;
      return (1. / sqrt(2. * PI * stdSq)) * pow(E, -(x * x) / (2. * stdSq));
    }

    void main(){

    vec2 onePixel = vec2(1.0, 1.0) / resolution;
    vec4 texel0 = texture2D(texOne, vUv);

    vec4 col = vec4(vec3(0.), 1.);
    float sum = 0.;

    for (float index = 0.; index < 50.; index++) {
      float offset = (index/50. - 0.5);
      vec2 theUv = vUv + vec2(offset * 0.1 * (resolution.y / resolution.x), 0.);
      float spot = offset - 25.;
      float gauss = calcGauss(offset, 0.3);
      col += texture2D(texOne, theUv) * gauss;
      sum += gauss;
    }
    gl_FragColor = vec4(col/sum);
  }`
};

export {
  GlowShaderHori
};
