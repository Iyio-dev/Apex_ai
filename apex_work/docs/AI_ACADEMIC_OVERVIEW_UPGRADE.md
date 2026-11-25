# APEX Academic Overview — Start / Stop / Reduce / Reinforce

## Purpose
An evidence-aware academic coaching overview, separate from AI Study Plans. This upgrade replaces the one-click academic analysis screen with a five-question guided flow and persists generated overviews per authenticated student.

## Workflow
1. `GET /api/v1/academic/overview/context` requires authentication and an academic profile. The backend assembles a restricted academic snapshot: programme, subjects, goals, strengths, weaknesses, topic understanding, submitted assessment scores, and study plan completion counts. It returns five clarifying questions.
2. The student answers questions on goals, obstacles, existing habits, time constraints, and preferred support.
3. `POST /api/v1/academic/overview/generate` validates all five answers with Zod, applies the authenticated-user AI rate limiter, and sends the academic snapshot plus answers to Groq.
4. The AI is instructed to produce four sections, each with action, reason, firstStep and evidence, and to avoid unsupported accusations about bad habits.
5. A strict Zod schema validates the generated JSON before it is stored as `AcademicOverview` with user ID, answers and context snapshot.
6. `GET /api/v1/academic/overview/latest` retrieves the latest saved overview for the current student. Reloading the screen restores it.

## Code map
- `client/src/features/analysis/Analysis.jsx`: guided questions, navigation, generation, four recommendation sections, previous overview.
- `src/routes/academicRoutes.js`: new authenticated overview routes; POST uses `aiLimiter` and `validate(answersSchema)`.
- `src/services/academicOverviewService.js`: context aggregation, questions, AI call, output validation and persistence.
- `src/models/AcademicOverview.js`: user-scoped versioned saved result, input answers and context snapshot.
- `tests/academicOverview.test.js`: input/output schema contract tests.

## Engineering decisions
- Separation of concerns: AI overview does not mutate study plans or assessment records.
- Backend ownership: all academic records are queried using the authenticated user's ID, never a client-supplied user ID.
- Explicit clarifications: existing student records cannot reveal personal habits or obstacles, so questions are required before generation.
- Evidence-aware advice: recommendations must cite data or explicitly identify conditional suggestions. This is prompt guidance, not a factual-verification guarantee.
- Data minimization: question text and personally identifying fields are not included in the AI payload; avoid submitting sensitive free text.
- Persistence: snapshots enable future historical comparison, but contain potentially sensitive student information; define retention and deletion policy before launch.
- Fail closed: invalid AI JSON is rejected rather than persisted.

## Verification and limitations
Backend syntax checks passed. Existing backend tests pass, but the newly added overview schema tests could not load because npm dependencies are absent in the current environment. Frontend build, real Groq calls and MongoDB integration remain unverified. Run `npm ci && npm test && npm run check` at the server root, then `cd client && npm ci && npm run build` in an environment with npm access. Manually verify account isolation, question flow, saved overview retrieval and rate limiting.

## Future work
Potential improvements: adaptive follow-up questions based on missing context, feedback on each recommendation, change history, plan recommendations derived from overview, content safety evaluation, and a retention/deletion interface. Do not claim these are implemented.
