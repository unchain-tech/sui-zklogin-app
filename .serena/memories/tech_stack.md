# Technology Stack

## Frontend Framework
- **React 18** with **TypeScript**
- **Vite** as build tool and development server
- **React Router DOM** for routing (single route application)

## UI Framework and Styling
- **Material-UI (MUI) v5** for components
  - @mui/material, @mui/lab, @mui/icons-material
  - @emotion/react, @emotion/styled for styling
- **Tailwind CSS** for utility-first styling
- **PostCSS** with Autoprefixer

## Sui Blockchain Integration
- **@mysten/sui.js** (v0.46.1): Core Sui SDK
- **@mysten/dapp-kit** (v0.9.0): React hooks for Sui integration
- **@mysten/zklogin** (v0.3.4): zkLogin specific functionality
- **@noble/curves** (v1.2.0): Cryptographic operations

## State Management and Data Fetching
- **@tanstack/react-query** (v5.8.4): Server state management
- **React hooks**: Local state management

## Internationalization
- **i18next** and **react-i18next**: Multi-language support (EN/CN)

## Additional Libraries
- **axios**: HTTP client for API calls
- **jwt-decode**: JWT token decoding
- **query-string**: URL parameter parsing
- **notistack**: Toast notifications
- **react-syntax-highlighter**: Code syntax highlighting
- **bignumber.js**: Precise number operations
- **buffer**: Node.js Buffer polyfill for browser

## Development Tools
- **TypeScript 5.0.2**: Type safety
- **ESLint**: Code linting
- **@biomejs/biome**: Code formatting (alternative to Prettier)
- **Vite**: Build tool with HMR

## Analytics and Monitoring
- **@vercel/analytics**: User analytics on deployed version