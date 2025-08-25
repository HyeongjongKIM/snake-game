interface PauseDialogOptions {
  state: 'paused';
  onResume: () => void;
}

interface GameOverDialogOptions {
  state: 'end';
  onRestart: () => void;
}

type GameStateDialogOptions = PauseDialogOptions | GameOverDialogOptions;

export class GameStateDialog {
  private overlay: HTMLDivElement;
  private currentButton: HTMLButtonElement | null = null;

  constructor() {
    this.overlay = document.getElementById('dialog') as HTMLDivElement;
  }

  show(options: GameStateDialogOptions) {
    this.createDialog(options);
    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('flex');

    if (this.currentButton) {
      this.currentButton.focus();
    }
  }

  hide() {
    this.overlay.classList.remove('flex');
    this.overlay.classList.add('hidden');
    this.overlay.innerHTML = '';
    this.currentButton = null;
  }

  private createDialog(options: GameStateDialogOptions): void {
    if (options.state === 'end') {
      this.createGameOverDialog(options.onRestart);
    } else if (options.state === 'paused') {
      this.createPausedDialog(options.onResume);
    }
  }

  private createGameOverDialog(onRestart: () => void): void {
    this.overlay.innerHTML = `
      <div class="flex flex-col justify-center items-center gap-4">
        <h3
          class="grow flex justify-center items-center"
        >
          Game Over
        </h3>
        <button id="restartButton">
          Restart
        </button>
      </div>
    `;

    const restartButton = document.getElementById(
      'restartButton',
    ) as HTMLButtonElement;
    restartButton.addEventListener('click', onRestart);

    this.currentButton = restartButton;
  }

  private createPausedDialog(onResume: () => void): void {
    this.overlay.innerHTML = `
      <div class="flex flex-col justify-center items-center gap-4">
        <button id="resumeButton">
          Resume
        </button>
      </div>
    `;

    const resumeButton = document.getElementById(
      'resumeButton',
    ) as HTMLButtonElement;
    resumeButton.addEventListener('click', onResume);

    this.currentButton = resumeButton;
  }
}
