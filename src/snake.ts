import type { Position } from './types';

const INITIAL_POSITION: Position = { x: 10, y: 10 };

export class Snake {
  private body: Position[];
  private gridSize: number;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
    this.body = [{ ...INITIAL_POSITION }];
  }

  getBody(): Position[] {
    return this.body;
  }

  getHead(): Position {
    return this.body[0];
  }

  move(direction: Position): void {
    const head = { ...this.body[0] };
    head.x += direction.x;
    head.y += direction.y;
    this.body.unshift(head);
  }

  grow(): void {
    // Don't remove tail when growing (food was eaten)
    // The move() method already added a new head
  }

  removeTail(): void {
    this.body.pop();
  }

  checkSelfCollision(): boolean {
    const head = this.body[0];
    for (let i = 1; i < this.body.length; i++) {
      if (head.x === this.body[i].x && head.y === this.body[i].y) {
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
}
