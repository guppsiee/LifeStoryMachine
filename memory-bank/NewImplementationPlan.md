Here's an implementation plan focused exclusively on the newly added and updated features for your Life Story Machine app. This plan assumes you've already completed the initial implementation steps.

---

## 1. Project Setup and Initial Infrastructure (Updates)

### 1.2 Database Connection and Environment Variables (Update)
* **Instruction:** Ensure `RESEND_API_KEY` is configured as an environment variable in `.env.local`.
* **Test:** Create a temporary API route that logs this environment variable. Verify the key is loaded and displayed correctly in the server logs.

---

## 3. Frontend UI Development (Updates)

### 3.1 Landing Page (`app/page.js`) (New)
* **Instruction:** Design and implement the landing page. Include a welcome message, a brief description of the app, and two prominent buttons: "Login" and "Register." Use Tailwind CSS for styling.
* **Test:** Navigate to the root URL (`/`). Verify the landing page loads, is responsive, and the buttons are clearly visible and clickable.

### 3.2 Login/Register Pages (`app/login/page.js`, `app/register/page.js`) (New/Modified)
* **Instruction:** Create dedicated pages for login and registration. Implement forms that send data to the `/api/auth` endpoints. Handle successful authentication by redirecting to the main app page (`/app`).
* **Test:**
    * From the landing page, click "Register" and complete the process. Verify redirection to `/app`.
    * From the landing page, click "Login" and complete the process. Verify redirection to `/app`.

### 3.3 Main App Page (`app/app/page.js`) (Update)
* **Instruction:** Update the main app interface to include:
    * A "Generate Story" button.
    * A "Reset Session" button.
    * A display area for the current session's accumulated text (scrollable).
* **Test:** Navigate to `/app` after logging in. Verify these new UI elements are present, styled with Tailwind, and responsive.

---

## 4. Client-Side Functionality (Update)

### 4.2 Frontend-to-Backend API Call for Segment Processing (Update)
* **Instruction:** On the "Stop Recording" event, use the browser's `fetch` API to send the captured audio data to the **`/api/process-segment`** route.
* **Test:**
    * Record a short clip and click "Stop."
    * Monitor the browser's network tab. Verify a POST request is sent to `/api/process-segment` with the audio data in the request body.

---

## 5. Session History Management (Backend & Frontend) (New Section)

### 5.1 MongoDB Session History Schema (New)
* **Instruction:** Define a MongoDB schema for the `sessionHistory` collection. Each document should have `userId` (indexed), `segments` (an array of strings), and `lastUpdated` (timestamp).
* **Test:** After implementing the `process-segment` API, verify a new `sessionHistory` document is created in MongoDB for the user, matching the schema.

### 5.2 Audio Segment Processing API (`app/api/process-segment/route.js`) (New)
* **Instruction:** Implement a `POST` handler to receive audio segments.
    * Transcribe audio using the STT API.
    * Find the user's `sessionHistory` document. If it doesn't exist, create it.
    * **Append the transcribed text to the `segments` array in the document.** Update `lastUpdated`.
    * Return the updated session history to the frontend.
* **Test:**
    * Record a short audio segment. Verify the `sessionHistory` document is created/updated in MongoDB with the transcribed text appended.
    * Record a second segment. Verify the new text is appended to the *same* document.

### 5.3 Session Management API (`app/api/session/route.js`) (New)
* **Instruction:**
    * Implement a `GET` handler to retrieve the current user's session history from MongoDB.
    * Implement a `DELETE` handler to remove the user's `sessionHistory` document from MongoDB (for "Reset Session").
* **Test:**
    * After recording a segment, send a GET request to `/api/session`. Verify the accumulated text is returned.
    * Send a DELETE request to `/api/session`. Verify the `sessionHistory` document is removed from MongoDB.

### 5.4 Frontend Session History Display & Reset (New)
* **Instruction:**
    * On `app/app/page.js` load, fetch the current session history using `GET /api/session` and display it in the designated area.
    * After each audio segment is processed, update the displayed session history with the new data received from `POST /api/process-segment`.
    * Implement the "Reset Session" button to call `DELETE /api/session` and clear the local display.
* **Test:**
    * Record multiple segments. Verify the displayed text updates after each segment.
    * Refresh the page. Verify the previously recorded segments are still displayed.
    * Click "Reset Session." Verify the displayed text clears, and subsequent recordings start a new session.

---

## 6. Story Generation and Email Delivery (Updates)

### 6.1 Story Generation API (`app/api/generate-story/route.js`) (Update)
* **Instruction:** Implement a `POST` handler for "Generate Story."
    * Retrieve ***all*** segments from the user's `sessionHistory` document in MongoDB.
    * Concatenate segments into a single text for the LLM.
    * Call the Gemini LLM API with the combined text and a suitable prompt.
    * Call the Resend API to send the generated story to the user's email.
    * **Crucially, after successful email sending, delete the user's `sessionHistory` document from MongoDB.**
* **Test:**
    * Record several segments. Click "Generate Story."
    * Verify an email with the complete story is received.
    * Verify the user's `sessionHistory` document is deleted from MongoDB.

### 6.2 Frontend "Generate Story" Integration (Update)
* **Instruction:** Implement the "Generate Story" button to call `POST /api/generate-story`. Display a loading indicator during processing and a "Story Sent!" confirmation message afterward. Clear the local session history display.
* **Test:** Click "Generate Story." Verify the loading indicator appears, and upon completion, the "Story Sent!" message is displayed, and the local history clears.

---

## 7. UI Enhancements (New Section)

### 7.1 Tailwind CSS Customization (New)
* **Instruction:** Define a custom color palette, fonts (e.g., Inter), and rounded corners in `tailwind.config.js`. Apply these consistently across all components.
* **Test:** Verify the app's visual style adheres to the defined palette and typography.

### 7.2 Animations and Transitions (New)
* **Instruction:** Add subtle CSS animations (e.g., for button hovers, recording indicator pulsation, loading spinners) and transitions (e.g., for state changes) using Tailwind's animation utilities.
* **Test:** Interact with buttons, start/stop recording, and trigger loading states. Verify smooth visual feedback and animations.

### 7.3 Iconography (New)
* **Instruction:** Integrate a lightweight icon library (e.g., Lucide React or inline SVGs) for key actions (e.g., microphone icon, send icon, reset icon).
* **Test:** Verify relevant icons are displayed correctly next to their corresponding actions.

---

## 8. Testing and Deployment (Updates)

### 8.2 End-to-End User Flow Testing (Update)
* **Instruction:** Perform comprehensive manual testing of the entire application on various devices and browsers, covering all user flows:
    * **Landing page navigation.**
    * Registration, login, and logout.
    * **Recording multiple segments within a session.**
    * **Resetting a session.**
    * Generating and receiving a story via email.
    * Error handling scenarios.
* **Test:** Successfully complete all user flows multiple times, ensuring data consistency and correct behavior.