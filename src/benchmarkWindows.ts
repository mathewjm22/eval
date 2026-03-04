// src/benchmarkWindows.ts

export type BenchmarkWindow = 'midYear' | 'endOfYear' | null;

/**
 * Given a JS month index (0 = Jan), returns which benchmark window this falls in:
 * - Feb–Apr => 'midYear'
 * - May–Jul => 'endOfYear'
 * - otherwise => null
 */
export function getBenchmarkWindowForMonth(month: number): BenchmarkWindow {
  if (month >= 1 && month <= 3) {
    // Feb–Apr
    return 'midYear';
  }
  if (month >= 4 && month <= 6) {
    // May–Jul
    return 'endOfYear';
  }
  return null;
}

/**
 * If you still want week-based badges on RotationSummary, keep these helpers.
 * These are independent of the month-based benchmark windows used for the
 * “Met / Not met” panel.
 */
export function isMidYearWeek(weekNumber: number): boolean {
  return weekNumber >= 13 && weekNumber <= 16;
}

export function isEndOfYearWeek(weekNumber: number): boolean {
  return weekNumber >= 31 && weekNumber <= 34;
}
