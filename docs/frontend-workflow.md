# Frontend Workflow

## Pages & Routes

| Route       | Component       | Access    | Description |
|-------------|-----------------|-----------|-------------|
| `/login`    | Login.jsx       | Public    | Email/password login |
| `/register` | Register.jsx    | Public    | New account creation |
| `/`         | Dashboard.jsx   | Protected | Main analysis UI |
| `/learning` | Learning.jsx    | Protected | 7-day roadmap view |
| `/tracker`  | Tracker.jsx     | Protected | Skill proficiency tracker |

All routes under `/*` are wrapped in `ProtectedRoute`, which redirects unauthenticated users to `/login`.

---

## State Management

### AuthContext (`context/AuthContext.jsx`)
Manages authentication state across the app.

| Value | Type | Description |
|-------|------|-------------|
| `user` | object \| null | `{ id, email, created_at }` |
| `token` | string \| null | JWT stored in `localStorage` |
| `loading` | boolean | True while verifying stored token on mount |
| `login(email, password)` | async fn | Calls `/api/auth/login`, stores token |
| `register(email, password)` | async fn | Calls `/api/auth/register`, stores token |
| `logout()` | fn | Clears token from state and localStorage |

On app mount, if a token exists in `localStorage`, it is verified against `GET /api/auth/me`. If invalid, it is cleared.

### AnalysisContext (`context/AnalysisContext.jsx`)
Holds the analysis result in memory so all pages can access it without re-fetching.

| Value | Type | Description |
|-------|------|-------------|
| `result` | object \| null | Full response from `/api/analyze/full` |
| `loading` | boolean | True while analysis is running |
| `error` | string \| null | Error message if analysis fails |

---

## Dashboard Flow

```
User uploads resume file  →  stored in local state (resumeFile)
User pastes job text      →  stored in local state (jobText)

Click "Run Analysis"
    │
    ├─ POST /api/resume/upload (FormData)
    │       └─ receives { resume_text }
    │
    └─ POST /api/analyze/full ({ resume_text, job_text })
            └─ receives full result → stored in AnalysisContext

Results rendered:
    ├─ MatchGauge     — displays match_score + skill_gaps
    ├─ JobsPanel      — fetches live jobs using job_title
    └─ Roadmap        — displays roadmap entries
```

---

## Component Responsibilities

| Component | What it does |
|-----------|-------------|
| `Navbar` | Top navigation bar |
| `Sidebar` | Left navigation with page links |
| `MatchGauge` | Circular gauge showing match score + gap list |
| `SkillGaps` | Renders skill gap cards with Critical/Secondary labels |
| `Roadmap` | Renders roadmap day cards with task lists |
| `JobsPanel` | Calls `/api/jobs/search` with the analyzed job title, shows live listings |
| `ProtectedRoute` | Redirects to `/login` if no valid auth token |

---

## Learning Page

Reads `result.roadmap` from `AnalysisContext`. Displays a vertical timeline with:
- Progress bar (completed / total entries)
- Each roadmap entry as a card with status badge and task checklist
- "Start Learning" button on the active (`in-progress`) entry

If no roadmap exists yet, shows an empty state with a link back to Dashboard.

---

## Tracker Page

Reads `result` from `AnalysisContext`. Displays:
- 4 stat cards: Match Score, Skills Found, Gaps Found, Plan Days
- Skill proficiency bars (resume skills with estimated levels, gap skills shown in red at low level)
- Gaps to Close panel with Critical/Secondary classification

If no analysis has been run, shows an empty state with a link back to Dashboard.
