import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '../context';
import { PHASE_CONFIG, SCORE_CATEGORIES, SCORE_LABELS } from '../types';

export function EvaluationsList() {
  const { data, deleteEvaluation } = useAppData();
  const navigate = useNavigate();
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'week' | 'rating'>('date');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStudentName = (id: string) => data.students.find(s => s.id === id)?.name || 'Unknown';

  const filtered = useMemo(() => {
    let evals = [...data.evaluations];
    if (filterStudent !== 'all') evals = evals.filter(e => e.studentId === filterStudent);
    if (filterPhase !== 'all') evals = evals.filter(e => e.phase === filterPhase);

    evals.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'week') return b.weekNumber - a.weekNumber;
      return b.overallRating - a.overallRating;
    });

    return evals;
  }, [data.evaluations, filterStudent, filterPhase, sortBy]);

  const handleDelete = (id: string) => {
    deleteEvaluation(id);
    setShowDeleteConfirm(null);
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">📋 All Evaluations</h2>
          <p className="text-sm text-slate-400 mt-1">{filtered.length} evaluation{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link
          to="/evaluate"
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
        >
          + New Evaluation
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Student</label>
            <select
              value={filterStudent}
              onChange={e => setFilterStudent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="all">All Students</option>
              {data.students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Phase</label>
            <select
              value={filterPhase}
              onChange={e => setFilterPhase(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="all">All Phases</option>
              <option value="early">Early Phase (Wk 1–12)</option>
              <option value="middle">Middle Phase (Wk 13–30)</option>
              <option value="final">Final Phase (Wk 31–52)</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'date' | 'week' | 'rating')}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="date">Date (Newest)</option>
              <option value="week">Week Number</option>
              <option value="rating">Overall Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-700">No evaluations found</h3>
          <p className="text-sm text-slate-400 mt-2">
            {data.evaluations.length === 0
              ? 'Create your first evaluation to see it here.'
              : 'Try adjusting your filters.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ev) => {
            const phaseConf = PHASE_CONFIG[ev.phase];
            const isExpanded = expandedId === ev.id;
            const scoreAvg = (Object.values(ev.scores).reduce((a, b) => a + b, 0) / Object.values(ev.scores).length).toFixed(1);

            return (
              <div key={ev.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div
                  className="p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                      W{ev.weekNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{getStudentName(ev.studentId)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{ev.date} • {ev.sessionType} • {ev.patientEncounters} patients</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`hidden sm:inline-block text-xs px-2.5 py-1 rounded-full font-medium ${phaseConf.bgColor} ${phaseConf.color} border ${phaseConf.borderColor}`}>
                      {phaseConf.label}
                    </span>
                    <span className={`text-lg font-bold ${
                      ev.overallRating >= 4 ? 'text-emerald-600' : ev.overallRating >= 3 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {ev.overallRating}/5
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 sm:p-5 space-y-5 bg-slate-50/50">
                    {/* Scores Grid */}
                    <div>
                      <h4 className="font-semibold text-slate-700 text-sm mb-3">Competency Scores</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {SCORE_CATEGORIES.map(cat => (
                          <div key={cat.key} className="bg-white rounded-lg p-3 border border-slate-100 text-center">
                            <p className="text-[11px] text-slate-400 mb-1 leading-tight">{cat.label}</p>
                            <p className={`text-xl font-bold ${
                              ev.scores[cat.key] >= 4 ? 'text-emerald-600' : ev.scores[cat.key] >= 3 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {ev.scores[cat.key]}
                            </p>
                            <p className="text-[10px] text-slate-400">{SCORE_LABELS[ev.scores[cat.key]]}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-center mt-3 text-sm text-slate-500">
                        Average: <span className="font-bold text-indigo-600">{scoreAvg}/5</span>
                      </p>
                    </div>

                    {/* Feedback */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ev.strengths && (
                        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                          <h5 className="font-semibold text-emerald-700 text-xs mb-1">💪 Strengths</h5>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">{ev.strengths}</p>
                        </div>
                      )}
                      {ev.areasForImprovement && (
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                          <h5 className="font-semibold text-amber-700 text-xs mb-1">🎯 Areas for Improvement</h5>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">{ev.areasForImprovement}</p>
                        </div>
                      )}
                      {ev.actionPlan && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <h5 className="font-semibold text-blue-700 text-xs mb-1">📋 Action Plan</h5>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">{ev.actionPlan}</p>
                        </div>
                      )}
                      {ev.preceptorNotes && (
                        <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                          <h5 className="font-semibold text-slate-700 text-xs mb-1">📝 Notes</h5>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">{ev.preceptorNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/evaluate/${ev.id}`); }}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      {showDeleteConfirm === ev.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(null); }}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(ev.id); }}
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
