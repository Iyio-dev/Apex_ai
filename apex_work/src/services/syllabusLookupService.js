import Syllabus from '../models/Syllabus.js';

const clean = value => String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
const programmeKey = value => {
 const normalized = clean(value);
 // The school prefix varies between JUPEB imports and academic profiles.
 return /\bjupeb\b/.test(normalized) ? 'jupeb' : normalized;
};

export function matchSyllabuses(records, profile) {
 const subjects = new Set((profile.subjects || []).map(clean));
 if(subjects.size!==4)return [];
 const programme = programmeKey(profile.programme);
 return records.filter(s => programmeKey(s.programme) === programme && subjects.has(clean(s.subject)));
}

export async function findStudentSyllabuses(profile) {
 // Query broadly so legacy spacing/case and JUPEB programme prefixes don't hide records.
 const records = await Syllabus.find().lean();
 return matchSyllabuses(records, profile);
}

export function syllabusDiagnostics(records, profile) {
 const matches = matchSyllabuses(records, profile);
 return {
  requestedProgramme: profile.programme,
  requestedSubjects: profile.subjects,
  matchedSubjects: matches.map(s => ({subject:s.subject,topics:s.topics?.length || 0})),
  totalTopics: matches.reduce((sum,s) => sum + (s.topics?.length || 0), 0),
  availableRecords: records.map(s => ({programme:s.programme,subject:s.subject,topics:s.topics?.length || 0}))
 };
}
