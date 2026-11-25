# APEX — collaborative syllabus-driven study planner update

## Delivered
- Three-step planning wizard: syllabus topic choices, schedule availability, and student interests/goals.
- Student topic selection includes difficulty, estimated hours, admin-covered and predicted-next labels, and subtopics.
- Personal session editor for date, duration, title, personal subtopics, objectives, and interests; saves through existing PATCH endpoint.
- Official syllabus and lecture coverage remain admin-managed. Student understanding is separate.
- More polished top bar and softened midnight-blue theme.
- Backend carries student interests into generated activities; existing server-side planning validation still checks daily and weekly limits.

## Before deployment
- Install dependencies in both root and client directories (`npm ci`).
- Run `npm test` at root and `npm run build` in client.
- Configure database and GROQ_API_KEY; verify login, permissions, and plan generation with real test accounts.
- Confirm admin creates approved syllabus topics, coverage, predictions, and objectives.
- Check generated session editing on desktop/mobile, and review scheduling conflicts before production.

## Notes
This is an implementation package, not a deployed or end-to-end-tested release. The source archive contains no node_modules or secrets. The existing tests cannot fully run in this environment without installing dependencies.
