export const particleVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform vec2 uMouse;
  uniform float uActiveIndex;
  uniform float uClickTime;
  uniform vec2 uClickPos;
  
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  
  varying float vAlpha;
  varying float vDepth;
  varying vec3 vColor;
  
  void main() {
    vec3 pos = position;
    
    // Organic floating motion
    float t = uTime * aSpeed * 0.3;
    pos.x += sin(t + aPhase * 6.28) * 0.5;
    pos.y += cos(t * 0.7 + aPhase * 3.14) * 0.4;
    pos.z += sin(t * 0.5 + aPhase * 4.71) * 0.3;
    
    // Scroll-driven wave distortion
    float wave = sin(pos.x * 0.5 + uScrollProgress * 6.28) * uScrollProgress * 2.0;
    pos.y += wave;
    
    // Mouse repulsion — particles gently flee the cursor
    vec2 mouseWorld = uMouse * 5.0;
    vec2 diff = pos.xy - mouseWorld;
    float dist = length(diff);
    float repulsion = smoothstep(3.0, 0.0, dist) * 1.5;
    pos.xy += normalize(diff + 0.001) * repulsion;

    // Shockwave effect on click
    float timeSinceClick = uTime - uClickTime;
    if (timeSinceClick > 0.0 && timeSinceClick < 3.0) {
      vec2 clickWorld = uClickPos * 5.0;
      vec2 clickDiff = pos.xy - clickWorld;
      float clickDist = length(clickDiff);
      
      // Ring expanding outwards
      float ringRadius = timeSinceClick * 8.0; 
      float ringThickness = 1.5;
      float distanceToRing = abs(clickDist - ringRadius);
      
      // Only affect particles near the expanding ring
      float shock = smoothstep(ringThickness, 0.0, distanceToRing);
      // Push particles outward and upward
      pos.xy += normalize(clickDiff + 0.001) * shock * 2.0;
      pos.z += shock * 2.0;
    }
    
    // Depth based alpha
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float depth = -mvPosition.z;
    vAlpha = smoothstep(20.0, 2.0, depth) * (0.3 + aPhase * 0.7);
    vDepth = depth;
    
    // Color variation based on active character
    float hueShift = uActiveIndex * 0.2;
    vColor = vec3(
      0.96 + sin(hueShift) * 0.04,
      0.62 + cos(hueShift * 1.5) * 0.15,
      0.04 + sin(hueShift * 2.0) * 0.2
    );
    
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * (300.0 / depth);
  }
`;

export const particleFragmentShader = /* glsl */ `
  varying float vAlpha;
  varying float vDepth;
  varying vec3 vColor;
  
  void main() {
    // Soft circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Glow falloff
    alpha *= vAlpha;
    alpha *= 0.6;
    
    // Warm golden color with depth fade
    vec3 color = vColor;
    color += vec3(0.1, 0.05, 0.0) * (1.0 - dist * 2.0); // Bright center
    
    gl_FragColor = vec4(color, alpha);
  }
`;
