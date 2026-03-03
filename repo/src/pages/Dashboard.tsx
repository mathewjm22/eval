import { Link } from 'react-router-dom';
import { useAppData } from '../context';
import { PHASE_CONFIG, Phase, SCORE_CATEGORIES, TEACHING_TOPIC_CATEGORIES, PREPOPULATED_CONDITIONS, TOTAL_OBJECTIVE_EXPECTATIONS } from '../types';

export function Dashboard() {
  const { data } = useAppData();
  const { preceptor, students, evaluations } = data;

  const totalEvals = evaluations.length;
  const phaseCount = (p: Phase) => evaluations.filter(e => e.phase === p).length;

  const avgOverall = totalEvals > 0
    ? (evaluations.reduce((sum, e) => sum + e.overallRating, 0) / totalEvals).toFixed(1)
    : '-';

  const recentEvals = [...evaluations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Unknown';

  // Calculate average scores per category across all evaluations
  const avgScores = SCORE_CATEGORIES.map(cat => {
    if (totalEvals === 0) return { ...cat, avg: 0 };
    const sum = evaluations.reduce((s, e) => s + e.scores[cat.key], 0);
    return { ...cat, avg: sum / totalEvals };
  });

  // Teaching Topics: count how many times each category has been taught
  const topicCategoryCounts = TEACHING_TOPIC_CATEGORIES.map(({ category }) => {
    const count = evaluations.filter(e =>
      (e.teachingTopics || []).some(t => t.category === category && t.topics.length > 0)
    ).length;
    return { category, count };
  }).filter(({ count }) => count > 0);

  // Total unique conditions seen across all evaluations
  const allConditionsSeen = new Set(
    evaluations.flatMap(e => [...(e.conditionsSeen || []), ...(e.customConditions || [])])
  );
  const totalPossibleConditions = PREPOPULATED_CONDITIONS.reduce((sum, { conditions }) => sum + conditions.length, 0);

  // Clinical Objectives: count unique string expectation IDs achieved across all evaluations (V2 format)
  const allObjectivesAchieved = new Set(
    evaluations.flatMap(e => (e.objectivesAchieved || []).filter(id => typeof id === 'string' && String(id).includes('-')))
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold">
          Welcome{preceptor.name ? `, Dr. ${preceptor.name}` : ''}! 👋
        </h2>
        <p className="mt-2 text-indigo-100 text-sm sm:text-base">
          {preceptor.institution ? `${preceptor.institution} • ${preceptor.specialty}` : 'Set up your profile in Settings to get started.'}
        </p>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{students.length}</p>
            <p className="text-xs text-indigo-100 mt-1">Students</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{totalEvals}</p>
            <p className="text-xs text-indigo-100 mt-1">Evaluations</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{avgOverall}</p>
            <p className="text-xs text-indigo-100 mt-1">Avg Rating</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{new Set(evaluations.map(e => e.weekNumber)).size}</p>
            <p className="text-xs text-indigo-100 mt-1">Weeks Logged</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/evaluate"
          className="bg-white rounded-xl border-2 border-dashed border-indigo-200 p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
        >
          <div className="text-3xl mb-2">📝</div>
          <p className="font-semibold text-indigo-700 group-hover:text-indigo-800">New Evaluation</p>
          <p className="text-xs text-slate-400 mt-1">Start a session evaluation</p>
        </Link>
        <Link
          to="/students"
          className="bg-white rounded-xl border-2 border-dashed border-emerald-200 p-6 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
        >
          <div className="text-3xl mb-2">👨‍🎓</div>
          <p className="font-semibold text-emerald-700 group-hover:text-emerald-800">Manage Students</p>
          <p className="text-xs text-slate-400 mt-1">Add or edit student profiles</p>
        </Link>
        <Link
          to="/evaluations"
          className="bg-white rounded-xl border-2 border-dashed border-amber-200 p-6 text-center hover:border-amber-400 hover:bg-amber-50 transition-all group"
        >
          <div className="text-3xl mb-2">📋</div>
          <p className="font-semibold text-amber-700 group-hover:text-amber-800">View History</p>
          <p className="text-xs text-slate-400 mt-1">Review past evaluations</p>
        </Link>
      </div>

      {/* Conditions & Objectives Summary Row */}
      {totalEvals > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-3">🩺 Conditions Coverage</h3>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold text-blue-600">{allConditionsSeen.size}</p>
              <p className="text-sm text-slate-400 pb-1">/ {totalPossibleConditions} prepopulated conditions seen</p>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-400 transition-all"
                style={{ width: `${Math.min((allConditionsSeen.size / totalPossibleConditions) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-3">🎯 Clinical Objectives (EPAs)</h3>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold text-purple-600">{allObjectivesAchieved.size}</p>
              <p className="text-sm text-slate-400 pb-1">/ {TOTAL_OBJECTIVE_EXPECTATIONS} expectations achieved</p>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-purple-400 transition-all"
                style={{ width: `${Math.min((allObjectivesAchieved.size / TOTAL_OBJECTIVE_EXPECTATIONS) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      // Inside Dashboard.tsx, replace the block that starts with:
// <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//
// with this slightly more structured one:

      {/* Middle analytics row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: phases + category averages */}
        <div className="space-y-6 xl:col-span-2">
          {/* Phase Progress */}
          {/* ...your existing Phase Progress card... */}

          {/* Category Averages */}
          {/* ...your existing Category Averages card... */}
        </div>

        {/* Right: conditions / objectives summary */}
        <div className="space-y-4">
          {/* Conditions & Objectives Summary Row */}
          {/* ...your existing two small cards (conditions & objectives) */}
        </div>
      </div>

        {/* Category Averages */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-4">📊 Category Averages</h3>
          {totalEvals === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No evaluations yet. Create one to see data here.</p>
          ) : (
            <div className="space-y-3">
              {avgScores.map((cat) => (
                <div key={cat.key} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{cat.label}</p>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mt-1">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          cat.avg < 2 ? 'bg-red-400' : cat.avg < 3 ? 'bg-orange-400' : cat.avg < 4 ? 'bg-yellow-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${(cat.avg / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-600 w-8 text-right">{cat.avg.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Teaching Topics */}
      {topicCategoryCounts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-4">📚 Teaching Topics Coverage</h3>
          <p className="text-xs text-slate-400 mb-4">Body systems covered across all sessions (by number of sessions)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topicCategoryCounts.map(({ category, count }) => (
              <div key={category} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{category}</p>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                    <div
                      className="h-2 rounded-full bg-teal-400 transition-all"
                      style={{ width: `${Math.min((count / Math.max(totalEvals, 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-500 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Evaluations */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-lg mb-4">🕐 Recent Evaluations</h3>
        {recentEvals.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No evaluations recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {recentEvals.map((ev) => {
              const phaseConf = PHASE_CONFIG[ev.phase];
              return (
                <Link
                  key={ev.id}
                  to={`/evaluations/${ev.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                      W{ev.weekNumber}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{getStudentName(ev.studentId)}</p>
                      <p className="text-xs text-slate-400">{ev.date} • {ev.sessionType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${phaseConf.bgColor} ${phaseConf.color} border ${phaseConf.borderColor}`}>
                      {phaseConf.label}
                    </span>
                    <span className={`text-sm font-bold ${
                      ev.overallRating >= 4 ? 'text-emerald-600' : ev.overallRating >= 3 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {ev.overallRating}/5
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
