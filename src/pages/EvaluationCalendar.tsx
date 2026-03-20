import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context';
import { AdHocTeaching } from '../types';
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

function evalHasRedFlag(ev: SessionEvaluation): boolean {
  const rf = ev.redFlagBenchmarks;
  if (!rf) return false;
  return Object.values(rf).some(v => v && v.status === 'redFlag');
}

export function EvaluationCalendar() {
  const { data } = useAppData();
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const nonDraftEvals = data.evaluations.filter(e => !e.isDraft);
    if (nonDraftEvals.length > 0) {
      const latest = [...nonDraftEvals].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      return new Date(latest.date);
    }
    return new Date();
  });

  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, (SessionEvaluation | AdHocTeaching)[]>();
    for (const ev of data.evaluations.filter(e => !e.isDraft)) {
      const iso = ev.date;
      if (!map.has(iso)) map.set(iso, []);
      map.get(iso)!.push(ev);
    }
    for (const th of data.teachings || []) {
      const iso = th.date; // It's strictly "YYYY-MM-DD" natively now.
      if (!map.has(iso)) map.set(iso, []);
      map.get(iso)!.push(th);
    }
    return map;
  }, [data.evaluations, data.teachings]);

  const days: CalendarDay[] = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const month = start.getMonth();
    const year = start.getFullYear();

    const firstWeekday = start.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid: CalendarDay[] = [];

    // Leading days (previous month)
    for (let i = 0; i < firstWeekday; i++) {
      const d = new Date(year, month, i - firstWeekday + 1);
      grid.push({ date: d, iso: formatISO(d), inCurrentMonth: false });
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      grid.push({ date: d, iso: formatISO(d), inCurrentMonth: true });
    }

    // Trailing days to make 6 weeks
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

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [currentMonth]
  );

  const selectedItems =
    selectedDateIso && itemsByDate.get(selectedDateIso)
      ? itemsByDate.get(selectedDateIso)!
      : [];

  const selectedPhases = new Set(
    selectedItems
      .filter((item): item is SessionEvaluation => 'sessionType' in item)
      .map(ev => ev.phase)
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
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl border border-slate-200 dark:border-white/10 p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10"
          >
            Next →
          </button>
        </div>
        <div className="text-lg font-semibold text-slate-800">{monthLabel}</div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl border border-slate-200 dark:border-white/10 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-sm">
          {days.map(day => {
            const items = itemsByDate.get(day.iso) || [];
            const hasItems = items.length > 0;
            const hasEvals = items.some(i => 'sessionType' in i);
            const hasTeachings = items.some(i => !('sessionType' in i));
            const hasRedFlag = items.some(i => 'sessionType' in i && evalHasRedFlag(i as SessionEvaluation));
            const isToday = formatISO(new Date()) === day.iso;
            const isSelected = selectedDateIso === day.iso;

            let baseClasses =
              'h-16 rounded-xl flex flex-col items-center justify-between px-1 py-1 cursor-pointer transition-all border ';
            if (!day.inCurrentMonth) {
              baseClasses += 'bg-slate-50 dark:bg-black/20 text-slate-300 dark:text-gray-600 border-slate-100 dark:border-white/5';
            } else {
              baseClasses += 'bg-slate-900 dark:bg-[#1a1f2e] text-slate-50 border-slate-700 dark:border-white/10';
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
                  <span className="font-semibold">{day.date.getDate()}</span>
                  {isToday && (
                    <span className="text-[10px] text-sky-300 font-medium">
                      Today
                    </span>
                  )}
                </div>

                {/* Evaluation indicator */}
                <div className="flex-1 flex items-center justify-center">
                  {hasItems && (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span className={`text-[10px] ${countColor}`}>
                        {items.length} item{items.length !== 1 ? 's' : ''}
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
        <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl border border-slate-200 dark:border-white/10 p-4 shadow-sm space-y-3">
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
              {selectedPhases.has('early') && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  Early
                </span>
              )}
              {selectedPhases.has('middle') && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  Middle
                </span>
              )}
              {selectedPhases.has('final') && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Final
                </span>
              )}
              <button
                type="button"
                onClick={() => setSelectedDateIso(null)}
                className="text-xs text-slate-500 hover:text-slate-700 ml-1"
              >
                Clear
              </button>
            </div>
          </div>

          {selectedItems.length === 0 ? (
            <p className="text-sm text-slate-500">
              No records found on this date.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedItems
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                )
                .map(item => {
                  const isTeaching = !('sessionType' in item);

                  if (isTeaching) {
                    const th = item as AdHocTeaching;
                    const studentNames = th.studentIds
                      .map(id => data.students.find(s => s.id === id)?.name)
                      .filter(Boolean)
                      .join(', ');
                    const topicsCount = th.teachingTopics.reduce((acc, cat) => acc + cat.topics.length, 0);

                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-teaching-modal', { detail: { teachingId: th.id } }))}
                        className="w-full text-left rounded-xl px-3 py-2.5 flex items-center justify-between gap-3 transition-colors border bg-slate-900 dark:bg-black/20 border-slate-700 dark:border-white/10 hover:border-blue-400 hover:bg-slate-800 dark:hover:bg-white/5"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-slate-50 dark:text-white">
                            📚 Teaching Session
                          </span>
                          <span className="text-[11px] text-slate-300 dark:text-gray-400">
                            {studentNames || 'No students'} • {topicsCount} topics
                          </span>
                        </div>
                      </button>
                    );
                  }

                  const ev = item as SessionEvaluation;
                  const student =
                    data.students.find(s => s.id === ev.studentId)?.name ||
                    'Unknown student';
                  const phaseConf = PHASE_CONFIG[ev.phase];
                  const hasRedFlag = evalHasRedFlag(ev);

                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => navigate(`/evaluations/${ev.id}`)}
                      className={`w-full text-left rounded-xl px-3 py-2.5 flex items-center justify-between gap-3 transition-colors border ${
                        hasRedFlag
                          ? 'bg-rose-900 border-rose-700 hover:border-rose-400 hover:bg-rose-800'
                          : 'bg-slate-900 dark:bg-black/20 border-slate-700 dark:border-white/10 hover:border-indigo-400 hover:bg-slate-800 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-slate-50 dark:text-white">
                          {student}
                        </span>
                        <span className="text-[11px] text-slate-300 dark:text-gray-400">
                          {ev.sessionType} • {ev.patientEncounters} patients
                        </span>
                        {hasRedFlag && (
                          <span className="text-[10px] text-rose-200 font-medium">
                            ⚠️ Red-flag concerns documented
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${phaseConf.bgColor} ${phaseConf.color} border ${phaseConf.borderColor}`}
                        >
                          {phaseConf.label}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            hasRedFlag
                              ? 'text-rose-300'
                              : ev.overallRating >= 4
                              ? 'text-emerald-300'
                              : ev.overallRating >= 3
                              ? 'text-amber-300'
                              : 'text-rose-300'
                          }`}
                        >
                          {ev.overallRating}/5 ⭐
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
