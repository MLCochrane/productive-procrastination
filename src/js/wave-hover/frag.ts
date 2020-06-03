export default `
precision mediump float;

varying vec2 fragCoord;
varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_delta;
uniform float u_hover;
uniform float u_force;
uniform sampler2D u_texture;
uniform sampler2D u_displacement;

void main() {
  vec2 uv = vUv;
  vec3 col = vec3(vUv, 0.0);
  vec2 disUv = uv + u_delta * u_force;
  vec3 dis = texture2D(u_displacement, disUv).rgb;
  uv.x += (dis.r * .03);
  uv.y += (dis.r * .03);
  vec3 tex = texture2D(u_texture, uv).rgb;
  gl_FragColor = vec4(tex, 1.);
}
`;
