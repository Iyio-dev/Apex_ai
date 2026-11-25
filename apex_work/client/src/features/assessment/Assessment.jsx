import {QuestionText} from "../../components/ui/QuestionText";
import { toast } from "../../components/ui/ToastHost";
import { ApexLoader } from "../../components/ui/ApexLoader";
import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { api, errorText } from "../../api";
import { useLoad } from "../../hooks/useLoad";
import { Header } from "../../components/ui/Header";
import { Notice } from "../../components/ui/Notice";
export function Assessment() {
  const { data, error, loading, refresh } = useLoad(
      "/academic/assessments/daily",
    ),
    [answers, setAnswers] = useState({}),
    [result, setResult] = useState(null),
    [busy, setBusy] = useState(false),
    [err, setErr] = useState("");
  const qs = data?.questions || [];
  const submit = async () => {
    setBusy(true);
    setErr("");
    try {
      const r = await api("/academic/assessments/daily", {
        method: "POST",
        body: {
          answers: qs.map((q) => ({ question: q._id, answer: answers[q._id] })),
        },
      });
      setResult(r);
      toast("Your assessment has been submitted successfully.");
      refresh();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Header
        title="Daily assessment"
        subtitle={`${qs.length || 5} questions to check your understanding.`}
      />
      <Notice error={error || err} />
      {loading ? (
        <ApexLoader message="Preparing your personalized questions" />
      ) : data?.submitted ? (
        <div className="panel">
          <CheckCircle2 className="text-emerald-600 mb-3" />
          <h3 className="text-xl font-bold">Completed for today</h3>
          <p className="muted mt-2">
            Your score: {data.score}/{data.total || 5}. Come back tomorrow for another set.
          </p>
          {result && <div className="panel mt-5"><h3 className="font-bold">Score: {result.score}/{result.total || data.total || 5}</h3>{result.answers?.map((a,i)=><p key={i} className="mt-3 text-sm">Question {i+1}: {a.correct?"Correct":"Needs revision"}. Correct answer: <QuestionText>{a.correctAnswer}</QuestionText>. <QuestionText>{a.explanation}</QuestionText></p>)}</div>}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {qs.map((q, i) => (
              <div className="panel" key={q._id}>
                <p className="text-xs uppercase font-bold tracking-wide text-indigo-600 mb-2">
                  Question {i + 1} of {qs.length} · {q.subject}
                </p>
                <h3 className="font-semibold mb-4"><QuestionText>{q.text}</QuestionText></h3>
                {q.options?.length ? (
                  <div className="space-y-2">
                    {q.options.map((option, j) => (
                      <label
                        key={j}
                        className={cls(
                          "flex gap-3 items-center border rounded-xl p-3 cursor-pointer",
                          answers[q._id] === option
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200",
                        )}
                      >
                        <input
                          type="radio"
                          name={q._id}
                          value={option}
                          checked={answers[q._id] === option}
                          onChange={() =>
                            setAnswers({ ...answers, [q._id]: option })
                          }
                        />
                        <QuestionText>{option}</QuestionText>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    className="field"
                    aria-label={`Answer to question ${i + 1}`}
                    value={answers[q._id] || ""}
                    onChange={(e) =>
                      setAnswers({ ...answers, [q._id]: e.target.value })
                    }
                    placeholder="Type your answer"
                  />
                )}
              </div>
            ))}
          </div>
          {qs.length === 5 && (
            <button
              className="btn mt-5"
              disabled={busy || qs.some((q) => !answers[q._id]?.trim())}
              onClick={submit}
            >
              Submit {qs.length} answers
            </button>
          )}

        </>
      )}
    </>
  );
}
