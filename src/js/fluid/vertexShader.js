export const vertBase = `
    precision highp float;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 uTexelSize;
    void main() {
      vUv = position.xy;
      vL = vUv - vec2(uTexelSize.x, 0.0);
      vR = vUv + vec2(uTexelSize.x, 0.0);
      vT = vUv + vec2(0.0, uTexelSize.y);
      vB = vUv - vec2(0.0, uTexelSize.y);
      gl_Position = vec4(position.xy * 2. - 1., 0.0, 1.0);
    }
`;