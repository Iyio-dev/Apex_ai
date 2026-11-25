# Syllabus lookup fix

Study Plan, Daily Assessment, Academic Overview and legacy academic plan/statistics now use a shared syllabus matching service. It tolerates subject capitalization/spacing and treats JUPEB programme labels (e.g. `OAU JUPEB` and `JUPEB`) as the same programme family. It does not rewrite database records or topic IDs.

Daily Assessment no longer requires prior study-plan/progress records before considering imported topics. Academic Overview now counts AI-generated questions in its assessment history.

## Check after deploying

1. Restart the backend and sign in as a student with an academic profile.
2. Open Study Plan: check the count and subjects shown by GET `/api/.../plans/context` (use the actual mounted route prefix).
3. If still zero, inspect MongoDB's `syllabuses` collection for actual documents and nonempty `topics` arrays. The earlier import script **skips existing subject records** rather than updating them.
4. Test Daily Assessment and AI Overview with the same profile.
5. Do not delete or replace existing syllabus records until topic-ID references are backed up and reconciled.

This package does not contain the newly imported JSON files or a live MongoDB connection. It cannot verify that the database contains the expected documents. No production database was changed.
