/**
 * Animated ocean vertex/fragment shader.
 * Uses Gerstner-style wave displacement with foam and fresnel reflection.
 * All uniforms are typed and documented.
 */

export const oceanVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaveHeight;
  uniform float uWaveFrequency;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vElevation;

  // Gerstner wave helper — displaces vertex along wave direction
  vec3 gerstnerWave(vec3 pos, float freq, float amp, vec2 dir, float time, float steepness) {
    float phase = dot(dir, pos.xz) * freq + time;
    float s = sin(phase);
    float c = cos(phase);
    // Displace horizontally (for Gerstner look) and vertically
    return vec3(
      steepness * amp * dir.x * c,
      amp * s,
      steepness * amp * dir.y * c
    );
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Sum of 4 Gerstner waves with different directions/frequencies
    vec3 wave1 = gerstnerWave(pos, uWaveFrequency * 1.0, uWaveHeight * 1.0, normalize(vec2(1.0, 0.6)), uTime * 0.8, 0.4);
    vec3 wave2 = gerstnerWave(pos, uWaveFrequency * 2.3, uWaveHeight * 0.4, normalize(vec2(-0.4, 1.0)), uTime * 1.2, 0.3);
    vec3 wave3 = gerstnerWave(pos, uWaveFrequency * 3.1, uWaveHeight * 0.2, normalize(vec2(0.8, -0.3)), uTime * 1.5, 0.2);
    vec3 wave4 = gerstnerWave(pos, uWaveFrequency * 4.7, uWaveHeight * 0.1, normalize(vec2(-0.6, -0.8)), uTime * 0.9, 0.15);

    pos += wave1 + wave2 + wave3 + wave4;
    vElevation = pos.y - position.y;

    // Compute displaced normal via finite differences (approximate)
    float delta = 0.05;
    vec3 posR = position + vec3(delta, 0.0, 0.0);
    vec3 posF = position + vec3(0.0, 0.0, delta);
    posR += gerstnerWave(posR, uWaveFrequency, uWaveHeight, normalize(vec2(1.0, 0.6)), uTime * 0.8, 0.4);
    posF += gerstnerWave(posF, uWaveFrequency, uWaveHeight, normalize(vec2(1.0, 0.6)), uTime * 0.8, 0.4);

    vec3 tangent = normalize(posR - pos);
    vec3 bitangent = normalize(posF - pos);
    vNormal = normalize(cross(bitangent, tangent));

    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const oceanFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeepColor;
  uniform vec3 uShallowColor;
  uniform vec3 uFoamColor;
  uniform float uFoamThreshold;
  uniform vec3 uSunDirection;
  uniform vec3 uSunColor;
  uniform float uFresnelPower;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 normal = normalize(vNormal);

    // Fresnel term — reflectivity increases at glancing angles
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);

    // Color blending: deep vs shallow based on elevation
    float depthFactor = smoothstep(-0.2, 0.3, vElevation);
    vec3 waterColor = mix(uDeepColor, uShallowColor, depthFactor);

    // Foam on wave crests
    float foam = smoothstep(uFoamThreshold - 0.05, uFoamThreshold, vElevation);
    waterColor = mix(waterColor, uFoamColor, foam * 0.6);

    // Specular highlight from sun
    vec3 halfDir = normalize(uSunDirection + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 256.0);
    vec3 specular = uSunColor * spec * 1.5;

    // Sky reflection tint via fresnel
    vec3 skyReflect = mix(vec3(0.15, 0.1, 0.2), vec3(0.9, 0.5, 0.3), fresnel);
    waterColor = mix(waterColor, skyReflect, fresnel * 0.5);

    waterColor += specular;

    gl_FragColor = vec4(waterColor, 0.85);
  }
`;
