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
├── main.ts         # Main application entry point
├── counter.ts      # Counter functionality (example)
├── style.css       # Global styles
├── typescript.svg  # TypeScript logo asset
└── vite-env.d.ts   # Vite environment type definitions
```

### Future Structure (as project grows)

```
src/
├── game/           # Game-specific logic and components
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
├── constants/      # Game constants (speed, colors, etc.)
├── styles/         # CSS files and styling
└── assets/         # Static assets (images, sounds)
```

### Naming Conventions

- **Files**: Use kebab-case for file names (`user-profile.component.ts`)
- **Components**: Use PascalCase for component names (`UserProfile`)
- **Functions**: Use camelCase for function names (`getUserData`)
- **Constants**: Use UPPER_SNAKE_CASE for constants (`API_BASE_URL`)
- **Types/Interfaces**: Use PascalCase with descriptive names (`UserData`, `ApiResponse`)

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
