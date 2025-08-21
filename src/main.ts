// import './styles/index.css';

interface Position {
  x: number;
  y: number;
}

class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridSize = 20;
  private tileCount: number;
  private gameState = {
    snake: [{ x: 10, y: 10 }],
    food: { x: 0, y: 0 }, // Will be set randomly in initializeGame
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

    this.initializeGame();
    this.setupEventListeners();
  }

  private initializeGame(): void {
    this.loadHighScore();
    this.updateScore();
    this.generateFood();
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
    if (!this.gameState.isRunning && !this.gameState.gameOver) {
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
    if (this.gameState.isRunning) {
      if (event.key === ' ') {
        this.togglePause();
        event.preventDefault();
        return;
      }
    }

    // Handle arrow keys when paused - unpause and move in that direction
    if (this.gameState.isRunning && this.gameState.isPaused) {
      let newDirection: Position | null = null;

      switch (event.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          // Prevent moving up if currently moving down
          if (this.gameState.direction.y !== 1) {
            newDirection = { x: 0, y: -1 };
          }
          break;
        case 'arrowdown':
        case 's':
          // Prevent moving down if currently moving up
          if (this.gameState.direction.y !== -1) {
            newDirection = { x: 0, y: 1 };
          }
          break;
        case 'arrowleft':
        case 'a':
          // Prevent moving left if currently moving right
          if (this.gameState.direction.x !== 1) {
            newDirection = { x: -1, y: 0 };
          }
          break;
        case 'arrowright':
        case 'd':
          // Prevent moving right if currently moving left
          if (this.gameState.direction.x !== -1) {
            newDirection = { x: 1, y: 0 };
          }
          break;
      }

      // If valid direction, unpause and set new direction
      if (newDirection) {
        this.gameState.direction = newDirection;
        this.gameState.isPaused = false;

        const pauseBtn = document.getElementById(
          'pauseBtn',
        ) as HTMLButtonElement;
        pauseBtn.textContent = 'PAUSE';
        this.gameLoop = setInterval(() => this.update(), 150);

        event.preventDefault();
        return;
      }
    }

    if (!this.gameState.isRunning || this.gameState.isPaused) return;

    // Get the current direction (either from current state or last queued move)
    const currentDirection =
      this.moveQueue.length > 0
        ? this.moveQueue[this.moveQueue.length - 1]
        : this.gameState.direction;

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
    this.gameState.isRunning = true;
    // Use provided initial direction or generate a random one
    this.gameState.direction = initialDirection || this.getRandomDirection();

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
    this.gameState.isPaused = !this.gameState.isPaused;

    const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;

    if (this.gameState.isPaused) {
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
    this.gameState = {
      snake: [{ x: 10, y: 10 }],
      food: { x: 0, y: 0 }, // Will be set randomly below
      direction: { x: 0, y: 0 },
      score: 0,
      gameOver: false,
      isPaused: false,
      isRunning: false,
    };

    // Clear the move queue
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
    this.generateFood();
    this.draw();

    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  private update(): void {
    if (this.gameState.gameOver || this.gameState.isPaused) return;

    this.processQueuedMove();
    this.moveSnake();
    this.checkCollisions();
    this.checkFoodCollision();
    this.draw();
  }

  private processQueuedMove(): void {
    // Process the next move from the queue
    if (this.moveQueue.length > 0) {
      this.gameState.direction = this.moveQueue.shift()!;
    }
  }

  private moveSnake(): void {
    const { snake, direction } = this.gameState;
    const head = { ...snake[0] };

    head.x += direction.x;
    head.y += direction.y;

    snake.unshift(head);
  }

  private checkCollisions(): void {
    const { snake } = this.gameState;
    const head = snake[0];

    // Wall collision
    if (
      head.x < 0 ||
      head.x >= this.tileCount ||
      head.y < 0 ||
      head.y >= this.tileCount
    ) {
      this.endGame();
      return;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        this.endGame();
        return;
      }
    }
  }

  private checkFoodCollision(): void {
    const { snake, food } = this.gameState;
    const head = snake[0];

    if (head.x === food.x && head.y === food.y) {
      this.gameState.score += 10;
      this.updateScore();
      this.generateFood();
    } else {
      snake.pop();
    }
  }

  private generateFood(): void {
    const { snake } = this.gameState;
    let newFood: Position;

    do {
      newFood = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount),
      };
    } while (
      snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y,
      )
    );

    this.gameState.food = newFood;
  }

  private endGame(): void {
    this.gameState.gameOver = true;
    this.gameState.isRunning = false;

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

    finalScoreSpan.textContent = this.gameState.score.toString();
    gameOverDiv.style.display = 'block';
    pauseBtn.style.display = 'none';

    // Focus the restart button automatically
    setTimeout(() => {
      restartBtn.focus();
    }, 100);
  }

  private updateScore(): void {
    const scoreSpan = document.getElementById('score') as HTMLSpanElement;
    scoreSpan.textContent = this.gameState.score.toString();
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
    if (this.gameState.score > currentHighScore) {
      localStorage.setItem('snakeHighScore', this.gameState.score.toString());
      const highScoreSpan = document.getElementById(
        'high-score',
      ) as HTMLSpanElement;
      highScoreSpan.textContent = this.gameState.score.toString();
    }
  }

  private draw(): void {
    this.clearCanvas();
    this.drawGrid();
    this.drawFood();
    this.drawSnake();
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

  private drawFood(): void {
    const { food } = this.gameState;

    // Draw glowing food
    this.ctx.save();
    this.ctx.shadowColor = '#ff0080';
    this.ctx.shadowBlur = 15;

    this.ctx.fillStyle = '#ff4444';
    this.ctx.fillRect(
      food.x * this.gridSize + 2,
      food.y * this.gridSize + 2,
      this.gridSize - 4,
      this.gridSize - 4,
    );

    // Add highlight
    this.ctx.fillStyle = '#ff8888';
    this.ctx.fillRect(
      food.x * this.gridSize + 4,
      food.y * this.gridSize + 4,
      this.gridSize - 12,
      this.gridSize - 12,
    );

    this.ctx.restore();
  }

  private drawSnake(): void {
    const { snake } = this.gameState;

    snake.forEach((segment, index) => {
      this.ctx.save();

      if (index === 0) {
        // Head - brighter glow
        this.ctx.shadowColor = '#00ff41';
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = '#00ff41';
      } else {
        // Body - dimmer glow
        this.ctx.shadowColor = '#00cc33';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#00cc33';
      }

      this.ctx.fillRect(
        segment.x * this.gridSize + 1,
        segment.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2,
      );

      // Add inner highlight
      this.ctx.fillStyle = index === 0 ? '#88ff88' : '#66dd66';
      this.ctx.fillRect(
        segment.x * this.gridSize + 3,
        segment.y * this.gridSize + 3,
        this.gridSize - 6,
        this.gridSize - 6,
      );

      this.ctx.restore();
    });
  }
}

new Game();
