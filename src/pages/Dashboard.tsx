import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '../context';
import { PHASE_CONFIG, SCORE_CATEGORIES } from '../types';

export function Dashboard() {
  const { data } = useAppData();
  const { students, evaluations, preceptor } = data;
  const navigate = useNavigate();

  const recentEvals = useMemo(
    () =>
      [...evaluations]
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        .slice(0, 5),
    [evaluations],
  );

  const overallAvg = useMemo(() => {
    if (!evaluations.length) return null;
    const sum = evaluations.reduce(
      (acc, ev) => acc + ev.overallRating,
      0,
    );
    return (sum / evaluations.length).toFixed(1);
  }, [evaluations]);

  const categoryAverages = useMemo(() => {
    if (!evaluations.length) return null;
    return SCORE_CATEGORIES.map(cat => ({
      label: cat.label,
      avg: (
        evaluations.reduce(
          (s, ev) => s + (ev.scores[cat.key] ?? 0),
          0,
        ) / evaluations.length
      ).toFixed(1),
    }));
  }, [evaluations]);

  const completedCount = evaluations.length;
  const studentCount = students.length;

  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Students */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Students
            </h3>
            <Link
              to="/students"
              className="text-[11px] text-lime-300 hover:text-lime-200"
            >
              Manage →
            </Link>
          </div>
          <p className="mt-3 text-3xl font-bold text-lime-300">
            {studentCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Active learners in your panel
          </p>
        </div>

        {/* Completed Evaluations */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Completed Evaluations
            </h3>
            <Link
              to="/evaluations"
              className="text-[11px] text-lime-300 hover:text-lime-200"
            >
              View all →
            </Link>
          </div>
          <p className="mt-3 text-3xl font-bold text-sky-300">
            {completedCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Saved evaluations across all weeks
          </p>
        </div>

        {/* Overall Average Rating */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Overall Rating
            </h3>
            <span className="text-[11px] text-slate-400">
              1–5 scale
            </span>
          </div>
          {overallAvg ? (
            <>
              <p className="mt-3 text-3xl font-bold text-emerald-300">
                {overallAvg}/5
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Average across all evaluations
              </p>
            </>
          ) : (
            <p className="mt-4 text-xs text-slate-500">
              No evaluations yet.
            </p>
          )}
        </div>
      </div>

      {/* Middle row: recent + category averages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Evaluations */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⏱️</span>
              <h3 className="text-sm font-semibold text-slate-100">
                Recent Evaluations
              </h3>
            </div>
            <Link
              to="/evaluations"
              className="text-xs font-medium text-lime-300 hover:text-lime-200"
            >
              View all →
            </Link>
          </div>

          {recentEvals.length === 0 ? (
            <p className="text-xs text-slate-500">
              No evaluations yet. Create your first evaluation to see it
              here.
            </p>
          ) : (
            <div className="space-y-2">
              {recentEvals.map(ev => {
                const student = students.find(
                  s => s.id === ev.studentId,
                );
                const phaseConf = PHASE_CONFIG[ev.phase];

                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => navigate(`/evaluations/${ev.id}`)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-lime-300/60 hover:bg-slate-900 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-xs font-bold text-lime-300">
                        W{ev.weekNumber}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">
                          {student?.name || 'Unknown student'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {ev.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${phaseConf.bgColor} ${phaseConf.color} border ${phaseConf.borderColor}`}
                      >
                        {phaseConf.label}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          ev.overallRating >= 4
                            ? 'text-emerald-300'
                            : ev.overallRating >= 3
                            ? 'text-amber-300'
                            : 'text-rose-300'
                        }`}
                      >
                        {ev.overallRating}/5
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Category averages */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100">
            Competency Averages
          </h3>
          {categoryAverages ? (
            <div className="space-y-2">
              {categoryAverages.map(cat => (
                <div
                  key={cat.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-slate-300">{cat.label}</span>
                  <span className="font-semibold text-indigo-200">
                    {cat.avg}/5
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Averages will appear once you have evaluations.
            </p>
          )}
        </div>
      </div>

      {/* Preceptor profile reminder / quick actions */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-lime-400 text-black text-sm font-semibold flex items-center justify-center">
            {preceptor.name
              ? preceptor.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)
              : 'DR'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">
              {preceptor.name || 'Set up your profile'}
            </p>
            <p className="text-[11px] text-slate-400">
              {preceptor.institution || 'Add your institution and specialty'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/evaluate"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-lime-400 text-black hover:bg-lime-300 transition-colors"
          >
            + New Evaluation
          </Link>
          <Link
            to="/settings"
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-100 hover:border-slate-500 transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
