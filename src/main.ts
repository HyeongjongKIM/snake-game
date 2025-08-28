import { Snake } from './snake';
import { Food } from './food';
import { Renderer } from './renderer';
import { Score } from './score';
import { GameStateDialog } from './game-state-dialog';
import { FullScreenDialog } from './fullscreen-dialog';
import { GameSettings } from './settings';
import { GameStateManager, type GameState } from './game-context';
import type { Position } from './types';

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
  private renderer!: Renderer;
  private snake!: Snake;
  private food!: Food;
  private score!: Score;
  private gameStateDialog!: GameStateDialog;
  private fullScreenDialog!: FullScreenDialog;
  private settings: GameSettings;
  private gameStateManager: GameStateManager;

  private gridSize = GRID_SIZE;
  private canvasSize = 400; // Canvas size from HTML

  private gameLoop: number | null = null;

  constructor() {
    this.gameStateManager = GameStateManager.getInstance();
    this.settings = new GameSettings();
    this.initializeComponents();
    this.setupEventListeners();
    this.initializeGame();
  }

  private initializeComponents(): void {
    const gridOption = this.settings.getGridSizeOption();
    this.gridSize = this.canvasSize / gridOption.tileCount;

    // Clean up previous instances if they exist
    this.cleanupComponents();

    this.renderer = new Renderer(this.gridSize);
    this.snake = new Snake(this.gridSize);
    this.food = new Food(this.gridSize);
    this.score = new Score();
    this.gameStateDialog = new GameStateDialog();
    this.fullScreenDialog = new FullScreenDialog();
  }

  private cleanupComponents(): void {
    if (this.renderer?.destroy) this.renderer.destroy();
    if (this.score?.destroy) this.score.destroy();
    if (this.gameStateDialog?.destroy) this.gameStateDialog.destroy();
  }

  private initializeGame(): void {
    this.stopGame('ready');
    this.score.init();
    this.gameStateManager.setScore(0);
    this.snake.init(this.renderer.getTileCount());
    this.food.generate(this.snake.getBody(), this.renderer.getTileCount());
    this.renderer.render(this.snake, this.food);
  }
  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
    const settings = document.getElementById('settings');
    if (settings) {
      settings.addEventListener('click', this.showSettings.bind(this));
    }
    const info = document.getElementById('info');
    if (info) {
      info.addEventListener('click', this.showInfo.bind(this));
    }
  }

  private handleKeyPress(event: KeyboardEvent): void {
    const currentState = this.gameStateManager.getGameState();
    if (currentState === 'end' || this.fullScreenDialog.isDialogOpen()) {
      return;
    }

    // Handle settings menu
    if (event.key === 'Escape') {
      this.showSettings();
      return;
    }

    // Handle pause toggle
    if (
      event.key === ' ' &&
      (currentState === 'playing' || currentState === 'paused')
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

    // Check if the direction change is valid (not opposite)
    if (this.snake.isValidDirectionChange(newDirection)) {
      if (currentState === 'ready' || currentState === 'paused') {
        // For game start/resume, always allow direction and start game
        this.snake.setDirection(newDirection);
        this.gameStateManager.setGameState('playing');
        this.startGame();
      } else {
        // During gameplay, only queue if direction is different
        const nextDirection = this.snake.getNextQueuedDirection();
        if (
          newDirection.x !== nextDirection.x ||
          newDirection.y !== nextDirection.y
        ) {
          this.snake.queueDirection(newDirection);
        }
      }
    }

    event.preventDefault();
  }

  private startGame(): void {
    this.gameStateManager.setGameState('playing');
    this.gameStateDialog.hide();
    this.gameLoop = setInterval(() => this.update(), GAME_SPEED);
  }

  private stopGame(state: Exclude<GameState, 'playing'>) {
    this.gameStateManager.setGameState(state);
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    if (state === 'paused') {
      this.gameStateDialog.show({
        state: 'paused',
        onResume: () => {
          this.gameStateDialog.hide();
          this.togglePause();
        },
      });
    }
  }

  private togglePause() {
    const currentState = this.gameStateManager.getGameState();
    if (currentState === 'playing') {
      this.stopGame('paused');
    } else {
      this.startGame();
    }
  }

  private endGame(): void {
    this.stopGame('end');
    this.score.saveHighScore();
    this.gameStateDialog.show({
      state: 'end',
      onRestart: () => {
        this.gameStateDialog.hide();
        this.initializeGame();
      },
    });
  }

  private showSettings(): void {
    const currentState = this.gameStateManager.getGameState();
    // Playing 중이면 게임 루프만 중단 (상태는 유지)
    if (currentState === 'playing' && this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    if (currentState === 'paused') {
      this.gameStateDialog.hide();
    }

    this.fullScreenDialog.show({
      type: 'settings',
      currentGridOption: this.settings.getGridSizeOption(),
      onBack: () => {
        const state = this.gameStateManager.getGameState();
        this.fullScreenDialog.hide();
        // Playing 중이었다면 게임 재개
        if (state === 'playing') {
          this.startGame();
        } else if (state === 'paused') {
          this.togglePause();
        }
      },
      onApply: (option) => {
        this.settings.setGridSizeOption(option);
        this.fullScreenDialog.hide();
        this.restartWithNewSettings();
      },
      onScreenshot: () => {
        this.takeScreenshot();
      },
    });
  }

  private restartWithNewSettings(): void {
    this.initializeComponents();
    this.initializeGame();
  }

  private update(): void {
    if (this.gameStateManager.getGameState() !== 'playing') return;
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
      const points = this.food.getScore();
      this.score.addPoints(points);
      this.food.generate(this.snake.getBody(), this.renderer.getTileCount());
    } else {
      this.snake.removeTail();
    }
  }

  private showInfo(): void {
    const currentState = this.gameStateManager.getGameState();
    // Playing 중이면 게임 루프만 중단 (상태는 유지)
    const wasPlaying = currentState === 'playing';
    if (wasPlaying && this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    if (currentState === 'paused') {
      this.gameStateDialog.hide();
    }

    this.fullScreenDialog.show({
      type: 'info',
      onClose: () => {
        this.fullScreenDialog.hide();
        const state = this.gameStateManager.getGameState();
        // Playing 중이었다면 게임 재개
        if (wasPlaying) {
          this.startGame();
        } else if (state === 'paused') {
          this.togglePause();
        }
      },
    });
  }

  private takeScreenshot(): void {
    // Create a temporary canvas to combine header and game canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCanvas || !tempCtx) return;

    const gameCanvas = document.querySelector('canvas') as HTMLCanvasElement;
    const header = document.querySelector('header') as HTMLElement;

    if (!gameCanvas || !header) return;

    // Calculate dimensions
    const canvasWidth = gameCanvas.width;
    const canvasHeight = gameCanvas.height;
    const headerHeight = 50; // Approximate header height
    const padding = 10;

    tempCanvas.width = canvasWidth + padding * 2;
    tempCanvas.height = canvasHeight + headerHeight + padding * 3;

    // Set background
    tempCtx.fillStyle = '#000000';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Set font for header text
    tempCtx.fillStyle = '#a8a29e'; // stone-400
    tempCtx.font = '14px "IBM Plex Mono", monospace';
    tempCtx.textAlign = 'left';

    // Draw score text
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const currentScore = scoreElement?.textContent || '0';
    const highScore = highScoreElement?.textContent || '0';

    tempCtx.fillText(`score: ${currentScore}`, padding, padding + 20);

    // Draw title in center
    tempCtx.textAlign = 'center';
    tempCtx.fillText('snake game', tempCanvas.width / 2, padding + 20);

    // Draw high score on right
    tempCtx.textAlign = 'right';
    tempCtx.fillText(
      `high: ${highScore}`,
      tempCanvas.width - padding,
      padding + 20,
    );

    // Draw game canvas
    tempCtx.drawImage(gameCanvas, padding, headerHeight + padding * 2);

    // Create download link
    tempCanvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `snake-game-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
      link.href = url;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
    });
  }
}

new Game();
