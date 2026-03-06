import React from 'react';
import { motion } from 'framer-motion';
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
import { useTheme } from '../../theme';
import { CHART_COLORS } from '../../utils/chartConstants';

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
          ? { background: 'var(--panel)', border: '1px solid var(--border)' }
          : { background: 'var(--panel)', border: '1px solid var(--border)' }
      }
    >
      {title && (
        <h4
          className="text-sm font-semibold mb-2"
          style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#2b2b36' }}
        >
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          style={{ cursor: onPointClick ? 'pointer' : 'default' }}
          onClick={(state) => {
            if (onPointClick && typeof state?.activeIndex === 'number') {
              onPointClick(state.activeIndex);
            }
          }}
        >
          <defs>
            {lines.map((line, idx) => {
              const color = line.color ?? CHART_COLORS[idx % CHART_COLORS.length];
              return (
                <linearGradient key={`gradient-${line.dataKey}`} id={`gradient-${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey={xDataKey} tick={tickStyle} axisLine={false} tickLine={false} />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.7)' : undefined }} />
          {lines.map((line, idx) => {
            const color = line.color ?? CHART_COLORS[idx % CHART_COLORS.length];
            return line.strokeDasharray ? (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name ?? line.dataKey}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={line.strokeDasharray}
                dot={line.dot !== false ? { r: 4, strokeWidth: 2, fill: isDark ? '#1f2032' : '#ffffff' } : false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
              />
            ) : (
              <Area
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name ?? line.dataKey}
                stroke={color}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#gradient-${line.dataKey})`}
                dot={line.dot !== false ? { r: 4, strokeWidth: 2, fill: isDark ? '#1f2032' : '#ffffff' } : false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
