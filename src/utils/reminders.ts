import { SessionEvaluation, SCORE_CATEGORIES, CLINICAL_OBJECTIVES_V2, expectationId } from '../types';

export interface ReminderItem {
  type: 'competency' | 'objective';
  id: string; // The category key or objective expectation ID
  title: string;
  reason: string;
  urgency: 'high' | 'medium';
}

export function getRemindersForStudent(evaluations: SessionEvaluation[]): ReminderItem[] {
  if (!evaluations || evaluations.length === 0) {
    return [];
  }

  const sortedEvals = [...evaluations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const reminders: ReminderItem[] = [];
  const now = new Date();

  // 1. Competencies logic
  SCORE_CATEGORIES.forEach(cat => {
    // Find the most recent evaluation where this category was scored
    const latestEvalForCat = [...sortedEvals].reverse().find(ev => ev.scores && ev.scores[cat.key] !== undefined);

    if (latestEvalForCat) {
      const score = latestEvalForCat.scores[cat.key];
      const evDate = new Date(latestEvalForCat.date);
      // Using UTC dates for accurate diff
      const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      const utcEv = Date.UTC(evDate.getFullYear(), evDate.getMonth(), evDate.getDate());
      const weeksSince = (utcNow - utcEv) / (1000 * 60 * 60 * 24 * 7);

      if (score <= 2 && weeksSince > 3) {
        reminders.push({
          type: 'competency',
          id: cat.key,
          title: cat.label,
          reason: `Scored ${score} on ${latestEvalForCat.date} (over 3 weeks ago).`,
          urgency: 'high'
        });
      }
    }
  });

  // 2. Clinical Objectives logic
  const objectivesAchieved = new Set<string>();
  let lastEvalDateWithObjectives: Date | null = null;

  sortedEvals.forEach(ev => {
    if (ev.objectivesAchieved && ev.objectivesAchieved.length > 0) {
      ev.objectivesAchieved.forEach(objId => {
        objectivesAchieved.add(String(objId));
      });
      lastEvalDateWithObjectives = new Date(ev.date);
    }
  });

  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const getUtcDate = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

  let weeksSinceObjectivesEval = 0;

  if (lastEvalDateWithObjectives) {
    weeksSinceObjectivesEval = (utcNow - getUtcDate(lastEvalDateWithObjectives)) / (1000 * 60 * 60 * 24 * 7);
  } else if (sortedEvals.length > 0) {
    weeksSinceObjectivesEval = (utcNow - getUtcDate(new Date(sortedEvals[0].date))) / (1000 * 60 * 60 * 24 * 7);
  }

  if (weeksSinceObjectivesEval > 3) {
      let unachievedCount = 0;

      for (const obj of CLINICAL_OBJECTIVES_V2) {
          for (const phase of ['middle', 'final']) {
              const expectations = phase === 'middle' ? obj.expectations.middle : obj.expectations.final;
              for (let i = 0; i < expectations.length; i++) {
                  const id = expectationId(obj.id, phase as 'middle' | 'final', i);
                  if (!objectivesAchieved.has(id)) {
                      if (unachievedCount < 3) {
                          reminders.push({
                              type: 'objective',
                              id: id,
                              title: `EPA ${obj.id}: ${obj.outcome}`,
                              reason: `Not evaluated recently. Consider observing: ${expectations[i]}`,
                              urgency: 'medium'
                          });
                          unachievedCount++;
                      } else {
                          break;
                      }
                  }
              }
              if (unachievedCount >= 3) break;
          }
          if (unachievedCount >= 3) break;
      }
  }

  // Sort: high urgency first
  return reminders.sort((a, b) => {
    if (a.urgency === 'high' && b.urgency !== 'high') return -1;
    if (a.urgency !== 'high' && b.urgency === 'high') return 1;
    return 0;
  });
}
