/**
 * Calculates the calendar week number since the student's start date.
 * A week is defined as Sunday to Saturday. The week containing the start date is Week 1.
 * @param evalDateString The date of the evaluation (YYYY-MM-DD)
 * @param startDateString The student's start date (YYYY-MM-DD)
 * @returns The week number (1-based)
 */
export function calculateWeekNumberFromDate(evalDateString: string, startDateString?: string): number {
  if (!evalDateString || !startDateString) return 1;

  // Parse dates as local dates to avoid timezone issues with midnight UTC
  const [evalYear, evalMonth, evalDay] = evalDateString.split('-').map(Number);
  const [startYear, startMonth, startDay] = startDateString.split('-').map(Number);

  const evalDate = new Date(evalYear, evalMonth - 1, evalDay);
  const startDate = new Date(startYear, startMonth - 1, startDay);

  // If evaluation is before start date, return week 1
  if (evalDate < startDate) return 1;

  // Find the Sunday of the week containing the start date
  const startSunday = new Date(startDate);
  startSunday.setDate(startDate.getDate() - startDate.getDay());

  // Reset time portions just to be safe
  startSunday.setHours(0, 0, 0, 0);
  evalDate.setHours(0, 0, 0, 0);

  // Calculate difference in milliseconds from that Sunday
  const diffTime = evalDate.getTime() - startSunday.getTime();

  // Convert to days (using Math.round to avoid daylight saving issues where diff is 23 or 25 hours)
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // Calculate week number (1-based)
  const weekNumber = Math.floor(diffDays / 7) + 1;

  return weekNumber;
}

/**
 * Determines the timeline phase based on the week number since the start date.
 * Early: Weeks 1-7
 * Middle: Weeks 8-14
 * Final: Weeks 15+
 */
export function determinePhaseFromDate(evalDateString: string, startDateString?: string): 'early' | 'middle' | 'final' {
  const weekNumber = calculateWeekNumberFromDate(evalDateString, startDateString);

  if (weekNumber <= 7) return 'early';
  if (weekNumber <= 14) return 'middle';
  return 'final';
}
