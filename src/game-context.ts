import { Subject } from './libs/subject';

export type GameState = 'ready' | 'playing' | 'paused' | 'end';

export interface GameContext {
  gameState: Subject<GameState>;
  score: Subject<number>;
}

export class GameStateManager {
  private static instance: GameStateManager;
  private context: GameContext;

  private constructor() {
    this.context = {
      gameState: new Subject<GameState>('ready'),
      score: new Subject<number>(0),
    };
  }

  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  public getContext(): GameContext {
    return this.context;
  }

  // Convenience methods for game state
  public getGameState(): GameState {
    return this.context.gameState.getState();
  }

  public setGameState(state: GameState): void {
    this.context.gameState.setState(state);
  }

  public subscribeToGameState(callback: (newState: GameState, prevState: GameState) => void) {
    return this.context.gameState.subscribe(callback);
  }

  // Convenience methods for score
  public getScore(): number {
    return this.context.score.getState();
  }

  public setScore(score: number): void {
    this.context.score.setState(score);
  }

  public subscribeToScore(callback: (newScore: number, prevScore: number) => void) {
    return this.context.score.subscribe(callback);
  }
}