# APEX personalized assessment repair

- Objective test: 10 newly generated questions for a specific activity and its admin syllabus objectives.
- Revision test: 5 newly generated questions using historical completed/partial activities across plans and recorded lecture coverage/understanding.
- Each generation calls Groq with the academic profile, syllabus context and topic progress. No fixed shared question bank.
- Added schema normalization, deduplication and three generation attempts to address invalid AI JSON. Authentication/rate-limit errors now have separate messages.
- Removed Customize and Log study buttons and their inline editors from plan activity cards. Kept the status selector, objectives and Take a test button.
- Correct answers remain private until submission.
- Important: this environment cannot validate live Groq API, MongoDB or frontend build without configured services. Generated questions should be reviewed for scientific accuracy before high-stakes use.
