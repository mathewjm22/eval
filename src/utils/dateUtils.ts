export function determinePhaseFromDate(dateString: string): 'early' | 'middle' | 'final' {
  if (!dateString) return 'early';

  const date = new Date(dateString);
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // January (0) to end of February (1) is early
  if (month === 0 || month === 1) {
    return 'early';
  }

  // March (2) to middle of May (May 15) is middle
  if (month === 2 || month === 3) {
    return 'middle';
  }
  if (month === 4 && day <= 15) {
    return 'middle';
  }

  // Middle of May (May 16) to end of July (6) is late (final)
  if (month === 4 && day > 15) {
    return 'final';
  }
  if (month === 5 || month === 6) {
    return 'final';
  }

  // August (7) is final
  if (month === 7) {
    return 'final';
  }

  // September (8) to December (11) is early
  if (month >= 8 && month <= 11) {
    return 'early';
  }

  return 'early';
}

export function calculateWeekNumberFromDate(dateString: string): number {
  if (!dateString) return 1;

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11

  // Determine the start year for the "academic year" (Sept 1 to Aug 31)
  // If the date is between Jan and Aug, the start year is the previous year
  let startYear = year;
  if (month >= 0 && month <= 7) {
    startYear = year - 1;
  }

  const startDate = new Date(startYear, 8, 1); // September 1st

  // Calculate difference in milliseconds
  const diffTime = Math.abs(date.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Calculate week number (1-based)
  const weekNumber = Math.floor(diffDays / 7) + 1;

  // Cap at 52 just in case
  return Math.min(Math.max(weekNumber, 1), 52);
}
