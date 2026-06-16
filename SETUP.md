# DunongAI — Setup & Deploy Guide

DunongAI works out of the box in **demo mode** (no setup, curated AI fallbacks,
sessionStorage logins). Follow this guide to enable **real accounts** (Firebase)
and **live Claude AI** (via a secure serverless proxy), then deploy to Vercel.

---

## 0. Run the demo locally (no setup)

```bash
npm install
npm run dev
```

Open http://localhost:5173. Demo logins:

- Student: `student@dunongai.ph` / `dunong123`
- Teacher: `teacher@dunongai.ph` / `dunong123`
- Parent:  `parent@dunongai.ph`  / `dunong123`

---

## 1. Firebase (real accounts + data)

1. Go to https://console.firebase.google.com → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** (start in production mode).
4. **Firestore → Rules** → paste the contents of [firestore.rules](firestore.rules) → **Publish**.
5. **Project Settings (⚙) → Your apps → Web app (`</>`)** → copy the config values into `.env`:

   ```bash
   copy .env.example .env      # macOS/Linux: cp .env.example .env
   ```

   Fill in every `VITE_FIREBASE_*` value. (These are public client keys — safe to ship.)

6. Restart `npm run dev`. Sign-up now creates real accounts; the **+ Bagong Section**
   button on the teacher dashboard generates join codes; students join with a code at
   sign-up or from the library.

> **Seeding stories:** the sample stories self-seed on first load. Because the rules
> only let teachers write `stories`, log in as a teacher once (or seed from the Firebase
> console) so the library populates.

---

## 2. Live Claude AI (secure serverless proxy)

The Claude key is **never** put in the browser. The client calls `/api/claude`
([api/claude.js](api/claude.js)), which holds the secret server-side.

**Local (with live AI):**
```bash
npm i -g vercel
vercel dev          # serves the app AND the /api function
```
Set these in `.env` (do **not** prefix the secret with `VITE_`):
```
VITE_AI_ENABLED=true
CLAUDE_API_KEY=sk-ant-...
```
Get a key at https://console.anthropic.com. With `npm run dev` (plain Vite) the
`/api` function is not available, so the app stays in demo mode — that's expected.

---

## 3. Deploy to Vercel

1. Push the repo to GitHub.
2. https://vercel.com → **New Project** → import the repo (framework auto-detects Vite).
3. **Settings → Environment Variables** — add:
   - all `VITE_FIREBASE_*` values
   - `VITE_AI_ENABLED=true`
   - `CLAUDE_API_KEY` (server-only secret) and optionally `CLAUDE_MODEL`
4. **Deploy.** The `/api/claude` function deploys automatically.
5. In Firebase → Authentication → **Settings → Authorized domains**, add your
   `*.vercel.app` domain so login works in production.

**Verify the key is not exposed:**
```bash
npm run build
# search the bundle — the key must NOT appear:
#   PowerShell: Select-String -Path dist/**/*.js -Pattern "sk-ant"
```

---

## Roles & routes

| Role    | Sign up at        | Lands on             |
|---------|-------------------|----------------------|
| Student | `/signup/student` | `/student/quiz`      |
| Teacher | `/signup/teacher` | `/teacher/dashboard` |
| Parent  | `/signup/parent`  | `/parent/dashboard`  |

Parents link to a child by the child's **registered student email**.
