# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript Vite project for a Snake Game. The project uses modern web development tools including TypeScript, Vite for fast development and building, and ESLint for code quality. It uses Yarn with PnP (Plug'n'Play) for dependency management.

## Development Commands

### Package Management

- `yarn install` - Install dependencies
- `yarn install --frozen-lockfile` - Install dependencies for CI/CD
- `yarn upgrade` - Update dependencies

### Build Commands

- `yarn build` - Build the project for production (TypeScript compilation + Vite build)
- `yarn dev` - Start Vite development server (opens browser automatically)
- `yarn preview` - Preview production build locally

### Testing Commands

- Testing framework not yet configured
- Future: Add testing framework (Jest, Vitest, or similar)

### Code Quality Commands

- `yarn lint` - Run ESLint for code linting
- `yarn lint:fix` - Run ESLint with auto-fix
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check if code is properly formatted
- `yarn typecheck` - Run TypeScript type checking

### Development Tools

- Currently using basic Vite tooling
- Future: Add additional development tools as needed

## Technology Stack

### Current Stack

- **TypeScript** - Primary programming language with strict type checking
- **Vite** - Fast build tool and development server with HMR
- **Yarn 4.9.2** - Package manager with PnP (Plug'n'Play)
- **ESLint** - TypeScript/JavaScript linter with flat config

### Code Quality Tools

- **ESLint** - Configured with TypeScript support and recommended rules
- **Prettier** - Code formatter for consistent code style
- **TypeScript** - Strict mode enabled for maximum type safety
- **@typescript-eslint** - TypeScript-specific ESLint rules and parser

## Project Structure Guidelines

### Current File Organization

```
src/
├── main.ts         # Main Game class and application entry point
├── snake.ts        # Snake entity with movement and collision logic
├── food.ts         # Food entity with generation and scoring
├── renderer.ts     # Canvas rendering system
├── score.ts        # Score tracking and persistence
├── dialog.ts       # Game state dialogs (pause/game over)
├── message.ts      # User notification system
├── types.ts        # TypeScript type definitions
├── index.css       # Global styles with minimal stone theme
└── vite-env.d.ts   # Vite environment type definitions
```

### Architecture Overview

The project follows a **Component-Based Entity System** with clear separation of concerns:

- **Game Class** (`main.ts`): Central game loop, state management, and coordination
- **Entity Classes**: Snake, Food - independent game entities
- **System Classes**: Renderer, Score, Dialog - specialized functionality
- **Type Definitions** (`types.ts`): Shared interfaces and types
- **Constants**: Game configuration (speed, grid size, key mappings)

### Naming Conventions

- **Files**: Use kebab-case for file names (`snake.ts`, `dialog.ts`)
- **Classes**: Use PascalCase for class names (`Game`, `Snake`, `Dialog`)
- **Functions**: Use camelCase for function names (`handleKeyPress`, `checkCollision`)
- **Constants**: Use UPPER_SNAKE_CASE for constants (`GAME_SPEED`, `GRID_SIZE`)
- **Types**: Use PascalCase with descriptive names (`GameState`, `Position`, `DialogOptions`)

## Design System

### Visual Theme

The game uses a **minimal stone aesthetic** with a focus on readability and modern design:

- **Color Palette**: Stone/neutral tones with subtle gradients
- **Typography**: IBM Plex Mono for consistent monospace appearance
- **Visual Style**: Clean, minimal design without distracting effects

### Color Guidelines

**Background Colors**:
- Primary background: Black with stone gradient (`from-stone-800/40 via-stone-700/20 to-stone-900/30`)
- Text colors: Stone-400 for UI elements, Stone-300 for less prominent text

**Game Entity Colors**:
- **Snake**: Stone tones with subtle glow effects
  - Head: `#d6d3d1` (stone-300) with `#f5f5f4` highlight
  - Body: `#a8a29e` (stone-400) with `#e7e5e4` highlight
- **Food**: Warm orange-amber tones for contrast
  - Primary: `#ea580c` (orange-600) with `#fb923c` highlight
  - Glow: `#d97706` (amber-600) for subtle emphasis

**UI Components**:
- Borders: Stone-600 default, Stone-400 for active/hover states
- Buttons: Stone-400 background on hover with black text
- Grid lines: Subtle stone grid with minimal opacity

### Typography

- **Primary Font**: IBM Plex Mono - consistent, readable monospace
- **Font Weights**: Regular (400) for body text, no bold weights to maintain minimalism
- **Text Hierarchy**: Size-based hierarchy without weight variation

### Design Principles

1. **Minimalism**: Clean design without unnecessary visual noise
2. **Readability**: High contrast ratios and clear typography
3. **Consistency**: Unified color palette and spacing throughout
4. **Accessibility**: Consider color contrast and keyboard navigation

## Game Development Guidelines

### Game State Management

The game uses a simple state machine with four states:
- `'ready'` - Initial state, waiting for user input
- `'playing'` - Active gameplay
- `'paused'` - Game paused by user
- `'end'` - Game over

### Key Input System

- **Movement Keys**: Arrow keys + WASD
- **Pause/Resume**: Spacebar (only during gameplay)
- **Direction Validation**: Prevents 180-degree turns
- **Input Queuing**: Allows buffering of direction changes

### Entity System

- **Snake**: Body segments, movement, collision detection
- **Food**: Random generation, collision detection, scoring
- **Renderer**: Canvas drawing, entity visualization
- **Score**: Current score, high score persistence

### Dialog System

Two dialog types with auto-focus:
- **Pause Dialog**: Resume button with keyboard support
- **Game Over Dialog**: Restart button with keyboard support

## TypeScript Guidelines

### Type Safety

- Enable strict mode in `tsconfig.json`
- Use explicit types for function parameters and return values
- Prefer interfaces over types for object shapes
- Use union types for multiple possible values
- Avoid `any` type - use `unknown` when type is truly unknown

### Best Practices

- Use type guards for runtime type checking
- Leverage utility types (`Partial`, `Pick`, `Omit`, etc.)
- Create custom types for domain-specific data
- Use enums for finite sets of values
- Document complex types with JSDoc comments

## Code Quality Standards

### ESLint Configuration

The project uses ESLint with flat config format (`eslint.config.js`):

- TypeScript recommended rules with `@typescript-eslint`
- Strict TypeScript rules enabled
- Code style rules for consistency
- Proper ignoring of build artifacts and Yarn PnP files

### Current ESLint Rules

- `@typescript-eslint/no-unused-vars`: error
- `@typescript-eslint/no-explicit-any`: warn
- `prefer-const`, `no-var`, `object-shorthand`: enabled
- `no-console`: warn (for production readiness)
- `no-debugger`: error

### Prettier Configuration

The project uses Prettier with the following settings (`.prettierrc`):

- Single quotes for strings
- Semicolons enabled
- 80 character line width
- 2-space indentation
- Trailing commas for all ES5-valid syntax
- Always use parentheses around arrow function parameters

### Testing Standards

- Aim for 80%+ test coverage
- Write unit tests for utilities and business logic
- Use integration tests for component interactions
- Implement e2e tests for critical user flows
- Follow AAA pattern (Arrange, Act, Assert)

## Performance Optimization

### Bundle Optimization

- Use code splitting for large applications
- Implement lazy loading for routes and components
- Optimize images and assets
- Use tree shaking to eliminate dead code
- Analyze bundle size regularly

### Runtime Performance

- Implement proper memoization (React.memo, useMemo, useCallback)
- Use virtualization for large lists
- Optimize re-renders in React applications
- Implement proper error boundaries
- Use web workers for heavy computations

## Security Guidelines

### Dependencies

- Regularly audit dependencies with `npm audit`
- Keep dependencies updated
- Use lock files (`package-lock.json`, `yarn.lock`)
- Avoid dependencies with known vulnerabilities

### Code Security

- Sanitize user inputs
- Use HTTPS for API calls
- Implement proper authentication and authorization
- Store sensitive data securely (environment variables)
- Use Content Security Policy (CSP) headers

## Development Workflow

### Before Starting

1. Check Node.js version compatibility
2. Install dependencies with `yarn install`
3. Run type checking with `yarn typecheck`
4. Ensure ESLint passes: `yarn lint`

### During Development

1. Use TypeScript for type safety
2. Run linter frequently to catch issues early: `yarn lint`
3. Use meaningful commit messages
4. Review code changes before committing
5. Take advantage of Vite's fast HMR for development

### Before Committing

1. Format code: `yarn format`
2. Check linting: `yarn lint`
3. Run type checking: `yarn typecheck`
4. Test production build: `yarn build`
5. Consider running `yarn lint:fix` to auto-fix linting issues
