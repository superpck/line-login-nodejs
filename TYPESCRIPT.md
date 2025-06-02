# TypeScript Migration Guide

This document provides information about the migration from JavaScript to TypeScript for the LINE Login application.

## Changes Made

1. Converted all JavaScript files to TypeScript
2. Added TypeScript configuration and dependencies
3. Updated package.json scripts for TypeScript support
4. Added type definitions for request/response objects
5. Added interfaces for LINE API responses
6. Updated views to support TypeScript implementation

## How to Run the Application

### Development Mode

```bash
# Install dependencies
npm install

# Run in development mode with hot-reloading
npm run dev
```

### Production Mode

```bash
# Build the TypeScript files
npm run build

# Start the application
npm start
```

## TypeScript Benefits

- Strong typing for better code quality
- Early error detection during development
- Better IDE support with code completion
- Improved code maintainability and readability
- Better documentation through type definitions

## File Structure

- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript files (generated)
- `public/` - Static assets (CSS, client-side JavaScript)
- `views/` - EJS templates

## Environment Variables

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
