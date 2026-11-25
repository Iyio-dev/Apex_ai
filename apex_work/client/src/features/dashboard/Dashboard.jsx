import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight, CheckCircle2, Clock3, Target } from "lucide-react";
import { useLoad } from "../../hooks/useLoad";
import { Header } from "../../components/ui/Header";
import { Metric } from "../../components/ui/Metric";
import { ApexLoader } from "../../components/ui/ApexLoader";
import { Notice } from "../../components/ui/Notice";
export function Dashboard() {
  const { data, error, loading } = useLoad("/academic/dashboard");
  const navigate = useNavigate();
  if (loading) return <ApexLoader message="Loading your dashboard" />;
  const stats = data?.progress;
  return (
    <>
      <Header
        title="Study overview"
        subtitle="A clear view of your next steps."
      />
      <Notice error={error} />
      {data && (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
            <Metric
              label="Lecturer-covered topics"
              value={`${stats?.syllabus?.percent ?? 0}%`}
              detail={`${stats?.syllabus?.covered ?? 0} of ${stats?.syllabus?.total ?? 0} across your subjects`}
              Icon={BookOpen}
            />
            <Metric
              label="Activities completed"
              value={stats?.activities?.completed ?? 0}
              detail={`${stats?.activities?.planned ?? 0} planned · ${stats?.activities?.skipped ?? 0} skipped`}
              Icon={CheckCircle2}
            />
            <Metric
              label="Study time logged"
              value={`${((stats?.studyMinutes ?? 0) / 60).toFixed(1)}h`}
              detail="From your activity logs"
              Icon={Clock3}
            />
            <Metric
              label="Latest daily score"
              value={
                stats?.recentScores?.[0]
                  ? `${stats.recentScores[0].score}/${stats.recentScores[0].total}`
                  : "—"
              }
              detail={stats?.recentScores?.[0]?.day || "No submitted assessments"}
              Icon={Target}
            />
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            <section className="panel">
              <h3 className="font-bold text-lg mb-4">Today's schedule</h3>
              {data.todaysActivities?.length ? (
                data.todaysActivities.map((a) => (
                  <div
                    key={a._id}
                    className="border-b py-3 flex justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="muted">
                        {a.subject} · {a.estimatedMinutes} min
                      </p>
                    </div>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg h-fit">
                      {a.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="muted">No activities scheduled today.</p>
              )}
              <button
                className="btn-secondary mt-5"
                onClick={() => navigate("/plans")}
              >
                Manage study plan <ArrowRight size={15} className="ml-2" />
              </button>
            </section>
            <section className="panel">
              <h3 className="font-bold text-lg mb-4">Daily practice</h3>
              <p className="muted">
                {data.assessment?.total || 5} questions chosen from your current subjects and learning priorities.
              </p>
              <div className="mt-5 p-4 bg-indigo-50 rounded-xl">
                <p className="font-semibold text-indigo-900">
                  {data.assessment?.submitted
                    ? "Todays assessment completed"
                    : "Your questions are ready"}
                </p>
                <p className="text-sm text-indigo-700 mt-1">
                  {data.assessment?.submitted
                  ? `Score: ${data.assessment.score}/${data.assessment.total || 5}`
                    : "Build consistency with a short daily check-in."}
                </p>
              </div>
              <button
                className="btn mt-5"
                onClick={() => navigate("/assessment")}
              >
                Open assessment <ArrowRight size={16} className="ml-2" />
              </button>
            </section>
          </div>
        </>
      )}
    </>
  );
}
