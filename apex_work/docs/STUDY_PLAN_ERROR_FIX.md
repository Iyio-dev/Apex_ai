# Study plan generation error fix

- AI-generated sessions on rest days are rescheduled to permitted days where capacity allows.
- Sessions exceeding daily or weekly limits are skipped rather than causing an opaque 502 error.
- If the AI provider fails or yields no usable sessions, a rule-based syllabus schedule is generated.
- The saved plan `source` identifies `ai` versus `rule-based`.
- If no sessions can fit, the API returns `NO_AVAILABLE_STUDY_TIME` with an actionable explanation.
- Tests: `node --test tests/studyScheduleEngine.test.js`.

Limitations: Provider configuration and database-backed end-to-end flows require testing in a configured deployment. Rule-based fallback is not AI personalization. The scheduler can produce fewer sessions than requested when capacity is insufficient; the UI should explain the allocated total to students.
