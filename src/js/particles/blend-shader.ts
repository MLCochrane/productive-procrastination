const BlendShader = {

  uniforms: {
    texOne: {
      value: null
    },
    glowTexture: {
      value: null
    },
  },

  vertexShader: `
    varying highp vec2 vUv;

    void main() {

    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }
  `,

  fragmentShader: `
    uniform sampler2D texOne;
    uniform sampler2D glowTexture;

    varying highp vec2 vUv;

    vec4 getTexture(sampler2D texelToLinearTexture) {
      return linearToOutputTexel(texture2D(texelToLinearTexture , vUv));
    }

    void main(){
      gl_FragColor = (getTexture(texOne) + vec4(1.0) * getTexture(glowTexture));
      //gl_FragColor = (texture2D(texOne, vUv));
    }`
};

export {
  BlendShader
};
