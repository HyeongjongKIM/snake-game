import type { Position } from './types';

export class Food {
  private position: Position;
  private gridSize: number;
  private score: number = 10;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
    this.position = { x: 0, y: 0 };
  }

  getPosition(): Position {
    return { ...this.position };
  }

  getScore(): number {
    return this.score;
  }

  generate(snakeBody: Position[], tileCount: number): void {
    let newPosition: Position;

    do {
      newPosition = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
      };
    } while (
      snakeBody.some(
        (segment) => segment.x === newPosition.x && segment.y === newPosition.y,
      )
    );

    this.position = newPosition;
  }

  checkCollision(position: Position): boolean {
    return this.position.x === position.x && this.position.y === position.y;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Draw glowing food
    ctx.save();
    ctx.shadowColor = '#ff0080';
    ctx.shadowBlur = 15;

    ctx.fillStyle = '#ff4444';
    ctx.fillRect(
      this.position.x * this.gridSize + 2,
      this.position.y * this.gridSize + 2,
      this.gridSize - 4,
      this.gridSize - 4,
    );

    // Add highlight
    ctx.fillStyle = '#ff8888';
    ctx.fillRect(
      this.position.x * this.gridSize + 4,
      this.position.y * this.gridSize + 4,
      this.gridSize - 12,
      this.gridSize - 12,
    );

    ctx.restore();
  }
}
