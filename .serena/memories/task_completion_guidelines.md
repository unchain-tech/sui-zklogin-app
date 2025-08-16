# Task Completion Guidelines

## After Making Code Changes

### 1. Code Quality Checks
```bash
# Format code
npm run format

# Check for linting errors
npm run lint

# Verify TypeScript compilation
npx tsc --noEmit
```

### 2. Testing and Verification
```bash
# Start development server to test changes
npm run dev

# Build to verify production compatibility
npm run build
```

### 3. Manual Testing Checklist
- [ ] All 7 zkLogin steps function correctly
- [ ] Google OAuth login works
- [ ] ZK proof generation succeeds
- [ ] Transaction execution completes
- [ ] UI language switching works (EN/CN)
- [ ] Error handling displays proper messages
- [ ] Browser storage persistence works
- [ ] Reset functionality clears all state

### 4. Code Review Points
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented for async operations
- [ ] Console errors are addressed
- [ ] UI is responsive across devices
- [ ] Accessibility considerations are met
- [ ] Performance impacts are minimal

### 5. Documentation Updates
- [ ] Update README.md if functionality changes
- [ ] Add code comments for complex logic
- [ ] Update internationalization keys if UI text changes

## Before Deployment
- [ ] Production build succeeds without warnings
- [ ] Environment-specific configurations are correct
- [ ] All external dependencies are available
- [ ] Vercel deployment configuration is updated if needed

## Rollback Plan
- Keep track of working commit hash
- Have rollback procedure documented
- Monitor error rates after deployment
- Prepare hotfix process for critical issues

## Performance Considerations
- Minimize bundle size impact
- Optimize re-renders using React.memo if needed
- Ensure proper cleanup of event listeners and timers
- Monitor memory usage in browser dev tools