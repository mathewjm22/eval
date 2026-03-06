import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme';

/** Minimum alpha for non-zero cells (visible but subtle). */
const ALPHA_MIN = 0.15;
/** Maximum alpha for cells at peak intensity. */
const ALPHA_MAX = 0.85;
/** Alpha for empty cells in dark mode. */
const EMPTY_ALPHA_DARK = 0.04;

interface HeatmapCell {
  /** Column label (e.g. week, month, or x-axis label) */
  x: string;
  /** Row label (e.g. category, day-of-week, or y-axis label) */
  y: string;
  /** Numeric intensity value */
  value: number;
}

interface AnimatedHeatmapProps {
  data: HeatmapCell[];
  title?: string;
  /** Label for the x-axis dimension */
  xLabel?: string;
  /** Label for the y-axis dimension */
  yLabel?: string;
  /** Override the maximum value used for color scaling */
  maxValue?: number;
  /** Color scheme: 'green' | 'blue' | 'purple' */
  colorScheme?: 'green' | 'blue' | 'purple';
  cellSize?: number;
}

function interpolateColor(ratio: number, scheme: 'green' | 'blue' | 'purple', isDark: boolean): string {
  if (ratio === 0) return isDark ? `rgba(255,255,255,${EMPTY_ALPHA_DARK})` : '#f3f4f6';
  const alpha = ALPHA_MIN + ratio * ALPHA_MAX;
  switch (scheme) {
    case 'green':
      return isDark
        ? `rgba(16,185,129,${alpha})`
        : `rgba(22,163,74,${alpha})`;
    case 'blue':
      return isDark
        ? `rgba(0,212,255,${alpha})`
        : `rgba(14,165,233,${alpha})`;
    case 'purple':
      return isDark
        ? `rgba(124,58,237,${alpha})`
        : `rgba(99,102,241,${alpha})`;
    default:
      return isDark ? `rgba(16,185,129,${alpha})` : `rgba(22,163,74,${alpha})`;
  }
}

export function AnimatedHeatmap({
  data,
  title,
  xLabel,
  yLabel,
  maxValue,
  colorScheme = 'green',
  cellSize = 28,
}: AnimatedHeatmapProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { xs, ys, cellMap, effectiveMax } = useMemo(() => {
    const xSet = new Set<string>();
    const ySet = new Set<string>();
    const map = new Map<string, number>();
    let mx = maxValue ?? 0;

    data.forEach(({ x, y, value }) => {
      xSet.add(x);
      ySet.add(y);
      map.set(`${x}__${y}`, value);
      if (!maxValue && value > mx) mx = value;
    });

    return {
      xs: [...xSet],
      ys: [...ySet],
      cellMap: map,
      effectiveMax: mx || 1,
    };
  }, [data, maxValue]);

  const labelColor = isDark ? 'rgba(255,255,255,0.5)' : '#64748b';
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl border p-4 shadow-sm overflow-x-auto"
      style={
        isDark
          ? { background: 'rgba(18,18,31,0.85)', border: `1px solid ${borderColor}` }
          : { background: '#ffffff', border: `1px solid ${borderColor}` }
      }
    >
      {title && (
        <h4
          className="text-sm font-semibold mb-3"
          style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#0f172a' }}
        >
          {title}
        </h4>
      )}

      {/* Y-label */}
      {yLabel && (
        <p className="text-[10px] mb-1" style={{ color: labelColor }}>
          {yLabel} →
        </p>
      )}

      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        {/* Y-axis labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: cellSize + 4 }}>
          {ys.map((y) => (
            <div
              key={y}
              style={{
                height: cellSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 6,
                fontSize: 9,
                color: labelColor,
                whiteSpace: 'nowrap',
                minWidth: 36,
              }}
            >
              {y}
            </div>
          ))}
        </div>

        <div>
          {/* X-axis labels */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
            {xs.map((x) => (
              <div
                key={x}
                style={{
                  width: cellSize,
                  textAlign: 'center',
                  fontSize: 9,
                  color: labelColor,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {x}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {ys.map((y, yIdx) => (
              <div key={y} style={{ display: 'flex', gap: 3 }}>
                {xs.map((x, xIdx) => {
                  const val = cellMap.get(`${x}__${y}`) ?? 0;
                  const ratio = val / effectiveMax;
                  const bg = interpolateColor(ratio, colorScheme, isDark);
                  return (
                    <motion.div
                      key={x}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: (yIdx * xs.length + xIdx) * 0.008,
                        duration: 0.25,
                        ease: 'easeOut',
                      }}
                      title={`${y} / ${x}: ${val}`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        borderRadius: 5,
                        background: bg,
                        cursor: val > 0 ? 'default' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {val > 0 && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            color: ratio > 0.55 ? '#fff' : (isDark ? 'rgba(255,255,255,0.7)' : '#334155'),
                          }}
                        >
                          {val}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* X-label */}
      {xLabel && (
        <p className="text-[10px] mt-2" style={{ color: labelColor }}>
          ↑ {xLabel}
        </p>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3">
        <span style={{ fontSize: 9, color: labelColor }}>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((r) => (
          <div
            key={r}
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: interpolateColor(r, colorScheme, isDark),
            }}
          />
        ))}
        <span style={{ fontSize: 9, color: labelColor }}>More</span>
      </div>
    </motion.div>
  );
}
