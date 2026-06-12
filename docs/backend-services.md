# Backend Services — Function Reference

All services live in `backend/services/`. They are pure Python modules called by the routers.

---

## auth_service.py

Handles password hashing and JWT token operations.

### `hash_password(password: str) -> str`
Hashes a plain-text password using bcrypt.

### `verify_password(plain: str, hashed: str) -> bool`
Compares a plain-text password against a stored bcrypt hash. Returns `True` if they match.

### `create_access_token(user_id: int, email: str) -> str`
Creates a signed JWT token with a 24-hour expiry.

Payload structure:
```json
{ "sub": "<user_id>", "email": "<email>", "exp": <timestamp> }
```

### `decode_token(token: str) -> dict`
Decodes and validates a JWT token. Raises `JWTError` if invalid or expired.

**Config**
| Setting | Value |
|---------|-------|
| Algorithm | HS256 |
| Expiry | 24 hours |
| Secret | `JWT_SECRET_KEY` env var |

---

## resume_parser.py

Converts uploaded resume files to plain text.

### `parse_resume(file_bytes: bytes, filename: str) -> str`
Accepts raw file bytes and the original filename. Returns extracted plain text.

- PDF: uses `pdfplumber` to extract text page by page
- DOCX: uses `python-docx` to extract paragraphs and table cells
- Max file size: 10 MB
- Raises `ValueError` with a user-friendly message on failure (empty file, scanned PDF, unsupported format)

---

## skill_extractor.py

Extracts technical skills from resume text using the Groq LLM.

### `extract_resume_skills(resume_text: str) -> dict`
Sends the first 3000 characters of the resume to `llama-3.1-8b-instant` and returns structured skill data.

**Returns**
```python
{
  "skills": ["Python", "SQL"],
  "tools": ["Docker", "Git"],
  "experience_years": 3
}
```

Uses `response_format={"type": "json_object"}` to guarantee valid JSON output.

---

## job_parser.py

Extracts required skills from a job description using the Groq LLM.

### `extract_job_skills(job_text: str) -> dict`
Sends the first 3000 characters of the job description to `llama-3.1-8b-instant`.

**Returns**
```python
{
  "required_skills": ["Python", "AWS"],
  "nice_to_have": ["Kubernetes"],
  "job_title": "Backend Engineer"
}
```

---

## matching_engine.py

Computes a semantic similarity score between resume skills and job skills.

### `compute_match_score(resume_skills: list[str], job_skills: list[str]) -> float`
Uses the `all-MiniLM-L6-v2` sentence-transformer model to encode both skill lists as embeddings, then computes cosine similarity.

- Returns a percentage between `0.0` and `100.0`
- Model is lazy-loaded on first call and cached globally
- Model is pre-loaded in a background thread at server startup to avoid cold-start delays on the first request

**Example**
```python
compute_match_score(["Python", "SQL"], ["Python", "AWS", "Kubernetes"])
# → 68.3
```

---

## gap_analyzer.py

Identifies which job skills are missing from the resume and classifies their importance.

### `find_skill_gaps(resume_skills: list[str], job_skills: list[str]) -> list[dict]`

1. Performs a case-insensitive set difference to find missing skills
2. Sends missing skills to `llama-3.1-8b-instant` for classification
3. Returns each gap labeled as `"Critical"` or `"Secondary"`

**Returns**
```python
[
  { "skill": "AWS", "level": "Critical" },
  { "skill": "GraphQL", "level": "Secondary" }
]
```

If the LLM returns no gaps, falls back to labeling all missing skills as `"Secondary"`.

---

## mentor_agent.py

Generates a personalized 7-day learning roadmap for the identified skill gaps.

### `generate_roadmap(missing_skills: list[str]) -> list[dict]`

- Takes up to 5 missing skills
- Sends them to `llama-3.3-70b-versatile` (larger model for better quality output)
- Returns 3–5 roadmap entries covering all skills across 7 days
- Enforces status rules after receiving the response:
  - First entry → `"in-progress"`
  - Last entry → `"locked"`
  - Middle entries → `"upcoming"`

**Returns**
```python
[
  {
    "days": "Days 1-2",
    "skill": "AWS",
    "tasks": [
      "Complete AWS Cloud Practitioner intro",
      "Set up IAM roles",
      "Deploy a simple EC2 instance"
    ],
    "status": "in-progress"
  },
  {
    "days": "Days 3-4",
    "skill": "Kubernetes",
    "tasks": ["..."],
    "status": "upcoming"
  },
  {
    "days": "Day 7",
    "skill": "Review",
    "tasks": ["..."],
    "status": "locked"
  }
]
```
