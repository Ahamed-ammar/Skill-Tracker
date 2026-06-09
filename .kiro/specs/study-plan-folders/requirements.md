# Requirements Document

## Introduction

This feature adds a Study Plan folder system to the Learning section of Curator AI. Each time a user runs an analysis, the resulting 7-day roadmap is saved as a named study plan folder in the database, linked to that user. In the sidebar's Learning section, users see a list of their saved study plan folders. Clicking a folder navigates to the Learning page pre-loaded with that plan's roadmap data.

## Glossary

- **Study Plan**: A saved 7-day learning roadmap generated from a single analysis session, stored in the database and associated with a specific user.
- **Study Plan Folder**: A UI element in the Learning sidebar section representing one saved Study Plan.
- **Learning Page**: The `/learning` route that renders the 7-day roadmap timeline.
- **Analysis Session**: A completed run of `POST /api/analyze/full`.
- **AnalysisContext**: The React context holding the current in-memory analysis result.
- **Curator AI System**: The full-stack web application.
- **Authenticated User**: A user with a valid JWT token.

---

## Requirements

### Requirement 1

**User Story:** As an authenticated user, I want each analysis I run to be saved as a study plan linked to my account, so that I can revisit past roadmaps.

#### Acceptance Criteria

1. WHEN an authenticated user submits `POST /api/analyze/full`, THE Curator AI System SHALL save the roadmap, skill gaps, match score, and job title to the database associated with that user's ID.
2. WHEN a study plan is saved, THE Curator AI System SHALL assign a name derived from the job title (e.g., "Backend Engineer Plan").
3. WHEN a study plan is saved, THE Curator AI System SHALL record the creation timestamp in ISO 8601 UTC format.
4. IF the authenticated user's ID cannot be resolved from the JWT token, THEN THE Curator AI System SHALL return a 401 Unauthorized response and SHALL NOT save the study plan.

### Requirement 2

**User Story:** As an authenticated user, I want to see my saved study plan folders in the Learning sidebar section, so that I can access past plans.

#### Acceptance Criteria

1. WHEN an authenticated user navigates to any protected page, THE Curator AI System SHALL display saved study plan folders under the "Learning" sidebar item.
2. WHEN the user has no saved study plans, THE Curator AI System SHALL display a message indicating no plans exist.
3. THE Curator AI System SHALL display each folder with its name and creation date.
4. WHILE the folder list is loading, THE Curator AI System SHALL display a loading indicator.

### Requirement 3

**User Story:** As an authenticated user, I want to click a study plan folder and be taken to the Learning page showing that plan's roadmap.

#### Acceptance Criteria

1. WHEN an authenticated user clicks a study plan folder, THE Curator AI System SHALL navigate to `/learning/:planId`.
2. WHEN `/learning/:planId` loads, THE Curator AI System SHALL fetch the plan from `GET /api/study-plans/:planId` and render the roadmap.
3. IF the `planId` does not belong to the authenticated user, THEN THE Curator AI System SHALL return a 403 Forbidden response.
4. IF the `planId` does not exist, THEN THE Curator AI System SHALL return a 404 Not Found response.

### Requirement 4

**User Story:** As an authenticated user, I want the API to expose my list of study plans.

#### Acceptance Criteria

1. THE Curator AI System SHALL expose `GET /api/study-plans` returning all plans for the authenticated user, ordered by creation date descending.
2. THE Curator AI System SHALL expose `GET /api/study-plans/:planId` returning full data for a single plan.
3. WHEN the user has no plans, `GET /api/study-plans` SHALL return an empty array with 200 OK.
4. WHERE the sidebar uses the list response, THE Curator AI System SHALL include `id`, `name`, and `created_at` in each item.
