export interface GridSizeOption {
  label: string;
  tileCount: number;
}

export type GameConfig = {
  gridSizeOption: GridSizeOption;
};

/**
 * Manages game settings and preferences
 */
export class GameSettings {
  private static readonly STORAGE_KEY = 'snake-game-settings';

  // Available grid size options
  static readonly GRID_OPTIONS: GridSizeOption[] = [
    { label: '10x10', tileCount: 10 },
    { label: '20x20', tileCount: 20 },
    { label: '40x40', tileCount: 40 },
  ];

  private settings: GameConfig;

  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * Get current settings
   */
  getSettings(): GameConfig {
    return { ...this.settings };
  }

  /**
   * Get current grid size option
   */
  getGridSizeOption(): GridSizeOption {
    return this.settings.gridSizeOption;
  }

  /**
   * Set grid size option
   */
  setGridSizeOption(option: GridSizeOption): void {
    this.settings.gridSizeOption = option;
    this.saveSettings();
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): GameConfig {
    try {
      const stored = localStorage.getItem(GameSettings.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GameConfig;
        // Validate that the stored option exists in current options
        const validOption = GameSettings.GRID_OPTIONS.find(
          (opt) => opt.tileCount === parsed.gridSizeOption.tileCount,
        );
        if (validOption) {
          return { gridSizeOption: validOption };
        }
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }

    // Return default settings (Medium difficulty)
    return {
      gridSizeOption: GameSettings.GRID_OPTIONS[1], // 20x20
    };
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(
        GameSettings.STORAGE_KEY,
        JSON.stringify(this.settings),
      );
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }
}
