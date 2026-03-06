import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../theme';
import { CHART_COLORS } from '../../utils/chartConstants';

interface DonutDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface AnimatedDonutChartProps {
  data: DonutDataPoint[];
  height?: number;
  title?: string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  showLegend?: boolean;
}

export function AnimatedDonutChart({
  data,
  height = 260,
  title,
  innerRadius = '55%',
  outerRadius = '80%',
  showLegend = true,
}: AnimatedDonutChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const tooltipStyle = isDark
    ? { background: 'rgba(18,18,31,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }
    : undefined;

  const total = data.reduce((sum, d) => sum + d.value, 0);

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
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <defs>
              {data.map((entry, index) => {
                const color = entry.color ?? CHART_COLORS[index % CHART_COLORS.length];
                return (
                  <linearGradient key={`donut-grad-${index}`} id={`donut-grad-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.65} />
                  </linearGradient>
                );
              })}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey="value"
              isAnimationActive
              animationBegin={0}
              animationDuration={900}
              animationEasing="ease-out"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              stroke="none"
              paddingAngle={2}
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#donut-grad-${index})`}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [`${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`, '']}
            />
            {showLegend && (
              <Legend
                wrapperStyle={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.7)' : undefined }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        {total > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              // Account for legend offset when visible
              marginTop: showLegend ? -16 : 0,
            }}
          >
            <div
              style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                color: isDark ? 'rgba(255,255,255,0.9)' : '#2b2b36',
                lineHeight: 1,
              }}
            >
              {activeIndex !== null ? data[activeIndex]?.value : total}
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                marginTop: 2,
                color: isDark ? 'rgba(255,255,255,0.45)' : '#8b8e9b',
              }}
            >
              {activeIndex !== null ? data[activeIndex]?.name : 'total'}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
