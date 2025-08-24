import type { Snake } from './snake';
import type { Food } from './food';

/**
 * Handles all canvas rendering operations for the Snake game
 */
export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridSize: number;
  private tileCount: number;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      throw new Error('No HTML Canvas Element!');
    }

    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.tileCount = this.canvas.width / gridSize;
  }

  /**
   * Gets the tile count for the current canvas size
   */
  getTileCount(): number {
    return this.tileCount;
  }

  /**
   * Renders the complete game state
   */
  render(snake: Snake, food: Food): void {
    this.clearCanvas();
    this.drawGrid();
    food.draw(this.ctx);
    snake.draw(this.ctx);
  }

  /**
   * Clears the entire canvas with background color
   */
  private clearCanvas(): void {
    this.ctx.fillStyle = '#050508';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draws the grid lines on the canvas
   */
  private drawGrid(): void {
    this.ctx.strokeStyle = '#1a1a2e';
    this.ctx.lineWidth = 0.5;

    for (let i = 0; i < this.tileCount; i++) {
      // Vertical lines
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();

      // Horizontal lines
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }
  }
}
