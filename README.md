# Project Structure Documentation

## Overview

The project is organized into several directories, each serving a specific purpose. This structure supports a Vite + React frontend and an Express backend, with Firebase and other integrations.

## Directory Structure

````plaintext
└── 📁video-call
    └── 📁api
        └── fetchlogs.js
        └── login.js
        └── meeting-add-participant.js
        └── meeting-participants.js
        └── meeting.js
        └── recording.js
        └── signup.js
    └── 📁public
        └── file.svg
        └── logo.svg
        └── vite.svg
    └── 📁server
        └── .env
        └── package-lock.json
        └── package.json
        └── server.mjs
        └── serviceAccountKey.json
    └── 📁src
        └── 📁assets
            └── 📁HomePage
                └── exit.png
                └── home.png
                └── join.png
                └── log.png
                └── logo.png
                └── moaed.jpg
                └── rami.jpg
                └── ronen.png
                └── social.png
                └── workshop.png
            └── react.svg
        └── 📁components
            └── 📁Home
                └── CreateMeeting.css
                └── CreateMeeting.tsx
                └── HomePage.css
                └── HomePage.tsx
                └── JoinMeeting.tsx
                └── Logs.css
                └── Logs.tsx
            └── 📁Login
                └── Login.css
                └── LoginPage.tsx
            └── 📁SignUp
                └── SignupPage.css
                └── SignupPage.tsx
            └── VideoClientContext.tsx
        └── App.css
        └── App.tsx
        └── index.css
        └── main.tsx
        └── style.css
        └── vite-env.d.ts
    └── .eslintrc.cjs
    └── .gitignore
    └── index.html
    └── package-lock.json
    └── package.json
    └── ProcFile
    └── README.md
    └── tailwind.config.js
    └── tsconfig.app.json
    └── tsconfig.json
    └── tsconfig.node.json
    └── vercel.json
    └── vite.config.ts
    ```
# Project Structure Documentation

## Explanation

### `api` Folder

- **Purpose**: Contains route handlers for API requests.
- **Files**:
  - `fetchlogs.js`: Handles fetching logs for users from Firestore.
  - `login.js`: Manages user login functionality.
  - `meeting-add-participant.js`: Adds participants to meetings.
  - `meeting-participants.js`: Retrieves participants for meetings.
  - `meeting.js`: Manages meeting creation and management.
  - `recording.js`: Handles operations related to recording.
  - `signup.js`: Manages user signup functionality.

### `public` Folder

- **Purpose**: Stores static assets that are publicly accessible.
- **Files**:
  - Various SVG files (e.g., `file.svg`, `logo.svg`) and other static image resources.

### `server` Folder

- **Purpose**: Contains server-side files and configuration for local development.
- **Files**:
  - `.env`: Environment variables for the backend server.
  - `package-lock.json` & `package.json`: Dependencies and configurations for the server.
  - `server.mjs`: Server entry point used for local development. **Note**: This file is only for local use. When deploying to Vercel, Vercel automatically serves the functions defined in the `api` folder and does not require `server.mjs`.
  - `serviceAccountKey.json`: Service account key for Firebase access.

### `src` Folder

- **Purpose**: Contains the frontend source code.
- **Subfolders**:
  - **`assets`**: Holds static assets and images used in the frontend.
  - **`components`**: Contains React components organized by feature (e.g., Home, Login, SignUp).
- **Files**:
  - Various TypeScript (`.tsx`) and CSS (`.css`) files used for styling and building the frontend components.

### Root Directory

- **Files**:
  - `.eslintrc.cjs`: Configuration file for ESLint.
  - `.gitignore`: Specifies files and directories to be ignored by Git.
  - `index.html`: Main HTML file for the frontend.
  - `package-lock.json` & `package.json`: Dependencies and configurations for the entire project.
  - `ProcFile`: Used by certain platforms for process management.
  - `README.md`: Project overview and setup instructions.
  - `tailwind.config.js`: Configuration file for Tailwind CSS.
  - `tsconfig.app.json`, `tsconfig.json`, `tsconfig.node.json`: TypeScript configuration files.
  - `vercel.json`: Vercel deployment configuration.
  - `vite.config.ts`: Configuration file for Vite.

## Additional Notes

- **Route Handlers**: All route handlers are located in the `api` folder. This includes all backend logic for managing API requests.
- **Local Development**: `server.mjs` is used to start the server locally and manage environment variables. This file is not used in production, as Vercel automatically handles the API routes defined in the `api` folder.

## Deployment Instructions

### Vercel Deployment

1. **Push to Repository**: Ensure that your latest changes are committed and pushed to your repository.
2. **Connect to Vercel**:
   - Log in to your Vercel account.
   - Create a new project and connect it to your repository.
3. **Configure Deployment**:
   - Vercel will automatically detect the `vercel.json` configuration and set up the deployment environment.
4. **Deploy**:
   - Click "Deploy" to start the deployment process.
   - Vercel will handle building and deploying the project based on the configuration provided.

   **Note**: Ensure that environment variables used in your project (e.g., Firebase API keys) are set up correctly in the Vercel dashboard under the project settings.

## Maintenance and Updates

To ensure continued operation and usability of the project, follow these guidelines:

- **Apply Updates**: Regularly check for updates to dependencies and apply them as needed.
- **Monitor Logs**: Use the logs provided by Vercel or your local server to monitor and troubleshoot issues.
- **Backup Data**: Regularly back up your Firebase Firestore database to prevent data loss.
- **Review Code**: Periodically review and refactor the codebase to improve performance and maintainability.

For detailed instructions on setting up and using specific tools and libraries, refer to their respective documentation:

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express.js Documentation](https://expressjs.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
````
