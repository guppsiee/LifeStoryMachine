## 1. Introduction

This document outlines the requirements for the "Life Story Machine" application, a simple and intuitive tool designed to help elderly individuals record and preserve their life stories. The app will capture voice recordings, leverage a Large Language Model (LLM) to transform these recordings into coherent written narratives, and then deliver the completed story to the user's registered email address. The primary goal is to provide an easy-to-use platform for sharing personal histories without complexity.

## 2. Goals

- **Enable effortless story creation:** Provide a straightforward interface for users to record their life experiences through voice.
- **Automate narrative generation:** Utilize an LLM to convert spoken narratives into well-structured, readable written stories.
- **Ensure data privacy and ephemerality:** Implement a system where conversational memory is cleared after each story is completed, and the final story is delivered via email, with no persistent storage within the app itself.
- **Promote accessibility:** Design the app to be simple and intuitive, catering to an older demographic with varying technical proficiencies.
- **Facilitate sharing:** Automatically deliver the generated story to the user's email for easy sharing and archival.

## 3. Target Audience

- **Primary:** Elderly individuals (e.g., 65+) who wish to share their life experiences but may find typing or complex digital interfaces challenging.
- **Secondary:** Family members or caregivers who might assist the primary users in setting up or using the app.

## 4. Key Features

### 4.1 User Authentication

- **Email Registration/Login:** Users will register and log in using their email address. This email will be used for story delivery.
- **Simple Authentication:** Prioritize ease of use (e.g., magic link or simple password setup) over complex security protocols, while still ensuring basic account security.

### 4.2 Voice Recording Interface

- **Start/Stop Recording:** A prominent, easy-to-tap button to initiate and conclude voice recording sessions.
- **Recording Indicator:** Clear visual feedback (e.g., a pulsating icon, a timer) to indicate that recording is active.
- **Pause/Resume (Optional but Recommended):** Ability to pause and resume recording within a single session to allow for breaks.
- **Microphone Access:** The app must request and obtain microphone permissions.

### 4.3 Story Generation (LLM Integration)

- **Speech-to-Text (STT):** Convert the recorded audio into text.
- **LLM Processing:** The transcribed text will be fed to an LLM (e.g., `gemini-2.5-flash-preview-05-20` or similar) to generate a cohesive narrative.
    - **Prompt Engineering:** The system will use a pre-defined prompt to guide the LLM in structuring the story, focusing on clarity, flow, and narrative coherence based on the user's spoken input.
    - **Contextual Memory (Ephemeral):** The LLM will maintain conversational context *only* for the duration of a single story creation session. Once the story is finalized and sent, this context will be immediately cleared.
- **Progress Indicator:** A visual indicator (e.g., spinner, progress bar) during the story generation process.

### 4.4 Story Delivery

- **Email Integration:** The generated story will be sent as plain text or a simple HTML email to the user's registered email address.
- **Email Content:** The email will contain the full generated story and a simple subject line (e.g., "Your Life Story from [App Name]").

### 4.5 Data Management & Privacy

- **No Persistent In-App Storage:** The app will *not* store user voice recordings or generated stories on its servers after the email delivery is confirmed.
- **Ephemeral Memory:** Any conversational context or temporary data used by the LLM during story generation will be immediately purged upon story completion and email delivery.
- **User Data:** Only the registered email address will be stored for authentication and delivery purposes.

## 5. User Flow

1. **Launch App:** User opens the Life Story Machine app.
2. **Login/Register:**
    - **First-time User:** Enters email address, receives a verification/magic link, and logs in.
    - **Returning User:** Enters email address and logs in.
3. **Main Screen:** User sees a clear "Start Recording" button.
4. **Start Recording:** User taps "Start Recording." Microphone icon/timer indicates active recording.
5. **Speak Life Story:** User speaks their life story. Can optionally pause/resume.
6. **Stop Recording:** User taps "Stop Recording."
7. **Processing:** App displays a "Generating Story..." message with a progress indicator.
8. **Story Generation (Backend):**
    - Audio is transcribed to text.
    - Text is sent to LLM for narrative generation.
    - LLM response is received.
9. **Email Delivery:** The generated story is immediately emailed to the user's registered address.
10. **Confirmation:** App displays "Story Sent to Your Email!" message.
11. **Memory Clear:** All temporary conversational context and transcribed text for that session are purged.
12. **Ready for New Story:** App returns to the main screen, ready for a new recording.

## 6. Technical Requirements

- **Frontend:** Web-based application (HTML, CSS, JavaScript) for maximum accessibility across devices (desktop, tablet, mobile browsers).
    - Responsive design is crucial.
- **Backend:**
    - **Speech-to-Text (STT) API:** Integration with a reliable STT service (e.g., Google Cloud Speech-to-Text API, or a similar service).
    - **LLM API:** Integration with a powerful LLM (e.g., `gemini-2.5-flash-preview-05-20` or `gemini-1.5-flash` for text generation).
    - **Email Service:** Integration with an email sending service (e.g., SendGrid, Mailgun, or a simple SMTP setup) to send stories.
    - **Authentication Service:** Firebase Authentication or a similar service for user login/registration.
- **Database (Minimal):** A simple database (e.g., Firestore if Firebase Auth is used) to store only user email addresses for authentication purposes. No story content or audio should be stored.
- **Hosting:** Cloud-based hosting (e.g., Google Cloud Platform, AWS, Heroku).

## 7. Non-Functional Requirements

- **Usability:**
    - **Simplicity:** Minimal buttons, clear instructions, large touch targets.
    - **Intuitive Design:** Easy to understand the purpose of each element.
    - **Accessibility:** Consider features for users with visual or auditory impairments (e.g., high contrast, clear audio prompts).
- **Performance:**
    - **Fast Recording Start:** Near-instantaneous start of recording.
    - **Efficient Processing:** Story generation and email delivery should be completed within a reasonable timeframe (e.g., under 30-60 seconds for a typical story).
- **Security:**
    - **Data in Transit:** All communication between the client and server, and with APIs, must be encrypted (HTTPS/SSL).
    - **Authentication Security:** Secure handling of user credentials.
    - **Data Purging:** Strict adherence to the ephemeral memory policy.
- **Scalability:** The backend infrastructure should be able to handle a growing number of users and concurrent story generation requests.
- **Reliability:** High uptime for all services (STT, LLM, Email).
- **Maintainability:** Codebase should be well-documented, modular, and easy to update.

## 8. Future Enhancements (Optional)

- **Story Editing:** Allow users to review and make minor text edits to the generated story before it's emailed.
- **Multiple Story Formats:** Option to send stories in different formats (e.g., PDF, plain text download).
- **Thematic Prompts:** Provide optional prompts or questions to guide the user's storytelling (e.g., "Tell me about your childhood," "Describe a memorable journey").
- **Language Support:** Support for multiple languages for recording and story generation.
- **Feedback Mechanism:** A simple way for users to provide feedback on story quality or app usability.