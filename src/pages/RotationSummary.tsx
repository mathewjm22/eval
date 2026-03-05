import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../context';
import { PHASE_CONFIG, SessionEvaluation } from '../types';
import { isMidYearWeek, isEndOfYearWeek } from '../benchmarkWindows';
import { IM_BENCHMARKS } from '../imBenchmarks';
import { TopicCoverageWidget } from '../components/TopicCoverageWidget';


function evalHasRedFlag(ev: SessionEvaluation): boolean {
  const rf = ev.redFlagBenchmarks;
  if (!rf) return false;
  return Object.values(rf).some(v => v && v.status === 'redFlag');
}


export function RotationSummary() {
  const { studentId } = useParams<{ studentId: string }>();
  const { data } = useAppData();
  const navigate = useNavigate();

  const student = data.students.find(s => s.id === studentId);
  const studentEvals = useMemo(
    () =>
      data.evaluations
        .filter(ev => ev.studentId === studentId)
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
    [data.evaluations, studentId],
  );

  const byPhase = useMemo(() => {
    const early: SessionEvaluation[] = [];
    const middle: SessionEvaluation[] = [];
    const final: SessionEvaluation[] = [];
    for (const ev of studentEvals) {
      if (ev.phase === 'early') early.push(ev);
      else if (ev.phase === 'middle') middle.push(ev);
      else final.push(ev);
    }
    return { early, middle, final };
  }, [studentEvals]);

  const totalRedFlags = useMemo(
    () => studentEvals.filter(ev => evalHasRedFlag(ev)).length,
    [studentEvals],
  );

  const ratingTrend = useMemo(
    () =>
      studentEvals.map(ev => ({
        date: ev.date,
        rating: ev.overallRating,
      })),
    [studentEvals],
  );

  if (!studentId || !student) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Rotation Summary</h2>
        <p className="text-sm text-slate-500">
          Student not found. Go back to{' '}
          <Link to="/students" className="text-indigo-600 underline">
            Students
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {student.name} – Rotation Summary
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Overview of all evaluations for this student across the rotation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Print Summary
          </button>
        </div>
      </div>

      {/* High-level stats + trend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <p className="text-xs text-slate-400">Total evaluations</p>
          <p className="mt-2 text-3xl font-bold text-sky-300">
            {studentEvals.length}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <p className="text-xs text-slate-400">Red-flag evaluations</p>
          <p className="mt-2 text-3xl font-bold text-rose-300">
            {totalRedFlags}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-1">
          <p className="text-xs text-slate-400">Phase breakdown</p>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-full border border-blue-300 text-blue-100 bg-blue-900/40">
              Early: {byPhase.early.length}
            </span>
            <span className="px-2 py-0.5 rounded-full border border-amber-300 text-amber-100 bg-amber-900/40">
              Middle: {byPhase.middle.length}
            </span>
            <span className="px-2 py-0.5 rounded-full border border-emerald-300 text-emerald-100 bg-emerald-900/40">
              Final: {byPhase.final.length}
            </span>
          </div>
        </div>

        {/* Overall rating trend sparkline */}
        {ratingTrend.length > 1 && (
          <div className="md:col-span-3 rounded-2xl bg-slate-900 border border-slate-800 p-4">
            <p className="text-xs text-slate-400 mb-2">Overall Rating Trend</p>
            <div className="h-20 w-full">
              <svg viewBox="0 0 100 40" className="w-full h-full">
                {(() => {
                  const maxRating = 5;
                  const minRating = 1;
                  const span = Math.max(ratingTrend.length - 1, 1);
                  const points = ratingTrend.map((pt, idx) => {
                    const x = (idx / span) * 100;
                    const normalized =
                      (pt.rating - minRating) / (maxRating - minRating || 1);
                    const y = 40 - normalized * 30 - 5;
                    return `${x},${y}`;
                  });
                  const polyline = points.join(' ');
                  return (
                    <>
                      <polyline
                        points={polyline}
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="1.5"
                      />
                      {ratingTrend.map((pt, idx) => {
                        const x = (idx / span) * 100;
                        const normalized =
                          (pt.rating - minRating) /
                          (maxRating - minRating || 1);
                        const y = 40 - normalized * 30 - 5;
                        return (
                          <circle
                            key={pt.date + idx}
                            cx={x}
                            cy={y}
                            r={1.2}
                            fill="#22c55e"
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Left = earliest evaluation • Right = most recent
            </p>
          </div>
        )}
      </div>

      {/* Phase sections */}
      <PhaseSection
        title="Early Phase"
        description="Foundational learning and orientation to clinical environment."
        evaluations={byPhase.early}
        navigate={navigate}
      />
      <PhaseSection
        title="Middle Phase (Mid-Year Period)"
        description="Use this section to prepare for mid-year feedback discussions."
        evaluations={byPhase.middle}
        navigate={navigate}
      />
      <PhaseSection
        title="Final Phase (End-of-Rotation)"
        description="Use this section to synthesize performance for end-of-rotation decisions."
        evaluations={byPhase.final}
        navigate={navigate}
      />

      {/* Teaching Topics Coverage */}
      <TopicCoverageWidget evaluations={data.evaluations} studentId={studentId} />
    </div>
  );
}

// Benchmarks UI used inside each phase section (for middle/final)
function BenchmarksDetails({ phaseTitle }: { phaseTitle: string }) {
  const isMiddle = phaseTitle.includes('Middle');
  const isFinal = phaseTitle.includes('Final');
  if (!isMiddle && !isFinal) return null;

  return (
    <details className="mt-2">
      <summary className="text-[11px] text-slate-400 cursor-pointer">
        Show {isMiddle ? 'Mid-Year' : 'End-of-Year'} expectations
      </summary>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {IM_BENCHMARKS.map(row => (
          <div
            key={row.id}
            className="bg-slate-950/40 border border-slate-700 rounded-xl p-3 space-y-1.5"
          >
            <p className="font-semibold text-slate-100 text-xs">
              {row.area}
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
              {(isMiddle ? row.midYear : row.endOfYear).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}

function PhaseSection({
  title,
  description,
  evaluations,
  navigate,
}: {
  title: string;
  description: string;
  evaluations: SessionEvaluation[];
  navigate: (path: string) => void;
}) {
  if (evaluations.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
        <h3 className="text-sm font-semibold text-slate-100 mb-1">
          {title}
        </h3>
        <p className="text-xs text-slate-500">{description}</p>
        <p className="mt-2 text-xs text-slate-500 italic">
          No evaluations recorded in this phase.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            {title}
          </h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>

      {/* Benchmarks toggle for middle / final phases */}
      <BenchmarksDetails phaseTitle={title} />

      <div className="space-y-2">
        {evaluations.map(ev => {
          const hasRedFlag = evalHasRedFlag(ev);
          const phaseConf = PHASE_CONFIG[ev.phase];
          const midWindow =
            isMidYearWeek(ev.weekNumber) && ev.phase === 'middle';
          const finalWindow =
            isEndOfYearWeek(ev.weekNumber) && ev.phase === 'final';

          return (
            <button
              key={ev.id}
              type="button"
              onClick={() => navigate(`/evaluations/${ev.id}`)}
              className={`w-full text-left rounded-xl px-3 py-2.5 flex items-center justify-between gap-3 transition-colors border ${
                hasRedFlag
                  ? 'bg-rose-950/60 border-rose-700 hover:border-rose-400 hover:bg-rose-900'
                  : 'bg-slate-950/40 border-slate-700 hover:border-indigo-400 hover:bg-slate-900'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-slate-50">
                  Week {ev.weekNumber} • {ev.sessionType}
                </span>
                <span className="text-[11px] text-slate-300">
                  {ev.date} • {ev.patientEncounters} patients
                </span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {hasRedFlag && (
                    <span className="text-[11px] text-rose-200 font-medium">
                      ⚠️ Red-flag concerns documented in Internal Medicine benchmarks
                    </span>
                  )}
                  {midWindow && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-900/40 text-sky-200 border border-sky-500/60">
                      Mid-year window
                    </span>
                  )}
                  {finalWindow && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-900/40 text-violet-200 border border-violet-500/60">
                      Final window
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${phaseConf.bgColor} ${phaseConf.color} border ${phaseConf.borderColor}`}
                >
                  {phaseConf.label}
                </span>
                <span
                  className={`text-sm font-bold ${
                    hasRedFlag
                      ? 'text-rose-300'
                      : ev.overallRating >= 4
                      ? 'text-emerald-300'
                      : ev.overallRating >= 3
                      ? 'text-amber-300'
                      : 'text-rose-300'
                  }`}
                >
                  {ev.overallRating}/5 ⭐
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
