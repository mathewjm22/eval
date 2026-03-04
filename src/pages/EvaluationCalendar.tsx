import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context';
import { PHASE_CONFIG, SessionEvaluation } from '../types';

interface CalendarDay {
  date: Date;
  iso: string; // YYYY-MM-DD
  inCurrentMonth: boolean;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper: does this evaluation have any red-flag benchmarks?
function evalHasRedFlag(ev: SessionEvaluation): boolean {
  const rf = ev.redFlagBenchmarks;
  if (!rf) return false;
  return Object.values(rf).some(v => v && v.status === 'redFlag');
}

export function EvaluationCalendar() {
  const { data } = useAppData();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    // Default to month of most recent evaluation, or today
    if (data.evaluations.length > 0) {
      const latest = [...data.evaluations].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0];
      return new Date(latest.date);
    }
    return new Date();
  });
  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null);

  // Map date -> list of evaluations
  const evaluationsByDate = useMemo(() => {
    const map = new Map<string, SessionEvaluation[]>();
    for (const ev of data.evaluations) {
      const iso = ev.date;
      if (!map.has(iso)) map.set(iso, []);
      map.get(iso)!.push(ev);
    }
    return map;
  }, [data.evaluations]);

  // Build calendar grid for currentMonth
  const days: CalendarDay[] = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const month = start.getMonth();
    const year = start.getFullYear();

    const firstWeekday = start.getDay(); // 0-6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid: CalendarDay[] = [];

    // Days from previous month to fill first week
    for (let i = 0; i < firstWeekday; i++) {
      const d = new Date(year, month, i - firstWeekday + 1);
      grid.push({
        date: d,
        iso: formatISO(d),
        inCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      grid.push({
        date: d,
        iso: formatISO(d),
        inCurrentMonth: true,
      });
    }

    // Fill remaining cells to complete 6 weeks (6 * 7 = 42)
    while (grid.length < 42) {
      const last = grid[grid.length - 1].date;
      const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
      grid.push({
        date: d,
        iso: formatISO(d),
        inCurrentMonth: d.getMonth() === month,
      });
    }

    return grid;
  }, [currentMonth]);

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  }, [currentMonth]);

  const selectedEvals =
    selectedDateIso && evaluationsByDate.get(selectedDateIso)
      ? evaluationsByDate.get(selectedDateIso)!
      : [];

  const selectedPhases = new Set(
    selectedEvals.map(ev => ev.phase),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">📅 Evaluation Calendar</h2>
          <p className="text-sm text-slate-400 mt-1">
            Click a highlighted date to view and open evaluations from that day.
          </p>
        </div>
      </div>

      {/* Month controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-50 text-slate-600 hover:bg-slate-100"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Next →
          </button>
        </div>
        <div className="text-lg font-semibold text-slate-800">{monthLabel}</div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-sm">
          {days.map(day => {
            const evals = evaluationsByDate.get(day.iso) || [];
            const hasEvals = evals.length > 0;
            const hasRedFlag = evals.some(ev => evalHasRedFlag(ev));
            const isToday = formatISO(new Date()) === day.iso;
            const isSelected = selectedDateIso === day.iso;

            let baseClasses =
              'h-16 rounded-xl flex flex-col items-center justify-between px-1 py-1 cursor-pointer transition-all border ';
            if (!day.inCurrentMonth) {
              baseClasses += 'bg-slate-50 text-slate-300 border-slate-100';
            } else {
              baseClasses += 'bg-slate-900 text-slate-50 border-slate-700';
            }

            if (hasEvals && day.inCurrentMonth) {
              baseClasses += ' shadow-sm ';
              baseClasses += hasRedFlag
                ? 'shadow-rose-500/40'
                : 'shadow-emerald-500/30';
            }

            if (isSelected) {
              baseClasses += ' ring-2 ring-lime-400';
            } else if (isToday && day.inCurrentMonth) {
              baseClasses += ' ring-1 ring-sky-400';
            }

            const dotColor = hasRedFlag ? 'bg-rose-400' : 'bg-emerald-400';
            const countColor = hasRedFlag ? 'text-rose-100' : 'text-emerald-100';

            return (
              <button
                key={day.iso}
                type="button"
                className={baseClasses}
                onClick={() =>
                  hasEvals ? setSelectedDateIso(day.iso) : setSelectedDateIso(null)
                }
              >
                <div className="w-full flex justify-between items-center text-[11px]">
                  <span className="font-semibold">
                    {day.date.getDate()}
                  </span>
                  {isToday && (
                    <span className="text-[10px] text-sky-300 font-medium">
                      Today
                    </span>
                  )}
                </div>

                {/* Evaluation indicator */}
                <div className="flex-1 flex items-center justify-center">
                  {hasEvals && (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span className={`text-[10px] ${countColor}`}>
                        {evals.length} eval{evals.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Evaluations on this day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>One or more evaluations with red-flag concerns</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md border border-lime-400" />
            <span>Selected day</span>
          </div>
        </div>
      </div>

      {/* Selected date details */}
      {selectedDateIso && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                Evaluations on {selectedDateIso}
              </h3>
              <p className="text-xs text-slate-400">
                Click an evaluation to view or edit.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Phase chips */}
              {selectedPhases.has('early') && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  Early
*

