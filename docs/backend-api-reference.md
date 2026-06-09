# Backend API Reference

Base URL: `http://localhost:8000`

All protected routes require the header:
```
Authorization: Bearer <access_token>
```
 
---

## Auth — `/api/auth`

### POST `/api/auth/register`
Register a new user account.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "mypassword"
}
```

**Response `201`**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

**Errors**
| Code | Reason |
|------|--------|
| 409  | Email already registered |
| 400  | Password shorter than 6 characters |

---

### POST `/api/auth/login`
Authenticate and receive a JWT token.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "mypassword"
}
```

**Response `200`**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

**Errors**
| Code | Reason |
|------|--------|
| 401  | Invalid email or password |

---

### GET `/api/auth/me`
Returns the currently authenticated user. Requires Bearer token.

**Response `200`**
```json
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2026-04-09T10:00:00+00:00"
}
```

---

## Resume — `/api/resume`

### POST `/api/resume/upload`
Upload a resume file (PDF or DOCX) and receive extracted plain text.

**Request** — `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | PDF or DOCX, max 10 MB |

**Response `200`**
```json
{
  "resume_text": "John Doe\nSoftware Engineer\n..."
}
```

**Errors**
| Code | Reason |
|------|--------|
| 400  | No file provided, wrong field name, or unsupported type |
| 422  | File is empty or text could not be extracted |

---

## Job — `/api/job`

### POST `/api/job/parse`
Parse a job description and extract required skills.

> Note: This is a utility endpoint. The frontend uses `/api/analyze/full` instead.

**Request Body**
```json
{
  "job_text": "We are looking for a Python developer with AWS experience..."
}
```

**Response `200`**
```json
{
  "required_skills": ["Python", "AWS"],
  "nice_to_have": ["Kubernetes"],
  "job_title": "Backend Engineer"
}
```

---

## Analysis — `/api/analyze`

### POST `/api/analyze/full`
The core pipeline. Runs all 5 stages and returns the complete analysis result.

**Request Body**
```json
{
  "resume_text": "...",
  "job_text": "..."
}
```

**Response `200`**
```json
{
  "match_score": 72.4,
  "resume_skills": ["Python", "SQL", "Docker"],
  "job_skills": ["Python", "AWS", "Kubernetes"],
  "job_title": "Backend Engineer",
  "skill_gaps": [
    { "skill": "AWS", "level": "Critical" },
    { "skill": "Kubernetes", "level": "Secondary" }
  ],
  "roadmap": [
    {
      "days": "Days 1-2",
      "skill": "AWS",
      "tasks": ["Complete AWS Cloud Practitioner intro", "Set up IAM roles", "Deploy a simple EC2 instance"],
      "status": "in-progress"
    }
  ]
}
```

**Errors**
| Code | Reason |
|------|--------|
| 400  | Empty resume_text or job_text |
| 500  | Internal pipeline failure |

---

## Jobs Search — `/api/jobs`

### GET `/api/jobs/search`
Search live job listings via JSearch (RapidAPI).

**Query Parameters**
| Param      | Required | Description |
|------------|----------|-------------|
| `query`    | Yes      | Job title or keywords |
| `location` | No       | City or country |
| `page`     | No       | Page number (default: 1) |

**Example**
```
GET /api/jobs/search?query=Python+Developer&location=Remote&page=1
```

**Response `200`**
```json
{
  "jobs": [
    {
      "id": "abc123",
      "title": "Python Developer",
      "company": "Acme Corp",
      "location": "Remote",
      "type": "FULLTIME",
      "posted": "2026-04-08T00:00:00Z",
      "description": "We are looking for...",
      "url": "https://apply.link/...",
      "logo": "https://logo.url/..."
    }
  ],
  "total": 10,
  "page": 1
}
```

**Errors**
| Code | Reason |
|------|--------|
| 500  | RAPID_API_KEY not configured |
| 502  | JSearch API unreachable or returned an error |

---

## Health Check

### GET `/health`
Simple liveness check.

**Response `200`**
```json
{ "status": "ok" }
```
