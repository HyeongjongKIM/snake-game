import { Snake } from './snake';
import { Food } from './food';
import type { Position } from './types';

class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridSize = 20;
  private tileCount: number;
  private snake: Snake;
  private food: Food;
  private state = {
    direction: { x: 0, y: 0 },
    score: 0,
    gameOver: false,
    isPaused: false,
    isRunning: false,
  };
  private moveQueue: Position[] = [];
  private gameLoop: number | null = null;

  constructor() {
    this.canvas = document.querySelector('canvas')!;
    this.ctx = this.canvas.getContext('2d')!;
    this.tileCount = this.canvas.width / this.gridSize;
    this.snake = new Snake(this.gridSize);
    this.food = new Food(this.gridSize);

    this.initializeGame();
    this.setupEventListeners();
  }

  private initializeGame(): void {
    this.loadHighScore();
    this.updateScore();
    this.food.generate(this.snake.getBody(), this.tileCount);
    this.draw();
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyPress.bind(this));

    const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
    const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
    const restartBtn = document.getElementById(
      'restartBtn',
    ) as HTMLButtonElement;

    startBtn.addEventListener('click', () => this.startGame());
    pauseBtn.addEventListener('click', () => this.togglePause());
    restartBtn.addEventListener('click', () => this.restartGame());
  }

  private handleKeyPress(event: KeyboardEvent): void {
    // If game is not running, any key starts the game (except space key)
    if (!this.state.isRunning && !this.state.gameOver) {
      // Handle space key - it should not start the game
      if (event.key === ' ') {
        event.preventDefault();
        return;
      }

      // Check if it's a directional key and set initial direction
      let initialDirection: Position | null = null;

      switch (event.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          initialDirection = { x: 0, y: -1 };
          break;
        case 'arrowdown':
        case 's':
          initialDirection = { x: 0, y: 1 };
          break;
        case 'arrowleft':
        case 'a':
          initialDirection = { x: -1, y: 0 };
          break;
        case 'arrowright':
        case 'd':
          initialDirection = { x: 1, y: 0 };
          break;
      }

      this.startGame(initialDirection);
      event.preventDefault();
      return;
    }

    // Handle space key for pause anytime during gameplay
    if (this.state.isRunning) {
      if (event.key === ' ') {
        this.togglePause();
        event.preventDefault();
        return;
      }
    }

    // Handle arrow keys when paused - unpause and move in that direction
    if (this.state.isRunning && this.state.isPaused) {
      let newDirection: Position | null = null;

      switch (event.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          // Prevent moving up if currently moving down
          if (this.state.direction.y !== 1) {
            newDirection = { x: 0, y: -1 };
          }
          break;
        case 'arrowdown':
        case 's':
          // Prevent moving down if currently moving up
          if (this.state.direction.y !== -1) {
            newDirection = { x: 0, y: 1 };
          }
          break;
        case 'arrowleft':
        case 'a':
          // Prevent moving left if currently moving right
          if (this.state.direction.x !== 1) {
            newDirection = { x: -1, y: 0 };
          }
          break;
        case 'arrowright':
        case 'd':
          // Prevent moving right if currently moving left
          if (this.state.direction.x !== -1) {
            newDirection = { x: 1, y: 0 };
          }
          break;
      }

      // If valid direction, unpause and set new direction
      if (newDirection) {
        this.state.direction = newDirection;
        this.state.isPaused = false;

        const pauseBtn = document.getElementById(
          'pauseBtn',
        ) as HTMLButtonElement;
        pauseBtn.textContent = 'PAUSE';
        this.gameLoop = setInterval(() => this.update(), 150);

        event.preventDefault();
        return;
      }
    }

    if (!this.state.isRunning || this.state.isPaused) return;

    // Get the current direction (either from current state or last queued move)
    const currentDirection =
      this.moveQueue.length > 0
        ? this.moveQueue[this.moveQueue.length - 1]
        : this.state.direction;

    let newDirection: Position | null = null;

    switch (event.key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        // Prevent moving up if currently moving down
        if (currentDirection.y !== 1) {
          newDirection = { x: 0, y: -1 };
        }
        break;
      case 'arrowdown':
      case 's':
        // Prevent moving down if currently moving up
        if (currentDirection.y !== -1) {
          newDirection = { x: 0, y: 1 };
        }
        break;
      case 'arrowleft':
      case 'a':
        // Prevent moving left if currently moving right
        if (currentDirection.x !== 1) {
          newDirection = { x: -1, y: 0 };
        }
        break;
      case 'arrowright':
      case 'd':
        // Prevent moving right if currently moving left
        if (currentDirection.x !== -1) {
          newDirection = { x: 1, y: 0 };
        }
        break;
    }

    // Add the new direction to queue if it's valid and different from current
    if (
      newDirection &&
      (newDirection.x !== currentDirection.x ||
        newDirection.y !== currentDirection.y)
    ) {
      // Limit queue size to prevent excessive queuing
      if (this.moveQueue.length < 2) {
        this.moveQueue.push(newDirection);
      }
    }

    event.preventDefault();
  }

  private startGame(initialDirection?: Position | null): void {
    this.state.isRunning = true;
    // Use provided initial direction or generate a random one
    this.state.direction = initialDirection || this.getRandomDirection();

    const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
    const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
    const pressKeyMessage = document.getElementById(
      'pressKeyMessage',
    ) as HTMLDivElement;

    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    pressKeyMessage.style.display = 'none';

    this.gameLoop = setInterval(() => this.update(), 150);
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

  private togglePause(): void {
    this.state.isPaused = !this.state.isPaused;

    const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;

    if (this.state.isPaused) {
      pauseBtn.textContent = 'RESUME';
      if (this.gameLoop) {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
      }
    } else {
      pauseBtn.textContent = 'PAUSE';
      this.gameLoop = setInterval(() => this.update(), 150);
    }
  }

  private restartGame(): void {
    this.state = {
      direction: { x: 0, y: 0 },
      score: 0,
      gameOver: false,
      isPaused: false,
      isRunning: false,
    };

    // Reset snake and clear move queue
    this.snake.reset();
    this.moveQueue = [];

    const gameOverDiv = document.getElementById('gameOver') as HTMLDivElement;
    const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
    const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
    const pressKeyMessage = document.getElementById(
      'pressKeyMessage',
    ) as HTMLDivElement;

    gameOverDiv.style.display = 'none';
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'none';
    pauseBtn.textContent = 'PAUSE';
    pressKeyMessage.style.display = 'block';

    this.updateScore();
    this.food.generate(this.snake.getBody(), this.tileCount);
    this.draw();

    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  private update(): void {
    if (this.state.gameOver || this.state.isPaused) return;

    this.processQueuedMove();
    this.snake.move(this.state.direction);
    this.checkCollisions();
    this.checkFoodCollision();
    this.draw();
  }

  private processQueuedMove(): void {
    // Process the next move from the queue
    if (this.moveQueue.length > 0) {
      this.state.direction = this.moveQueue.shift()!;
    }
  }

  private checkCollisions(): void {
    // Wall collision
    if (this.snake.checkWallCollision(this.tileCount)) {
      this.endGame();
      return;
    }

    // Self collision
    if (this.snake.checkSelfCollision()) {
      this.endGame();
      return;
    }
  }

  private checkFoodCollision(): void {
    const head = this.snake.getHead();

    if (this.food.checkCollision(head)) {
      this.state.score += this.food.getScore();
      this.updateScore();
      this.snake.grow();
      this.food.generate(this.snake.getBody(), this.tileCount);
    } else {
      this.snake.removeTail();
    }
  }

  private endGame(): void {
    this.state.gameOver = true;
    this.state.isRunning = false;

    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    this.saveHighScore();
    this.showGameOver();
  }

  private showGameOver(): void {
    const gameOverDiv = document.getElementById('gameOver') as HTMLDivElement;
    const finalScoreSpan = document.getElementById(
      'finalScore',
    ) as HTMLSpanElement;
    const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
    const restartBtn = document.getElementById(
      'restartBtn',
    ) as HTMLButtonElement;

    finalScoreSpan.textContent = this.state.score.toString();
    gameOverDiv.style.display = 'block';
    pauseBtn.style.display = 'none';

    // Focus the restart button automatically
    setTimeout(() => {
      restartBtn.focus();
    }, 100);
  }

  private updateScore(): void {
    const scoreSpan = document.getElementById('score') as HTMLSpanElement;
    scoreSpan.textContent = this.state.score.toString();
  }

  private loadHighScore(): void {
    const highScore = localStorage.getItem('snakeHighScore') || '0';
    const highScoreSpan = document.getElementById(
      'high-score',
    ) as HTMLSpanElement;
    highScoreSpan.textContent = highScore;
  }

  private saveHighScore(): void {
    const currentHighScore = parseInt(
      localStorage.getItem('snakeHighScore') || '0',
    );
    if (this.state.score > currentHighScore) {
      localStorage.setItem('snakeHighScore', this.state.score.toString());
      const highScoreSpan = document.getElementById(
        'high-score',
      ) as HTMLSpanElement;
      highScoreSpan.textContent = this.state.score.toString();
    }
  }

  private draw(): void {
    this.clearCanvas();
    this.drawGrid();
    this.food.draw(this.ctx);
    this.snake.draw(this.ctx);
  }

  private clearCanvas(): void {
    this.ctx.fillStyle = '#050508';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = '#1a1a2e';
    this.ctx.lineWidth = 0.5;

    for (let i = 0; i < this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }
  }
}

new Game();
