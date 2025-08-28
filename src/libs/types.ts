export interface Position {
  x: number;
  y: number;
}

export interface GameTimingConfig {
  gameSpeed: number;
  targetFps: number;
  maxFrameSkip: number;
}
