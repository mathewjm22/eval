/** Shared color palette used across all animated chart components. */
export const CHART_COLORS = [
  '#00d4ff', // cyan
  '#7c3aed', // purple
  '#ff2d78', // pink
  '#ff9500', // orange
  '#2ed573', // green
  '#10b981', // emerald
  '#f59e0b', // amber
  '#06b6d4', // light blue
] as const;

/** Maximum number of characters for chart axis labels before truncation. */
export const CHART_LABEL_MAX_LENGTH = 14;

/** Truncate a label to CHART_LABEL_MAX_LENGTH with an ellipsis if needed. */
export function truncateChartLabel(label: string): string {
  return label.length > CHART_LABEL_MAX_LENGTH
    ? label.slice(0, CHART_LABEL_MAX_LENGTH) + '…'
    : label;
}
