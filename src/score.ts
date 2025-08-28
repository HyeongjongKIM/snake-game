import { GameStateManager } from './game-context';
import type { Subscription } from './libs/subject';

export class Score {
  private currentScore: number = 0;
  private readonly highScoreKey = 'snakeHighScore';
  private gameStateManager: GameStateManager;
  private scoreSubscription?: Subscription;

  constructor() {
    this.gameStateManager = GameStateManager.getInstance();
    this.setupScoreSubscription();
  }

  private setupScoreSubscription(): void {
    this.scoreSubscription = this.gameStateManager.subscribeToScore((newScore) => {
      this.currentScore = newScore;
      this.updateScoreDisplay();
    });
  }

  getCurrentScore(): number {
    return this.currentScore;
  }

  getHighScore(): number {
    return parseInt(localStorage.getItem(this.highScoreKey) || '0');
  }

  addPoints(points: number): void {
    const newScore = this.currentScore + points;
    this.gameStateManager.setScore(newScore);
  }

  init(): void {
    this.gameStateManager.setScore(0);
    this.updateHighScoreDisplay();
  }

  saveHighScore(): boolean {
    const currentHighScore = this.getHighScore();
    if (this.currentScore > currentHighScore) {
      localStorage.setItem(this.highScoreKey, this.currentScore.toString());
      this.updateHighScoreDisplay();
      return true; // New high score achieved
    }
    return false; // No new high score
  }

  updateScoreDisplay(): void {
    const scoreSpan = document.getElementById('score') as HTMLSpanElement;
    if (scoreSpan) {
      scoreSpan.textContent = this.currentScore.toString();
    }
  }

  updateHighScoreDisplay(): void {
    const highScoreSpan = document.getElementById('high-score') as HTMLSpanElement;
    if (highScoreSpan) {
      highScoreSpan.textContent = this.getHighScore().toString();
    }
  }

  public destroy(): void {
    if (this.scoreSubscription && !this.scoreSubscription.closed) {
      this.scoreSubscription.unsubscribe();
    }
  }
}
