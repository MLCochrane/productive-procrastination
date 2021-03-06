const vert = `
	#define PI 3.141592653589793
	uniform vec4 scale;
  uniform float time;
	varying highp vec2 v_Uv;
  varying vec3 v_Norm;
  varying vec3 v_FragPos;
  varying vec3 v_viewPos;
  varying mat3 v_TBN;
	float amp = 0.2;
	float wave(vec2 dir, float x, float y, float t, float k, float w, float speed) {
		float base = sin(dot(dir, vec2(x, y)) * w + t * speed) + 1.0;
		return (2. * amp) * pow(base / 2., k);
	}
  float wavePartDerX(vec2 dir, float x, float y, float t, float k, float w, float speed) {
		float internalWave = dot(dir, vec2(x, y)) * w + t * speed;
		return k * dir.x * w * amp * (pow((sin(internalWave) + 1.0) / 2., k - 1.0)) * cos(internalWave);
	}
	float wavePartDerY(vec2 dir, float x, float y, float t, float k, float w, float speed) {
		float internalWave = dot(dir, vec2(x, y)) * w + t * speed;
		return k * dir.y * w * amp * (pow((sin(internalWave) + 1.0) / 2., k - 1.0)) * cos(internalWave);
	}
	void main() {
		v_Uv = uv;
		vec2 dir = vec2(.8, 0.5);
		vec2 dir2 = vec2(.5, .7);
    vec2 dir3 = vec2(1.2, .4);

     // local space
		vec4 pos = vec4( position, 1.0 );
    vec4 norm = vec4(normal, 0.0);

    // local space to world space
    v_FragPos = vec3(modelMatrix * pos);
    v_viewPos = cameraPosition;
    v_Norm = (modelMatrix * norm).xyz;
		pos.z += wave(dir, pos.x, pos.y, time, 1.5, 15., 2.03);
		pos.z += wave(dir2, pos.x, pos.y, time, 1.0, 20., 1.75);
		pos.z += wave(dir3, pos.x, pos.y, time, 2.0, 10., 2.48);
    vec3 newBi = vec3(1.0, 0.0, wavePartDerX(dir, pos.x, pos.y, time, 1.5, 2.0, 5.5));
    vec3 newTan = vec3(0.0, 1.0, wavePartDerY(dir, pos.x, pos.y, time, 1.5, 2.0, 5.5));
    vec3 newBi2 = vec3(1.0, 0.0, wavePartDerX(dir2, pos.x, pos.y, time, 1.0, 4., 3.9));
    vec3 newTan2 = vec3(0.0, 1.0, wavePartDerY(dir2, pos.x, pos.y, time, 1.0, 4., 3.9));
    vec3 newBi3 = vec3(1.0, 0.0, wavePartDerX(dir2, pos.x, pos.y, time, 2.0, 3., 4.5));
    vec3 newTan3 = vec3(0.0, 1.0, wavePartDerY(dir2, pos.x, pos.y, time, 2.0, 3., 4.5));
    v_Norm = cross(newBi, newTan);
    v_Norm += cross(newBi2, newTan2);
    v_Norm += cross(newBi3, newTan3);

    // TBN from geometry normals and tangents
    vec3 T = normalize(vec3(modelMatrix * vec4(newTan + newTan2, 0.)));
    vec3 N = normalize(vec3(modelMatrix * vec4(v_Norm, 0.)));
    vec3 B = normalize(vec3(modelMatrix * vec4(newBi + newBi2, 0.)));
    v_TBN = mat3(T, B, N);
		gl_Position = projectionMatrix * modelViewMatrix * pos;
	}
`;

const frag = `
struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};
struct SpotLight {
    vec3 position;
    vec3 direction;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float constant;
    float linear;
    float quadratic;
    float innerCutOff;
    float outerCutOff;
};
struct PointLight {
  vec3 position;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float constant;
  float linear;
  float quadratic;
};
struct DirLight {
  vec3 direction;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};
uniform Material material;
uniform SpotLight spotLight;
uniform DirLight dirLight;
uniform PointLight pointLights[NR_POINT_LIGHTS];
uniform vec2 u_resolution;
uniform vec3 ambientColor;
uniform float ambientStrength;
uniform float time;
uniform sampler2D normalMap;
varying highp vec2 v_Uv;
varying vec3 v_Norm;
varying vec3 v_FragPos;
varying vec3 v_viewPos;
varying mat3 v_TBN;
vec3 CalcDirectionalLight(DirLight light, vec3 normal, vec3 viewDir) {
  vec3 lightDir = normalize(-light.direction);
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 halfwayDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfwayDir), 0.0), material.shininess);
  vec3 ambient = (material.ambient * light.ambient);
  vec3 specular = (spec * material.specular) * light.specular;
  vec3 diffuse = (diff * material.diffuse) * light.diffuse;
  return (ambient + diffuse + specular) * ambientStrength;
}
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 viewDir, vec3 fragPos) {
  vec3 lightDir = normalize(light.position - fragPos);
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 halfwayDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfwayDir), 0.0), material.shininess);
  vec3 ambient = (material.ambient * light.ambient);
  vec3 specular = (spec * material.specular) * light.specular;
  vec3 diffuse = (diff * material.diffuse) * light.diffuse;
  float distance = length(light.position - fragPos);
  float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * pow(distance, 2.));
  ambient  *= attenuation;
  diffuse  *= attenuation;
  specular *= attenuation;
  return ambient + diffuse + specular;
}
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 viewDir, vec3 fragPos) {
  vec3 lightDir = normalize(light.position - fragPos);
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 halfwayDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfwayDir), 0.0), material.shininess);
  vec3 ambient = (material.ambient * light.ambient);
  vec3 specular = (spec * material.specular) * light.specular;
  vec3 diffuse = (diff * material.diffuse) * light.diffuse;
  float distance = length(light.position - fragPos);
  float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * pow(distance, 2.));
  ambient  *= attenuation;
  diffuse  *= attenuation;
  specular *= attenuation;
  // spotlight angles
  float theta = dot(lightDir, normalize(-light.direction));
  float epsilon = light.innerCutOff - light.outerCutOff;
  /*
  *  intensity determined by if the
  *  angle is inside first cutoff,
  *  inbetween two cutoffs, or outside both
  */
  float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);
  diffuse *= intensity;
  specular *= intensity;
  return ambient + diffuse + specular;
}
void main() {
  float specularStrength = 0.5;
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	st.x *= u_resolution.x/u_resolution.y;
  //vec3 norm = normalize(v_Norm);
  vec2 newUv = v_Uv;
  newUv.x += time * 0.005;
  newUv.y -= time * 0.008;
  vec3 norm = texture2D(normalMap, newUv * 3.).rgb;
  norm = normalize(norm * 2.0 - 1.0);
  norm = normalize(v_TBN * norm);
  vec3 viewDir = normalize(v_viewPos - v_FragPos);
  vec3 result = vec3(0.);
  result += CalcDirectionalLight(dirLight, norm, viewDir);
  for (int i = 0; i < NR_POINT_LIGHTS; i++)
  {
    result += CalcPointLight(pointLights[i], norm, viewDir, v_FragPos);
  }
  result += CalcSpotLight(spotLight, norm, viewDir, v_FragPos);
  gl_FragColor = vec4(result, 1.0);
}
`;

export {
  vert,
  frag,
};
