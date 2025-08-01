This document provides a detailed, step-by-step implementation plan for the "Life Story Machine" application, following the technical architecture of a Next.js project with MongoDB, Tailwind CSS, and Resend. Each instruction is designed to be small and specific, and each step includes a validation test. No code is included in this plan.

## 1. Project Setup and Infrastructure

### 1.1 Next.js Project Initialization

- **Instruction:** Create a new Next.js project without a `src` directory, using JavaScript and the App Router. Configure Tailwind CSS during the setup.
- **Test:** Verify the project structure is created correctly and Tailwind CSS is configured by applying a utility class to a component and checking its effect in a browser.

### 1.2 Database Connection Setup

- **Instruction:** Install the MongoDB driver or Mongoose. Create a `lib/mongodb.js` file to handle the database connection. Configure the MongoDB connection string as an environment variable (`MONGODB_URI`).
- **Test:** Create a temporary API route that attempts to connect to the database. Verify the route returns a success message in the browser, confirming the connection is established.

### 1.3 External API Configuration

- **Instruction:** Store the API keys for the OpenAI API (for both STT and LLM) and Resend as environment variables in the project's `.env.local` file.
- **Test:** Create a temporary API route that logs these environment variables. Verify the keys are loaded and displayed correctly in the server logs.

## 2. Authentication and Database Implementation

### 2.1 User Schema Definition

- **Instruction:** Define a schema for the `users` collection in MongoDB. The schema should be simple, containing only fields for the `email` and an authentication token or a hashed password.
- **Test:** Use a database tool to connect to MongoDB and verify the `users` collection is created with the defined schema when the application first interacts with it.

### 2.2 Authentication API Routes

- **Instruction:** Create a Next.js API route at `app/api/auth/route.js` to handle user registration and login. Implement the logic to create a new user document in MongoDB (if they don't exist) and generate a secure session token (e.g., using a library like `jsonwebtoken`).
- **Test:**
    - Send a POST request to the registration endpoint with a test email. Verify a new user is created in MongoDB.
    - Send a POST request to the login endpoint with a valid email. Verify the API route returns a session token.

## 3. Frontend Development

### 3.1 UI Components for Authentication

- **Instruction:** Create React components for the login/registration form. Use Tailwind CSS for styling the input fields, buttons, and error messages.
- **Test:** Navigate to the login page. Verify the form fields are responsive, and the styling is consistent with the Tailwind configuration.

### 3.2 UI Components for Recording

- **Instruction:** Create a main application component that displays a prominent "Start Recording" button, a recording indicator (e.g., a timer or pulsating icon), and a message area for status updates.
- **Test:** Navigate to the main recording page. Verify all UI elements are visible and properly styled.

## 4. Client-Side Functionality

### 4.1 Microphone Access and Recording

- **Instruction:** Implement a custom React hook or component that uses the `MediaRecorder` API to handle microphone access, recording start/stop, and collecting the audio data.
- **Test:** Click the "Start Recording" button. Verify the browser prompts for microphone permission. After granting permission, verify the recording indicator becomes active.

### 4.2 Frontend-to-Backend API Call

- **Instruction:** On the "Stop Recording" event, use the browser's `fetch` API to send the captured audio data to the `/api/story-process` route.
- **Test:**
    - Record a short clip and click "Stop."
    - Monitor the browser's network tab. Verify a POST request is sent to `/api/story-process` with the audio data in the request body.

## 5. Backend Processing and Service Integration

### 5.1 Story Processing API Route

- **Instruction:** Create the main processing route at `app/api/story-process/route.js`. This route will receive the audio data, but initially, it should only log a success message and return a confirmation.
- **Test:** Send a recording from the frontend to this route. Verify the route logs the request and sends a success response back to the client.

### 5.2 Speech-to-Text (STT) Integration

- **Instruction:** Within the `story-process` route, add logic to send the received audio data to the OpenAI API for transcription. Wait for the response and log the transcribed text.
- **Test:** Send an audio file containing a simple phrase. Verify the server logs show the correct text transcription returned by the OpenAI API.

### 5.3 LLM Integration (OpenAI)

- **Instruction:** Use the transcribed text to create a prompt for the OpenAI LLM. Send a request to the OpenAI API and wait for the generated story. Implement logic to immediately purge any ephemeral conversation data related to this session.
- **Test:** Send a transcribed text that requires a narrative response (e.g., "Tell me about growing up on a farm."). Verify the server logs display a coherent, generated story from the LLM.

### 5.4 Email Delivery Integration (Resend)

- **Instruction:** After the story is generated, use the Resend API to send an email. The email's content should be the generated story, and the recipient should be the user's email (obtained from the session token).
- **Test:** Perform a full story generation cycle. Verify that an email containing the generated story is successfully delivered to the user's inbox.

## 6. Final Touches and Testing

### 6.1 Loading and Error States

- **Instruction:** Implement state management on the frontend to display loading indicators (e.g., a spinner) while the backend processes the request. Implement error handling to display user-friendly messages for failed API calls.
- **Test:**
    - Initiate a story generation and verify the loading indicator is displayed.
    - Disconnect from the internet or intentionally create a backend error. Verify a clear error message is shown on the frontend.

### 6.2 End-to-End User Flow

- **Instruction:** Manually test the complete user journey:
    1. Register with a new email.
    2. Record a life story.
    3. Verify the story is successfully generated and emailed.
    4. Log out and log back in.
    5. Repeat the process.
- **Test:** Verify all steps of the user flow are completed successfully without any errors or unexpected behavior. The generated stories must be delivered correctly to the registered email address.