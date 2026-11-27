export function coveredScope(records = []) {
  const covered = records.map(s => ({...s, topics: (s.topics || []).filter(t => t.lectureCovered === true)}));
  return {records: covered, topics: new Map(covered.flatMap(s => s.topics.map(t => [String(t._id), s.subject])))};
}

export function coveredProfileTopics(records, values = []) {
 const allowed = new Set(coveredScope(records).records.flatMap(s => s.topics.map(t => t.name)));
 return values.filter(value => allowed.has(value));
}
