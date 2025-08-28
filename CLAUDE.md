# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern TypeScript Snake Game built with reactive architecture patterns. The project demonstrates advanced state management through an observer pattern implementation, clean component separation, and modern web development practices. Built with Vite for fast development and optimized production builds.

## Technology Stack

### Core Technologies

- **TypeScript** - Primary language with strict type checking and comprehensive type definitions
- **Vite** - Lightning-fast build tool with HMR and optimized bundling
- **Yarn 4.9.2** - Package manager with PnP (Plug'n'Play) for efficient dependency management
- **HTML5 Canvas** - High-performance game rendering

### Architecture Libraries

- **Custom Subject System** (`src/libs/subject.ts`) - Reactive state management with observer pattern
- **GameStateManager** - Singleton-based global state coordination
- **GameLoopController** (`src/game-loop-controller.ts`) - High-performance requestAnimationFrame-based game loop with error handling
- **Component-based Entity System** - Modular game architecture

### Code Quality Tools

- **ESLint** - TypeScript/JavaScript linter with flat config and strict rules
- **Prettier** - Automated code formatting for consistent style
- **TypeScript Compiler** - Strict mode with comprehensive type checking
- **@typescript-eslint** - TypeScript-specific linting rules

## Development Commands

### Package Management
- `yarn install` - Install dependencies with PnP optimization
- `yarn install --frozen-lockfile` - Install for CI/CD with lock file validation
- `yarn upgrade` - Update dependencies to latest compatible versions

### Build & Development
- `yarn build` - Production build with TypeScript compilation and Vite optimization
- `yarn dev` - Development server with HMR (auto-opens browser)
- `yarn preview` - Preview production build locally

### Code Quality
- `yarn lint` - ESLint validation with TypeScript rules
- `yarn lint:fix` - Auto-fix linting issues where possible
- `yarn format` - Format code with Prettier
- `yarn format:check` - Validate code formatting
- `yarn typecheck` - TypeScript type checking without compilation

### Testing
- Testing framework not yet configured
- Recommended: Vitest for unit testing, Playwright for E2E testing

## Architecture Overview

### Reactive State Management Architecture

The project implements a **Subject-Observer Pattern** with centralized state management:

```
GameStateManager (Singleton)
    ├── GameState Subject ('ready' | 'playing' | 'paused' | 'end')
    └── Score Subject (number)
         ↓ (observers)
    Components subscribe to state changes:
    ├── Game (main coordinator)
    ├── GameStateDialog (auto-hide on state change)
    ├── Renderer (pause dimming effects)
    └── Score (reactive UI updates)
```

### Component Architecture

**Core Components**:
- **Game Class** (`main.ts`): Main coordinator, event handling, component initialization
- **GameLoopController** (`game-loop-controller.ts`): Optimized game loop with requestAnimationFrame, FPS monitoring, and error recovery
- **GameStateManager** (`game-context.ts`): Centralized state management with observer pattern
- **Subject System** (`libs/subject.ts`): Reactive state management foundation

**Game Entities**:
- **Snake** (`snake.ts`): Movement logic, collision detection, direction queue management
- **Food** (`food.ts`): Random generation, collision detection, scoring logic
- **Renderer** (`renderer.ts`): Canvas operations, visual effects, state-reactive rendering

**UI Systems**:
- **GameStateDialog** (`game-state-dialog.ts`): In-game overlays (pause/game over)
- **FullScreenDialog** (`fullscreen-dialog.ts`): Settings and info modals
- **Score** (`score.ts`): Reactive score display and persistence

**Configuration & Types**:
- **GameSettings** (`settings.ts`): Persistent game configuration
- **Types & Constants** (`libs/types.ts`, `libs/constants.ts`): TypeScript definitions and game timing configuration

## Project Structure

```
src/
├── main.ts                 # Game coordinator and entry point
├── game-loop-controller.ts # RequestAnimationFrame-based game loop controller
├── game-context.ts         # GameStateManager and reactive state system
├── libs/
│   ├── subject.ts          # Observer pattern implementation
│   ├── types.ts            # TypeScript interface definitions
│   └── constants.ts        # Game timing and configuration constants
├── snake.ts                # Snake entity with improved direction API
├── food.ts                 # Food entity with collision and scoring
├── renderer.ts             # Canvas rendering with state-reactive effects
├── score.ts                # Reactive score management and persistence  
├── game-state-dialog.ts    # In-game dialog system with auto-hide
├── fullscreen-dialog.ts    # Modal dialog system with keyboard nav
├── settings.ts             # Game configuration management
├── index.css               # Minimal stone aesthetic styling
└── vite-env.d.ts           # Vite type definitions
```

## State Management System

### GameStateManager (Singleton Pattern)

**Purpose**: Centralized state coordination using observer pattern

**Key Features**:
- Singleton instance ensures global state consistency
- Subject-based reactive updates
- Type-safe state transitions
- Memory leak prevention through subscription management

**API**:
```typescript
// Game State Management
gameStateManager.getGameState(): GameState
gameStateManager.setGameState(state: GameState): void
gameStateManager.subscribeToGameState(callback): Subscription

// Score Management  
gameStateManager.getScore(): number
gameStateManager.setScore(score: number): void
gameStateManager.subscribeToScore(callback): Subscription
```

### Subject System

**Features**:
- Generic reactive state container
- Automatic change detection with `Object.is()`
- Safe error handling in subscriber callbacks
- Subscription management with cleanup

**Usage Pattern**:
```typescript
// Create reactive state
const subject = new Subject<StateType>(initialValue);

// Subscribe to changes
const subscription = subject.subscribe((newState, prevState) => {
  // React to state changes
});

// Update state
subject.setState(newValue);
subject.setState(prev => transformFunction(prev));

// Cleanup
subscription.unsubscribe();
```

## Game Development Guidelines

### Enhanced Snake API

The Snake class provides a clean, consistent API for movement and direction management:

**Direction Management**:
```typescript
// Get current active direction
snake.getCurrentDirection(): Position

// Get next queued direction (includes queue)
snake.getNextQueuedDirection(): Position

// Immediate direction setting (game start/resume)
snake.setDirection(direction: Position): void

// Queue direction for next move (gameplay)
snake.queueDirection(direction: Position): void

// Validate direction changes (prevent 180° turns)
snake.isValidDirectionChange(newDirection: Position): boolean
```

### Game State Flow

**State Transitions**:
```
ready → playing (user input)
playing → paused (spacebar/settings)
paused → playing (user input/resume)
playing → end (collision)
end → ready (restart)
```

**State-Reactive Behaviors**:
- **GameStateDialog**: Auto-hide when transitioning to 'playing'
- **Renderer**: Dim canvas overlay during 'paused' state
- **Score**: Reactive UI updates via state subscription
- **Game**: Loop control and input handling based on state

### Input System

**Keyboard Controls**:
- **Movement**: Arrow keys + WASD (with direction validation)
- **Pause/Resume**: Spacebar (during gameplay)
- **Settings**: Escape key
- **Screenshot**: 'S' key (in settings dialog)

**Input Processing**:
1. Validate direction change (prevent opposite directions)
2. State-dependent handling:
   - `ready`/`paused`: Start game immediately
   - `playing`: Queue direction for smooth movement
3. Direction buffering for responsive controls

### Dialog System Architecture

**GameStateDialog (In-game Overlays)**:
- Purpose: Quick game state interactions
- Behavior: Small overlay with auto-focus
- Integration: Reactive hiding on game start
- Memory: Automatic subscription cleanup

**FullScreenDialog (Modal System)**:
- Purpose: Complex interactions (settings, info)
- Features: Full keyboard navigation, screenshot capability
- State: Preserves game state during interaction
- Accessibility: Proper focus management and ARIA support

## Visual Design System

### Stone Aesthetic Theme

**Color Palette**:
- **Backgrounds**: Black base with stone gradients
- **UI Elements**: Stone-400 (`#a8a29e`) for primary text
- **Secondary Text**: Stone-300 (`#d6d3d1`) for highlights
- **Game Entities**:
  - Snake Head: `#d6d3d1` with `#f5f5f4` highlight  
  - Snake Body: `#a8a29e` with `#e7e5e4` highlight
  - Food: `#ea580c` (orange-600) with `#fb923c` highlight

**Typography**:
- **Font Family**: IBM Plex Mono (monospace consistency)
- **Weight**: Regular (400) throughout for minimal aesthetic
- **Hierarchy**: Size-based without weight variation

**Design Principles**:
1. **Minimalism**: Clean, distraction-free design
2. **Readability**: High contrast and clear typography  
3. **Consistency**: Unified palette and spacing
4. **Accessibility**: Keyboard navigation and color contrast compliance

## Code Quality Standards

### TypeScript Configuration

**Strict Type Checking**:
- `strict: true` - Enable all strict type-checking options
- `noImplicitAny: true` - Flag implicit any types
- `strictNullChecks: true` - Enable strict null/undefined checking
- `noImplicitReturns: true` - Flag functions without return statements

**Best Practices**:
- Explicit return types for public methods
- Comprehensive JSDoc documentation for complex logic
- Interface definitions for all object shapes
- Union types for controlled value sets
- Utility types (`Partial`, `Pick`, `Omit`) where appropriate

### ESLint Configuration

**Rule Categories**:
- **TypeScript Rules**: `@typescript-eslint/recommended`
- **Code Style**: Consistent formatting and patterns
- **Best Practices**: Modern JavaScript/TypeScript patterns
- **Error Prevention**: Catch potential runtime errors

**Key Rules**:
```javascript
{
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/no-explicit-any': 'warn',
  'prefer-const': 'error',
  'no-var': 'error',
  'object-shorthand': 'error'
}
```

### Memory Management

**Subscription Cleanup**:
- All components implement `destroy()` methods
- Automatic subscription cleanup prevents memory leaks
- Component re-initialization properly cleans up previous instances

**Pattern**:
```typescript
class Component {
  private subscription?: Subscription;
  
  constructor() {
    this.subscription = subject.subscribe(callback);
  }
  
  public destroy(): void {
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
  }
}
```

## Performance Considerations

### Game Loop Optimization

**Current Implementation**:
- `setInterval` based game loop (150ms intervals)
- State-gated update cycle to prevent unnecessary work
- Efficient collision detection with early returns

**Future Enhancements**:
- Consider `requestAnimationFrame` for smoother animation
- Implement delta time for frame-independent movement
- Add performance monitoring and metrics

### Bundle Optimization

**Current Stats**:
- Production bundle: ~19.7KB (gzipped: ~5.6KB)
- CSS bundle: ~16.5KB (gzipped: ~3.7KB)
- Efficient tree-shaking with ES modules

### Reactive Performance

**Observer Pattern Benefits**:
- Decoupled component updates
- Efficient change propagation
- Prevents unnecessary re-renders through change detection
- Error isolation in subscriber callbacks

## Development Workflow

### Pre-Development Setup
1. Verify Node.js compatibility (check package.json engines)
2. Install dependencies: `yarn install`
3. Validate setup: `yarn typecheck && yarn lint`

### During Development
1. Run development server: `yarn dev`
2. Use TypeScript for type safety and better IDE support
3. Frequent linting: `yarn lint` (consider IDE integration)
4. Leverage Vite's HMR for rapid iteration
5. Test state management with browser dev tools

### Pre-Commit Checklist
1. **Format**: `yarn format` (automated styling)
2. **Lint**: `yarn lint` (catch errors and style issues)  
3. **Type Check**: `yarn typecheck` (verify type safety)
4. **Build**: `yarn build` (ensure production compatibility)
5. **Review**: Check changed files for unintended modifications

### Commit Standards
- Use conventional commit format: `type: description`
- Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`
- Keep descriptions concise and descriptive
- Include breaking changes in commit body when applicable

## Architecture Patterns

### Observer Pattern Implementation

**Benefits**:
- Loose coupling between components
- Centralized state management
- Reactive UI updates
- Scalable event system

**Usage Guidelines**:
- Use for cross-component communication
- Implement proper cleanup to prevent memory leaks
- Keep subscriber callbacks lightweight
- Use type-safe subscriptions with TypeScript

### Singleton Pattern (GameStateManager)

**Justification**:
- Global game state requirement
- Single source of truth for state
- Simplified access pattern
- Memory efficiency

**Considerations**:
- Ensure thread safety (not applicable in single-threaded JS)
- Plan for testing with dependency injection if needed
- Document global state dependencies clearly

## Game Loop Performance Architecture

### GameLoopController System

**Purpose**: High-performance, requestAnimationFrame-based game loop with comprehensive error handling and performance monitoring.

**Key Features**:
- **Fixed Timestep Updates**: Game logic runs at consistent 150ms intervals regardless of frame rate
- **Variable Frame Rendering**: Smooth 60fps visual updates using requestAnimationFrame
- **FPS Monitoring**: Real-time performance tracking displayed in top-right corner
- **Error Recovery**: Automatic restart mechanism for loop failures
- **Memory Optimization**: Bound methods prevent repeated function creation
- **Spiral of Death Prevention**: Maximum frame skip limit prevents performance cascade failures

**Architecture**:
```typescript
GameLoopController {
  config: GameTimingConfig
  state: GameLoopState
  callbacks: { update, render, onFpsUpdate, onError }
  
  // Performance monitoring
  getCurrentFps(): number
  
  // Lifecycle management
  start(): void
  stop(): void
  
  // Error handling with auto-recovery
  private handleError(error: Error): void
}
```

**Performance Benefits**:
- **Smoother Animation**: 60fps rendering vs previous 6.7fps (150ms intervals)
- **Battery Efficiency**: Automatic pause when tab inactive
- **Error Resilience**: Graceful recovery from animation frame failures
- **Memory Efficiency**: Optimized function binding prevents GC pressure

### Game Timing Configuration

**Constants** (`src/libs/constants.ts`):
```typescript
DEFAULT_GAME_TIMING = {
  gameSpeed: 150,     // ms between game logic updates
  targetFps: 60,      // target frames per second
  maxFrameSkip: 5     // prevent spiral of death
}
```

## Future Enhancements

### Testing Infrastructure
- **Unit Testing**: Vitest for component logic testing
- **Integration Testing**: Component interaction testing
- **E2E Testing**: Playwright for user workflow validation
- **Coverage Goals**: 80%+ for critical game logic

### Performance Improvements
- ✅ **Animation**: RequestAnimationFrame implementation with GameLoopController
- ✅ **FPS Monitoring**: Real-time performance tracking and display
- ✅ **Error Recovery**: Automatic game loop recovery mechanisms  
- **Input**: Debounce rapid key presses
- **Rendering**: Canvas optimization techniques
- **Memory**: Object pooling for game entities

### Feature Extensions
- **Multiplayer**: WebSocket-based real-time gameplay
- **Themes**: Multiple visual themes with reactive switching
- **Sound**: Audio system with reactive volume control
- **Analytics**: Performance monitoring and user metrics

---

## Important Notes

**File Management**:
- ALWAYS prefer editing existing files over creating new ones
- NEVER create documentation files unless explicitly requested
- Use TypeScript strict mode for all new code
- Follow established naming conventions consistently

**Code Standards**:
- Implement proper error handling for DOM operations
- Use defensive programming patterns
- Document complex logic with JSDoc comments
- Ensure accessibility compliance for UI components

**State Management**:
- All state changes should go through GameStateManager
- Implement proper subscription cleanup in all components
- Use type-safe state transitions
- Test observer pattern behavior thoroughly