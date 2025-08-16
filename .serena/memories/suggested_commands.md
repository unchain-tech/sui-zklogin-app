# Suggested Commands

## Development Commands

### Start Development Server
```bash
npm run dev
# or
yarn dev
```
Starts Vite development server with hot module replacement

### Build for Production
```bash
npm run build
# or
yarn build
```
Runs TypeScript compilation followed by Vite build

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```
Serves the production build locally for testing

## Code Quality Commands

### Linting
```bash
npm run lint
# or
yarn lint
```
Runs ESLint on TypeScript and TSX files with error reporting

### Formatting
```bash
npm run format
# or
yarn format
```
Formats code using Biome formatter

### Manual Type Checking
```bash
npx tsc --noEmit
```
Run TypeScript compiler in check mode (no output files)

## System Commands (macOS/Darwin)

### File Operations
```bash
find . -name "*.tsx" -o -name "*.ts"  # Find TypeScript files
grep -r "zkLogin" src/                # Search in source code
ls -la src/                           # List source directory
```

### Git Operations
```bash
git status                            # Check repository status
git add .                             # Stage all changes
git commit -m "message"              # Commit changes
git push origin main                 # Push to main branch
```

### Package Management
```bash
yarn install                         # Install dependencies
yarn add <package>                   # Add new dependency
yarn add -D <package>                # Add dev dependency
yarn remove <package>                # Remove dependency
```

## Debugging and Analysis

### Bundle Analysis
```bash
npx vite-bundle-analyzer dist
```

### Dependency Tree
```bash
yarn list                            # Show dependency tree
yarn why <package>                   # Why is package installed
```

## Environment Setup
- Ensure Node.js 16+ is installed
- Use yarn or npm for package management
- Modern browser for development testing
- Git for version control