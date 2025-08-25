interface PauseDialogOptions {
  state: 'paused';
  onResume: () => void;
}

interface GameOverDialogOptions {
  state: 'end';
  onRestart: () => void;
}

type DialogOptions = PauseDialogOptions | GameOverDialogOptions;

export class Dialog {
  private overlay: HTMLDivElement;
  private currentButton: HTMLButtonElement | null = null;

  constructor() {
    this.overlay = document.getElementById('dialog') as HTMLDivElement;
  }

  show(options: DialogOptions) {
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

  private createDialog(options: DialogOptions): void {
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
        <button
          id="restartButton"
          class="backdrop-blur-sm border-1 px-6 py-3 uppercase tracking-wide transition-all duration-300"
        >
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
        <button
          id="resumeButton"
          class="backdrop-blur-sm border-1 px-6 py-3 uppercase tracking-wide transition-all duration-300 hover:bg-stone-400 hover:text-black"
        >
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
