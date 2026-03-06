/** Shared color palette used across all animated chart components. */
export const CHART_COLORS = [
  '#7c3aed',
  '#00d4ff',
  '#2ed573',
  '#ff2d78',
  '#ff9500',
  '#10b981',
  '#f59e0b',
  '#06b6d4',
] as const;

/** Maximum number of characters for chart axis labels before truncation. */
export const CHART_LABEL_MAX_LENGTH = 14;

/** Truncate a label to CHART_LABEL_MAX_LENGTH with an ellipsis if needed. */
export function truncateChartLabel(label: string): string {
  return label.length > CHART_LABEL_MAX_LENGTH
    ? label.slice(0, CHART_LABEL_MAX_LENGTH) + '…'
    : label;
}
