import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  Plus,
  Save,
  Trash2,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  Pencil,
  X,
  Search,
  Layers3,
  CircleHelp,
  CheckCircle2,
} from "lucide-react";
import { api, errorText } from "./api";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry"];
const emptySyllabus = () => ({
  programme: "OAU JUPEB",
  subject: "Mathematics",
  description: "",
  topics: [],
});
const emptyQuestion = () => ({
  subject: "Mathematics",
  topic: "",
  text: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
  difficulty: "medium",
});
const cx = (...items) => items.filter(Boolean).join(" ");

function Field({ label, children, hint }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs font-normal text-slate-500">
          {hint}
        </span>
      )}
    </label>
  );
}
function Input(props) {
  return <input {...props} className={cx("field mt-1", props.className)} />;
}
function Textarea(props) {
  return (
    <textarea
      {...props}
      className={cx("field mt-1 min-h-24", props.className)}
    />
  );
}
function Select(props) {
  return <select {...props} className={cx("field mt-1", props.className)} />;
}
function Button({ children, secondary, danger, ...props }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        danger
          ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : secondary
            ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            : "bg-indigo-600 text-white hover:bg-indigo-700",
        props.className,
      )}
    >
      {children}
    </button>
  );
}
function Alert({ error, success }) {
  if (!error && !success) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      className={cx(
        "mb-4 rounded-xl border p-3 text-sm",
        error
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
      )}
    >
      {error || success}
    </div>
  );
}
function Stat({ icon: Icon, label, value, note }) {
  return (
    <div className="panel">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-sm">{label}</span>
        <Icon size={19} className="text-indigo-600" />
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

export function AdminNav() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    let active = true;
    api("/academic/admin/access")
      .then(() => active && setAllowed(true))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  if (!allowed) return null;
  return (
    <NavLink
      to="/admin"
      className={({ isActive }) =>
        cx(
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
          isActive
            ? "bg-indigo-600 text-white"
            : "text-slate-300 hover:bg-slate-800",
        )
      }
    >
      <ShieldCheck size={18} /> Content admin
    </NavLink>
  );
}

export default function Admin() {
  const [allowed, setAllowed] = useState(null);
  const [syllabuses, setSyllabuses] = useState([]);
  const [questions, setQuestions] = useState([]);
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
    setLoading(true);
    setError("");
    try {
      await api("/academic/admin/access");
      setAllowed(true);
      const [syl, qs] = await Promise.all([
        api("/academic/syllabuses"),
        api("/academic/questions?limit=100&offset=0"),
      ]);
      setSyllabuses(Array.isArray(syl) ? syl : []);
      setQuestions(qs?.results || []);
    } catch (e) {
      if (e?.status === 403 || e?.status === 401) setAllowed(false);
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const topics = useMemo(
    () =>
      syllabuses.flatMap((s) =>
        (s.topics || []).map((t) => ({
          ...t,
          subject: s.subject,
          syllabusId: s._id,
        })),
      ),
    [syllabuses],
  );
  const filteredSyllabuses = syllabuses.filter((s) =>
    `${s.subject} ${s.programme}`.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredQuestions = questions.filter((q) =>
    `${q.text} ${q.subject} ${q.difficulty}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const resetSyllabus = () => {
    setSyllabusForm(emptySyllabus());
    setEditingSyllabus(null);
  };
  const resetQuestion = () => {
    setQuestionForm(emptyQuestion());
    setEditingQuestion(null);
  };

  const editSyllabus = (item) => {
    setSyllabusForm({
      programme: item.programme,
      subject: item.subject,
      description: item.description || "",
      topics: (item.topics || []).map((t) => ({
        _id: t._id,
        name: t.name,
        description: t.description || "",
        difficulty: t.difficulty || "medium",
        estimatedHours: Number(t.estimatedHours ?? 2),
        subtopics: (t.subtopics || []).map((st) => ({
          _id: st._id,
          name: st.name,
          description: st.description || "",
        })),
      })),
    });
    setEditingSyllabus(item._id);
    setTab("syllabus-editor");
    setError("");
    setSuccess("");
  };
  const saveSyllabus = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (
        !editingSyllabus &&
        syllabuses.some(
          (item) =>
            item.programme.toLowerCase() ===
              syllabusForm.programme.trim().toLowerCase() &&
            item.subject === syllabusForm.subject,
        )
      ) {
        throw new Error(
          "A syllabus already exists for this programme and subject. Edit the existing syllabus instead.",
        );
      }
      const body = {
        ...syllabusForm,
        topics: syllabusForm.topics.map(({ _id, ...t }) => ({
          ...t,
          estimatedHours: Number(t.estimatedHours || 0),
          subtopics: (t.subtopics || []).map(({ _id: sid, ...st }) => st),
        })),
      };
      if (editingSyllabus)
        await api(`/academic/syllabuses/${editingSyllabus}`, {
          method: "PATCH",
          body,
        });
      else await api("/academic/syllabuses", { method: "POST", body });
      await load();
      resetSyllabus();
      setTab("syllabus");
      setSuccess("Syllabus saved successfully.");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSaving(false);
    }
  };
  const deleteSyllabus = async (item) => {
    if (
      !window.confirm(
        `Delete the ${item.subject} syllabus? This may affect topic progress and questions linked to its topics.`,
      )
    )
      return;
    setError("");
    setSuccess("");
    try {
      await api(`/academic/syllabuses/${item._id}`, { method: "DELETE" });
      await load();
      setSuccess("Syllabus deleted.");
    } catch (e) {
      setError(errorText(e));
    }
  };

  const editQuestion = async (item) => {
    setError("");
    setSuccess("");
    try {
      const full = await api(`/academic/questions/${item._id}/editor`);
      setQuestionForm({
        subject: full.subject,
        topic: full.topic,
        text: full.text,
        options: full.options?.length ? full.options : ["", "", "", ""],
        correctAnswer: full.correctAnswer || "",
        explanation: full.explanation || "",
        difficulty: full.difficulty || "medium",
      });
      setEditingQuestion(full._id);
      setTab("question-editor");
    } catch (e) {
      setError(errorText(e));
    }
  };
  const saveQuestion = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const body = {
        ...questionForm,
        options: questionForm.options.map((x) => x.trim()).filter(Boolean),
      };
      if (editingQuestion)
        await api(`/academic/questions/${editingQuestion}`, {
          method: "PATCH",
          body,
        });
      else await api("/academic/questions", { method: "POST", body });
      await load();
      resetQuestion();
      setTab("questions");
      setSuccess("Question saved successfully.");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSaving(false);
    }
  };
  const deleteQuestion = async (item) => {
    if (
      !window.confirm(
        "Delete this question? Existing assessments may reference it.",
      )
    )
      return;
    setError("");
    setSuccess("");
    try {
      await api(`/academic/questions/${item._id}`, { method: "DELETE" });
      await load();
      setSuccess("Question deleted.");
    } catch (e) {
      setError(errorText(e));
    }
  };

  const updateTopic = (index, patch) =>
    setSyllabusForm((old) => ({
      ...old,
      topics: old.topics.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    }));
  const addTopic = () =>
    setSyllabusForm((old) => ({
      ...old,
      topics: [
        ...old.topics,
        {
          name: "",
          description: "",
          difficulty: "medium",
          estimatedHours: 2,
          subtopics: [],
        },
      ],
    }));
  const removeTopic = (index) =>
    setSyllabusForm((old) => ({
      ...old,
      topics: old.topics.filter((_, i) => i !== index),
    }));
  const addSubtopic = (index) =>
    updateTopic(index, {
      subtopics: [
        ...(syllabusForm.topics[index].subtopics || []),
        { name: "", description: "" },
      ],
    });
  const updateSubtopic = (ti, si, patch) =>
    updateTopic(ti, {
      subtopics: syllabusForm.topics[ti].subtopics.map((st, i) =>
        i === si ? { ...st, ...patch } : st,
      ),
    });
  const removeSubtopic = (ti, si) =>
    updateTopic(ti, {
      subtopics: syllabusForm.topics[ti].subtopics.filter((_, i) => i !== si),
    });

  if (loading && allowed === null)
    return <div className="panel">Checking content-editor access…</div>;
  if (allowed === false)
    return (
      <div className="panel max-w-2xl">
        <ShieldCheck className="mb-3 text-rose-600" size={28} />
        <h2 className="heading">Admin access required</h2>
        <p className="muted mt-2">
          This account is not on the server's CONTENT_EDITOR_EMAILS allowlist.
          Sign in with your authorized content-editor account.
        </p>
        <p className="mt-4">
          <a className="text-indigo-600 font-semibold" href="/">
            Return to student dashboard
          </a>
        </p>
      </div>
    );

  const syllabusEditor = tab === "syllabus-editor";
  const questionEditor = tab === "question-editor";
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <ShieldCheck size={14} /> CONTENT MANAGEMENT
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Admin dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the academic content students use across APEX.
          </p>
        </div>
        <Button secondary onClick={load}>
          <RefreshCw size={16} /> Refresh data
        </Button>
      </div>
      <Alert error={error} success={success} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={BookOpen}
          label="Subject syllabuses"
          value={syllabuses.length}
          note="Programme and subject records"
        />
        <Stat
          icon={Layers3}
          label="Topics and subtopics"
          value={syllabuses.reduce((n, s) => n + (s.topics || []).length, 0)}
          note={`${topics.length} topic records available`}
        />
        <Stat
          icon={CircleHelp}
          label="Question bank"
          value={questions.length}
          note="Questions currently loaded (first 100)"
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          ["syllabus", "Syllabuses", BookOpen],
          ["questions", "Question bank", ClipboardList],
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              setError("");
              setSuccess("");
            }}
            className={cx(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
              tab === id ||
                (id === "syllabus" && syllabusEditor) ||
                (id === "questions" && questionEditor)
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100",
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === "syllabus" && (
        <section className="panel">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Syllabus library
              </h2>
              <p className="muted">
                Create a syllabus for a programme and subject, then add its
                topics and subtopics.
              </p>
            </div>
            <Button
              onClick={() => {
                resetSyllabus();
                setTab("syllabus-editor");
              }}
            >
              <Plus size={17} /> Add syllabus
            </Button>
          </div>
          <div className="relative mb-4">
            <Search
              size={17}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              className="field pl-10"
              placeholder="Search subject or programme…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filteredSyllabuses.length ? (
            <div className="space-y-3">
              {filteredSyllabuses.map((s) => (
                <div
                  key={s._id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {s.subject}
                      </div>
                      <div className="text-xs text-slate-500">
                        {s.programme} · {s.topics?.length || 0} topics ·{" "}
                        {(s.topics || []).reduce(
                          (n, t) => n + (t.subtopics || []).length,
                          0,
                        )}{" "}
                        subtopics
                      </div>
                      {s.description && (
                        <p className="mt-2 text-sm text-slate-600">
                          {s.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button secondary onClick={() => editSyllabus(s)}>
                        <Pencil size={15} /> Edit
                      </Button>
                      <Button danger onClick={() => deleteSyllabus(s)}>
                        <Trash2 size={15} /> Delete
                      </Button>
                    </div>
                  </div>
                  {!!s.topics?.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {s.topics.slice(0, 8).map((t) => (
                        <span
                          key={t._id}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                        >
                          {t.name}
                        </span>
                      ))}
                      {s.topics.length > 8 && (
                        <span className="text-xs text-slate-500">
                          +{s.topics.length - 8} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
              No syllabus records found. Add your first subject syllabus.
            </div>
          )}
        </section>
      )}

      {syllabusEditor && (
        <section className="panel">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                {editingSyllabus ? "Edit syllabus" : "Create syllabus"}
              </h2>
              <p className="muted">
                Add the verified programme content students will follow.
              </p>
            </div>
            <Button
              secondary
              onClick={() => {
                resetSyllabus();
                setTab("syllabus");
              }}
            >
              <X size={16} /> Close
            </Button>
          </div>
          <form onSubmit={saveSyllabus} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Programme">
                <Input
                  required
                  value={syllabusForm.programme}
                  onChange={(e) =>
                    setSyllabusForm({
                      ...syllabusForm,
                      programme: e.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Subject">
                <Select
                  value={syllabusForm.subject}
                  onChange={(e) =>
                    setSyllabusForm({
                      ...syllabusForm,
                      subject: e.target.value,
                    })
                  }
                >
                  {SUBJECTS.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Syllabus description">
              <Textarea
                value={syllabusForm.description}
                onChange={(e) =>
                  setSyllabusForm({
                    ...syllabusForm,
                    description: e.target.value,
                  })
                }
                placeholder="Describe the syllabus or its source…"
              />
            </Field>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">
                  Topics ({syllabusForm.topics.length})
                </h3>
                <p className="muted">Add each topic and its subtopics.</p>
              </div>
              <Button type="button" secondary onClick={addTopic}>
                <Plus size={15} /> Add topic
              </Button>
            </div>
            {syllabusForm.topics.map((t, i) => (
              <div
                key={t._id || `new-${i}`}
                className="rounded-2xl border border-slate-200 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                    Topic {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTopic(i)}
                    className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                    aria-label="Remove topic"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Topic name">
                    <Input
                      required
                      value={t.name}
                      onChange={(e) => updateTopic(i, { name: e.target.value })}
                      placeholder="e.g. Differentiation"
                    />
                  </Field>
                  <Field label="Estimated hours">
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={t.estimatedHours}
                      onChange={(e) =>
                        updateTopic(i, { estimatedHours: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Difficulty">
                    <Select
                      value={t.difficulty || "medium"}
                      onChange={(e) =>
                        updateTopic(i, { difficulty: e.target.value })
                      }
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </Select>
                  </Field>
                  <Field label="Description">
                    <Input
                      value={t.description || ""}
                      onChange={(e) =>
                        updateTopic(i, { description: e.target.value })
                      }
                      placeholder="Optional description"
                    />
                  </Field>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Subtopics ({t.subtopics?.length || 0})
                    </span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-indigo-600"
                      onClick={() => addSubtopic(i)}
                    >
                      + Add subtopic
                    </button>
                  </div>
                  {(t.subtopics || []).map((st, j) => (
                    <div key={st._id || `sub-${i}-${j}`} className="flex gap-2">
                      <input
                        className="field mt-0"
                        required
                        value={st.name}
                        placeholder="Subtopic name"
                        onChange={(e) =>
                          updateSubtopic(i, j, { name: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeSubtopic(i, j)}
                        className="px-2 text-rose-600"
                        aria-label="Remove subtopic"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                secondary
                onClick={() => {
                  resetSyllabus();
                  setTab("syllabus");
                }}
              >
                Cancel
              </Button>
              <Button disabled={saving}>
                <Save size={16} />
                {saving ? "Saving…" : "Save syllabus"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {tab === "questions" && (
        <section className="panel">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Question bank</h2>
              <p className="muted">
                Create and maintain assessment questions linked to syllabus
                topics.
              </p>
            </div>
            <Button
              onClick={() => {
                resetQuestion();
                setTab("question-editor");
              }}
            >
              <Plus size={17} /> Add question
            </Button>
          </div>
          <div className="relative mb-4">
            <Search
              size={17}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              className="field pl-10"
              placeholder="Search question text, subject or difficulty…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filteredQuestions.length ? (
            <div className="space-y-3">
              {filteredQuestions.map((q) => (
                <div
                  key={q._id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-md bg-indigo-50 px-2 py-1 font-semibold text-indigo-700">
                        {q.subject}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-900">
                      {q.text}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Topic ID: {String(q.topic)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button secondary onClick={() => editQuestion(q)}>
                      <Pencil size={15} /> Edit
                    </Button>
                    <Button danger onClick={() => deleteQuestion(q)}>
                      <Trash2 size={15} /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
              No questions found. Add questions after creating the relevant
              syllabus topics.
            </div>
          )}
          {questions.length === 100 && (
            <p className="mt-4 text-xs text-slate-500">
              Showing the first 100 questions. Search is limited to the loaded
              records.
            </p>
          )}
        </section>
      )}

      {questionEditor && (
        <section className="panel">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                {editingQuestion ? "Edit question" : "Add question"}
              </h2>
              <p className="muted">
                Answers and explanations are stored privately and not exposed
                before submission.
              </p>
            </div>
            <Button
              secondary
              onClick={() => {
                resetQuestion();
                setTab("questions");
              }}
            >
              <X size={16} /> Close
            </Button>
          </div>
          <form onSubmit={saveQuestion} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Subject">
                <Select
                  value={questionForm.subject}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      subject: e.target.value,
                      topic: "",
                    })
                  }
                >
                  {SUBJECTS.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Topic">
                <Select
                  required
                  value={questionForm.topic}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, topic: e.target.value })
                  }
                >
                  <option value="">Choose a topic</option>
                  {topics
                    .filter((t) => t.subject === questionForm.subject)
                    .map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                </Select>
              </Field>
            </div>
            <Field label="Question text">
              <Textarea
                required
                value={questionForm.text}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, text: e.target.value })
                }
                placeholder="Enter the question…"
              />
            </Field>
            <div>
              <div className="mb-2 text-sm font-semibold">Answer options</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {questionForm.options.map((option, i) => (
                  <Field
                    key={i}
                    label={`Option ${String.fromCharCode(65 + i)}`}
                  >
                    <Input
                      value={option}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          options: questionForm.options.map((x, j) =>
                            j === i ? e.target.value : x,
                          ),
                        })
                      }
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    />
                  </Field>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Correct answer"
                hint="Enter the exact option text, not its letter."
              >
                <Input
                  required
                  value={questionForm.correctAnswer}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      correctAnswer: e.target.value,
                    })
                  }
                  placeholder="Exact correct option"
                />
              </Field>
              <Field label="Difficulty">
                <Select
                  value={questionForm.difficulty}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      difficulty: e.target.value,
                    })
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Select>
              </Field>
            </div>
            <Field label="Explanation">
              <Textarea
                value={questionForm.explanation}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    explanation: e.target.value,
                  })
                }
                placeholder="Explain why the answer is correct…"
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                secondary
                onClick={() => {
                  resetQuestion();
                  setTab("questions");
                }}
              >
                Cancel
              </Button>
              <Button disabled={saving}>
                <Save size={16} />
                {saving ? "Saving…" : "Save question"}
              </Button>
            </div>
          </form>
        </section>
      )}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Content integrity:</strong> Enter only verified syllabus
        material and reviewed questions. Deleting topics or questions can affect
        existing student progress and assessment records; prefer editing content
        rather than deleting records already used by students.
      </div>
    </div>
  );
}
