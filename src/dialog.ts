interface PauseDialogOptions {
  state: 'paused';
  onRestart?: never;
  onResume: () => void;
}

interface GameOverDialogOptions {
  state: 'end';
  onRestart: () => void;
  onResume?: never;
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
    } else {
      this.createPausedDialog(options.onResume);
    }
  }

  private createGameOverDialog(onRestart: () => void): void {
    this.overlay.innerHTML = `
      <div class="flex flex-col justify-center items-center gap-4">
        <h3
          class="grow overflow-auto flex justify-center items-center text-neon-green"
        >
          Game Over
        </h3>
        <button
          id="restartButton"
          class="backdrop-blur-sm border-2 border-neon-green text-neon-green px-6 py-3 rounded-lg uppercase tracking-wide transition-all duration-300 shadow-neon-green hover:bg-neon-green hover:text-dark-bg hover:shadow-neon-green-hover hover:-translate-y-0.5 active:translate-y-0"
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
          class="backdrop-blur-sm border-2 border-neon-green text-neon-green px-6 py-3 rounded-lg uppercase tracking-wide transition-all duration-300 shadow-neon-green hover:bg-neon-green hover:text-dark-bg hover:shadow-neon-green-hover hover:-translate-y-0.5 active:translate-y-0"
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
