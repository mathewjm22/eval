import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { CategoricalChartFunc } from 'recharts/types/chart/types';
import { computeOverallSeries } from '../../utils/analytics';
import { SessionEvaluation } from '../../types';
import { useTheme } from '../../theme';

interface Props {
  evaluations: SessionEvaluation[];
  studentId?: string;
  onPointClick?: (id: string) => void;
}

export function OverallLine({ evaluations, studentId, onPointClick }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { series, movingAvg } = computeOverallSeries(evaluations, studentId);

  const chartData = series.map((s, i) => ({
    date: s.date.slice(0, 10),
    rating: s.rating,
    movingAvg: movingAvg[i],
    id: s.id,
  }));

  const handleClick: CategoricalChartFunc = (nextState) => {
    if (!onPointClick) return;
    const idx = nextState.activeIndex;
    if (typeof idx === 'number' && chartData[idx]) {
      onPointClick(chartData[idx].id);
    }
  };

  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0';
  const tickStyle = { fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' };

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
        Overall Rating Over Time
      </h4>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} onClick={handleClick} style={{ cursor: onPointClick ? 'pointer' : 'default' }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" tick={tickStyle} />
          <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={tickStyle} />
          <Tooltip
            contentStyle={isDark ? { background: 'rgba(18,18,31,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' } : undefined}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.7)' : undefined }} />
          <Line
            type="monotone"
            dataKey="rating"
            name="Overall rating"
            stroke="#10b981"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="movingAvg"
            name="Moving avg (3)"
            stroke="#06b6d4"
            strokeDasharray="6 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
