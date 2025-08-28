import type { GameTimingConfig } from './types';

export type GameLoopConfig = GameTimingConfig;

export interface GameLoopState {
  isRunning: boolean;
  lastUpdateTime: number;
  accumulator: number;
  frameCount: number;
  lastFpsUpdate: number;
  currentFps: number;
}

export interface GameLoopCallbacks {
  update: () => void;
  render: () => void;
  onFpsUpdate?: (fps: number) => void;
  onError?: (error: Error) => void;
}

export class GameLoopController {
  private config: GameLoopConfig;
  private state: GameLoopState;
  private callbacks: GameLoopCallbacks;
  private animationId: number | null = null;
  private boundGameLoop: (currentTime: number) => void;

  constructor(config: GameLoopConfig, callbacks: GameLoopCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
    this.boundGameLoop = this.gameLoopCallback.bind(this);
    
    this.state = {
      isRunning: false,
      lastUpdateTime: 0,
      accumulator: 0,
      frameCount: 0,
      lastFpsUpdate: 0,
      currentFps: 0,
    };
  }

  public start(): void {
    if (this.state.isRunning) return;
    
    this.state.isRunning = true;
    this.state.lastUpdateTime = performance.now();
    this.state.accumulator = 0;
    this.state.frameCount = 0;
    this.state.lastFpsUpdate = this.state.lastUpdateTime;
    
    this.scheduleNextFrame();
  }

  public stop(): void {
    if (!this.state.isRunning) return;
    
    this.state.isRunning = false;
    
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public getCurrentFps(): number {
    return this.state.currentFps;
  }

  public isRunning(): boolean {
    return this.state.isRunning;
  }

  private scheduleNextFrame(): void {
    if (!this.state.isRunning) return;
    
    try {
      this.animationId = requestAnimationFrame(this.boundGameLoop);
    } catch (error) {
      this.handleError(new Error(`Failed to schedule animation frame: ${error}`));
    }
  }

  private gameLoopCallback(currentTime: number): void {
    if (!this.state.isRunning) return;

    try {
      const deltaTime = currentTime - this.state.lastUpdateTime;
      
      // Prevent spiral of death with maximum frame skip
      const maxDelta = this.config.gameSpeed * this.config.maxFrameSkip;
      const clampedDelta = Math.min(deltaTime, maxDelta);
      
      this.state.lastUpdateTime = currentTime;
      this.state.accumulator += clampedDelta;

      // Fixed timestep updates
      while (this.state.accumulator >= this.config.gameSpeed) {
        this.callbacks.update();
        this.state.accumulator -= this.config.gameSpeed;
      }

      // Always render for smooth visuals
      this.callbacks.render();

      // Update FPS counter
      this.updateFps(currentTime);

      // Schedule next frame
      this.scheduleNextFrame();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private updateFps(currentTime: number): void {
    this.state.frameCount++;
    
    const elapsed = currentTime - this.state.lastFpsUpdate;
    if (elapsed >= 1000) { // Update FPS every second
      this.state.currentFps = Math.round(
        (this.state.frameCount * 1000) / elapsed
      );
      this.state.frameCount = 0;
      this.state.lastFpsUpdate = currentTime;
      
      if (this.callbacks.onFpsUpdate) {
        this.callbacks.onFpsUpdate(this.state.currentFps);
      }
    }
  }

  private handleError(error: Error): void {
    console.error('Game loop error:', error);
    
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
    
    // Stop the loop to prevent cascading errors
    this.stop();
    
    // Try to restart after a delay (simple recovery mechanism)
    setTimeout(() => {
      if (!this.state.isRunning) {
        console.log('Attempting to restart game loop...');
        this.start();
      }
    }, 1000);
  }

  public updateConfig(newConfig: Partial<GameLoopConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}