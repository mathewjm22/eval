import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../context';
import { PHASE_CONFIG, SCORE_CATEGORIES } from '../types';

export function Dashboard() {
  const { data } = useAppData();
  const { students, evaluations, preceptor } = data;

  const recentEvals = useMemo(() =>
    [...evaluations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [evaluations]
  );

  const overallAvg = useMemo(() => {
    if (!evaluations.length) return null;
    const sum = evaluations.reduce((acc, ev) => acc + ev.overallRating, 0);
    return (sum / evaluations.length).toFixed(1);
  }, [evaluations]);

  const categoryAverages = useMemo(() => {
    if (!evaluations.length) return null;
    return SCORE_CATEGORIES.map(cat => ({
      label: cat.label,
      avg: (evaluations.reduce((s, ev) => s + (ev.scores[cat.key] ?? 0), 0) / evaluations.length).toFixed(1),
    }));
  }, [evaluations]);

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name ?? 'Unknown';

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold">
          Welcome{preceptor.name ? `, ${preceptor.name}` : ''}! 👋
        </h2>
        <p className="text-indigo-200 text-sm mt-1">
          {preceptor.institution || 'Medical Preceptor Evaluation Tracker'}
        </p>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Students', value: students.length },
            { label: 'Evaluations', value: evaluations.length },
            { label: 'Avg Rating', value: overallAvg ?? '—' },
            { label: 'This Month', value: evaluations.filter(e => {
              const d = new Date(e.date);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length },
          ].map(stat => (
            <div key={stat.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-indigo-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { to: '/evaluate', emoji: '📝', label: 'New Evaluation', color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' },
          { to: '/students', emoji: '👥', label: 'Manage Students', color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' },
          { to: '/progress', emoji: '📈', label: 'View Progress', color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
        ].map(a => (
          <Link key={a.to} to={a.to} className={`flex flex-col items-center gap-2 p-5 rounded-2xl border font-medium text-sm transition-colors ${a.color}`}>
            <span className="text-3xl">{a.emoji}</span>
            {a.label}
          </Link>
        ))}
      </div>

      {/* Category averages */}
      {categoryAverages && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-4">📊 Competency Averages (All Students)</h3>
          <div className="space-y-3">
            {categoryAverages.map(({ label, avg }) => (
              <div key={label} className="flex items-center gap-3">
                <p className="w-44 text-sm font-medium text-slate-700 truncate shrink-0">{label}</p>
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      Number(avg) < 2 ? 'bg-red-400' : Number(avg) < 3 ? 'bg-orange-400' : Number(avg) < 4 ? 'bg-yellow-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(Number(avg) / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-600 w-8 text-right">{avg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent evaluations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-lg">🕐 Recent Evaluations</h3>
          <Link to="/evaluations" className="text-xs text-indigo-600 hover:underline">View all →</Link>
        </div>
        {recentEvals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-slate-500 text-sm">No evaluations yet.</p>
            <Link to="/evaluate" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">Create your first →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentEvals.map(ev => {
              const phaseConf = PHASE_CONFIG[ev.phase];
              return (
                <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                      W{ev.weekNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{getStudentName(ev.studentId)}</p>
                      <p className="text-xs text-slate-400">{ev.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${phaseConf.bgColor} ${phaseConf.color}`}>
                      {phaseConf.label}
                    </span>
                    <span className={`font-bold ${ev.overallRating >= 4 ? 'text-emerald-600' : ev.overallRating >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {ev.overallRating}/5
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty state nudge */}
      {students.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-semibold text-amber-800">Get started by adding a student</p>
            <p className="text-sm text-amber-600 mt-1">You need at least one student before you can create evaluations.</p>
            <Link to="/students" className="mt-2 inline-block text-sm font-medium text-amber-700 underline underline-offset-2">
              Add a student →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}