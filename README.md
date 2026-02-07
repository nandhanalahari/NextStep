# NextStep

AI micro-mentor that turns goals into daily, achievable next steps.

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
