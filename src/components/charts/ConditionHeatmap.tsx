import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { subYears, formatISO } from 'date-fns';
import { computeTopicDateCounts } from '../../utils/analytics';
import { SessionEvaluation } from '../../types';
import { useTheme } from '../../theme';

interface Props {
  evaluations: SessionEvaluation[];
  field?: 'teachingTopics' | 'conditionsSeen';
  studentId?: string;
  onDateClick?: (date: string) => void;
}

export function ConditionHeatmap({
  evaluations,
  field = 'teachingTopics',
  studentId,
  onDateClick,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const counts = computeTopicDateCounts(evaluations, field, studentId);
  const values = counts.map(c => ({ date: c.date, count: c.count }));

  const endDate = new Date();
  const startDate = subYears(endDate, 1);

  return (
    <div
      className="rounded-2xl border p-4 shadow-sm"
      style={isDark ? {
        background: 'rgba(18,18,31,0.85)',
        border: '1px solid rgba(255,255,255,0.07)',
      } : {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#0f172a' }}>
          Conditions / Topics Heatmap
        </h4>
        <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>Last 12 months</span>
      </div>
      <CalendarHeatmap
        startDate={formatISO(startDate, { representation: 'date' })}
        endDate={formatISO(endDate, { representation: 'date' })}
        values={values}
        classForValue={(value) => {
          if (!value || !value.count) return 'color-empty';
          if (value.count >= 5) return 'color-scale-4';
          if (value.count >= 3) return 'color-scale-3';
          if (value.count >= 2) return 'color-scale-2';
          return 'color-scale-1';
        }}
        tooltipDataAttrs={undefined}
        showWeekdayLabels
        onClick={(value) => {
          if (value?.date && onDateClick) onDateClick(String(value.date));
        }}
      />
      <style>{`
        .react-calendar-heatmap .color-empty { fill: ${isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'}; }
        .react-calendar-heatmap .color-scale-1 { fill: ${isDark ? '#14532d' : '#c7f9cc'}; }
        .react-calendar-heatmap .color-scale-2 { fill: ${isDark ? '#166534' : '#7be495'}; }
        .react-calendar-heatmap .color-scale-3 { fill: ${isDark ? '#15803d' : '#2ed573'}; }
        .react-calendar-heatmap .color-scale-4 { fill: ${isDark ? '#16a34a' : '#16a34a'}; }
      `}</style>
    </div>
  );
}
