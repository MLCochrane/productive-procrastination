export default `
precision mediump float;

attribute vec3 a_position;
attribute vec2 a_uv;

varying vec2 fragCoord;
varying vec2 vUv;
uniform vec2 u_resolution;

void main() {
  gl_Position = vec4(a_position, 1.0);
  fragCoord = a_position.xy;
  vUv = a_uv;
}
`;
