import { GameSettings } from './settings';
import type { GridSizeOption } from './settings';

interface SettingsDialogOptions {
  type: 'settings';
  currentGridOption: GridSizeOption;
  onBack: () => void;
  onApply: (option: GridSizeOption) => void;
  onScreenshot?: () => void;
}

interface InfoDialogOptions {
  type: 'info';
  onClose: () => void;
}

type FullScreenDialogOptions = SettingsDialogOptions | InfoDialogOptions;

export class FullScreenDialog {
  private overlay: HTMLDivElement;
  private options: GridSizeOption[] = GameSettings.GRID_OPTIONS;
  private selectedIndex = 0;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private isOpen = false;
  private currentButton: HTMLButtonElement | null = null;

  constructor() {
    // Create fullscreen dialog overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'fullScreenDialog';
    this.overlay.className =
      'fixed inset-0 backdrop-blur-sm bg-[rgba(0,0,0,0.4)] justify-center items-center z-50 hidden';
    document.body.appendChild(this.overlay);
  }

  show(options: FullScreenDialogOptions) {
    this.isOpen = true;

    if (options.type === 'settings') {
      this.showSettings(options);
    } else if (options.type === 'info') {
      this.showInfo(options);
    }

    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('flex');

    if (this.currentButton) {
      this.currentButton.focus();
    }
  }

  hide() {
    this.isOpen = false;
    this.overlay.classList.remove('flex');
    this.overlay.classList.add('hidden');
    this.overlay.innerHTML = '';
    this.currentButton = null;

    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  isDialogOpen(): boolean {
    return this.isOpen;
  }

  private showSettings(options: SettingsDialogOptions) {
    // Find current selection index
    this.selectedIndex = this.options.findIndex(
      (option) => option.tileCount === options.currentGridOption.tileCount,
    );
    if (this.selectedIndex === -1) {
      this.selectedIndex = 0;
    }

    this.createSettingsContent();
    this.setupSettingsEventListeners(options);
  }

  private showInfo(options: InfoDialogOptions) {
    this.createInfoContent();
    this.setupInfoEventListeners(options);
  }

  private createSettingsContent() {
    const optionsHTML = this.options
      .map(
        (option: GridSizeOption, index: number) => `
        <label class="flex items-center gap-3 cursor-pointer p-3 border-2 ${
          index === this.selectedIndex
            ? 'border-stone-400'
            : 'border-stone-600 hover:border-stone-400'
        } transition-colors" data-index="${index}">
          <div class="w-4 h-4 rounded-full border-2 ${
            index === this.selectedIndex
              ? 'border-stone-400'
              : 'border-stone-600'
          } transition-colors flex items-center justify-center">
            ${
              index === this.selectedIndex
                ? '<div class="w-2 h-2 rounded-full bg-black"></div>'
                : ''
            }
          </div>
          <span>${option.label}</span>
        </label>
      `,
      )
      .join('');

    this.overlay.innerHTML = `
      <div class="flex flex-col justify-center items-center gap-6 backdrop-blur-sm p-8 border-1 max-w-md w-full">
        <h3 class="text-center">
          Game Settings
        </h3>
        
        <div class="w-full">
          <h4 class="text-lg mb-4 text-center">Grid Size</h4>
          <div class="space-y-3" id="optionsList">
            ${optionsHTML}
          </div>
        </div>

        <div class="flex gap-4 justify-center w-full">
          <button id="backButton">
            Back<br>(ESC)
          </button>
          <button id="screenshotButton">
            Screenshot<br>(S)
          </button>
          <button id="applyButton">
            Apply & Restart<br>(ENTER)
          </button>
        </div>

        <div class="text-sm text-center text-stone-500">
          Use ↑↓ arrows to navigate • Enter to apply • S for screenshot • Esc to go back
        </div>
      </div>
    `;
  }

  private createInfoContent() {
    this.overlay.innerHTML = `
      <div class="flex flex-col justify-center items-center gap-6 backdrop-blur-sm p-8 border-1 max-w-md w-full mx-4">
        <h3 class="text-center text-xl">
          How to Play
        </h3>
        <div class="space-y-4 text-sm leading-relaxed">
          <div>
            <strong>Objective:</strong> Control the snake to eat food and grow longer without hitting walls or yourself.
          </div>
          <div>
            <strong>Controls:</strong>
            <br>• Arrow keys or WASD to move
            <br>• Spacebar to pause/resume
            <br>• Settings (*) to change grid size
          </div>
          <div>
            <strong>Scoring:</strong>
            <br>• Each food gives 10 points
            <br>• Try to beat your high score!
          </div>
        </div>
        <button
          id="infoCloseButton"
        >
          Got it!
        </button>
      </div>
    `;
  }

  private setupSettingsEventListeners(options: SettingsDialogOptions) {
    const backButton = document.getElementById(
      'backButton',
    ) as HTMLButtonElement;
    const applyButton = document.getElementById(
      'applyButton',
    ) as HTMLButtonElement;
    const screenshotButton = document.getElementById(
      'screenshotButton',
    ) as HTMLButtonElement;
    const optionsList = document.getElementById(
      'optionsList',
    ) as HTMLDivElement;

    backButton.addEventListener('click', options.onBack);
    applyButton.addEventListener('click', () => {
      const selectedOption = this.options[this.selectedIndex];
      options.onApply(selectedOption);
    });

    screenshotButton.addEventListener('click', () => {
      if (options.onScreenshot) {
        options.onScreenshot();
      }
    });

    // Setup click handlers for options
    optionsList.addEventListener('click', (event) => {
      const label = (event.target as Element).closest('label');
      if (label) {
        const index = parseInt(label.getAttribute('data-index') || '0', 10);
        this.setSelectedIndex(index);
      }
    });

    // Setup keyboard navigation
    this.keydownHandler = (event: KeyboardEvent) => {
      event.preventDefault();

      switch (event.key) {
        case 'Escape':
          options.onBack();
          break;
        case 'Enter': {
          const selectedOption = this.options[this.selectedIndex];
          options.onApply(selectedOption);
          break;
        }
        case 's':
        case 'S':
          if (options.onScreenshot) {
            options.onScreenshot();
          }
          break;
        case 'ArrowUp':
          this.setSelectedIndex(Math.max(0, this.selectedIndex - 1));
          break;
        case 'ArrowDown':
          this.setSelectedIndex(
            Math.min(this.options.length - 1, this.selectedIndex + 1),
          );
          break;
      }
    };

    document.addEventListener('keydown', this.keydownHandler);
    this.currentButton = applyButton;
  }

  private setupInfoEventListeners(options: InfoDialogOptions) {
    const closeButton = document.getElementById(
      'infoCloseButton',
    ) as HTMLButtonElement;
    closeButton.addEventListener('click', options.onClose);

    // Setup keyboard handler for ESC key
    this.keydownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        options.onClose();
      }
    };

    document.addEventListener('keydown', this.keydownHandler);
    this.currentButton = closeButton;
  }

  private setSelectedIndex(index: number): void {
    this.selectedIndex = index;
    this.updateVisualSelection();
  }

  private updateVisualSelection(): void {
    const labels = document.querySelectorAll('#optionsList label');
    labels.forEach((label, index) => {
      const isSelected = index === this.selectedIndex;

      // Update label styling
      label.className = `flex items-center gap-3 cursor-pointer p-3 border-2 ${
        isSelected
          ? 'border-stone-400'
          : 'border-stone-600 hover:border-stone-400'
      } transition-colors`;

      // Update radio button visual
      const radioVisual = label.querySelector('div');
      if (radioVisual) {
        radioVisual.className = `w-4 h-4 rounded-full border-2 ${
          isSelected ? 'border-stone-400' : 'border-stone-600'
        } transition-colors flex items-center justify-center`;
        radioVisual.innerHTML = isSelected
          ? '<div class="w-2 h-2 rounded-full bg-black"></div>'
          : '';
      }
    });
  }
}
