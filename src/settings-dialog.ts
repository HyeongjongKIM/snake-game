import { GameSettings } from './settings';
import type { GridSizeOption } from './settings';

interface SettingsDialogOptions {
  currentGridOption: GridSizeOption;
  onBack: () => void;
  onApply: (option: GridSizeOption) => void;
}

export class SettingsDialog {
  private overlay: HTMLDivElement;
  private options: GridSizeOption[] = GameSettings.GRID_OPTIONS;
  private selectedIndex = 0;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private isOpen = false;

  constructor() {
    this.overlay = document.getElementById('settingsDialog') as HTMLDivElement;
    if (!this.overlay) {
      // Create settings dialog overlay if it doesn't exist
      this.overlay = document.createElement('div');
      this.overlay.id = 'settingsDialog';
      this.overlay.className =
        'fixed inset-0 backdrop-blur-sm justify-center items-center z-50 hidden';
      document.body.appendChild(this.overlay);
    }
  }

  show(options: SettingsDialogOptions) {
    // Find current selection index
    this.selectedIndex = this.options.findIndex(
      (opt) => opt.tileCount === options.currentGridOption.tileCount,
    );
    if (this.selectedIndex === -1) this.selectedIndex = 0;

    this.createSettingsUI(options);
    this.setupKeyboardNavigation(options);
    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('flex');
    this.isOpen = true;
  }

  hide() {
    this.overlay.classList.remove('flex');
    this.overlay.classList.add('hidden');
    this.overlay.innerHTML = '';
    this.removeKeyboardNavigation();
    this.isOpen = false;
  }

  isSettingsOpen(): boolean {
    return this.isOpen;
  }

  private createSettingsUI(options: SettingsDialogOptions): void {
    const optionsHTML = this.options
      .map(
        (option: GridSizeOption, index: number) => `
        <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 ${
          index === this.selectedIndex
            ? 'border-neon-blue'
            : 'border-gray-600 hover:border-neon-blue/50'
        } transition-colors" data-index="${index}">
          <div class="w-4 h-4 rounded-full border-2 ${
            index === this.selectedIndex
              ? 'border-neon-blue'
              : 'border-gray-600'
          } transition-colors flex items-center justify-center">
            ${
              index === this.selectedIndex
                ? '<div class="w-2 h-2 rounded-full"></div>'
                : ''
            }
          </div>
          <span class="text-white">${option.label}</span>
        </label>
      `,
      )
      .join('');

    this.overlay.innerHTML = `
      <div class="flex flex-col justify-center items-center gap-6 backdrop-blur-sm p-8 rounded-2xl border-2 border-neon-blue max-w-md w-full">
        <h3 class="text-2xl text-neon-blue font-bold text-center">
          Game Settings
        </h3>
        
        <div class="w-full">
          <h4 class="text-lg text-white mb-4 text-center">Grid Size</h4>
          <div class="space-y-3" id="optionsList">
            ${optionsHTML}
          </div>
        </div>

        <div class="flex gap-4 justify-center w-full">
          <button
            id="backButton"
            class="backdrop-blur-sm border-2 border-gray-500 text-gray-300 px-6 py-3 rounded-lg uppercase tracking-wide transition-all duration-300 hover:border-gray-400 hover:text-white hover:-translate-y-0.5 active:translate-y-0"
          >
            Back<br>(ESC)
          </button>
          <button
            id="applyButton"
            class="backdrop-blur-sm border-2 border-neon-green text-neon-green px-6 py-3 rounded-lg uppercase tracking-wide transition-all duration-300 shadow-neon-green hover:bg-neon-green hover:text-dark-bg hover:shadow-neon-green-hover hover:-translate-y-0.5 active:translate-y-0"
          >
            Apply & Restart<br>(ENTER)
          </button>
        </div>

        <div class="text-sm text-gray-400 text-center">
          Use ↑↓ arrows to navigate • Enter to apply • Esc to go back
        </div>
      </div>
    `;

    // Add click event listeners
    this.setupClickHandlers(options);
  }

  private setupClickHandlers(options: SettingsDialogOptions): void {
    const backButton = document.getElementById(
      'backButton',
    ) as HTMLButtonElement;
    const applyButton = document.getElementById(
      'applyButton',
    ) as HTMLButtonElement;
    const labels = this.overlay.querySelectorAll('label');

    backButton.addEventListener('click', options.onBack);

    applyButton.addEventListener('click', () => {
      const selectedOption = this.options[this.selectedIndex];
      options.onApply(selectedOption);
    });

    // Add click handlers for option labels
    labels.forEach((label, index) => {
      label.addEventListener('click', () => {
        this.selectedIndex = index;
        this.updateVisualSelection();
      });
    });
  }

  private setupKeyboardNavigation(options: SettingsDialogOptions): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      // Stop all key events from propagating when settings dialog is open
      e.stopPropagation();

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          this.selectedIndex = Math.max(0, this.selectedIndex - 1);
          this.updateVisualSelection();
          break;

        case 'ArrowDown':
          e.preventDefault();
          this.selectedIndex = Math.min(
            this.options.length - 1,
            this.selectedIndex + 1,
          );
          this.updateVisualSelection();
          break;

        case 'Enter': {
          e.preventDefault();
          const selectedOption = this.options[this.selectedIndex];
          options.onApply(selectedOption);
          break;
        }

        case 'Escape':
          e.preventDefault();
          options.onBack();
          break;

        case ' ':
          // Prevent space bar from affecting the game
          e.preventDefault();
          break;

        default:
          // Prevent any other keys from affecting the game
          e.preventDefault();
          break;
      }
    };

    document.addEventListener('keydown', this.keydownHandler);
  }

  private removeKeyboardNavigation(): void {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  private updateVisualSelection(): void {
    const labels = this.overlay.querySelectorAll('label');

    labels.forEach((label, index) => {
      const isSelected = index === this.selectedIndex;

      // Update label styling
      label.className = `flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 ${
        isSelected
          ? 'border-neon-blue bg-neon-blue/10'
          : 'border-gray-600 hover:border-neon-blue/50'
      } transition-colors`;

      // Update radio button visual
      const radioVisual = label.querySelector('div');
      if (radioVisual) {
        radioVisual.className = `w-4 h-4 rounded-full border-2 ${
          isSelected ? 'border-neon-blue bg-neon-blue' : 'border-gray-600'
        } transition-colors flex items-center justify-center`;
        radioVisual.innerHTML = isSelected
          ? '<div class="w-2 h-2 rounded-full bg-dark-bg"></div>'
          : '';
      }
    });
  }
}
