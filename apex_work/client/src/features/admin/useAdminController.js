import { useCallback, useEffect, useMemo, useState } from "react";
import { api, errorText } from "../../api";
import { emptySyllabus, emptyQuestion } from "./adminUI";
export function useAdminController() {
  const [allowed, setAllowed] = useState(null);
  const [syllabuses, setSyllabuses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionTotal, setQuestionTotal] = useState(0);
  const [tab, setTab] = useState("syllabus");
  const [syllabusForm, setSyllabusForm] = useState(emptySyllabus);
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [editingSyllabus, setEditingSyllabus] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      await api("/academic/admin/access");
      setAllowed(true);
      const [syl, qs] = await Promise.all([
        api("/academic/admin/syllabuses"),
        api("/academic/questions?limit=100&offset=0")
      ]);
      setSyllabuses(Array.isArray(syl) ? syl : []);
      setQuestions(qs?.results || []);
      setQuestionTotal(qs?.pagination?.total ?? qs?.results?.length ?? 0);
    } catch (e) {
      if (e?.status === 403 || e?.status === 401) setAllowed(false);
      setError(errorText(e));
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const topics = useMemo(() => syllabuses.flatMap(s =>
    (s.topics || []).map(t => ({ ...t, subject: s.subject, syllabusId: s._id }))
  ), [syllabuses]);
  const filteredSyllabuses = syllabuses.filter(s =>
    `${s.subject} ${s.programme}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredQuestions = questions.filter(q =>
    `${q.text} ${q.subject} ${q.difficulty}`.toLowerCase().includes(search.toLowerCase())
  );

  const resetSyllabus = () => { setSyllabusForm(emptySyllabus()); setEditingSyllabus(null); };
  const resetQuestion = () => { setQuestionForm(emptyQuestion()); setEditingQuestion(null); };

  const editSyllabus = (item) => {
    setSyllabusForm({
      programme: item.programme, subject: item.subject, description: item.description || "",
      topics: (item.topics || []).map(t => ({
        _id: t._id, name: t.name, description: t.description || "", courseCode: t.courseCode || "", courseTitle:t.courseTitle||"",
        difficulty: t.difficulty || "medium", estimatedHours: Number(t.estimatedHours ?? 2), lectureCovered: !!t.lectureCovered, predictedNext: !!t.predictedNext, objectives: t.objectives || [], requiredSkills:t.requiredSkills||[], questionTypes:t.questionTypes||[],
        subtopics: (t.subtopics || []).map(st => ({ _id: st._id, name: st.name, description: st.description || "", objectives:st.objectives||[] }))
      }))
    });
    setEditingSyllabus(item._id); setTab("syllabus-editor"); setError(""); setSuccess("");
  };
  const saveSyllabus = async (e) => {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      if (!editingSyllabus && syllabuses.some(item =>
        item.programme.toLowerCase() === syllabusForm.programme.trim().toLowerCase() &&
        item.subject === syllabusForm.subject
      )) {
        throw new Error("A syllabus already exists for this programme and subject. Edit the existing syllabus instead.");
      }
      const body = {
        ...syllabusForm,
        topics: syllabusForm.topics.map(t => ({
          ...t, estimatedHours: Number(t.estimatedHours || 0),
          objectives: (t.objectives || []).map(x=>x.trim()).filter(Boolean),
          requiredSkills: (t.requiredSkills || []).map(x=>x.trim()).filter(Boolean),
          questionTypes: (t.questionTypes || []).map(x=>x.trim()).filter(Boolean),
          subtopics: (t.subtopics || []).map(st=>({...st,objectives:(st.objectives||[]).map(x=>x.trim()).filter(Boolean)}))
        }))
      };
      if (editingSyllabus) await api(`/academic/syllabuses/${editingSyllabus}`, { method: "PATCH", body });
      else await api("/academic/syllabuses", { method: "POST", body });
      await load(); resetSyllabus(); setTab("syllabus"); setSuccess("Syllabus saved successfully.");
    } catch (e) { setError(errorText(e)); }
    finally { setSaving(false); }
  };
  const deleteSyllabus = async (item) => {
    if (!window.confirm(`Delete the ${item.subject} syllabus? This may affect topic progress and questions linked to its topics.`)) return;
    setError(""); setSuccess("");
    try { await api(`/academic/syllabuses/${item._id}`, { method: "DELETE" }); await load(); setSuccess("Syllabus deleted."); }
    catch (e) { setError(errorText(e)); }
  };

  const editQuestion = async (item) => {
    setError(""); setSuccess("");
    try {
      const full = await api(`/academic/questions/${item._id}/editor`);
      setQuestionForm({
        subject: full.subject, topic: full.topic, text: full.text,
        options: full.options?.length ? full.options : ["", "", "", ""],
        correctAnswer: full.correctAnswer || "", explanation: full.explanation || "",
        difficulty: full.difficulty || "medium"
      });
      setEditingQuestion(full._id); setTab("question-editor");
    } catch (e) { setError(errorText(e)); }
  };
  const saveQuestion = async (e) => {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      const body = {
        ...questionForm,
        options: questionForm.options.map(x => x.trim()).filter(Boolean)
      };
      if (editingQuestion) await api(`/academic/questions/${editingQuestion}`, { method: "PATCH", body });
      else await api("/academic/questions", { method: "POST", body });
      await load(); resetQuestion(); setTab("questions"); setSuccess("Question saved successfully.");
    } catch (e) { setError(errorText(e)); }
    finally { setSaving(false); }
  };
  const deleteQuestion = async (item) => {
    if (!window.confirm("Delete this question? Existing assessments may reference it.")) return;
    setError(""); setSuccess("");
    try { await api(`/academic/questions/${item._id}`, { method: "DELETE" }); await load(); setSuccess("Question deleted."); }
    catch (e) { setError(errorText(e)); }
  };

  const updateTopic = (index, patch) => setSyllabusForm(old => ({
    ...old, topics: old.topics.map((t,i) => i === index ? {...t, ...patch} : t)
  }));
  const addTopic = () => setSyllabusForm(old => ({...old, topics: [...old.topics, {
    name: "", description: "", courseCode: "", difficulty: "medium", estimatedHours: 2, lectureCovered: false, predictedNext: false, objectives: [], subtopics: []
  }]}));
  const removeTopic = (index) => setSyllabusForm(old => ({...old, topics: old.topics.filter((_,i) => i !== index)}));
  const addSubtopic = (index) => updateTopic(index, {subtopics: [...(syllabusForm.topics[index].subtopics || []), {name:"",description:""}]});
  const updateSubtopic = (ti, si, patch) => updateTopic(ti, {subtopics: syllabusForm.topics[ti].subtopics.map((st,i) => i === si ? {...st,...patch} : st)});
  const removeSubtopic = (ti, si) => updateTopic(ti, {subtopics: syllabusForm.topics[ti].subtopics.filter((_,i) => i !== si)});

  return { allowed, syllabuses, questions, questionTotal, tab, setTab, syllabusForm, setSyllabusForm, questionForm, setQuestionForm, editingSyllabus, editingQuestion, search, setSearch, loading, saving, error, setError, success, setSuccess, load, topics, filteredSyllabuses, filteredQuestions, resetSyllabus, resetQuestion, editSyllabus, saveSyllabus, deleteSyllabus, editQuestion, saveQuestion, deleteQuestion, updateTopic, addTopic, removeTopic, addSubtopic, updateSubtopic, removeSubtopic };
}
