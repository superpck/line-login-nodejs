# LINE Login with Node.js, TypeScript, and Express 5

This project demonstrates how to implement LINE login functionality using Node.js, Express 5, and TypeScript. It provides a simple authentication flow that allows users to log in with their LINE accounts and view their profile information.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Development](#development)
- [License](#license)

## Features

- LINE login integration with TypeScript
- User authentication and session management
- Express 5 with improved error handling
- Enhanced security with Helmet, CORS, and cookie protection
- Profile page to display user information
- Simple and clean user interface
- Type-safe code with TypeScript

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/line-login-nodejs.git
   ```

2. Navigate to the project directory:
   ```
   cd line-login-nodejs
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file based on the `.env.example` file and fill in your LINE credentials.

## Usage

1. Build the TypeScript code:
   ```
   npm run build
   ```

2. Start the application:
   ```
   npm start
   ```

   Or run in development mode with auto-reload:
   ```
   npm run dev
   ```

3. Open your browser and go to `http://localhost:3100`.

4. Click on the "Login with LINE" button to authenticate.

5. After successful login, you will be redirected to your profile page.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
LINE_CHANNEL_ID=your_line_channel_id
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CALLBACK_URL=http://localhost:3100/auth/callback
SESSION_SECRET=your_session_secret
PORT=3100
```

You can obtain the LINE credentials by creating a LINE Login provider in the [LINE Developers Console](https://developers.line.biz/console/).

## Project Structure

```
line-login-nodejs/
├── dist/               # Compiled TypeScript files
├── public/             # Static assets
│   ├── css/            # CSS styles
│   └── js/             # Client-side JavaScript
├── src/                # Source code
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── routes/         # Express routes
│   ├── views/          # EJS templates
│   └── app.ts          # Main application file
├── .env                # Environment variables
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## Development

- Use `npm run dev` to start the development server with hot-reloading
- Use `npm run build` to compile TypeScript to JavaScript
- Use `npm start` to run the compiled JavaScript

## License

This project is licensed under the MIT License. See the LICENSE file for more details.