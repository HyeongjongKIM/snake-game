import { Snake } from './snake';
import { Food } from './food';
import { Renderer } from './renderer';
import { Score } from './score';
import { Dialog } from './dialog';
import type { Position } from './types';

type GameState = 'ready' | 'playing' | 'paused' | 'end';
type DirectionKey = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const GAME_SPEED = 150;

const DIRECTIONS: Record<DirectionKey, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const KEY_MAPPINGS: Record<string, DirectionKey> = {
  arrowup: 'UP',
  w: 'UP',
  arrowdown: 'DOWN',
  s: 'DOWN',
  arrowleft: 'LEFT',
  a: 'LEFT',
  arrowright: 'RIGHT',
  d: 'RIGHT',
};

class Game {
  private renderer: Renderer;
  private snake: Snake;
  private food: Food;
  private score: Score;
  private dialog: Dialog;

  private gridSize = GRID_SIZE;

  private state: GameState = 'ready';
  private gameLoop: number | null = null;

  constructor() {
    this.renderer = new Renderer(this.gridSize);
    this.snake = new Snake(this.gridSize);
    this.food = new Food(this.gridSize);
    this.score = new Score();
    this.dialog = new Dialog();

    this.initializeGame();
    this.setupEventListeners();
  }

  private initializeGame(): void {
    this.stopGame('ready');
    this.score.reset();
    this.score.initializeDisplay();
    this.snake.reset();
    this.food.generate(this.snake.getBody(), this.renderer.getTileCount());
    this.renderer.render(this.snake, this.food);
  }
  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  private handleKeyPress(event: KeyboardEvent): void {
    if (this.state === 'end') {
      return;
    }

    // Handle pause toggle
    if (
      event.key === ' ' &&
      (this.state === 'playing' || this.state === 'paused')
    ) {
      this.togglePause();
      return;
    }

    // Handle movement keys
    const directionKey = KEY_MAPPINGS[event.key.toLowerCase()];
    const newDirection = directionKey ? DIRECTIONS[directionKey] : null;
    if (!newDirection) {
      return;
    }

    const currentDirection = this.snake.getCurrentDirection();

    const isOppositeDirection =
      newDirection.x === -currentDirection.x &&
      newDirection.y === -currentDirection.y;

    if (!isOppositeDirection) {
      // Add the new direction to queue if it's different from current
      if (
        newDirection.x !== currentDirection.x ||
        newDirection.y !== currentDirection.y
      ) {
        this.snake.queueDirection(newDirection);
      }

      if (this.state === 'ready' || this.state === 'paused') {
        this.snake.setDirection(newDirection);
        this.state = 'playing';
        this.startGame();
      }
    }

    event.preventDefault();
  }

  private startGame(): void {
    this.state = 'playing';
    this.dialog.hide();
    this.gameLoop = setInterval(() => this.update(), GAME_SPEED);
  }

  private stopGame(state: Exclude<GameState, 'playing'>) {
    this.state = state;
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    if (state === 'paused') {
      this.dialog.show({
        state: 'paused',
        onResume: () => {
          this.dialog.hide();
          this.togglePause();
        },
      });
    }
  }

  private togglePause() {
    if (this.state === 'playing') {
      this.stopGame('paused');
    } else {
      this.startGame();
    }
  }

  private endGame(): void {
    this.state = 'end';
    this.stopGame('end');
    this.score.saveHighScore();
    this.dialog.show({
      state: 'end',
      onRestart: () => {
        this.dialog.hide();
        this.initializeGame();
      },
    });
  }

  private update(): void {
    if (this.state !== 'playing') return;
    this.snake.move();
    this.checkCollisions();
    this.checkFoodCollision();
    this.renderer.render(this.snake, this.food);
  }

  private checkCollisions(): void {
    if (
      this.snake.checkWallCollision(this.renderer.getTileCount()) ||
      this.snake.checkSelfCollision()
    ) {
      this.endGame();
      return;
    }
  }

  private checkFoodCollision(): void {
    const head = this.snake.getHead();

    if (this.food.checkCollision(head)) {
      this.score.addPoints(this.food.getScore());
      this.food.generate(this.snake.getBody(), this.renderer.getTileCount());
    } else {
      this.snake.removeTail();
    }
  }
}

new Game();
