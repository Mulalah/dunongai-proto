# DunongAI — Basahin Natin Ito!

An AI-powered adaptive reading companion for K–6 Filipino public school students.
Built for ISS170 Technopreneurship demo.

## 🔎 How to Review This Demo

**Live app:** https://dunongai.vercel.app

Sign in instantly with any of these demo accounts (no registration needed):

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Student | `student@dunongai.ph`  | `dunong123` |
| Teacher | `teacher@dunongai.ph`  | `dunong123` |
| Parent  | `parent@dunongai.ph`   | `dunong123` |

**Suggested 4–6 min walkthrough:**
1. Student login → **Diagnostic Quiz** → AI assigns a reading level
2. **Story Library** → open a story → tap a gold-underlined word → **Basa Bot** replies
3. **"Tapos na Basahin"** → AI comprehension questions → score + level-up screen → **Progreso**
4. Log out → Teacher login → **Dashboard** (create/switch sections, see a flagged student → profile → **Generate AI Summary**)
5. Log out → Parent login → **child's progress dashboard**

## Quick Start

```bash
npm install
cp .env.example .env       # Windows: copy .env.example .env
# (optional) fill in real keys in .env — works in demo mode without them
npm run dev
```

Open http://localhost:5173

## Demo Credentials

- **Student:** `student@dunongai.ph` / `dunong123`
- **Teacher:** `teacher@dunongai.ph` / `dunong123`

These accounts work even without Firebase configured (sessionStorage-based demo mode).

## Demo Mode

If `VITE_AI_ENABLED` is not `true`, the app runs in **demo mode** (live AI goes through the `/api/claude` serverless proxy — see [SETUP.md](SETUP.md)):
- All Claude API calls return curated fallbacks after a ~1.5s delay
- A small "Demo" badge appears on the Basa Bot panel and AI Summary card
- Pre-seeded stories, students, and sessions render the entire UX without any backend

## Demo Flow (Video Recording)

1. **Landing** → "Mag-login bilang Estudyante"
2. **Student login** (auto-filled demo creds) → Login
3. **Diagnostic Quiz** (5 questions) → AI assesses level → Level Assigned screen
4. **Story Library** → click "Ang Taniman ni Lolo Pedro"
5. **Story Reader** → tap a highlighted word → Basa Bot responds in panel
6. Click **"Tapos na Basahin"** → AI generates Comprehension Questions
7. Answer 4 questions → Submit → Session Complete with score + level-up banner
8. Click **"Tingnan ang Progreso"** → badges + leaderboard
9. **Logout** → Landing → "Mag-login bilang Guro"
10. **Teacher Dashboard** → click flagged student → Student Profile
11. Click **"Generate AI Summary"** → AI summary appears

Total demo time: 4–6 minutes.

## Tech Stack

- React 18 + Vite
- React Router v6
- Tailwind CSS (custom design tokens)
- Firebase (Firestore + Auth) — optional, falls back to sessionStorage
- Anthropic Claude API (`claude-haiku-4-5`) — optional, falls back to curated mock data
- Recharts (teacher trend chart)
- Google Fonts: Plus Jakarta Sans + Inter + Lora


## Set Up Firebase (optional)

1. Go to https://console.firebase.google.com → **New Project**
2. Enable **Authentication** → Email/Password provider
3. Enable **Firestore Database** (start in test mode)
4. Project Settings → **Web App** → copy config into `.env`
5. Optionally pre-create the demo accounts in Firebase Auth so login uses real auth

## File Layout

```
src/
  App.jsx                     # Routes + ProtectedRoute
  firebase.js                 # Firebase init
  context/AuthContext.jsx     # Auth state + demo login
  utils/
    claude.js                 # Claude API wrappers + fallbacks
    seedData.js               # Auto-seeds Firestore on first load
    levelUtils.js             # Level/star/badge helpers
  components/
    layout/                   # Sidebar, TeacherSidebar, TopBar, PageWrapper
    ui/                       # Button, Card, Badge, ProgressBar, etc.
    student/                  # StoryCard, BasaBotPanel, QuestionCard, BadgeCard, LeaderboardRow
    teacher/                  # StudentRow, ScoreTrendChart, AISummaryCard
  pages/
    auth/                     # Landing, StudentLogin, TeacherLogin
    student/                  # DiagnosticQuiz, LevelAssigned, StoryLibrary,
                              # StoryReader, Comprehension, SessionComplete, Progress
    teacher/                  # ClassDashboard, StudentProfile, FlaggedStudents
```

## Notes for the Demo

- Every Claude call has a hardcoded fallback — the app never freezes if the API is slow or missing
- Skeleton loaders or spinners appear on every data fetch — no blank white screens
- The Basa Bot welcome message appears immediately on the reader page
- Tapping any highlighted (gold-underlined) word pre-fills the Basa Bot input
- Generation visibly takes ~1.5s in demo mode so the AI feels real on camera
