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
        'fixed inset-0 backdrop-blur-sm bg-[rgba(0,0,0,0.4)] justify-center items-center z-50 hidden';
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
                ? '<div class="w-2 h-2 rounded-full"></div>'
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
          <button id="applyButton">
            Apply & Restart<br>(ENTER)
          </button>
        </div>

        <div class="text-sm text-center text-stone-500">
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
