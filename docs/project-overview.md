# Curator AI — Project Overview

## What is Curator AI?

Curator AI is a full-stack web application that helps job seekers understand how well their resume matches a job description. It uses AI to extract skills, compute a semantic match score, identify skill gaps, and generate a personalized 7-day learning roadmap.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React (Vite), React Router, Tailwind CSS        |
| Backend   | FastAPI (Python)                                |
| Database  | PostgreSQL via Neon (SQLAlchemy + pg8000)        |
| AI / LLM  | Groq API (llama-3.1-8b-instant, llama-3.3-70b)  |
| Embeddings| sentence-transformers (all-MiniLM-L6-v2)        |
| Auth      | JWT (python-jose) + bcrypt password hashing     |
| Job Search| JSearch API via RapidAPI                        |

---

## Project Structure

```
Curator_AI/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env                     # Secrets (not committed)
│   ├── db/
│   │   └── database.py          # SQLAlchemy ORM + DB helpers
│   ├── models/
│   │   └── schemas.py           # Pydantic request/response models
│   ├── routers/
│   │   ├── auth.py              # /api/auth/*
│   │   ├── resume.py            # /api/resume/*
│   │   ├── job.py               # /api/job/*
│   │   ├── analysis.py          # /api/analyze/*
│   │   └── jobs_search.py       # /api/jobs/*
│   └── services/
│       ├── auth_service.py      # JWT + password utilities
│       ├── resume_parser.py     # PDF/DOCX → plain text
│       ├── skill_extractor.py   # Resume skill extraction (Groq)
│       ├── job_parser.py        # Job description parsing (Groq)
│       ├── matching_engine.py   # Semantic similarity scoring
│       ├── gap_analyzer.py      # Skill gap classification (Groq)
│       └── mentor_agent.py      # 7-day roadmap generation (Groq)
└── frontend/
    ├── src/
    │   ├── App.jsx              # Routes + providers
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Auth state + token management
    │   │   └── AnalysisContext.jsx # Analysis result state
    │   ├── pages/
    │   │   ├── Dashboard.jsx    # Main analysis UI
    │   │   ├── Learning.jsx     # 7-day roadmap view
    │   │   ├── Tracker.jsx      # Skill proficiency tracker
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   └── components/
    │       ├── Navbar.jsx
    │       ├── Sidebar.jsx
    │       ├── MatchGauge.jsx   # Score visualization
    │       ├── SkillGaps.jsx    # Gap list display
    │       ├── Roadmap.jsx      # Roadmap card display
    │       ├── JobsPanel.jsx    # Live job listings
    │       └── ProtectedRoute.jsx
    └── vite.config.js
```

---

## Environment Variables

| Variable          | Description                              |
|-------------------|------------------------------------------|
| `DATABASE_URL`    | PostgreSQL connection string (Neon)      |
| `GROQ_API_KEY`    | Groq LLM API key                         |
| `JWT_SECRET_KEY`  | Secret for signing JWT tokens            |
| `RAPID_API_KEY`   | RapidAPI key for JSearch job listings    |

---

## Running the Project

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8000`.
API docs available at `http://localhost:8000/docs`.
