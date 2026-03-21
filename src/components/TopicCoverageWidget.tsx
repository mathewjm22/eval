import { useMemo, useState } from 'react';
import { SessionEvaluation, AdHocTeaching, TEACHING_TOPIC_CATEGORIES } from '../types';
import { useTheme } from '../theme';
import { useAppData } from '../context';

interface TopicCoverageWidgetProps {
  evaluations: SessionEvaluation[];
  teachings?: AdHocTeaching[];
  studentId: string | undefined;
}

export function TopicCoverageWidget({ evaluations, teachings = [], studentId }: TopicCoverageWidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { data, updateCustomTopicMapping } = useAppData();
  const customMappings = data.customTopicMappings || {};

  const coveredByCategory = useMemo(() => {
    const result: Record<string, Set<string>> = {};

    // Helper to add topic to mapped category or default
    const addTopic = (category: string, topic: string) => {
      let finalCategory = category;
      // If it's a custom topic, check mappings
      if (category === "Custom Topics") {
        finalCategory = customMappings[topic] || "Other";
      }
      if (!result[finalCategory]) result[finalCategory] = new Set();
      result[finalCategory].add(topic);
    };

    // Add from evaluations
    const filteredEvals = studentId
      ? evaluations.filter(ev => ev.studentId === studentId)
      : evaluations;
    for (const ev of filteredEvals) {
      for (const { category, topics } of ev.teachingTopics ?? []) {
        for (const t of topics) addTopic(category, t);
      }
    }

    // Add from ad-hoc teachings
    const filteredTeachings = studentId
      ? teachings.filter(th => th.studentIds.includes(studentId))
      : teachings;
    for (const th of filteredTeachings) {
      for (const { category, topics } of th.teachingTopics ?? []) {
        for (const t of topics) addTopic(category, t);
      }
    }

    return result;
  }, [evaluations, teachings, studentId, customMappings]);

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
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-teaching-modal', { detail: { studentId } }));
            }}
            className="text-xs font-semibold px-2 py-0.5 rounded-full border transition-colors"
            style={
              isDark
                ? {
                    background: 'rgba(59, 130, 246, 0.15)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    color: '#60a5fa',
                  }
                : {
                    background: '#eff6ff',
                    borderColor: '#bfdbfe',
                    color: '#2563eb',
                  }
            }
          >
            Add+
          </button>
        </div>
      </div>

      {/* Category rows */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {TEACHING_TOPIC_CATEGORIES.map(({ category, topics }) => {
          // Combine predefined topics with mapped custom topics
          const mappedCustomTopics = Array.from(coveredByCategory[category] || []).filter(t => !topics.includes(t));
          const allCategoryTopics = [...topics, ...mappedCustomTopics];

          return (
            <div key={category}>
              <p
                className="text-xs font-semibold mb-1.5"
                style={{ color: isDark ? 'rgba(255,255,255,0.55)' : '#475569' }}
              >
                {category}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {allCategoryTopics.map(topic => {
                  const covered = coveredByCategory[category]?.has(topic) ?? false;
                  const isCustom = mappedCustomTopics.includes(topic);
                  return (
                    <span
                      key={topic}
                      onClick={() => {
                        if (isCustom) {
                          window.dispatchEvent(new CustomEvent('open-custom-topic-modal', { detail: { topic, currentCategory: category } }));
                        }
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${isCustom ? 'cursor-pointer hover:opacity-80' : ''}`}
                      style={
                        covered
                          ? isCustom
                            ? isDark
                              ? {
                                  background: 'rgba(168,85,247,0.15)',
                                  border: '1px solid rgba(168,85,247,0.4)',
                                  color: '#c084fc',
                                }
                              : {
                                  background: 'rgba(147,51,234,0.1)',
                                  border: '1px solid rgba(147,51,234,0.3)',
                                  color: '#7e22ce',
                                }
                            : isDark
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
                      {covered && !isCustom ? '✓ ' : ''}{topic}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Other / Unassigned Custom Topics Row */}
        {coveredByCategory["Other"] && coveredByCategory["Other"].size > 0 && (
          <div key="custom-topics-other" className="pt-2">
            <p
              className="text-xs font-semibold mb-1.5"
              style={{ color: isDark ? 'rgba(168,85,247,0.7)' : '#9333ea' }}
            >
              Other
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from(coveredByCategory["Other"]).map(topic => (
                <span
                  key={topic}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-custom-topic-modal', { detail: { topic, currentCategory: null } }));
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full border font-medium cursor-pointer hover:opacity-80"
                  style={
                    isDark
                      ? {
                          background: 'rgba(168,85,247,0.15)',
                          border: '1px solid rgba(168,85,247,0.4)',
                          color: '#c084fc',
                        }
                      : {
                          background: 'rgba(147,51,234,0.1)',
                          border: '1px solid rgba(147,51,234,0.3)',
                          color: '#7e22ce',
                        }
                  }
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
