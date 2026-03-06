import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTheme } from '../../theme';
import { CHART_COLORS } from '../../utils/chartConstants';

interface BarDataPoint {
  [key: string]: string | number;
}

interface BarConfig {
  dataKey: string;
  name?: string;
  color?: string;
  /** If provided, each bar gets a color from this array based on index */
  cellColors?: string[];
}

interface AnimatedBarChartProps {
  data: BarDataPoint[];
  bars: BarConfig[];
  xDataKey: string;
  yDomain?: [number, number];
  height?: number;
  title?: string;
  layout?: 'horizontal' | 'vertical';
}

export function AnimatedBarChart({
  data,
  bars,
  xDataKey,
  yDomain,
  height = 260,
  title,
  layout = 'horizontal',
}: AnimatedBarChartProps) {
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
        <BarChart data={data} layout={layout}>
          <defs>
            {bars.map((bar, barIdx) => {
              const color = bar.color ?? CHART_COLORS[barIdx % CHART_COLORS.length];
              return (
                <linearGradient key={`bar-gradient-${bar.dataKey}`} id={`bar-gradient-${bar.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                </linearGradient>
              );
            })}
            {bars.flatMap((bar) => bar.cellColors ? bar.cellColors.map((color, cIdx) => (
              <linearGradient key={`bar-cell-gradient-${bar.dataKey}-${cIdx}`} id={`bar-cell-gradient-${bar.dataKey}-${cIdx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            )) : [])}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          {layout === 'horizontal' ? (
            <>
              <XAxis dataKey={xDataKey} tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis domain={yDomain} tick={tickStyle} axisLine={false} tickLine={false} />
            </>
          ) : (
            <>
              <XAxis type="number" domain={yDomain} tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey={xDataKey} tick={tickStyle} width={80} axisLine={false} tickLine={false} />
            </>
          )}
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }} />
          {bars.length > 1 && (
            <Legend wrapperStyle={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.7)' : undefined }} />
          )}
          {bars.map((bar, barIdx) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name ?? bar.dataKey}
              fill={`url(#bar-gradient-${bar.dataKey})`}
              radius={layout === 'horizontal' ? [4, 4, 0, 0] : [0, 4, 4, 0]}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
              barSize={layout === 'horizontal' ? 16 : 12}
            >
              {bar.cellColors &&
                data.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#bar-cell-gradient-${bar.dataKey}-${index % bar.cellColors!.length})`}
                  />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
