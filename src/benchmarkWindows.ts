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
 * Check if a given date string falls in the mid-year window.
 */
export function isMidYearDate(dateString: string): boolean {
  const date = new Date(dateString);
  const month = date.getMonth(); // 0 = Jan
  return month >= 1 && month <= 3; // Feb-Apr
}

/**
 * Check if a given date string falls in the end-of-year window.
 */
export function isEndOfYearDate(dateString: string): boolean {
  const date = new Date(dateString);
  const month = date.getMonth(); // 0 = Jan
  return month >= 4 && month <= 6; // May-Jul
}
