import type { Position } from './types';

const INITIAL_POSITION: Position = { x: 10, y: 10 };
const INITIAL_DIRECTION: Position = { x: 0, y: 0 };

export class Snake {
  private body: Position[] = [{ ...INITIAL_POSITION }];
  private currentDirection: Position = { ...INITIAL_DIRECTION };
  private moveQueue: Position[] = [];
  private gridSize: number;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
  }

  getBody(): Position[] {
    return this.body;
  }

  getHead(): Position {
    return this.body[0];
  }

  getDirection(): Position {
    return { ...this.currentDirection };
  }

  setDirection(direction: Position | null): void {
    direction = direction ?? this.currentDirection;
    // Ensure we have a valid direction (not { x: 0, y: 0 })
    if (direction.x === 0 && direction.y === 0) {
      direction = this.getRandomDirection();
    }
    this.currentDirection = { ...direction };
  }

  move(): void {
    // Process the next move from the queue
    if (this.moveQueue.length > 0) {
      this.currentDirection = this.moveQueue.shift()!;
    }

    const head = { ...this.body[0] };
    head.x += this.currentDirection.x;
    head.y += this.currentDirection.y;
    this.body.unshift(head);
  }

  removeTail(): void {
    // Only remove tail if body has more than 1 segment to prevent empty array
    if (this.body.length > 1) {
      this.body.pop();
    }
  }

  checkSelfCollision(): boolean {
    const head = this.body[0];
    for (let i = 1; i < this.body.length; i++) {
      if (head.x === this.body[i].x && head.y === this.body[i].y) {
        console.log('checkSelfCollision');
        return true;
      }
    }
    return false;
  }

  checkWallCollision(tileCount: number): boolean {
    const head = this.body[0];
    return (
      head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount
    );
  }

  reset(): void {
    this.body = [{ ...INITIAL_POSITION }];
    this.currentDirection = { ...INITIAL_DIRECTION };
    this.moveQueue = [];
  }

  // Move queue management methods
  queueDirection(direction: Position): void {
    // Limit queue size to prevent excessive queuing
    if (this.moveQueue.length < 2) {
      this.moveQueue.push(direction);
    }
  }

  getCurrentDirection(): Position {
    // Get current direction (either from queue or current direction)
    return this.moveQueue.length > 0
      ? this.moveQueue[this.moveQueue.length - 1]
      : this.currentDirection;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.body.forEach((segment, index) => {
      ctx.save();

      if (index === 0) {
        // Head - brighter glow
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#00ff41';
      } else {
        // Body - dimmer glow
        ctx.shadowColor = '#00cc33';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#00cc33';
      }

      ctx.fillRect(
        segment.x * this.gridSize + 1,
        segment.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2,
      );

      // Add inner highlight
      ctx.fillStyle = index === 0 ? '#88ff88' : '#66dd66';
      ctx.fillRect(
        segment.x * this.gridSize + 3,
        segment.y * this.gridSize + 3,
        this.gridSize - 6,
        this.gridSize - 6,
      );

      ctx.restore();
    });
  }

  private getRandomDirection(): Position {
    const directions: Position[] = [
      { x: 0, y: -1 }, // Up
      { x: 0, y: 1 }, // Down
      { x: -1, y: 0 }, // Left
      { x: 1, y: 0 }, // Right
    ];

    const randomIndex = Math.floor(Math.random() * directions.length);
    return directions[randomIndex];
  }
}
