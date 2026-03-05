import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { computeCompetencyAverages } from '../../utils/analytics';
import { SessionEvaluation } from '../../types';
import { useTheme } from '../../theme';

interface Props {
  evaluations: SessionEvaluation[];
  studentId?: string;
}

export function CompetencyRadar({ evaluations, studentId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dataArr = computeCompetencyAverages(evaluations, studentId);

  const chartData = dataArr.map(d => ({
    subject: d.label,
    avg: d.avg,
    fullMark: 5,
  }));

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
      <h4 className="text-sm font-semibold mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#0f172a' }}>
        Competency Radar
      </h4>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={chartData}>
          <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'} />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }} />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }} />
          <Radar
            name={studentId ? 'Student' : 'Cohort average'}
            dataKey="avg"
            stroke="rgba(99,102,241,1)"
            fill="rgba(99,102,241,0.15)"
            fillOpacity={1}
          />
          <Tooltip
            contentStyle={isDark ? { background: 'rgba(18,18,31,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' } : undefined}
            formatter={(value: number) => [value.toFixed(1), 'Avg']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
