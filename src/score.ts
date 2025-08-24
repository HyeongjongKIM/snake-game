export class Score {
  private currentScore: number = 0;
  private readonly highScoreKey = 'snakeHighScore';

  getCurrentScore(): number {
    return this.currentScore;
  }

  getHighScore(): number {
    return parseInt(localStorage.getItem(this.highScoreKey) || '0');
  }

  addPoints(points: number): void {
    this.currentScore += points;
    this.updateScoreDisplay();
  }

  init(): void {
    this.currentScore = 0;
    this.updateScoreDisplay();
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

}
