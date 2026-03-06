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

const DEFAULT_COLORS = ['#7c3aed', '#00d4ff', '#2ed573', '#ff2d78', '#ff9500', '#10b981'];

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
        <BarChart data={data} layout={layout}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          {layout === 'horizontal' ? (
            <>
              <XAxis dataKey={xDataKey} tick={tickStyle} />
              <YAxis domain={yDomain} tick={tickStyle} />
            </>
          ) : (
            <>
              <XAxis type="number" domain={yDomain} tick={tickStyle} />
              <YAxis type="category" dataKey={xDataKey} tick={tickStyle} width={80} />
            </>
          )}
          <Tooltip contentStyle={tooltipStyle} />
          {bars.length > 1 && (
            <Legend wrapperStyle={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.7)' : undefined }} />
          )}
          {bars.map((bar, barIdx) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name ?? bar.dataKey}
              fill={bar.color ?? DEFAULT_COLORS[barIdx % DEFAULT_COLORS.length]}
              radius={[4, 4, 0, 0]}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            >
              {bar.cellColors &&
                data.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={bar.cellColors![index % bar.cellColors!.length]}
                  />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
