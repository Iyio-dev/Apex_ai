# APEX V1 — Consolidated Implementation Package

## Intended users
OAU JUPEB learners studying Mathematics, Physics and Chemistry. This package preserves the existing APEX application and does not create a separate assessment product.

## Included implementation
1. Guided Academic Interview in `client/src/features/plans/AIPlanWizard.jsx`: goals, obstacles, topic situation, academic context, flexible availability, preferred format and optional study-session duration.
2. Personalized study-plan generation in `src/services/personalizedPlanService.js` and `src/services/aiStudyPlanService.js`, retaining existing plan persistence and editing.
3. Admin-authored topic objectives, required skills and question competencies in the syllabus model, validators and admin syllabus editor.
4. Learning objectives displayed alongside activities in the student study-plan UI.
5. On-demand 10-MCQ objective tests generated using Groq, with server-side answer keys, submission marking, explanations and persisted attempts.
6. On-demand 10-MCQ revision tests based on recorded plan activities; results saved to the assessment history.
7. Existing syllabus, authentication, dashboard and academic overview functionality preserved.

## Student journey
Admin enters syllabus topics and objectives → student completes academic profile → guided interview → personalized plan → activity objectives displayed → Take a Test → 10 MCQs → submit → score and explanations. Revision mode selects previously studied topics represented in the plan.

## Important current limitations
- The questionnaire supports flexible missions as a preference, but the backend still persists scheduled study sessions.
- Revision coverage is based on recorded plan activities, not a comprehensive cross-plan mastery history.
- Live Groq generation, MongoDB persistence and frontend browser workflow require environment configuration and end-to-end verification.
- AI-generated assessment questions may be inaccurate; review safeguards and content quality checks are recommended before broad student use.
- Do not store real API keys in the ZIP or commit them to Git.

## Local verification
From project root: `npm install`, `npm test`, `npm run check`, `npm run dev`. From `client`: `npm install`, `npm run build`. Configure environment variables from `.env.example` files and a reachable MongoDB instance. Verify role-based admin editing, student generation, hidden answers before submission, scoring and revision history with test accounts.
