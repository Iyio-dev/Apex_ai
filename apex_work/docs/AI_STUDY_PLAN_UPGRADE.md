# APEX Core Upgrade 01 — AI-Personalized Study Plans

## Current functionality

The legacy `POST /api/v1/academic/plans/generate` remains rule-based and is unchanged. The new guided AI flow is available alongside it. The student first loads `GET /api/v1/academic/plans/context`, which returns a user-specific academic profile and topic mastery summary. The frontend wizard then asks for plan length (7/14/30 days), focus subjects, minutes per study day, weekly break days, study rhythm, and optional personal goal. The server combines these preferences with the student's academic profile, syllabus and topic progress.

## Architecture and source map

- `client/src/features/plans/AIPlanWizard.jsx`: stepwise student preference capture, API calls and error handling.
- `client/src/features/plans/Plans.jsx`: mounts the wizard and refreshes saved plans.
- `src/routes/academicRoutes.js`: authenticated `GET /plans/context` and rate-limited, schema-validated `POST /plans/ai-generate`.
- `src/validators/academicValidators.js`: strict input validation (`aiPlanSchema`).
- `src/services/personalizedPlanService.js`: user-specific data collection, schedule policy checks and persistence.
- `src/services/aiStudyPlanService.js`: Groq client, prompt construction and structured output validation.
- `src/models/StudyPlan.js`: `source` and `preferences` metadata, retaining the existing activity structure.

## Core engineering decisions

1. Existing routes and saved plans remain backward-compatible.
2. AI is a suggestion engine, not the source of truth for topic identity, study hours or dates. Backend validates all returned topic IDs, time budgets, break days, date bounds and duplicates before saving.
3. Plans are tied to the authenticated user, not to a user ID accepted from the client.
4. Existing activity fields (`actualMinutes`, `understanding`, `feedback`, `status`) remain available for the future study-session engine. No new session engine has been introduced.
5. AI generation is intentionally fail-closed. Provider errors or invalid plans do not produce misleading 'AI generated' plans.
6. Inputs are limited and provider output is schema validated. AI-generated text is stored as data, not executed.

## API example

`POST /api/v1/academic/plans/ai-generate`

```json
{
  "days": 7,
  "focusSubjects": ["Physics"],
  "minutesPerDay": 60,
  "breakDays": [0],
  "learningStyle": "balanced",
  "goal": "Revise mechanics and weak areas"
}
```

## Environment

Set `GROQ_API_KEY` and optionally `GROQ_MODEL` in the server environment. MongoDB and existing session authentication must be configured.

## Verification status

Existing backend test suite: 14 passing. Backend syntax checks: passing. Frontend build was not verified: the installed dependency directory lacked the `vite` executable. Live Groq requests and MongoDB persistence were not exercised. Test the wizard, provider responses, account isolation, daily break constraints, 7/14/30-day periods and DB writes before deployment.

## Planned next phase, not implemented

Introduce `StudySession` as a separate collection linked to `user`, `plan`, `activity` and `topic`; capture session start/end, actual minutes, understanding and notes; aggregate session data into topic mastery; use session history as additional input for subsequent AI plans. Avoid storing unbounded session histories inside a plan document.
