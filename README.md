# NextStep

AI micro-mentor that turns goals into daily, achievable next steps. Set due dates on tasks, track progress in an in-app calendar, and hear a voice briefing for your next step.

## Using the Web App

### Landing page

Open [http://localhost:3000](http://localhost:3000) to see the landing page. Browse **Features**, **How It Works**, and **FAQ**. Use **Get Started** or **Log in** in the top-right.

### Sign up

1. Click **Get Started**.
2. Enter your name and email, then click **Continue**.
3. Set a password (min. 8 characters) and click **Create Account**.
4. You'll be taken to your dashboard.

### Log in

1. Click **Log in**.
2. Enter your email and password.
3. Click **Sign In** to go to your dashboard.

### Dashboard

Your dashboard lists your active goals as cards. Each card shows:

- Goal title and description
- Progress (e.g. 2 of 5 tasks)
- A preview of tasks

Use **New Goal** to create a goal, **Calendar** to see tasks by due date, or **Completed** to see goals you've finished or partially finished.

### Creating a new goal

1. Click **New Goal** (or **Create Your First Goal** if empty).
2. Describe your goal in the text box (e.g. "Land a software engineering internship").
3. Optionally use the example buttons (Learn machine learning, Get a tech internship, etc.).
4. Click **Generate Plan**.
5. The AI generates a title, description, and task list.
6. Review the plan, then click **Save to Dashboard** to add it to your goals.
7. Or use **Try a Different Goal** to generate another plan.

### Goal detail (roadmap)

1. Click a goal card to open its roadmap.
2. **Voice Mentor** – Each goal has a summary section. Click **Listen** to hear a calm voice briefing: "Today's next step is… here's why it matters."
3. **Due dates** – Set a due date on any unlocked task using the date picker. View all due tasks on the **Calendar** page.
4. Tasks appear left to right in sequence.
5. Only the next incomplete task can be worked on; earlier ones are unlocked by completing previous tasks.
6. Click a task's checkbox to mark it complete.
7. In the dialog, enter a short summary of what you did and click **Mark complete**.
8. Use the **+** between tasks to add custom tasks.
9. Use the trash icon on a task to delete it.
10. Click **Delete Goal** (top-right) to remove the goal.

### Completing a goal

When you complete the last task, a **Reflect on your journey** dialog appears. You can:

- Rate satisfaction (1–5)
- Describe how you felt at the start and at the end
- Click **Save reflection** to finish

### Calendar

1. Click **Calendar** in the dashboard nav.
2. Use the month view to see which days have due tasks; use the arrows or **Today** to change month.
3. **Upcoming** lists only *incomplete* tasks with due dates from today onward, grouped by date. Click a task to open its goal.
4. **Completed** lists tasks you’ve already finished that had due dates, grouped by date (newest first). Click a task to open its goal.
5. Due dates are set on the goal roadmap (date picker under each unlocked task). They display in your local timezone.

### Completed goals page

1. Click **Completed** on the dashboard.
2. View goals **In Progress** (some tasks done) and **Achieved** (all tasks done).
3. Click a goal to see its roadmap and reflection.

---

## Getting started

### 1. Environment

Copy the example env and fill in your values:

```bash
cp .env.local.example .env.local
```

- **MONGODB_URI** – From [MongoDB Atlas](https://cloud.mongodb.com): Cluster → Connect → Connect your application.
- **AUTH_SECRET** – Generate: `openssl rand -base64 32`
- **GOOGLE_GENERATIVE_AI_API_KEY** – For AI-generated goal plans (see below).
- **ELEVENLABS_API_KEY** – For Voice Mentor (see below).
- **GOOGLE_CLIENT_ID**, **GOOGLE_CLIENT_SECRET**, **GOOGLE_REDIRECT_URI** – Optional, for **Sign in with Google** and Google Calendar export (see below). Email/password auth works without these.

### 2. Free Gemini API key (for "Get started" / AI plans)

NextStep uses Google's Gemini to turn your goal into a step-by-step plan. You can use the **free tier**:

1. Go to **Google AI Studio**: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account.
3. Click **"Create API key"** (or "Get API key").
4. Copy the key and add it to `.env.local`:
   ```bash
   GOOGLE_GENERATIVE_AI_API_KEY=your-copied-key
   ```

No credit card is required for the free tier. Rate limits apply; see [Google AI Studio](https://aistudio.google.com/) for current limits.

### 3. ElevenLabs API key (for Voice Mentor)

NextStep uses ElevenLabs text-to-speech for the Voice Mentor feature:

1. Go to [ElevenLabs](https://elevenlabs.io/app/settings/api-keys) and create an API key.
2. Add it to `.env.local`:
   ```bash
   ELEVENLABS_API_KEY=your-copied-key
   ```

### 4. Google OAuth (optional): Sign in with Google and Calendar

The same Google OAuth client is used for **Sign in with Google** (login/get-started) and for **Google Calendar** (adding tasks to Calendar). If you configure it, both features work.

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project (or use existing).
2. Enable **Google Calendar API** if you want Calendar export; Sign in with Google only needs the OAuth client.
3. Create **OAuth 2.0 Client ID** (Web application). Add **Authorized redirect URI**: `http://localhost:3000/api/auth/google/callback` (or your app URL).
4. Copy Client ID and Client Secret into `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxx
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```

- **Sign in with Google**: Login and Get started pages show "Continue with Google"; users can create an account or log in with their Google profile (no password stored).
- **Google Calendar**: From the goal detail page, users can connect their account and add today’s next step to Google Calendar.

The **in-app calendar** (Dashboard → Calendar) works without Google; you set due dates on tasks and see them in a month view.

### 5. Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Voice Mentor (ElevenLabs)

On each goal's detail page, a **Voice Mentor** section shows a short summary and a **Listen** button. Clicking it plays a calm voice briefing: today's next step for the goal and why it matters. The app calls `POST /api/tts` with the summary text; the route uses the ElevenLabs API and returns MP3 audio (no extra npm packages). Add `ELEVENLABS_API_KEY` to `.env.local` as in **Getting started** above.
