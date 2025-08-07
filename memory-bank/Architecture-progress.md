# Architecture Progress

## Foundational Architecture in Place

The initial architecture has been implemented, providing a solid foundation for the project.

- The Next.js project is set up with the App Router.
- The backend is ready to handle API requests.
- The system is configured to use OpenAI for STT and LLM services and Resend for email.

## Authentication and Database Schema

- **`lib/mongodb.js`**: This file contains the logic for connecting to the MongoDB database. It uses a caching mechanism to prevent multiple connections during development. The `dbConnect` function is exported as a default export.

- **`models/user.js`**: Defines the `User` schema using Mongoose. It includes fields for `email` and a hashed `password`, ensuring that user data is structured and validated before being stored in MongoDB.

- **`models/sessionHistory.js`**: Defines the `SessionHistory` schema for storing user session data, including an array of transcribed text segments.

## API Routes

- **`app/api/auth/register/route.js`**: This API route provides the backend logic for user registration. It handles incoming `POST` requests, validates the data, hashes the password for security, and creates a new user in the database.

- **`app/api/auth/login/route.js`**: This API route handles user authentication. It validates credentials, and upon success, it creates a JWT and sets it as an HTTP-only cookie.

- **`app/api/process-segment/route.js`**: This API route receives an audio segment, transcribes it, and saves the transcript to the user's session history in the database.

- **`app/api/session/route.js`**: Provides `GET` and `DELETE` endpoints for managing a user's session history.

- **`app/api/generate-story/route.js`**: This API route generates a life story from the user's session history, sends it to their email, and then clears the session from the database.

## Frontend Components

- **`app/components/AuthForm.js`**: A reusable client component that provides the UI for both registration and login. It includes fields for email and password, a submit button, and handles basic form state and error display.

- **`app/register/page.js`** and **`app/login/page.js`**: These pages implement the `AuthForm` component to create the registration and login experiences. They contain the logic for handling form submissions and routing.

- **`app/components/RecordingComponent.js`**: The core UI for the application's main feature. It includes a "Start/Stop Recording" button, a status message display, and a visual recording indicator, providing a user-friendly interface for capturing audio.

- **`app/page.js`**: The main landing page of the application, which provides a welcome message and navigation to the login and registration pages.

- **`app/app/page.js`**: This is the main application page that users are redirected to after a successful login. It contains the main UI for the application, including the recording component and the session transcript display.
