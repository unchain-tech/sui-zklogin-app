# Application Architecture and Design Patterns

## Overall Architecture
- **Single Page Application (SPA)**: React-based client-only application
- **Step-by-Step UI Pattern**: Stepper component guiding users through 7 sequential steps
- **State Machine Pattern**: Each step has prerequisites and validates completion
- **Educational Demo Pattern**: Code snippets displayed alongside functionality

## Key Design Patterns

### 1. Provider Pattern
- **Theme Provider**: MUI theme context
- **Query Client Provider**: React Query state management
- **Sui Client Provider**: Blockchain connection context
- **Snackbar Provider**: Global notification system
- **i18n Provider**: Internationalization context

### 2. Custom Hooks Pattern
- **useSuiClientQuery**: For blockchain data fetching
- **useTranslation**: For i18n text retrieval
- **useLocation/useNavigate**: For URL-based state management

### 3. State Management Patterns
- **Local State**: useState for component-specific data
- **Derived State**: useMemo for computed values
- **Persistent State**: Browser storage for cross-session data
- **Server State**: React Query for external API data

### 4. Error Handling Pattern
- **Try-catch blocks**: For async operations
- **Global error display**: Using notistack for user feedback
- **Validation chains**: Step-by-step prerequisite checking

## Component Design Principles

### 1. Single Responsibility
- Each step handles one specific zkLogin operation
- Utility functions separated into constants file
- Theme and styling separated into dedicated modules

### 2. Declarative UI
- Conditional rendering based on step state
- Material-UI declarative components
- React Query declarative data fetching

### 3. Accessibility
- Stepper component for clear progress indication
- Loading states for async operations
- Error states with clear messaging

## Data Management Strategy

### 1. Temporary Data (sessionStorage)
- Ephemeral key pairs
- Randomness values
- One-time use cryptographic data

### 2. Persistent Data (localStorage)
- User salt (critical for address generation)
- Max epoch settings
- User preferences

### 3. Runtime State
- UI state (current step, loading states)
- Form data and user inputs
- API responses and computed values

## Security Considerations
- **Client-side key generation**: Ed25519 keypairs in browser
- **Secure storage separation**: Different storage for different data types
- **No backend dependencies**: Eliminates server-side attack vectors
- **External service integration**: Trusted third-party services (Google, Mysten Labs)

## Performance Optimizations
- **Code splitting**: Vite handles automatic code splitting
- **Lazy loading**: React.lazy could be added for large components
- **Memoization**: useMemo for expensive computations
- **Query caching**: React Query handles API response caching