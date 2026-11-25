import React from "react";
import { BookOpen, CheckCircle2, Clock3, GraduationCap, Brain } from "lucide-react";
import { ApexLoader } from "../../components/ui/ApexLoader";
import { useLoad } from "../../hooks/useLoad";
import { Header } from "../../components/ui/Header";
import { Metric } from "../../components/ui/Metric";
import { Notice } from "../../components/ui/Notice";
import { prettyDate } from "../../lib/format";
export function Progress() {
  const { data, error, loading } = useLoad("/academic/statistics");
  return (
    <>
      <Header
        title="Learning progress"
        subtitle="Simple, transparent indicators based on your study records."
      />
      <Notice error={error} />
      {loading ? (
        <ApexLoader message="Loading your progress" />
      ) : (
        data && (
          <>
            <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
              <Metric
                label="Lecturer coverage"
                value={`${data.syllabus.percent}%`}
                detail={`${data.syllabus.covered} of ${data.syllabus.total} course topics`}
                Icon={BookOpen}
              />
              <Metric label="Topics you track" value={`${data.learning?.tracked ?? 0}/${data.learning?.total ?? data.syllabus.total}`} detail="Topics with a saved understanding rating" Icon={GraduationCap} />
              <Metric label="Confident topics" value={data.learning?.mastered ?? 0} detail="Rated 4 or 5 out of 5" Icon={Brain} />
              <Metric
                label="Completed activities"
                value={`${data.activities.completed}/${data.activities.planned ?? data.activities.total}`}
                detail={`${data.activities.skipped ?? 0} skipped · ${data.activities.partial ?? 0} partial`}
                Icon={CheckCircle2}
              />
              <Metric
                label="Time invested"
                value={`${((data.studyMinutes || 0) / 60).toFixed(1)}h`}
                detail="Logged study time"
                Icon={Clock3}
              />
            </div>
            <section className="panel mb-5">
              <h3 className="font-bold mb-4">Lecturer-marked coverage</h3>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${data.syllabus.percent}%` }}
                />
              </div>
              <p className="muted mt-3">
                This is course coverage marked by the content editor. Your topic ratings are counted separately above.
              </p>
            </section>
            <section className="panel">
              <h3 className="font-bold mb-4">Recent assessments</h3>
              {data.recentScores?.length ? (
                <div className="space-y-3">
                  {data.recentScores.map((r, i) => (
                    <div
                      className="flex items-center justify-between border-b pb-3"
                      key={i}
                    >
                      <span>{prettyDate(r.submittedAt || r.day)}</span>
                      <strong>
                        {r.score}/{r.total}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">No submitted assessments yet.</p>
              )}
            </section>
          </>
        )
      )}
    </>
  );
}
