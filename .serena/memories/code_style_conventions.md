# Code Style and Conventions

## TypeScript Configuration
- **Target**: ES2020
- **Module System**: ESNext with bundler resolution
- **Strict Mode**: Enabled with full type checking
- **JSX**: react-jsx (new JSX transform)
- **Import Extensions**: TypeScript extensions allowed for bundler

## Code Formatting (Biome)
- **Indentation**: Spaces (configured in biome.json)
- **Quote Style**: Double quotes for JavaScript/TypeScript
- **Import Organization**: Automatic import sorting enabled
- **File Extensions**: .ts, .tsx for TypeScript files

## ESLint Configuration
- **Base**: eslint:recommended
- **TypeScript**: @typescript-eslint/recommended
- **React**: react-hooks/recommended
- **React Refresh**: Only export components rule for HMR

## Naming Conventions
- **React Components**: PascalCase (e.g., `App`, `StyledSnackbarProvider`)
- **Functions**: camelCase (e.g., `generateNonce`, `requestFaucet`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `CLIENT_ID`, `FULLNODE_URL`)
- **Variables**: camelCase
- **Files**: kebab-case for non-component files, PascalCase for components

## Component Structure
- **Functional Components**: Using hooks (no class components)
- **State Management**: useState, useEffect, useMemo hooks
- **Props**: TypeScript interfaces for prop types
- **Styling**: Emotion/MUI sx prop and Tailwind classes

## Import Organization
- **External Libraries**: First (React, MUI, etc.)
- **Sui Libraries**: Grouped together (@mysten/*)
- **Internal Imports**: Last (relative paths)
- **Asset Imports**: At the end

## File Structure
- **Components**: In src/components/ directory
- **Utilities**: In src/utils/ directory
- **Themes**: In src/theme/ with color subdirectory
- **Internationalization**: In src/lang/ directory
- **Assets**: In src/assets/ directory

## Error Handling
- **Try-catch**: Used for async operations
- **Error Display**: Using notistack for user-friendly error messages
- **Console Logging**: console.error for development debugging

## State Management Patterns
- **Browser Storage**: sessionStorage for temporary data, localStorage for persistent data
- **React Query**: For server state and caching
- **Local State**: useState for component-level state
- **Derived State**: useMemo for computed values