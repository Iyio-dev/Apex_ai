# Personalized daily assessment

Daily assessments now request five new MCQs from Groq for each student, grounded in their programme, registered subjects, syllabus, weak areas, topic understanding, and current/recent study plans. Admin question-bank content is not used. Questions and hidden answers are saved once per user per day. Existing admin question-bank screens remain available for other uses.

A student needs syllabus topics and either recorded coverage or a study plan. A valid GROQ_API_KEY and MongoDB connection are required. Older assessments created today using the question bank cannot be automatically migrated; new daily assessments start the following day.

The system uses current plan membership as a prioritization signal, not proof of mastery. AI question correctness must be monitored; generative AI can make mistakes.
