import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppData } from '../context';
import { useTheme } from '../theme';
import { PHASE_CONFIG, SCORE_CATEGORIES, SessionEvaluation } from '../types';
import { CompetencyRadar } from '../components/charts/CompetencyRadar';
import { OverallLine } from '../components/charts/OverallLine';
import { TopicCoverageWidget } from '../components/TopicCoverageWidget';
import { AnimatedBarChart } from '../components/charts/AnimatedBarChart';
import { AnimatedDonutChart } from '../components/charts/AnimatedDonutChart';
import { AnimatedButton } from '../components/AnimatedButton';
import { truncateChartLabel } from '../utils/chartConstants';
import { RemindersWidget } from '../components/RemindersWidget';
import { Sparkline } from '../components/charts/Sparkline';

export function Dashboard() {
  const { data } = useAppData();
  const { students, evaluations: allEvaluations, preceptor } = data;
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Exclude in-progress drafts from all statistics and displays.
  const evaluations = useMemo(() => allEvaluations.filter(e => !e.isDraft), [allEvaluations]);

  const recentEvals = useMemo(
    () =>
      [...evaluations]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [evaluations],
  );

  const overallAvg = useMemo(() => {
    if (!evaluations.length) return null;
    const sum = evaluations.reduce((acc, ev) => acc + ev.overallRating, 0);
    return (sum / evaluations.length).toFixed(1);
  }, [evaluations]);

  const hasRedFlag = (ev: SessionEvaluation) =>
    !!ev.redFlagBenchmarks &&
    Object.values(ev.redFlagBenchmarks).some(v => v && v.status === 'redFlag');

  const redFlagEvalCount = useMemo(
    () => evaluations.filter(hasRedFlag).length,
    [evaluations]
  );

  const redFlagStudentCount = useMemo(() => {
    const set = new Set<string>();
    evaluations.forEach(ev => { if (hasRedFlag(ev)) set.add(ev.studentId); });
    return set.size;
  }, [evaluations]);

  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);

  // When a student is selected, only consider their evals. Otherwise, use all evals.
  const filteredEvaluations = useMemo(() => {
    if (!selectedStudentId) return evaluations;
    return evaluations.filter(e => e.studentId === selectedStudentId);
  }, [evaluations, selectedStudentId]);

  const recentEvalsSortedForTrend = useMemo(() => {
    return [...filteredEvaluations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-10);
  }, [filteredEvaluations]);

  const overallTrendData = useMemo(() => {
    return recentEvalsSortedForTrend.map(e => e.overallRating);
  }, [recentEvalsSortedForTrend]);

  const categoryAverages = useMemo(() => {
    if (!filteredEvaluations.length) return null;
    return SCORE_CATEGORIES.map(cat => ({
      label: cat.label,
      avg: (filteredEvaluations.reduce((s, ev) => s + (ev.scores[cat.key] ?? 0), 0) / filteredEvaluations.length).toFixed(1),
      trendData: recentEvalsSortedForTrend.map(e => e.scores[cat.key] ?? 0),
    }));
  }, [filteredEvaluations, recentEvalsSortedForTrend]);

  // Data for animated bar chart (category averages)
  const categoryBarData = useMemo(() => {
    if (!filteredEvaluations.length) return [];
    return SCORE_CATEGORIES.map(cat => ({
      name: truncateChartLabel(cat.label),
      Score: parseFloat((filteredEvaluations.reduce((s, ev) => s + (ev.scores[cat.key] ?? 0), 0) / filteredEvaluations.length).toFixed(2)),
    }));
  }, [filteredEvaluations]);

  // Data for animated donut chart (phase distribution)
  const phaseDonutData = useMemo(() => {
    const counts: Record<string, number> = { early: 0, middle: 0, final: 0 };
    filteredEvaluations.forEach(ev => { counts[ev.phase] = (counts[ev.phase] ?? 0) + 1; });
    return [
      { name: 'Early', value: counts.early, color: '#7c3aed' },
      { name: 'Middle', value: counts.middle, color: '#00d4ff' },
      { name: 'Final', value: counts.final, color: '#2ed573' },
    ].filter(d => d.value > 0);
  }, [filteredEvaluations]);

  const completedCount = evaluations.length;
  const studentCount = students.length;

  const initials = preceptor.name
    ? preceptor.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : 'DR';

  // Neon stat card configs
  const statCards = [
    {
      title: 'Students',
      value: studentCount,
      sub: 'Active learners in your panel',
      link: '/students',
      linkLabel: 'Manage →',
      gradient: 'linear-gradient(135deg, rgba(255,45,120,0.18), rgba(124,58,237,0.12))',
      borderColor: 'rgba(255,45,120,0.25)',
      valueColor: '#ff2d78',
      glow: '0 8px 32px rgba(255,45,120,0.18)',
      topBorder: 'linear-gradient(90deg, #ff2d78, #7c3aed)',
    },
    {
      title: 'Completed Evaluations',
      value: completedCount,
      sub: 'Saved evaluations across all weeks',
      link: '/evaluations',
      linkLabel: 'View all →',
      gradient: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.1))',
      borderColor: 'rgba(0,212,255,0.22)',
      valueColor: '#00d4ff',
      glow: '0 8px 32px rgba(0,212,255,0.15)',
      topBorder: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
    },
    {
      title: 'Overall Rating',
      value: overallAvg ? `${overallAvg}/5` : '—',
      sub: overallAvg ? 'Average across all evaluations' : 'No evaluations yet',
      link: null,
      linkLabel: '1–5 scale',
      gradient: 'linear-gradient(135deg, rgba(46,213,115,0.15), rgba(0,212,255,0.1))',
      borderColor: 'rgba(46,213,115,0.22)',
      valueColor: '#2ed573',
      glow: '0 8px 32px rgba(46,213,115,0.15)',
      topBorder: 'linear-gradient(90deg, #2ed573, #00d4ff)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(0,212,255,0.2))'
            : 'linear-gradient(135deg, #6c3fc5 0%, #3b6fd4 50%, #06b0c8 100%)',
          minHeight: 140,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>
            🏥 Welcome back, {preceptor.name?.split(' ')[0] || 'Doctor'}!
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>
            Clinical Educator
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Ready to evaluate your students today?
        </h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Your evaluation platform is ready. Track progress and guide your learners.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/evaluate')}
            style={{ background: '#fff', color: '#4F7EFF', border: 'none' }}
          >
            + New Evaluation →
          </AnimatedButton>
          <Link
            to="/students"
            className="text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            View Students
          </Link>
        </div>
      </motion.div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isDark ? (
          // Neon dark stat cards
          <>
            {statCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07, ease: 'easeOut' }}
                className="rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
                style={{
                  background: card.gradient,
                  border: `1px solid ${card.borderColor}`,
                  boxShadow: card.glow,
                }}
              >
                {/* Top neon accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: card.topBorder }}
                />
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {card.title}
                  </h3>
                  {card.link ? (
                    <Link to={card.link} className="text-[11px] hover:opacity-80 transition-opacity" style={{ color: card.valueColor }}>
                      {card.linkLabel}
                    </Link>
                  ) : (
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{card.linkLabel}</span>
                  )}
                </div>
                <p className="mt-3 text-3xl font-bold" style={{ color: card.valueColor }}>
                  {card.value}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.48)' }}>
                  {card.sub}
                </p>
              </motion.div>
            ))}
          </>
        ) : (
          // Light mode cards — new clean design
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0, ease: 'easeOut' }}
              className="rounded-2xl p-4 flex flex-col justify-between shadow-sm"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Students</h3>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F7EFF, #7c3aed)' }}>
                  <span className="text-white text-base" aria-hidden="true">◉</span>
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold" style={{ color: 'var(--text)' }}>{studentCount}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Active learners in your panel</p>
                <Link to="/students" className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>Manage →</Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.07, ease: 'easeOut' }}
              className="rounded-2xl p-4 flex flex-col justify-between shadow-sm"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Completed Evaluations</h3>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
                  <span className="text-white text-base" aria-hidden="true">≡</span>
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold" style={{ color: 'var(--text)' }}>{completedCount}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Saved evaluations across all weeks</p>
                <Link to="/evaluations" className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>View all →</Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.14, ease: 'easeOut' }}
              className="rounded-2xl p-4 flex flex-col justify-between shadow-sm"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Overall Rating</h3>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2ed573, #00d4ff)' }}>
                  <span className="text-white text-base" aria-hidden="true">↗</span>
                </div>
              </div>
              {overallAvg ? (
                <>
                  <div className="flex items-center justify-between mt-3 gap-2">
                    <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{overallAvg}/5</p>
                    <div className="flex-1 flex justify-end">
                      <Sparkline data={overallTrendData} width={80} height={28} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Average across all evaluations</p>
                    <span className="text-[11px] font-semibold" style={{ color: '#22c55e' }}>1–5 scale</span>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-xs" style={{ color: 'var(--muted)' }}>No evaluations yet.</p>
              )}
            </motion.div>
          </>
        )}

        {/* Red-flag snapshot */}
        <div
          className="rounded-2xl p-4 flex items-center justify-between gap-3 relative overflow-hidden"
          style={isDark ? {
            background: 'linear-gradient(135deg, rgba(255,71,87,0.18), rgba(255,45,120,0.1))',
            border: '1px solid rgba(255,71,87,0.3)',
            boxShadow: '0 8px 32px rgba(255,71,87,0.15)',
          } : {
            background: '#fff1f2',
            border: '1px solid #fecdd3',
          }}
        >
          {isDark && (
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #ff4757, #ff2d78)' }} />
          )}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: isDark ? 'rgba(255,71,87,0.85)' : '#be123c' }}
            >
              Internal Medicine Red Flags
            </p>
            <p className="mt-1 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#9f1239' }}>
              {redFlagEvalCount} evaluation{redFlagEvalCount !== 1 ? 's' : ''} with benchmarks flagged
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-bold" style={{ color: isDark ? '#ff4757' : '#e11d48' }}>
              {redFlagStudentCount}
            </p>
            <p className="text-[11px]" style={{ color: isDark ? 'rgba(255,71,87,0.75)' : '#be123c' }}>
              student{redFlagStudentCount !== 1 ? 's' : ''} affected
            </p>
          </div>
        </div>
      </div>

      {/* Middle row: recent + category averages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Evaluations */}
        <div
          className="lg:col-span-2 rounded-2xl p-4 space-y-3 relative overflow-hidden"
          style={isDark ? {
            background: 'rgba(18,18,31,0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          } : {
            background: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          {isDark && (
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #ff2d78, #7c3aed, #00d4ff)' }} />
          )}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⏱️</span>
              <h3 className="text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#0f172a' }}>
                Recent Evaluations
              </h3>
            </div>
            <Link
              to="/evaluations"
              className="text-xs font-medium hover:opacity-80 transition-opacity"
              style={{ color: isDark ? '#ff2d78' : '#4f46e5' }}
            >
              View all →
            </Link>
          </div>

          {recentEvals.length === 0 ? (
            <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>
              No evaluations yet. Create your first evaluation to see it here.
            </p>
          ) : (
            <div className="space-y-2">
              {recentEvals.map(ev => {
                const student = students.find(s => s.id === ev.studentId);
                const phaseConf = PHASE_CONFIG[ev.phase];
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => navigate(`/evaluations/${ev.id}`)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl transition-all text-left group"
                    style={isDark ? {
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    } : {
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                    onMouseEnter={e => {
                      if (isDark) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,45,120,0.35)';
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,45,120,0.06)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (isDark) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)';
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={isDark ? {
                          background: 'rgba(255,45,120,0.15)',
                          color: '#ff2d78',
                        } : {
                          background: '#ede9fe',
                          color: '#7c3aed',
                        }}
                      >
                        W{ev.weekNumber}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#0f172a' }}>
                          {student?.name || 'Unknown student'}
                        </p>
                        <p className="text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : '#94a3b8' }}>
                          {ev.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${phaseConf.bgColor} ${phaseConf.color} border ${phaseConf.borderColor}`}>
                        {phaseConf.label}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: ev.overallRating >= 4
                            ? isDark ? '#2ed573' : '#16a34a'
                            : ev.overallRating >= 3
                            ? isDark ? '#ffa502' : '#d97706'
                            : isDark ? '#ff4757' : '#dc2626',
                        }}
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
        <div
          className="rounded-2xl p-4 space-y-3 relative overflow-hidden"
          style={isDark ? {
            background: 'rgba(18,18,31,0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          } : {
            background: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          {isDark && (
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #7c3aed, #00d4ff)' }} />
          )}
          <h3 className="text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#0f172a' }}>
            Competency Averages
          </h3>
          {categoryAverages ? (
            <div className="space-y-2.5">
              {categoryAverages.map((cat, i) => {
                const neonColors = ['#ff2d78', '#00d4ff', '#2ed573', '#ffa502', '#7c3aed', '#ff6b35', '#c8ff00'];
                const c = isDark ? neonColors[i % neonColors.length] : '#4f46e5';
                const pct = (parseFloat(cat.avg) / 5) * 100;
                return (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>{cat.label}</span>
                      <span className="font-semibold" style={{ color: c }}>{cat.avg}/5</span>
                    </div>
                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{ background: isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: c }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>
              Averages will appear once you have evaluations.
            </p>
          )}
        </div>
      </div>

      {/* Quick actions / profile */}
      <div
        className="rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 relative overflow-hidden"
        style={isDark ? {
          background: 'rgba(18,18,31,0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        } : {
          background: '#ffffff',
          border: '1px solid #e2e8f0',
        }}
      >
        {isDark && (
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #ff6b35, #ff9500)' }} />
        )}
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-2xl text-sm font-semibold flex items-center justify-center flex-shrink-0"
            style={isDark ? {
              background: 'linear-gradient(135deg, #ff2d78, #7c3aed)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(255,45,120,0.4)',
            } : {
              background: '#4f46e5',
              color: '#ffffff',
            }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#0f172a' }}>
              {preceptor.name || 'Set up your profile'}
            </p>
            <p className="text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}>
              {preceptor.institution || 'Add your institution and specialty'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/evaluate"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={isDark ? {
              background: 'linear-gradient(135deg, #ff2d78, #7c3aed)',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(255,45,120,0.35)',
            } : {
              background: '#4f46e5',
              color: '#ffffff',
            }}
          >
            + New Evaluation
          </Link>
          <Link
            to="/settings"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={isDark ? {
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.8)',
            } : {
              background: 'transparent',
              border: '1px solid #e2e8f0',
              color: '#475569',
            }}
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Analytics section */}
      <div>
        {/* Recommended Focus Areas */}
        <div className="mb-4">
          <RemindersWidget studentId={selectedStudentId} />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label
            className="text-sm font-medium"
            style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}
          >
            View:
          </label>
          <select
            value={selectedStudentId ?? ''}
            onChange={e => setSelectedStudentId(e.target.value || undefined)}
            className="px-3 py-1.5 rounded-xl border text-sm"
            style={isDark ? {
              background: 'rgba(18,18,31,0.85)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.85)',
            } : {
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
            }}
          >
            <option value="">Cohort (all students)</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CompetencyRadar evaluations={evaluations} studentId={selectedStudentId} />
          <OverallLine
            evaluations={evaluations}
            studentId={selectedStudentId}
            onPointClick={id => navigate(`/evaluations/${id}`)}
          />
          <TopicCoverageWidget
            evaluations={evaluations}
            studentId={selectedStudentId}
          />
        </div>

        {/* Animated charts row */}
        {evaluations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <AnimatedBarChart
              data={categoryBarData}
              bars={[{ dataKey: 'Score', name: 'Avg Score', cellColors: ['#7c3aed', '#00d4ff', '#2ed573', '#ff2d78', '#ff9500', '#10b981', '#f59e0b'] }]}
              xDataKey="name"
              yDomain={[0, 5]}
              height={240}
              title="Category Score Breakdown"
            />
            {phaseDonutData.length > 0 && (
              <AnimatedDonutChart
                data={phaseDonutData}
                height={240}
                title="Evaluations by Phase"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
