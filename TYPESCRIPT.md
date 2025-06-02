# TypeScript Migration Guide

This document provides detailed information about the migration from JavaScript to TypeScript for the LINE Login application.

## Key Changes

1. **Converted JavaScript to TypeScript**
   - All `.js` files renamed to `.ts`
   - Added proper type annotations
   - Replaced `require()` with ES6 `import` statements
   - Added type declarations for third-party modules

2. **Added Type Definitions**
   - Created interfaces for LINE API responses
   - Added type definitions for request/response objects
   - Defined custom types for authentication objects
   - Extended Express types to support custom properties

3. **Updated Build Process**
   - Added TypeScript compiler configuration
   - Updated package.json scripts for TypeScript
   - Configured source maps for debugging
   - Set up development and production builds

4. **Testing Framework**
   - Configured Jest for TypeScript testing
   - Added type-safe test utilities
   - Created sample TypeScript tests

## TypeScript Configuration

The `tsconfig.json` file is configured with the following important settings:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

## Key Type Definitions

### LINE API Response Types

```typescript
// LINE Token Response
interface LineTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

// LINE User Profile
interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}
```

### Extended Express Types

```typescript
// Extended Session data
declare module 'express-session' {
  interface SessionData {
    user?: LineProfile;
    state?: string;
    nonce?: string;
  }
}

// Extended Request object
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtUser;
  }
}
```

## Benefits of TypeScript

1. **Type Safety**
   - Catches type-related errors during development instead of runtime
   - Prevents common bugs like undefined properties
   - Makes refactoring safer and more reliable

2. **Developer Experience**
   - Better code completion and IntelliSense
   - Improved documentation through type annotations
   - Easier navigation with "Go to Definition" and "Find References"

3. **Code Quality**
   - Forces better architecture and design
   - Self-documenting code with type interfaces
   - Easier to maintain and extend

4. **Compatibility**
   - TypeScript is a superset of JavaScript
   - Easy integration with existing JavaScript code
   - Gradual adoption possible

## Best Practices Used

1. Defining clear interfaces for external API responses
2. Using type guards for runtime type checking
3. Avoiding `any` type wherever possible
4. Using generics for reusable components
5. Leveraging utility types (Partial, Pick, Omit, etc.)
6. Properly extending third-party library types

## References

- [TypeScript Official Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Express with TypeScript](https://expressjs.com/en/resources/frameworks.html)

Make sure to set up your `.env` file with the following variables:

```
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CALLBACK_URL=http://localhost:3100/auth/callback
SESSION_SECRET=your_session_secret
PORT=3100
```

## Testing

You can test the LINE login by:

1. Starting the application (`npm run dev`)
2. Opening a browser and navigating to http://localhost:3100
3. Clicking on the "Login with LINE" button
4. Completing the LINE authentication process
5. Viewing your profile information
