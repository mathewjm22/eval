import React from 'react';
import {
  ComposedChart,
  Area,
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
import { CHART_COLORS } from '../../utils/chartConstants';

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

  const ratingColor = CHART_COLORS[1]; // Purple
  const avgColor = CHART_COLORS[0]; // Cyan

  return (
    <div
      className="rounded-2xl border p-4 shadow-sm"
      style={isDark ? {
        background: 'var(--panel)',
        border: '1px solid var(--border)',
      } : {
        background: 'var(--panel)',
        border: '1px solid var(--border)',
      }}
    >
      <h4 className="text-sm font-semibold mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#2b2b36' }}>
        Overall Rating Over Time
      </h4>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} onClick={handleClick} style={{ cursor: onPointClick ? 'pointer' : 'default' }}>
          <defs>
            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={ratingColor} stopOpacity={0.6}/>
              <stop offset="95%" stopColor={ratingColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={tickStyle} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={isDark ? { background: 'rgba(18,18,31,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' } : undefined}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.7)' : undefined }} />
          <Area
            type="monotone"
            dataKey="rating"
            name="Overall rating"
            stroke={ratingColor}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRating)"
            dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#1f2032' : '#ffffff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="movingAvg"
            name="Moving avg (3)"
            stroke={avgColor}
            strokeDasharray="6 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
