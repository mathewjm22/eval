import { useMemo } from 'react';
import { SessionEvaluation, TEACHING_TOPIC_CATEGORIES } from '../types';
import { useTheme } from '../theme';

interface TopicCoverageWidgetProps {
  evaluations: SessionEvaluation[];
  studentId: string | undefined;
}

export function TopicCoverageWidget({ evaluations, studentId }: TopicCoverageWidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const coveredByCategory = useMemo(() => {
    const result: Record<string, Set<string>> = {};
    const filtered = studentId
      ? evaluations.filter(ev => ev.studentId === studentId)
      : evaluations;
    for (const ev of filtered) {
      for (const { category, topics } of ev.teachingTopics ?? []) {
        if (!result[category]) result[category] = new Set();
        for (const t of topics) result[category].add(t);
      }
    }
    return result;
  }, [evaluations, studentId]);

  const { totalTopics, coveredCount } = useMemo(() => {
    let total = 0;
    let covered = 0;
    for (const { category, topics } of TEACHING_TOPIC_CATEGORIES) {
      total += topics.length;
      covered += topics.filter(t => coveredByCategory[category]?.has(t)).length;
    }
    return { totalTopics: total, coveredCount: covered };
  }, [coveredByCategory]);

  return (
    <div
      className="rounded-2xl border p-4 shadow-sm"
      style={
        isDark
          ? {
              background: 'rgba(18,18,31,0.85)',
              border: '1px solid rgba(255,255,255,0.07)',
            }
          : {
              background: '#ffffff',
              border: '1px solid #e2e8f0',
            }
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4
          className="text-sm font-semibold"
          style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#0f172a' }}
        >
          📚 Teaching Topics Coverage
        </h4>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={
            isDark
              ? { background: 'rgba(46,213,115,0.15)', color: '#2ed573' }
              : { background: '#dcfce7', color: '#15803d' }
          }
        >
          {coveredCount} / {totalTopics} covered
        </span>
      </div>

      {/* Category rows */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {TEACHING_TOPIC_CATEGORIES.map(({ category, topics }) => (
          <div key={category}>
            <p
              className="text-xs font-semibold mb-1.5"
              style={{ color: isDark ? 'rgba(255,255,255,0.55)' : '#475569' }}
            >
              {category}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {topics.map(topic => {
                const covered = coveredByCategory[category]?.has(topic) ?? false;
                return (
                  <span
                    key={topic}
                    className="text-[11px] px-2 py-0.5 rounded-full border font-medium"
                    style={
                      covered
                        ? isDark
                          ? {
                              background: 'rgba(46,213,115,0.15)',
                              border: '1px solid rgba(46,213,115,0.4)',
                              color: '#2ed573',
                            }
                          : {
                              background: '#dcfce7',
                              border: '1px solid #86efac',
                              color: '#15803d',
                            }
                        : isDark
                        ? {
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.35)',
                          }
                        : {
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#94a3b8',
                          }
                    }
                  >
                    {covered ? '✓ ' : ''}{topic}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
