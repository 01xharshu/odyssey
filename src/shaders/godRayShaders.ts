export const godRayVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const godRayFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform vec2 uMouse;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // Simplex-style noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Radial gradient from top-left (light source position)
    vec2 lightPos = vec2(-0.3 + uMouse.x * 0.15, 0.8 + uMouse.y * 0.1);
    float dist = distance(uv, lightPos);
    
    // Ray direction
    vec2 rayDir = normalize(uv - lightPos);
    float rayAngle = atan(rayDir.y, rayDir.x);
    
    // Animated noise-based rays
    float rays = 0.0;
    rays += noise(vec2(rayAngle * 8.0 + uTime * 0.1, dist * 2.0)) * 0.5;
    rays += noise(vec2(rayAngle * 16.0 - uTime * 0.15, dist * 4.0)) * 0.25;
    rays += noise(vec2(rayAngle * 4.0 + uTime * 0.05, dist)) * 0.25;
    
    // Distance falloff
    float falloff = 1.0 - smoothstep(0.0, 1.2, dist);
    falloff = pow(falloff, 2.0);
    
    // Scroll-modulated intensity
    float scrollMod = 0.5 + uScrollProgress * 0.5;
    
    // Final color
    float intensity = rays * falloff * uIntensity * scrollMod;
    vec3 color = uColor * intensity;
    
    // Add subtle warm highlight
    color += vec3(1.0, 0.9, 0.7) * intensity * 0.15;
    
    gl_FragColor = vec4(color, intensity * 0.4);
  }
`;
