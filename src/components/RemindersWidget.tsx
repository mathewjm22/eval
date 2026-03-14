import React, { useMemo } from 'react';
import { useAppData } from '../context';
import { getRemindersForStudent } from '../utils/reminders';
import { useTheme } from '../theme';

interface RemindersWidgetProps {
  studentId?: string;
}

export function RemindersWidget({ studentId }: RemindersWidgetProps) {
  const { data } = useAppData();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const remindersData = useMemo(() => {
    let targetStudents = data.students;
    if (studentId) {
      targetStudents = data.students.filter(s => s.id === studentId);
    }

    const items: { studentName: string; studentId: string; reminders: ReturnType<typeof getRemindersForStudent> }[] = [];

    targetStudents.forEach(student => {
      const studentEvals = data.evaluations.filter(e => e.studentId === student.id && !e.isDraft);
      const studentReminders = getRemindersForStudent(studentEvals);
      if (studentReminders.length > 0) {
        items.push({
          studentName: student.name,
          studentId: student.id,
          reminders: studentReminders,
        });
      }
    });

    return items;
  }, [data.students, data.evaluations, studentId]);

  if (remindersData.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-2xl p-4 space-y-3 relative overflow-hidden"
      style={isDark ? {
        background: 'rgba(18,18,31,0.85)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      } : {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
      }}
    >
      {isDark && (
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #ff2d78, #ffa502)' }} />
      )}
      <div className="flex items-center gap-2">
        <span className="text-lg">💡</span>
        <h3 className="text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#0f172a' }}>
          Recommended Focus Areas
        </h3>
      </div>

      <div className="space-y-4">
        {remindersData.map(group => (
          <div key={group.studentId} className="space-y-2">
            {!studentId && (
              <h4 className="text-xs font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>
                {group.studentName}
              </h4>
            )}
            {group.reminders.map((rem, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border text-sm"
                style={isDark ? {
                  background: rem.urgency === 'high' ? 'rgba(255,45,120,0.06)' : 'rgba(255,255,255,0.03)',
                  borderColor: rem.urgency === 'high' ? 'rgba(255,45,120,0.3)' : 'rgba(255,255,255,0.1)',
                } : {
                  background: rem.urgency === 'high' ? '#fff1f2' : '#f8fafc',
                  borderColor: rem.urgency === 'high' ? '#fecdd3' : '#e2e8f0',
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-base">
                    {rem.type === 'competency' ? '🎯' : '🎯'}
                  </span>
                  <div>
                    <p className="font-semibold" style={{ color: isDark ? (rem.urgency === 'high' ? '#ff4757' : '#00d4ff') : (rem.urgency === 'high' ? '#be123c' : '#0369a1') }}>
                      {rem.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
                      {rem.reason}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
