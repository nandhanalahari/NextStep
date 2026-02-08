# NextStep

AI micro-mentor that turns goals into daily, achievable next steps.

## Using the Web App

### Landing page

Open [http://localhost:3000](http://localhost:3000) to see the landing page. Browse **Features**, **How It Works**, and **FAQ**. Use **Get Started** or **Log in** in the top-right.

### Sign up

1. Click **Get Started**.
2. Enter your name and email, then click **Continue**.
3. Set a password (min. 8 characters) and click **Create Account**.
4. You’ll be taken to your dashboard.

### Log in

1. Click **Log in**.
2. Enter your email and password.
3. Click **Sign In** to go to your dashboard.

### Dashboard

Your dashboard lists your active goals as cards. Each card shows:

- Goal title and description
- Progress (e.g. 2 of 5 tasks)
- A preview of tasks

Use **New Goal** to create a goal, or **Completed** to see goals you’ve finished or partially finished.

### Creating a new goal

1. Click **New Goal** (or **Create Your First Goal** if empty).
2. Describe your goal in the text box (e.g. “Land a software engineering internship”).
3. Optionally use the example buttons (Learn machine learning, Get a tech internship, etc.).
4. Click **Generate Plan**.
5. The AI generates a title, description, and task list.
6. Review the plan, then click **Save to Dashboard** to add it to your goals.
7. Or use **Try a Different Goal** to generate another plan.

### Goal detail (roadmap)

1. Click a goal card to open its roadmap.
2. Tasks appear left to right in sequence.
3. Only the next incomplete task can be worked on; earlier ones are unlocked by completing previous tasks.
4. Click a task’s checkbox to mark it complete.
5. In the dialog, enter a short summary of what you did and click **Mark complete**.
6. Use the **+** between tasks to add custom tasks.
7. Use the trash icon on a task to delete it.
8. Click **Delete Goal** (top-right) to remove the goal.

### Completing a goal

When you complete the last task, a **Reflect on your journey** dialog appears. You can:

- Rate satisfaction (1–5)
- Describe how you felt at the start and at the end
- Click **Save reflection** to finish

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

### 2. Free Gemini API key (for “Get started” / AI plans)

NextStep uses Google’s Gemini to turn your goal into a step-by-step plan. You can use the **free tier**:

1. Go to **Google AI Studio**: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account.
3. Click **“Create API key”** (or “Get API key”).
4. Copy the key and add it to `.env.local`:
   ```bash
   GOOGLE_GENERATIVE_AI_API_KEY=your-copied-key
   ```

No credit card is required for the free tier. Rate limits apply; see [Google AI Studio](https://aistudio.google.com/) for current limits.

### 3. Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
