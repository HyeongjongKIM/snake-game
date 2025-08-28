import type { GameTimingConfig } from './types';

export const DEFAULT_GAME_TIMING: GameTimingConfig = {
  gameSpeed: 150, // ms between game logic updates
  targetFps: 60, // target frames per second
  maxFrameSkip: 5, // maximum frames to skip to prevent spiral of death
};
