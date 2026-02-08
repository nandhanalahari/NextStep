# NextStep

AI micro-mentor that turns goals into daily, achievable next steps.

## Features

- **AI goal decomposition** — Describe a goal; Gemini breaks it into a step-by-step roadmap of tasks.
- **Voice mentoring** — Listen to a spoken summary of your current step and why it matters (ElevenLabs TTS).
- **One step at a time** — Complete tasks in order; each completion requires a short summary before moving on.
- **Due dates & calendar** — Set due dates on tasks. In-app calendar shows Upcoming and Completed lists; month view shows which days have tasks.
- **Google Calendar sync** — Connect your account to sync upcoming tasks to Google Calendar (events at 11:59 PM). Events update or remove when you change or clear due dates, complete tasks, or delete tasks.
- **Sign in with Google** — Create an account or log in with Google (optional; email/password also supported).
- **Reflections** — When you finish a goal, record satisfaction and thoughts on your journey.

## How to run

1. Copy the example env and add your values:

   ```bash
   cp .env.local.example .env.local
   ```

2. Set in `.env.local`:
   - **MONGODB_URI** — [MongoDB Atlas](https://cloud.mongodb.com) connection string.
   - **AUTH_SECRET** — e.g. `openssl rand -base64 32`
   - **GOOGLE_GENERATIVE_AI_API_KEY** — [Google AI Studio](https://aistudio.google.com/apikey) (for goal → roadmap).
   - **ELEVENLABS_API_KEY** — [ElevenLabs](https://elevenlabs.io/app/settings/api-keys) (for Voice Mentor).
   - **GOOGLE_CLIENT_ID**, **GOOGLE_CLIENT_SECRET**, **GOOGLE_REDIRECT_URI** — Optional; for Sign in with Google and Google Calendar. Redirect URI: `http://localhost:3000/api/auth/google/callback` (or your app URL).

3. Install and start:

   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Tech stack

| Layer        | Technology |
|-------------|------------|
| Front end   | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS |
| API / auth  | Next.js API routes, JWT (jose), bcrypt, HTTP-only cookie session |
| Database    | MongoDB |
| AI / plans  | Google Gemini 2.5 Flash (goal → task roadmap) |
| Voice       | ElevenLabs API (TTS for Voice Mentor) |
| Calendar    | Google Calendar API (sync tasks, 11:59 PM events) |
| OAuth       | Google OAuth 2.0 (Sign in with Google, Calendar scope) |
