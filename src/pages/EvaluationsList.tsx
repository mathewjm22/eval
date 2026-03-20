import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '../context';
import {
  PHASE_CONFIG,
  SCORE_CATEGORIES,
  SCORE_LABELS,
  RED_FLAG_COMPETENCIES,
  SessionEvaluation,
  AdHocTeaching,
} from '../types';
import { isMidYearDate, isEndOfYearDate } from '../benchmarkWindows';

export function EvaluationsList() {
  const { data, deleteEvaluation } = useAppData();
  const navigate = useNavigate();

  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'week' | 'rating'>('date');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStudentName = (id: string) =>
    data.students.find((s) => s.id === id)?.name || 'Unknown';

  const filtered = useMemo(() => {
    let items: (SessionEvaluation | AdHocTeaching)[] = [
      ...data.evaluations.filter(e => !e.isDraft),
      ...(data.teachings || [])
    ];

    if (filterStudent !== 'all') {
      items = items.filter(item => {
        if ('sessionType' in item) return item.studentId === filterStudent;
        return item.studentIds.includes(filterStudent);
      });
    }
    if (filterPhase !== 'all') {
      items = items.filter(item => {
        if ('sessionType' in item) return item.phase === filterPhase;
        return false;
      });
    }

    items.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'week') {
        const weekA = 'weekNumber' in a ? a.weekNumber : -1;
        const weekB = 'weekNumber' in b ? b.weekNumber : -1;
        return weekB - weekA;
      }
      // rating
      const ratingA = 'overallRating' in a ? a.overallRating : -1;
      const ratingB = 'overallRating' in b ? b.overallRating : -1;
      return ratingB - ratingA;
    });

    return items;
  }, [data.evaluations, data.teachings, filterStudent, filterPhase, sortBy]);

  const drafts = useMemo(
    () => data.evaluations.filter(e => e.isDraft),
    [data.evaluations],
  );

  const handleDelete = (id: string) => {
    deleteEvaluation(id);
    setShowDeleteConfirm(null);
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">📋 All Evaluations</h2>
          <p className="text-sm text-slate-400 mt-1">
            {filtered.length} evaluation{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Link
          to="/evaluate"
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
        >
          + New Evaluation
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-slate-200 dark:border-white/10 p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Student
            </label>
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="all">All Students</option>
              {data.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Phase
            </label>
            <select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="all">All Phases</option>
              <option value="early">Early Phase (Wk 1–12)</option>
              <option value="middle">Middle Phase (Wk 13–30)</option>
              <option value="final">Final Phase (Wk 31–52)</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'date' | 'week' | 'rating')
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="date">Date (Newest)</option>
              <option value="week">Week Number</option>
              <option value="rating">Overall Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drafts section */}
      {drafts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-700 flex items-center gap-2">
            <span>✏️</span>
            <span>In-Progress Drafts ({drafts.length})</span>
          </h3>
          {drafts.map((ev) => (
            <div
              key={ev.id}
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-xs shrink-0">
                  W{ev.weekNumber}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-700 truncate text-sm">
                    {getStudentName(ev.studentId)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ev.date} • {ev.sessionType} • last saved {new Date(ev.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/evaluations/${ev.id}`)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Continue →
                </button>
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold rounded-lg transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-200">
            No evaluations found
          </h3>
          <p className="text-sm text-slate-400 dark:text-gray-400 mt-2">
            {data.evaluations.filter(e => !e.isDraft).length === 0
              ? 'Create your first evaluation to see it here.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isTeaching = !('sessionType' in item);

            if (isTeaching) {
              const th = item as AdHocTeaching;
              const isExpanded = expandedId === th.id;
              const studentNames = th.studentIds
                .map(id => data.students.find(s => s.id === id)?.name)
                .filter(Boolean)
                .join(', ');
              const topicsCount = th.teachingTopics.reduce((acc, cat) => acc + cat.topics.length, 0);

              return (
                <div
                  key={th.id}
                  className={`rounded-2xl border transition-all overflow-hidden bg-white dark:bg-[#1a1f2e] ${
                    isExpanded
                      ? 'ring-2 ring-blue-500 border-transparent shadow-md'
                      : 'border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 hover:shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : th.id)}
                    className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    {/* Icon/Date */}
                    <div className="shrink-0 text-center w-14">
                      <div className="text-xl mb-1">📚</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {new Date(th.date + 'T00:00:00').toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>

                    <div className="h-10 w-[1px] bg-slate-100 dark:bg-white/10 shrink-0" />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 dark:text-white text-base truncate pr-4">
                        Teaching Session
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 dark:text-gray-400 font-medium truncate max-w-xs">
                          {studentNames || 'No students'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-slate-400 dark:text-gray-500">
                          {topicsCount} topics
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center text-blue-500">
                      <svg
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-black/20">
                      <div className="space-y-4">
                        {/* Topics */}
                        {th.teachingTopics && th.teachingTopics.length > 0 && (
                          <div className="pt-2">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">Teaching Topics</h5>
                            <div className="space-y-2">
                              {th.teachingTopics.map((tt) => (
                                <div key={tt.category}>
                                  <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 mr-2">{tt.category}:</span>
                                  <span className="text-[11px] text-slate-600 dark:text-gray-300">
                                    {tt.topics.join(', ')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.dispatchEvent(new CustomEvent('open-teaching-modal', { detail: { teachingId: th.id } }));
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            const ev = item as SessionEvaluation;
            const phaseConf = PHASE_CONFIG[ev.phase];
            const isExpanded = expandedId === ev.id;

            const scoreAvg = (
              (Object.values(ev.scores) as number[]).reduce(
                (a, b) => a + b,
                0
              ) / Object.values(ev.scores).length
            ).toFixed(1);

            // mid-year / final "window" badges
            const midWindow =
              isMidYearDate(ev.date) && ev.phase === 'middle';
            const finalWindow =
              isEndOfYearDate(ev.date) && ev.phase === 'final';

            const rf = ev.redFlagBenchmarks;
            const hasAnyRedFlagInfo =
              rf &&
              Object.values(rf).some(
                (v) =>
                  v &&
                  (v.status === 'redFlag' ||
                    v.status === 'unsure' ||
                    (v.plan ?? '').trim() !== '')
              );

            return (
              <div
                key={ev.id}
                className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Row header */}
                <div
                  className="p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-4"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : ev.id)
                  }
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 bg-indigo-100 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0">
                      W{ev.weekNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white truncate">
                        {getStudentName(ev.studentId)}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-gray-400 mt-0.5">
                        {ev.date} • {ev.sessionType} •{' '}
                        {ev.patientEncounters} patients
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <span
                          className={`hidden sm:inline-block text-xs px-2.5 py-1 rounded-full font-medium ${phaseConf.bgColor} ${phaseConf.color} border ${phaseConf.borderColor}`}
                        >
                          {phaseConf.label}
                        </span>
                        {midWindow && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                            Mid-year window
                          </span>
                        )}
                        {finalWindow && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                            Final window
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        ev.overallRating >= 4
                          ? 'text-emerald-600'
                          : ev.overallRating >= 3
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {ev.overallRating}/5
                    </span>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-white/10 p-4 sm:p-5 space-y-5 bg-slate-50/50 dark:bg-black/20">
                    {/* Scores grid */}
                    <div>
                      <h4 className="font-semibold text-slate-700 dark:text-gray-200 text-sm mb-3">
                        Competency Scores
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {SCORE_CATEGORIES.map((cat) => (
                          <div
                            key={cat.key}
                            className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3 border border-slate-100 dark:border-white/10 text-center"
                          >
                            <p className="text-[11px] text-slate-400 mb-1 leading-tight">
                              {cat.label}
                            </p>
                            <p
                              className={`text-xl font-bold ${
                                ev.scores[cat.key] >= 4
                                  ? 'text-emerald-600'
                                  : ev.scores[cat.key] >= 3
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {ev.scores[cat.key]}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {SCORE_LABELS[ev.scores[cat.key]]}
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="text-center mt-3 text-sm text-slate-500">
                        Average:{' '}
                        <span className="font-bold text-indigo-600">
                          {scoreAvg}/5
                        </span>
                      </p>
                    </div>

                    {/* Narrative feedback */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ev.strengths && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 border border-emerald-100 dark:border-emerald-900/50">
                          <h5 className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs mb-1">
                            💪 Strengths
                          </h5>
                          <p className="text-sm text-slate-600 dark:text-gray-400 whitespace-pre-wrap">
                            {ev.strengths}
                          </p>
                        </div>
                      )}
                      {ev.areasForImprovement && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-100 dark:border-amber-900/50">
                          <h5 className="font-semibold text-amber-700 dark:text-amber-400 text-xs mb-1">
                            🎯 Areas for Improvement
                          </h5>
                          <p className="text-sm text-slate-600 dark:text-gray-400 whitespace-pre-wrap">
                            {ev.areasForImprovement}
                          </p>
                        </div>
                      )}
                      {ev.actionPlan && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-100 dark:border-blue-900/50">
                          <h5 className="font-semibold text-blue-700 dark:text-blue-400 text-xs mb-1">
                            📋 Action Plan
                          </h5>
                          <p className="text-sm text-slate-600 dark:text-gray-400 whitespace-pre-wrap">
                            {ev.actionPlan}
                          </p>
                        </div>
                      )}
                      {ev.preceptorNotes && (
                        <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-3 border border-slate-200 dark:border-white/10">
                          <h5 className="font-semibold text-slate-700 dark:text-gray-300 text-xs mb-1">
                            📝 Notes
                          </h5>
                          <p className="text-sm text-slate-600 dark:text-gray-400 whitespace-pre-wrap">
                            {ev.preceptorNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Internal Medicine red-flag benchmarks */}
                    {hasAnyRedFlagInfo && (
                      <div className="bg-rose-50 dark:bg-rose-950/20 rounded-xl p-4 border border-rose-200 dark:border-rose-900/50 space-y-3">
                        <h4 className="font-semibold text-rose-800 dark:text-rose-200 text-sm">
                          Internal Medicine Benchmarks – Red Flags (Mid-Year / End-of-Rotation)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {RED_FLAG_COMPETENCIES.map((comp) => {
                            const val = rf?.[comp.key];
                            if (!val) return null;
                            if (
                              val.status === 'none' &&
                              (!val.plan || val.plan.trim() === '')
                            ) {
                              return null;
                            }

                            const statusLabel =
                              val.status === 'redFlag'
                                ? 'Red Flags Observed'
                                : val.status === 'unsure'
                                ? 'Unsure'
                                : 'No Concerns';

                            const statusColor =
                              val.status === 'redFlag'
                                ? 'bg-rose-600 text-white'
                                : val.status === 'unsure'
                                ? 'bg-amber-500 text-white'
                                : 'bg-emerald-500 text-white';

                            return (
                              <div
                                key={comp.key}
                                className="bg-white dark:bg-[#1a1f2e] rounded-lg border border-rose-100 dark:border-rose-900/30 p-3 space-y-1.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-semibold text-slate-800 dark:text-gray-200 text-xs">
                                    {comp.label}
                                  </p>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor}`}
                                  >
                                    {statusLabel}
                                  </span>
                                </div>
                                {val.plan && val.plan.trim() && (
                                  <p className="text-[11px] text-slate-600 whitespace-pre-wrap">
                                    {val.plan}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/evaluations/${ev.id}`);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      {showDeleteConfirm === ev.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(ev.id);
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(null);
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(ev.id);
                          }}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
