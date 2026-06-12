# Backend Workflow — Full Analysis Pipeline

This document describes the complete data flow from the moment a user clicks "Run Analysis" to the final response.

---

## High-Level Flow

```
User (Browser)
    │
    ├─ POST /api/resume/upload  (multipart PDF/DOCX)
    │       └─ resume_parser → plain text
    │
    └─ POST /api/analyze/full  (resume_text + job_text)
            │
            ├─ [1] skill_extractor   → resume skills list
            ├─ [2] job_parser        → job skills list + job title
            ├─ [3] matching_engine   → match score (0–100%)
            ├─ [4] gap_analyzer      → skill gaps with severity
            ├─ [5] mentor_agent      → 7-day learning roadmap
            │
            ├─ save_session()        → persisted to PostgreSQL
            │
            └─ JSON response → Frontend
```

---

## Step-by-Step Breakdown

### Step 0 — Resume Upload
**Endpoint:** `POST /api/resume/upload`

The user uploads a PDF or DOCX file. `resume_parser.py` reads the raw bytes and extracts all text content. The plain text is returned to the frontend and stored temporarily in React state.

---

### Step 1 — Resume Skill Extraction
**Service:** `skill_extractor.py` → `extract_resume_skills()`

The resume text (first 3000 chars) is sent to Groq's `llama-3.1-8b-instant` model with a structured prompt. The model returns a JSON object containing:
- `skills` — core technical skills (e.g. Python, SQL)
- `tools` — tools and platforms (e.g. Docker, Git)
- `experience_years` — estimated years of experience

Both `skills` and `tools` are merged into a single `resume_skills` list for downstream steps.

---

### Step 2 — Job Description Parsing
**Service:** `job_parser.py` → `extract_job_skills()`

The job description text (first 3000 chars) is sent to the same Groq model. Returns:
- `required_skills` — must-have skills for the role
- `nice_to_have` — optional/bonus skills
- `job_title` — inferred job title

Only `required_skills` is used in the analysis pipeline. `job_title` is passed through to the frontend to power the job search panel.

---

### Step 3 — Match Score Computation
**Service:** `matching_engine.py` → `compute_match_score()`

Both skill lists are joined into comma-separated strings and encoded into vector embeddings using the `all-MiniLM-L6-v2` sentence-transformer model. Cosine similarity between the two vectors is computed and scaled to a 0–100% score.

This approach captures semantic similarity — e.g. "ML" and "Machine Learning" will score as similar even though they are different strings.

---

### Step 4 — Skill Gap Analysis
**Service:** `gap_analyzer.py` → `find_skill_gaps()`

A case-insensitive set difference identifies which job skills are absent from the resume. The missing skills are sent to Groq for classification:
- `Critical` — core requirement for the role
- `Secondary` — nice-to-have or supporting skill

---

### Step 5 — Roadmap Generation
**Service:** `mentor_agent.py` → `generate_roadmap()`

The top 5 missing skills are sent to `llama-3.3-70b-versatile` (a larger, higher-quality model). The model generates a structured 7-day learning plan with 3–5 entries, each containing:
- Day range (e.g. "Days 1-2")
- Skill to focus on
- 3–4 specific, actionable tasks
- Status (`in-progress`, `upcoming`, `locked`)

---

### Step 6 — Persistence
**Module:** `db/database.py` → `save_session()`

The full result is saved to the `analysis_sessions` table in PostgreSQL. Skills, gaps, and roadmap are stored as JSON strings. This step is non-blocking — a DB failure does not fail the API response.

---

## Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key, auto-increment |
| email | VARCHAR(255) | Unique, indexed |
| hashed_password | VARCHAR(255) | bcrypt hash |
| is_active | BOOLEAN | Default true |
| created_at | VARCHAR(32) | ISO 8601 UTC timestamp |

### `analysis_sessions`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key, auto-increment |
| match_score | FLOAT | 0.0 – 100.0 |
| resume_skills | TEXT | JSON array |
| job_skills | TEXT | JSON array |
| skill_gaps | TEXT | JSON array of `{skill, level}` |
| roadmap | TEXT | JSON array of roadmap entries |
| created_at | VARCHAR(32) | ISO 8601 UTC timestamp |

---

## Authentication Flow

```
Register / Login
    │
    └─ POST /api/auth/register  or  POST /api/auth/login
            │
            ├─ hash_password() / verify_password()   (bcrypt)
            ├─ create_access_token()                 (JWT, 24h expiry)
            └─ { access_token, token_type: "bearer" }

Protected Request
    │
    └─ GET /api/auth/me  (Authorization: Bearer <token>)
            │
            ├─ decode_token()   → extract user_id
            ├─ get_user_by_id() → load from DB
            └─ { id, email, created_at }
```

---

## Startup Sequence

When the server starts (`on_startup` in `main.py`):

1. `init_db()` — creates all ORM tables if they don't exist
2. Background thread pre-loads the `all-MiniLM-L6-v2` model so the first analysis request doesn't time out

---

## Logging

Every request is logged by the `log_requests` middleware:
```
→ POST /api/analyze/full
← POST /api/analyze/full  200  1243ms
```

Each service also logs its own progress at `INFO` level, making it easy to trace a request through the pipeline in the console.
