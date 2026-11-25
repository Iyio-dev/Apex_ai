import { addCalendarDays } from "../utils/date.js";

export function scheduleSessions({ sessions, candidates, preferences, start, maxPerDay, weeklyMinutes }) {
  const byId = new Map(candidates.map(t => [String(t.topic._id), t]));
  const usage = new Map();
  const weekly = new Map();
  const usedTopics = new Set();
  const activities = [];
  const availableDays = Array.from({length: preferences.days}, (_, day) => day).filter(day => {
    const date = addCalendarDays(start, day);
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    return !preferences.breakDays.includes(weekday);
  });
  if (!availableDays.length) return [];
  for (const session of sessions) {
    const topic = byId.get(String(session.topicId));
    if (!topic) continue;
    const minutes = Math.min(maxPerDay, weeklyMinutes, Math.max(15, Math.floor(Number(session.minutes) || 45)));
    const preferred = Number.isInteger(session.day) ? session.day : availableDays[0];
    const ordered = [...availableDays].sort((a,b) => Math.abs(a-preferred)-Math.abs(b-preferred) || a-b);
    const day = ordered.find(d => (usage.get(d)||0)+minutes <= maxPerDay && (weekly.get(Math.floor(d/7))||0)+minutes <= weeklyMinutes && !usedTopics.has(`${d}:${session.topicId}`));
    if (day === undefined) continue;
    usage.set(day,(usage.get(day)||0)+minutes);
    const week=Math.floor(day/7);
    weekly.set(week,(weekly.get(week)||0)+minutes);
    usedTopics.add(`${day}:${session.topicId}`);
    const syllabusObjectives=(topic.topic.objectives||[]).slice(0,3);
    const requestedObjectives=Array.isArray(session.objectives)?session.objectives.filter(x=>typeof x==="string"&&x.trim()).slice(0,3):[];
    const objectives=requestedObjectives.length?requestedObjectives:syllabusObjectives;
    activities.push({day,subject:topic.subject,topic:topic.topic._id,title:`Study ${topic.topic.name}`,estimatedMinutes:minutes,priority:["low","medium","high"].includes(session.priority)?session.priority:"medium",personalObjectives:objectives,personalSubtopics:(topic.topic.subtopics||[]).slice(0,4).map(s=>s.name),interestNote:preferences.interestNote||""});
  }
  return activities.sort((a,b)=>a.day-b.day);
}

export function fallbackSessions(candidates, preferences, maxPerDay) {
  return Array.from({length:Math.min(100,Math.max(candidates.length,preferences.days))},(_,i)=>{
    const t=candidates[i%candidates.length];
    return {topicId:String(t.topic._id),day:i%preferences.days,minutes:Math.min(60,maxPerDay),priority:t.weak?"high":"medium"};
  });
}
