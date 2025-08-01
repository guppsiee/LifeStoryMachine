## 1. Introduction

This document outlines the technical architecture for the "Life Story Machine" application, as defined by the Product Requirements Document (PRD). This version of the architecture is tailored to the specified technology stack: a Next.js project using the App Router, JavaScript, no `src` folder, MongoDB, Tailwind CSS, and Resend for email delivery.

The core principle remains a simple, privacy-focused application, but the implementation shifts to a full-stack Next.js framework, consolidating both the frontend and backend logic into a single, cohesive codebase.

## 2. High-Level Architecture

The application will be a monolithic, full-stack Next.js application, where the frontend UI and the backend API logic reside within the same project. The Next.js App Router will handle all routing, and API routes will serve as the backend. This architecture simplifies deployment and development by keeping the entire stack within one repository.

```
+-------------------+       +------------------------------------------------+
|                   |       |                                                |
|   Web Browser     |       |   Next.js Application (App Router)             |
| (Client-Side App) |       |   (Hosted on Vercel or similar)                |
|                   |       |                                                |
| +---------------+ |       | +------------------------------------------+   |
| | User Interface| |       | |  Next.js Pages & Components              |   |
| | (React, JS)   |<-------->| |  (UI, Auth, Recording)                   |   |
| | (Tailwind CSS)| |       | +------------------------------------------+   |
| +---------------+ |       |                     |                          |
|         |         |       | +------------------------------------------+   |
| +---------------+ |       | |  Next.js API Routes                      |   |
| | Audio Recorder| |       | |  (e.g., /api/story-process)              |   |
| | (Web Audio API)|<------->| |                                          |   |
| +---------------+ |       | +------------------------------------------+   |
|                   |       |                     |              |           |
+---------|---------+       |    +----------------+-----------+  |           |
          |                 |    | MongoDB (via native driver   |  |           |
          |                 |    |   or Mongoose)              |  |           |
          |                 |    +-----------------------------+  |           |
          |                 |                                     |           |
          |                 | +---------------------------------+ |           |
          |                 | | External APIs (OpenAI)          | |           |
          |                 +>| (STT and LLM)                   | |           |
          |                   +---------------------------------+ |           |
          |                                                       |           |
          |                 +---------------------------------+   |           |
          +----------------->| Email Service (Resend)          |   |           |
                             +---------------------------------+   |           |
                                                               |   |           |
                                                               +---+-----------+

```

## 3. Component Breakdown

### 3.1 Frontend (Next.js Pages & Components)

- **Technology:** Next.js (App Router), React, JavaScript, Tailwind CSS.
- **Key Modules:**
    - **UI Components:** The main application layout, buttons, forms, and message displays will be built using React components styled with Tailwind CSS for a fully responsive and clean design.
    - **Audio Recorder:** The client-side logic will use the `MediaRecorder` API to capture and manage audio input from the user's microphone. The captured audio data will be sent to the backend via a Next.js API route.
    - **State Management:** React's built-in hooks (`useState`, `useReducer`, `useContext`) will manage the application's state, such as recording status, loading state, and authentication status.
    - **Client-Side Fetching:** The `fetch` API will be used to interact with Next.js API routes for all backend operations, ensuring a secure and efficient data exchange.

### 3.2 Backend (Next.js API Routes)

- **Technology:** Next.js API Routes, JavaScript.
- **Key Modules:**
    - **Authentication Route (`/api/auth`):**
        - Handles user registration and login.
        - Will likely use a token-based authentication scheme (e.g., JWTs) to manage user sessions.
        - Interacts with MongoDB to store and retrieve user data.
    - **Story Processing Route (`/api/story-process`):**
        - This will be the central API endpoint for a story generation request.
        - It will receive the audio data from the client.
        - It will act as a proxy, securely forwarding the audio data to the external STT API.
        - It will receive the transcribed text from the STT API.
        - It will forward the transcribed text to the OpenAI LLM API.
        - It will receive the generated story from the LLM API.
        - Finally, it will call the Resend API to send the email and then delete all ephemeral data related to the story.
    - **Helper Functions:** The API routes will utilize dedicated helper functions for tasks like prompt engineering, API key management, and database interactions to maintain a clean codebase.

### 3.3 Database (MongoDB)

- **Technology:** MongoDB.
- **Key Usage:**
    - A single collection, `users`, will store user-specific information.
    - This collection will only contain the user's email address and authentication-related data (e.g., hashed password, session tokens).
    - **Crucially, no story content, audio recordings, or conversational context will ever be stored persistently in MongoDB.**
    - The native MongoDB driver or a library like Mongoose will be used for database interactions from the Next.js API routes.

### 3.4 External Services

- **OpenAI API:** The OpenAI API will be used for both Speech-to-Text (STT) transcription and for the core story generation with their LLM. The Next.js backend will act as a secure proxy.
- **Email Delivery (Resend):** The Resend API will be integrated into the Next.js backend to send the final generated story via email. Resend's API is designed for ease of use and high deliverability.

## 4. Data Flow

1. **User Login/Registration:**
    - The user submits their email/password (or uses a magic link) via the frontend.
    - The frontend sends a request to the `/api/auth` route.
    - The API route interacts with MongoDB to create or verify the user and generates a secure session token.
    - The token is sent back to the client and stored securely (e.g., in a cookie).
2. **Story Generation Request:**
    - The user records their story using the `MediaRecorder` API on the frontend.
    - Upon stopping, the frontend sends the recorded audio data to the `/api/story-process` route.
3. **Backend Processing:**
    - The `/api/story-process` route receives the audio and:
        - Calls the OpenAI API to transcribe the audio to text.
        - Calls the OpenAI API with the transcribed text and a pre-defined prompt to generate the story.
        - **Immediately purges any temporary data related to the session.**
    - Once the story is generated, the API route:
        - Calls the Resend API with the generated story text and the user's email (obtained from the session token).
        - Sends a confirmation response back to the client.
4. **Confirmation & Cleanup:**
    - The frontend receives the success response and updates the UI to show a confirmation message.
    - Client-side temporary data is cleared.

## 5. Security Considerations

- **API Route Security:** All API routes will be protected by session validation to ensure only authenticated users can trigger the story generation process.
- **Environment Variables:** All sensitive information, including API keys for OpenAI and Resend, as well as the MongoDB connection string, will be stored securely in environment variables and never exposed to the client-side. Next.js handles this seamlessly.
- **Data Minimization:** No user-generated content (audio or stories) is stored in the database. The only persistent data is the user's email for authentication.
- **Data in Transit:** Vercel (or other hosting platforms) automatically provides HTTPS, ensuring all data transmitted between the client and server is encrypted.
- **Input Validation:** All data received by the API routes will be validated and sanitized to prevent common vulnerabilities like injection attacks.

## 6. Scalability Considerations

- **Next.js & Vercel:** Next.js apps deployed on Vercel benefit from automatic scaling, a global CDN for static assets, and serverless functions for API routes, ensuring the application can handle increased traffic without manual intervention.
- **MongoDB Atlas:** Using a managed MongoDB service like Atlas provides a highly scalable and reliable database solution.
- **Stateless Backend:** The Next.js API routes are designed to be stateless, with ephemeral memory for story generation, making horizontal scaling straightforward.
- **External Services:** The OpenAI and Resend APIs are highly scalable services, capable of handling a large volume of requests.

This architecture provides a robust, scalable, and secure foundation for the Life Story Machine, adhering to the specified technology stack while maintaining the core principles of the PRD.