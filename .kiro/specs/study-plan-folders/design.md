# Design Document — Study Plan Folders

## Overview

Each analysis result is persisted as a named Study Plan in a new `study_plans` DB table, tied to the authenticated user. The sidebar Learning section shows a folder list of saved plans. Clicking a folder navigates to `/learning/:planId`, which fetches and renders that plan's roadmap from the API.

## Architecture

```
Sidebar → GET /api/study-plans → StudyPlanList → folder click → /learning/:planId
Learning.jsx (with planId) → GET /api/study-plans/:planId → render roadmap
POST /api/analyze/full (auth-required) → save_study_plan(user_id, ...)
```

## Components and Interfaces

### Backend

**New ORM: `StudyPlan` table `study_plans`**
- id, user_id (FK→users), name, match_score, resume_skills (JSON), job_skills (JSON), skill_gaps (JSON), roadmap (JSON), created_at

**New DB helpers:**
- `save_study_plan(user_id, name, match_score, resume_skills, job_skills, skill_gaps, roadmap) -> int`
- `get_study_plans(user_id) -> list[dict]` — id, name, created_at ordered DESC
- `get_study_plan(plan_id, user_id) -> dict | None` — full data, owner-checked

**Updated `POST /api/analyze/full`:** requires JWT, calls `save_study_plan`, returns `plan_id` in response.

**New router `backend/routers/study_plans.py`:**
- `GET /api/study-plans` — list for current user
- `GET /api/study-plans/{plan_id}` — full plan, 403/404 on error

**New Pydantic schemas:** `StudyPlanSummary`, `StudyPlanDetail`

### Frontend

**Updated `Sidebar.jsx`:** Learning item expands to show `StudyPlanList` sub-component fetching `GET /api/study-plans`.

**Updated `Learning.jsx`:** reads `:planId` via `useParams()`; if present fetches plan from API; falls back to `AnalysisContext` when no planId.

**Updated `App.jsx`:** adds `/learning/:planId` route.

## Data Models

```sql
CREATE TABLE study_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  match_score FLOAT NOT NULL,
  resume_skills TEXT NOT NULL,
  job_skills TEXT NOT NULL,
  skill_gaps TEXT NOT NULL,
  roadmap TEXT NOT NULL,
  created_at VARCHAR(32) NOT NULL
);
```

## Error Handling

| Scenario | Response |
|----------|----------|
| No JWT on analyze | 401 |
| Wrong owner on plan | 403 |
| Plan not found | 404 |
| DB save fails | Non-fatal, analysis still returns |

## Testing Strategy

- Unit test DB helpers
- Test API endpoints with TestClient + mocked auth
- Frontend: verify folder list renders and navigates correctly
