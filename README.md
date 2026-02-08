# NextStep

NextStep is a web application designed to turn big goals into your very next step. It combines AI-powered roadmaps, voice guidance, and calendar sync so you can plan, stay accountable, and move forward one step at a time.

## Features

### Goals & roadmap

- **AI goal decomposition**: Describe a goal; Gemini breaks it into a step-by-step roadmap of tasks.
- **One step at a time**: Complete tasks in order; each completion requires a short summary before moving on.
- **Reflections**: When you finish a goal, record satisfaction and thoughts on your journey.

### Voice & guidance

- **Voice Mentor**: Listen to a spoken summary of your current step and why it matters (ElevenLabs TTS).

### Schedule & calendar

- **Due dates**: Set due dates on any task. In-app calendar shows Upcoming and Completed lists with a month view.
- **Google Calendar sync**: Connect your account to sync upcoming tasks as events (11:59 PM). Events update or remove when you change or clear dates, complete tasks, or delete tasks.

### Account

- **Sign in with Google**: Create an account or log in with Google (email/password also supported).

## Tech stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Database**: MongoDB
- **API / auth**: Next.js API routes, JWT (jose), bcrypt
- **AI**: Google Gemini 2.5 Flash (goal → roadmap)
- **Voice**: ElevenLabs API (TTS)
- **Calendar**: Google Calendar API, Google OAuth 2.0
