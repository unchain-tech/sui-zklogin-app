# Project Structure

## Root Directory
```
sui-zklogin-demo/
├── public/                 # Static assets
│   └── sui.svg            # Sui logo favicon
├── src/                   # Source code
├── package.json           # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tsconfig.node.json    # Node TypeScript config
├── vite.config.ts        # Vite build configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── biome.json           # Biome formatter configuration
├── .eslintrc.cjs        # ESLint configuration
├── index.html           # HTML entry point
└── README.md           # Project documentation
```

## Source Code Structure
```
src/
├── App.tsx              # Main application component (1165+ lines)
├── App.css             # Application styles
├── main.tsx            # React entry point
├── index.css           # Global styles
├── vite-env.d.ts       # Vite type definitions
├── components/         # Reusable components
│   └── StyledSnackbarProvider.tsx
├── utils/              # Utility functions and constants
│   └── constant.ts     # Application constants
├── lang/               # Internationalization
│   └── resources.ts    # Language resources (EN/CN)
├── theme/              # MUI theme configuration
│   ├── index.ts        # Main theme configuration
│   └── colors/         # Color palette definitions
│       ├── index.ts
│       ├── base.ts
│       ├── error.ts
│       ├── gray.ts
│       ├── primary.ts
│       ├── success.ts
│       └── warning.ts
└── assets/             # Static assets
    ├── google.svg      # Google logo
    ├── msafe.png      # MSafe logo
    └── sui-logo-color.svg # Sui logo
```

## Key Components and Files

### Core Application
- **App.tsx**: Main component containing all 7 zkLogin steps
- **main.tsx**: Application bootstrap with providers

### Configuration
- **constant.ts**: API endpoints, storage keys, OAuth config
- **theme/**: Material-UI theme and color definitions

### UI Components
- **StyledSnackbarProvider**: Custom notification provider

### Internationalization
- **resources.ts**: Translation keys and content

## Data Flow Architecture
1. **Browser Storage Layer**: sessionStorage + localStorage
2. **React State Layer**: useState hooks for component state
3. **Server State Layer**: React Query for API calls
4. **UI Layer**: Material-UI + Tailwind CSS
5. **External APIs**: Google OAuth, Sui network, ZK proving service