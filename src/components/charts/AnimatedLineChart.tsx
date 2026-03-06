import React from 'react';
import { motion } from 'framer-motion';
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
import { useTheme } from '../../theme';

interface DataPoint {
  [key: string]: string | number;
}

interface LineConfig {
  dataKey: string;
  name?: string;
  color?: string;
  strokeDasharray?: string;
  dot?: boolean;
}

interface AnimatedLineChartProps {
  data: DataPoint[];
  lines: LineConfig[];
  xDataKey: string;
  yDomain?: [number, number];
  yTicks?: number[];
  height?: number;
  title?: string;
  onPointClick?: (index: number) => void;
}

export function AnimatedLineChart({
  data,
  lines,
  xDataKey,
  yDomain,
  yTicks,
  height = 260,
  title,
  onPointClick,
}: AnimatedLineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0';
  const tickStyle = { fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' };
  const tooltipStyle = isDark
    ? { background: 'rgba(18,18,31,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl border p-4 shadow-sm"
      style={
        isDark
          ? { background: 'rgba(18,18,31,0.85)', border: '1px solid rgba(255,255,255,0.07)' }
          : { background: '#ffffff', border: '1px solid #e2e8f0' }
      }
    >
      {title && (
        <h4
          className="text-sm font-semibold mb-2"
          style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#0f172a' }}
        >
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          style={{ cursor: onPointClick ? 'pointer' : 'default' }}
          onClick={(state) => {
            if (onPointClick && typeof state?.activeIndex === 'number') {
              onPointClick(state.activeIndex);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey={xDataKey} tick={tickStyle} />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tick={tickStyle}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.7)' : undefined }} />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name ?? line.dataKey}
              stroke={line.color ?? '#10b981'}
              strokeDasharray={line.strokeDasharray}
              dot={line.dot !== false ? { r: 4 } : false}
              activeDot={{ r: 6 }}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
