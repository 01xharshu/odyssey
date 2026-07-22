export interface OdysseyCharacter {
  id: number;
  name: string;
  role: string;
  description: string;
  portrait: string;
  background: string;
  videoClip: string;
  accentColor: [number, number, number]; // RGB 0-1 for WebGL
  accentHex: string; // CSS hex color
}

export interface ScrollState {
  progress: number; // 0 to 1
  velocity: number;
  direction: 'up' | 'down' | 'idle';
}

export interface MouseState {
  x: number; // -1 to 1 (normalized)
  y: number; // -1 to 1 (normalized)
  clientX: number;
  clientY: number;
  isMoving: boolean;
}
