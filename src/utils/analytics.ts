import { SessionEvaluation, SCORE_CATEGORIES } from '../types';
import { parseISO, formatISO, startOfDay, subYears } from 'date-fns';

export type CompetencyAverage = { label: string; avg: number };

export function computeCompetencyAverages(
  evals: SessionEvaluation[],
  studentId?: string,
): CompetencyAverage[] {
  const filtered = studentId ? evals.filter(e => e.studentId === studentId) : evals;
  if (!filtered.length) {
    return SCORE_CATEGORIES.map(c => ({ label: c.label, avg: 0 }));
  }

  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};

  filtered.forEach(ev => {
    Object.entries(ev.scores).forEach(([k, v]) => {
      sums[k] = (sums[k] || 0) + (typeof v === 'number' ? v : 0);
      counts[k] = (counts[k] || 0) + 1;
    });
  });

  return SCORE_CATEGORIES.map(c => {
    const avg = counts[c.key] ? sums[c.key] / counts[c.key] : 0;
    return { label: c.label, avg: Math.round(avg * 10) / 10 };
  });
}

export function computeOverallSeries(evals: SessionEvaluation[], studentId?: string) {
  const filtered = studentId ? evals.filter(e => e.studentId === studentId) : evals;
  const series = filtered
    .map(ev => ({
      date: startOfDay(parseISO(ev.date)).toISOString(),
      rating: ev.overallRating,
      id: ev.id,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const ratings = series.map(s => s.rating);
  const movingAvg = ratings.map((_, i, arr) => {
    const win = arr.slice(Math.max(0, i - 2), i + 1);
    return Math.round((win.reduce((a, b) => a + b, 0) / win.length) * 10) / 10;
  });

  return { series, movingAvg };
}

export function computeTopicDateCounts(
  evals: SessionEvaluation[],
  topicsField: 'teachingTopics' | 'conditionsSeen' = 'teachingTopics',
  studentId?: string,
) {
  const filtered = studentId ? evals.filter(e => e.studentId === studentId) : evals;
  const map: Record<string, number> = {};

  filtered.forEach(ev => {
    const date = formatISO(startOfDay(parseISO(ev.date)), { representation: 'date' });
    let count = 0;
    if (topicsField === 'teachingTopics') {
      // teachingTopics is TeachingTopic[] — sum topics arrays per category
      const arr = ev.teachingTopics;
      count = Array.isArray(arr) ? arr.reduce((s, t) => s + t.topics.length, 0) : 0;
    } else {
      // conditionsSeen is string[]
      const arr = ev.conditionsSeen;
      count = Array.isArray(arr) ? arr.length : 0;
    }
    map[date] = (map[date] || 0) + count;
  });

  const endDate = new Date();
  const startDate = subYears(endDate, 1);

  return Object.entries(map)
    .filter(([date]) => {
      const d = parseISO(date);
      return d >= startDate && d <= endDate;
    })
    .map(([date, count]) => ({ date, count }));
}
