import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppData } from '../context';
import {
  SessionEvaluation,
  SCORE_CATEGORIES,
  SESSION_TYPES,
  PHASE_CONFIG,
  Phase,
  DEFAULT_SCORES,
  PREPOPULATED_CONDITIONS,
  TEACHING_TOPIC_CATEGORIES,
  CLINICAL_OBJECTIVES,
  CLINICAL_OBJECTIVES_V2,
  expectationId,
  RED_FLAG_COMPETENCIES,
  RedFlagPlan,
  RedFlagStatus,
  RED_FLAG_DETAILS,
} from '../types';
import { ScoreInput } from '../components/ScoreInput';
import { IM_BENCHMARKS, BenchmarkPhase } from '../imBenchmarks';

const STEPS = [
  'Session Details',
  'Diagnoses & Conditions',
  'Teaching Topics',
  'Clinical Objectives',
  'Clinical Scores',
  'Feedback & Notes',
  'Review & Submit',
];
const LAST_STEP = STEPS.length - 1;

export function EvaluateSession() {
  const { data, addEvaluation, updateEvaluation } = useAppData();
  const navigate = useNavigate();
  const { id } = useParams();

  const existingEval = id ? data.evaluations.find(e => e.id === id) : null;

  const [form, setForm] = useState<SessionEvaluation>(() => {
    if (existingEval) {
      return {
        ...existingEval,
        scores: { ...existingEval.scores },
        redFlagBenchmarks: existingEval.redFlagBenchmarks || {
          medicalKnowledge: { status: 'none', plan: '' },
          clinicalReasoning: { status: 'none', plan: '' },
          communicationEmotional: { status: 'none', plan: '' },
          interpersonalCommunication: { status: 'none', plan: '' },
        },
        benchmarkAssessments: existingEval.benchmarkAssessments || {},
      };
    }
    return {
      id: uuidv4(),
      studentId: data.students[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      weekNumber: 1,
      phase: 'early' as Phase,
      sessionType: SESSION_TYPES[0],
      patientEncounters: 0,
      scores: { ...DEFAULT_SCORES },
      strengths: '',
      areasForImprovement: '',
      actionPlan: '',
      preceptorNotes: '',
      overallRating: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conditionsSeen: [],
      customConditions: [],
      teachingTopics: [],
      objectivesAchieved: [],
      redFlagBenchmarks: {
        medicalKnowledge: { status: 'none', plan: '' },
        clinicalReasoning: { status: 'none', plan: '' },
        communicationEmotional: { status: 'none', plan: '' },
        interpersonalCommunication: { status: 'none', plan: '' },
      },
      benchmarkAssessments: {},
    };
  });

  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [customConditionInput, setCustomConditionInput] = useState('');
  const [customTopicInputs, setCustomTopicInputs] = useState<Record<string, string>>({});

  // Auto-determine phase from week number
  const autoPhase = useMemo((): Phase => {
    if (form.weekNumber <= 12) return 'early';
    if (form.weekNumber <= 30) return 'middle';
    return 'final';
  }, [form.weekNumber]);

  const effectivePhase: Phase = form.phaseOverride || autoPhase;
  const isMidOrFinal = effectivePhase === 'middle' || effectivePhase === 'final';

  const updateForm = <K extends keyof SessionEvaluation>(key: K, value: SessionEvaluation[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateScore = (key: keyof typeof form.scores, value: number) => {
    setForm(prev => ({ ...prev, scores: { ...prev.scores, [key]: value } }));
  };

  const updateRedFlagBenchmark = (
    key: keyof NonNullable<SessionEvaluation['redFlagBenchmarks']>,
    patch: Partial<RedFlagPlan>,
  ) => {
    setForm(prev => ({
      ...prev,
      redFlagBenchmarks: {
        ...(prev.redFlagBenchmarks || {}),
        [key]: {
          status: 'none',
          plan: '',
          ...(prev.redFlagBenchmarks?.[key] || {}),
          ...patch,
        },
      },
    }));
  };

  // Benchmark window based on evaluation date:
  // Feb (1)–Apr (3) = midYear, May (4)–Jul (6) = endOfYear
  const evalDate = new Date(form.date || new Date());
  const month = evalDate.getMonth(); // 0 = Jan
  let benchmarkPhase: BenchmarkPhase | null = null;
  if (month >= 1 && month <= 3) {
    benchmarkPhase = 'midYear';
  } else if (month >= 4 && month <= 6) {
    benchmarkPhase = 'endOfYear';
  }

  const setBenchmarkStatus = (
    id: string,
    status: 'met' | 'notMet' | 'notAssessed',
  ) => {
    setForm(prev => ({
      ...prev,
      benchmarkAssessments: {
        ...(prev.benchmarkAssessments || {}),
        [id]: { status },
      },
    }));
  };

  const avgScore = useMemo(() => {
    const vals = Object.values(form.scores) as number[];
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [form.scores]);

  // Previously seen conditions for the selected student
  const previousConditions = useMemo(() => {
    return new Set(
      data.evaluations
        .filter(e => e.studentId === form.studentId && e.id !== form.id)
        .flatMap(e => [...(e.conditionsSeen || []), ...(e.customConditions || [])]),
    );
  }, [data.evaluations, form.studentId, form.id]);

  // Previously achieved objectives for the selected student
  const previousObjectives = useMemo(() => {
    return new Set(
      data.evaluations
        .filter(e => e.studentId === form.studentId && e.id !== form.id)
        .flatMap(e => e.objectivesAchieved || []),
    );
  }, [data.evaluations, form.studentId, form.id]);

  const toggleCondition = (condition: string) => {
    const current = form.conditionsSeen || [];
    if (current.includes(condition)) {
      updateForm('conditionsSeen', current.filter(c => c !== condition));
    } else {
      updateForm('conditionsSeen', [...current, condition]);
    }
  };

  const addCustomCondition = () => {
    const val = customConditionInput.trim();
    if (!val) return;
    const current = form.customConditions || [];
    if (!current.includes(val)) {
      updateForm('customConditions', [...current, val]);
    }
    setCustomConditionInput('');
  };

  const removeCustomCondition = (cond: string) => {
    updateForm('customConditions', (form.customConditions || []).filter(c => c !== cond));
  };

  const toggleTopic = (category: string, topic: string) => {
    const current = form.teachingTopics || [];
    const existing = current.find(t => t.category === category);
    if (existing) {
      const newTopics = existing.topics.includes(topic)
        ? existing.topics.filter(t => t !== topic)
        : [...existing.topics, topic];
      const updated = current.map(t =>
        t.category === category ? { ...t, topics: newTopics } : t,
      );
      updateForm('teachingTopics', updated.filter(t => t.topics.length > 0));
    } else {
      updateForm('teachingTopics', [...current, { category, topics: [topic] }]);
    }
  };

  const getTopicsForCategory = (category: string) => {
    return (form.teachingTopics || []).find(t => t.category === category)?.topics || [];
  };

  const addCustomTopic = (category: string) => {
    const val = (customTopicInputs[category] || '').trim();
    if (!val) return;
    toggleTopic(category, val);
    setCustomTopicInputs(prev => ({ ...prev, [category]: '' }));
  };

  const toggleObjective = (id: string) => {
    const current = form.objectivesAchieved || [];
    if (current.includes(id)) {
      updateForm('objectivesAchieved', current.filter(i => i !== id));
    } else {
      updateForm('objectivesAchieved', [...current, id]);
    }
  };

  const handleSave = () => {
    const updated = {
      ...form,
      phase: effectivePhase,
      updatedAt: new Date().toISOString(),
    };
    if (existingEval) {
      updateEvaluation(updated);
    } else {
      addEvaluation(updated);
    }
    setSaved(true);
    setTimeout(() => navigate('/evaluations'), 1500);
  };

  if (data.students.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border-2 border-dashed border-amber-200 p-12 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-slate-700">No Students Added</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            You need to add at least one student before creating an evaluation.
          </p>
          <button
            onClick={() => navigate('/students')}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            Go to Students
          </button>
        </div>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-emerald-200 p-12 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-emerald-700">Evaluation Saved!</h3>
          <p className="text-sm text-slate-400 mt-2">Redirecting to evaluations list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* HEADER, steps, steps 0–5 ... (unchanged) */}

      {/* ... keep all of your steps 0–5 exactly as in your last working version ... */}

      {/* For brevity I'm not re-pasting steps 0–5, since your version there is fine.
          The only new logic is the benchmarks panel in step 6 below, which uses
          benchmarkPhase and setBenchmarkStatus. Make sure you keep the rest of the
          file identical to your last known-good EvaluateSession for steps 0–5. */}

      {/* Step 6: Review */}
      {step === 6 && (
        <div className="space-y-4">
          {/* existing summary cards ... */}

          {/* Benchmarks panel */}
          {benchmarkPhase && (
            <div className="mt-6 rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-100">
                  Internal Medicine Benchmarks –{' '}
                  {benchmarkPhase === 'midYear'
                    ? 'Mid-Year (Feb–Apr)'
                    : 'End-of-Year (May–Jul)'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  Based on evaluation date ({form.date})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {IM_BENCHMARKS.map(row => {
                  const current =
                    form.benchmarkAssessments?.[row.id]?.status ?? 'notAssessed';
                  const bullets =
                    benchmarkPhase === 'midYear' ? row.midYear : row.endOfYear;

                  return (
                    <div
                      key={row.id}
                      className="bg-slate-950/40 border border-slate-700 rounded-xl p-3 space-y-2"
                    >
                      <p className="font-semibold text-slate-100 text-xs">
                        {row.area}
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                        {bullets.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-slate-400">
                          Assessment:
                        </span>
                        <button
                          type="button"
                          onClick={() => setBenchmarkStatus(row.id, 'met')}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            current === 'met'
                              ? 'bg-emerald-500 text-black border-emerald-400'
                              : 'bg-slate-900 text-emerald-200 border-emerald-600/40'
                          }`}
                        >
                          Met
                        </button>
                        <button
                          type="button"
                          onClick={() => setBenchmarkStatus(row.id, 'notMet')}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            current === 'notMet'
                              ? 'bg-rose-500 text-black border-rose-400'
                              : 'bg-slate-900 text-rose-200 border-rose-600/40'
                          }`}
                        >
                          Not met
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setBenchmarkStatus(row.id, 'notAssessed')
                          }
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            current === 'notAssessed'
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-slate-900 text-slate-300 border-slate-600/40'
                          }`}
                        >
                          Not assessed
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Conditions summary */}
          {((form.conditionsSeen || []).length > 0 ||
            (form.customConditions || []).length > 0) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3">🩺 Conditions Seen</h4>
              <div className="flex flex-wrap gap-2">
                {[...(form.conditionsSeen || []), ...(form.customConditions || [])].map(
                  c => (
                    <span
                      key={c}
                      className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs"
                    >
                      {c}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Teaching topics summary */}
          {(form.teachingTopics || []).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3">📚 Teaching Topics</h4>
              <div className="space-y-2">
                {(form.teachingTopics || []).map(({ category, topics }) => (
                  <div key={category}>
                    <span className="text-xs font-semibold text-slate-500">
                      {category}:{' '}
                    </span>
                    <span className="text-xs text-slate-700">
                      {topics.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Objectives summary */}
          {(form.objectivesAchieved || []).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3">
                🎯 Clinical Objectives Achieved
              </h4>
              <div className="space-y-2">
                {CLINICAL_OBJECTIVES_V2.map(obj => {
                  const achieved = (form.objectivesAchieved || []).filter(id =>
                    typeof id === 'string' &&
                    (id.startsWith(`${obj.id}-middle-`) ||
                      id.startsWith(`${obj.id}-final-`)),
                  );
                  if (achieved.length === 0) return null;
                  return (
                    <div key={obj.id}>
                      <p className="text-xs font-bold text-indigo-600 mb-1">
                        Outcome {obj.id}: {obj.outcome}
                      </p>
                      {achieved.map(id => {
                        const parts =
                          typeof id === 'string' ? id.split('-') : [];
                        const phase = parts[1] as 'middle' | 'final' | undefined;
                        const letter = parts[2];
                        const idx = letter
                          ? letter.charCodeAt(0) - 97
                          : -1;
                        const text =
                          phase && idx >= 0
                            ? obj.expectations[phase]?.[idx] || id
                            : String(id);
                        return (
                          <div
                            key={String(id)}
                            className="flex items-start gap-2 text-sm ml-3"
                          >
                            <span className="text-emerald-500 font-bold flex-shrink-0">
                              ✓
                            </span>
                            <span className="text-slate-600">
                              <span
                                className={`text-xs font-medium mr-1 ${
                                  phase === 'middle'
                                    ? 'text-amber-600'
                                    : 'text-emerald-600'
                                }`}
                              >
                                [{phase}]
                              </span>
                              {letter}. {text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {/* Backward compat: show legacy numeric objectives */}
                {(form.objectivesAchieved || [])
                  .filter(id => typeof id === 'number')
                  .map(i => (
                    <div
                      key={String(i)}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-emerald-500 font-bold flex-shrink-0">
                        ✓
                      </span>
                      <span className="text-slate-600">
                        <span className="font-medium text-slate-700">
                          EPA {Number(i) + 1}:
                        </span>{' '}
                        {CLINICAL_OBJECTIVES[Number(i)]}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-3">Competency Scores</h4>
            <div className="grid grid-cols-2 gap-3">
              {SCORE_CATEGORIES.map(cat => (
                <div
                  key={cat.key}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-slate-600">{cat.label}</span>
                  <span
                    className={`font-bold ${
                      form.scores[cat.key] >= 4
                        ? 'text-emerald-600'
                        : form.scores[cat.key] >= 3
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {form.scores[cat.key]}/5
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="font-medium text-slate-700">Average</span>
              <span className="text-xl font-bold text-indigo-600">
                {avgScore}/5
              </span>
            </div>
          </div>

          {(form.strengths ||
            form.areasForImprovement ||
            form.actionPlan ||
            form.preceptorNotes) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              {form.strengths && (
                <div>
                  <h4 className="font-semibold text-emerald-700 text-sm">
                    💪 Strengths
                  </h4>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">
                    {form.strengths}
                  </p>
                </div>
              )}
              {form.areasForImprovement && (
                <div>
                  <h4 className="font-semibold text-amber-700 text-sm">
                    🎯 Areas for Improvement
                  </h4>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">
                    {form.areasForImprovement}
                  </p>
                </div>
              )}
              {form.actionPlan && (
                <div>
                  <h4 className="font-semibold text-blue-700 text-sm">
                    📋 Action Plan
                  </h4>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">
                    {form.actionPlan}
                  </p>
                </div>
              )}
              {form.preceptorNotes && (
                <div>
                  <h4 className="font-semibold text-slate-700 text-sm">
                    📝 Preceptor Notes
                  </h4>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">
                    {form.preceptorNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        {step < LAST_STEP ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
          >
            ✅ {existingEval ? 'Update Evaluation' : 'Save Evaluation'}
          </button>
        )}
      </div>
    </div>
  );
}
