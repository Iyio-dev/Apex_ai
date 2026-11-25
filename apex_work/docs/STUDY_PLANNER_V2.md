# APEX Study Planner V2

- Admin syllabus topics now support lectureCovered, predictedNext and official objectives. These fields are editable through the admin syllabus API. Existing records default to false / empty.
- Student syllabus no longer offers lecture coverage editing. Student progress updates accept understanding only. Existing historical student lectureCovered values are retained for compatibility but are not used for the student syllabus indicator.
- Wizard allows topic selection and interests, and sends these preferences to AI.
- Each study activity supports personal subtopics, objectives and interests, separately from official syllabus.
- Activity customization is persisted via the existing authenticated PATCH route.
- AI generation still requires GROQ_API_KEY. Generated sessions are validated for weekly/daily limits.
- Follow-up: expose admin topic flags and objectives in the admin editing form, add automated end-to-end tests and verify deployment.
