# Implementation Plan

- [x] 1. Add StudyPlan ORM model and DB helpers


  - Add `StudyPlan` SQLAlchemy model to `backend/db/database.py`
  - Implement `save_study_plan`, `get_study_plans`, `get_study_plan` helpers
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.4_






- [ ] 2. Add Pydantic schemas and study plans router
- [x] 2.1 Add StudyPlanSummary and StudyPlanDetail schemas to `backend/models/schemas.py`

  - _Requirements: 4.4_


- [ ] 2.2 Create `backend/routers/study_plans.py` with GET /api/study-plans and GET /api/study-plans/{plan_id}
  - Use `get_current_user` dependency for auth




  - Return 403 if plan owner mismatch, 404 if not found
  - _Requirements: 3.3, 3.4, 4.1, 4.2, 4.3_



- [ ] 3. Update analysis router and register study plans router
- [ ] 3.1 Update `POST /api/analyze/full` to require auth and call `save_study_plan`
  - Add `get_current_user` dependency, pass `user_id` to save function
  - Return `plan_id` in response
  - _Requirements: 1.1, 1.2, 1.3, 1.4_


- [x] 3.2 Register study plans router in `backend/main.py`




  - _Requirements: 4.1, 4.2_

- [ ] 4. Update frontend to send auth token on analysis and handle plan_id response
  - Update Dashboard's `POST /api/analyze/full` fetch call to include `Authorization` header
  - Store returned `plan_id` in AnalysisContext
  - _Requirements: 1.1_

- [ ] 5. Add StudyPlanList to Sidebar
  - Expand the Learning nav item to show a collapsible folder list
  - Fetch `GET /api/study-plans` with JWT on mount
  - Render each plan as a folder row with name and date; clicking navigates to `/learning/:planId`
  - Show loading indicator while fetching, empty state when no plans
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Update Learning page and App routes for plan-based navigation
- [ ] 6.1 Add `/learning/:planId` route in `App.jsx`
  - _Requirements: 3.1_
- [ ] 6.2 Update `Learning.jsx` to read `:planId` via `useParams`, fetch plan from API when present, fall back to AnalysisContext when absent
  - Handle loading, 403, and 404 states
  - _Requirements: 3.1, 3.2, 3.3, 3.4_
