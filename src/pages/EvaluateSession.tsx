import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppData } from '../context';
import { determinePhaseFromDate, calculateWeekNumberFromDate } from '../utils/dateUtils';
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
} from '../types';
import { ScoreInput } from '../components/ScoreInput';
import { getBenchmarkWindowForMonth } from '../benchmarkWindows';
import { IM_BENCHMARKS, BenchmarkPhase } from '../imBenchmarks';
import { RemindersWidget } from '../components/RemindersWidget';

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
      // Ensure redFlagBenchmarks & benchmarkAssessments exist even on older evaluations
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
      weekNumber: calculateWeekNumberFromDate(new Date().toISOString().split('T')[0]),
      phase: determinePhaseFromDate(new Date().toISOString().split('T')[0]) as Phase,
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

  // Effect to automatically calculate phase and weekNumber when date changes
  useEffect(() => {
    if (form.date) {
      const calculatedPhase = determinePhaseFromDate(form.date);
      const calculatedWeek = calculateWeekNumberFromDate(form.date);

      setForm(prev => {
        if (prev.phase !== calculatedPhase || prev.weekNumber !== calculatedWeek) {
          return {
            ...prev,
            phase: calculatedPhase,
            weekNumber: calculatedWeek
          };
        }
        return prev;
      });
    }
  }, [form.date]);

  // Auto-determine phase from date string
  const autoPhase = useMemo((): Phase => {
    return determinePhaseFromDate(form.date);
  }, [form.date]);

  // Effective phase: manual override takes priority over auto
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

  // Benchmark window based on evaluation date (Feb–Apr = mid-year, May–Jul = end-of-year)
  const evalDate = new Date(form.date || new Date());
  const month = evalDate.getMonth(); // 0 = Jan
  const benchmarkPhase = getBenchmarkWindowForMonth(month) as BenchmarkPhase | null;

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
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {existingEval ? '✏️ Edit Evaluation' : '📝 New Session Evaluation'}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {existingEval ? 'Update this evaluation' : 'Record a new clinical session evaluation'}
        </p>
      </div>

      {form.studentId && (
        <div className="mb-6">
          <RemindersWidget studentId={form.studentId} />
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex-shrink-0 py-2 px-2 text-xs font-medium rounded-xl transition-all ${
              step === i
                ? 'bg-indigo-600 text-white shadow-md'
                : step > i
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {/* Step 0: Session Details */}
      {step === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Student *
              </label>
              <select
                value={form.studentId}
                onChange={e => updateForm('studentId', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              >
                {data.students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => updateForm('date', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
              <p className="text-xs mt-1 flex gap-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PHASE_CONFIG[autoPhase].bgColor} ${PHASE_CONFIG[autoPhase].color} border ${PHASE_CONFIG[autoPhase].borderColor}`}
                >
                  Auto: {PHASE_CONFIG[autoPhase].label} ({PHASE_CONFIG[autoPhase].weeks})
                </span>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  Calculated: Week {form.weekNumber}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phase Override
              </label>
              <select
                value={form.phaseOverride || ''}
                onChange={e =>
                  updateForm(
                    'phaseOverride',
                    e.target.value ? (e.target.value as Phase) : undefined,
                  )
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              >
                <option value="">Auto (based on date)</option>
                <option value="early">Early Phase</option>
                <option value="middle">Middle Phase</option>
                <option value="final">Final Phase</option>
              </select>
              {form.phaseOverride && (
                <p className="text-xs mt-1 text-amber-600">
                  ⚠️ Manual override active — using{' '}
                  <strong>{PHASE_CONFIG[form.phaseOverride].label}</strong> instead of
                  auto-detected {PHASE_CONFIG[autoPhase].label}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Session Type
              </label>
              <select
                value={form.sessionType}
                onChange={e => updateForm('sessionType', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              >
                {SESSION_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Patient Encounters
              </label>
              <input
                type="number"
                min={0}
                value={form.patientEncounters}
                onChange={e =>
                  updateForm(
                    'patientEncounters',
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Diagnoses & Conditions */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">🩺 Diagnoses &amp; Conditions Seen</h3>
            <p className="text-sm text-slate-400 mt-1">
              Check all conditions encountered during this session.
            </p>
            {previousConditions.size > 0 && (
              <p className="text-xs text-emerald-600 mt-1">
                ✅ Green indicates previously seen in prior sessions.
              </p>
            )}
          </div>
          {PREPOPULATED_CONDITIONS.map(({ category, conditions }) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-slate-600 mb-2">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {conditions.map(cond => {
                  const checked = (form.conditionsSeen || []).includes(cond);
                  const prev = previousConditions.has(cond);
                  return (
                    <label
                      key={cond}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-all ${
                        checked
                          ? 'bg-indigo-100 border-indigo-400 text-indigo-800 font-medium'
                          : prev
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCondition(cond)}
                        className="w-3.5 h-3.5 accent-indigo-600"
                      />
                      {prev && !checked && (
                        <span className="text-emerald-500">✓</span>
                      )}
                      {cond}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Custom conditions */}
          <div>
            <h4 className="text-sm font-semibold text-slate-600 mb-2">
              Custom Conditions
            </h4>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={customConditionInput}
                onChange={e => setCustomConditionInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomCondition()}
                placeholder="Add a custom condition..."
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
              />
              <button
                type="button"
                onClick={addCustomCondition}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>
            {(form.customConditions || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(form.customConditions || []).map(cond => (
                  <span
                    key={cond}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-100 border border-purple-300 text-purple-800 text-sm"
                  >
                    {cond}
                    <button
                      type="button"
                      onClick={() => removeCustomCondition(cond)}
                      className="text-purple-500 hover:text-purple-700 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Teaching Topics */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">📚 Teaching Topics</h3>
            <p className="text-sm text-slate-400 mt-1">
              Select or add topics taught during this session, organized by body system.
            </p>
          </div>
          {TEACHING_TOPIC_CATEGORIES.map(({ category, topics }) => {
            const selectedTopics = getTopicsForCategory(category);
            const allTopics = Array.from(new Set([...topics, ...selectedTopics]));

            return (
              <div
                key={category}
                className="border border-slate-100 rounded-xl p-4"
              >
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  {category}
                  {selectedTopics.length > 0 && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {selectedTopics.length} selected
                    </span>
                  )}
                </h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {allTopics.map(topic => {
                    const checked = selectedTopics.includes(topic);
                    return (
                      <label
                        key={topic}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs transition-all ${
                          checked
                            ? 'bg-indigo-100 border-indigo-400 text-indigo-800 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTopic(category, topic)}
                          className="w-3 h-3 accent-indigo-600"
                        />
                        {topic}
                      </label>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={customTopicInputs[category] || ''}
                    onChange={e =>
                      setCustomTopicInputs(prev => ({
                        ...prev,
                        [category]: e.target.value,
                      }))
                    }
                    onKeyDown={e => e.key === 'Enter' && addCustomTopic(category)}
                    placeholder="Add custom topic..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomTopic(category)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 3: Clinical Objectives */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              🎯 Clinical Objectives (EPAs)
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Check which expectations the student demonstrated during this session.
              Showing{' '}
              <span
                className={`font-semibold ${PHASE_CONFIG[effectivePhase].color}`}
              >
                {PHASE_CONFIG[effectivePhase].label}
              </span>{' '}
              expectations.
            </p>
            {previousObjectives.size > 0 && (
              <p className="text-xs text-emerald-600 mt-1">
                ✅ Green border indicates expectations achieved in prior sessions.
              </p>
            )}
          </div>

          {effectivePhase === 'early' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              Phase-specific expectations begin at the Middle Phase. Continue
              building foundational skills during Early Phase.
            </div>
          ) : (
            <div className="space-y-5">
              {CLINICAL_OBJECTIVES_V2.map(obj => {
                const phaseExpectations =
                  effectivePhase === 'middle'
                    ? obj.expectations.middle
                    : obj.expectations.final;
                return (
                  <div
                    key={obj.id}
                    className="border border-slate-200 rounded-xl overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <span className="text-xs font-bold text-indigo-600 mr-2">
                        Outcome {obj.id}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {obj.outcome}
                      </span>
                    </div>
                    <div className="p-3 space-y-2">
                      {phaseExpectations.map((exp, ei) => {
                        const id = expectationId(
                          obj.id,
                          effectivePhase === 'middle' ? 'middle' : 'final',
                          ei,
                        );
                        const checked =
                          (form.objectivesAchieved || []).includes(id);
                        const prev = previousObjectives.has(id);
                        return (
                          <label
                            key={id}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              checked
                                ? 'bg-indigo-50 border-indigo-400'
                                : prev
                                ? 'bg-emerald-50 border-emerald-300'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleObjective(id)}
                              className="mt-0.5 w-4 h-4 accent-indigo-600 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span
                                className={`text-xs font-bold mr-1 ${
                                  checked
                                    ? 'text-indigo-600'
                                    : prev
                                    ? 'text-emerald-600'
                                    : 'text-slate-400'
                                }`}
                              >
                                {String.fromCharCode(97 + ei)}.
                              </span>
                              <span
                                className={`text-sm ${
                                  checked
                                    ? 'text-indigo-800 font-medium'
                                    : prev
                                    ? 'text-emerald-700'
                                    : 'text-slate-600'
                                }`}
                              >
                                {exp}
                              </span>
                              {prev && !checked && (
                                <span className="ml-2 text-xs text-emerald-500">
                                  ✓ Previously achieved
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-sm text-indigo-700">
            {(form.objectivesAchieved || []).length} expectation
            {(form.objectivesAchieved || []).length !== 1 ? 's' : ''} marked for
            this session
          </div>
        </div>
      )}

      {/* Step 4: Clinical Scores */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
            <p className="text-sm text-indigo-700 font-medium">
              Rate each competency from 1 (Below Expectations) to 5 (Outstanding)
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCORE_CATEGORIES.map(cat => (
              <ScoreInput
                key={cat.key}
                label={cat.label}
                description={cat.description}
                value={form.scores[cat.key as keyof typeof form.scores]}
                onChange={v =>
                  updateScore(cat.key as keyof typeof form.scores, v)
                }
                rubrics={cat.rubrics}
              />
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-sm text-slate-500">Category Average</p>
            <p className="text-3xl font-bold text-indigo-600">{avgScore}</p>
          </div>
        </div>
      )}

      {/* Step 5: Feedback & Internal Medicine Benchmarks */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              💪 Strengths
            </label>
            <textarea
              value={form.strengths}
              onChange={e => updateForm('strengths', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
              placeholder="What did the student do well today?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              🎯 Areas for Improvement
            </label>
            <textarea
              value={form.areasForImprovement}
              onChange={e => updateForm('areasForImprovement', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
              placeholder="What areas need more work?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              📋 Action Plan / Goals
            </label>
            <textarea
              value={form.actionPlan}
              onChange={e => updateForm('actionPlan', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
              placeholder="Specific goals or tasks for next session..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              📝 Preceptor Notes (private)
            </label>
            <textarea
              value={form.preceptorNotes}
              onChange={e => updateForm('preceptorNotes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
              placeholder="Additional notes for your records..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ⭐ Overall Session Rating
            </label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => updateForm('overallRating', r)}
                  className={`flex-1 py-3 rounded-xl text-lg font-bold transition-all border-2 ${
                    form.overallRating === r
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {'⭐'.repeat(r)}
                </button>
              ))}
            </div>
          </div>

          {/* Internal Medicine Red-Flag Benchmarks (mid/final only) */}
          {isMidOrFinal && (
            <div className="mt-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-rose-800 text-sm">
                    Internal Medicine Benchmarks – Red Flags (Mid-Year / End-of-Rotation)
                  </h3>
                  <p className="text-xs text-rose-700 mt-1">
                    For each competency, indicate whether you have concerns based on the
                    Internal Medicine benchmark table. Use this section to guide mid-year
                    and end-of-rotation reviews.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RED_FLAG_COMPETENCIES.map(comp => {
                  const value =
                    form.redFlagBenchmarks?.[comp.key] || ({
                      status: 'none',
                      plan: '',
                    } as RedFlagPlan);

                  return (
                    <div
                      key={comp.key}
                      className="bg-white rounded-xl border border-rose-100 p-3 space-y-2"
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {comp.label}
                      </p>

                      {/* Status buttons */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {[
                          { id: 'none', label: 'No Concerns' },
                          { id: 'redFlag', label: 'Red Flags Observed' },
                          { id: 'unsure', label: 'Unsure' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              updateRedFlagBenchmark(comp.key, {
                                status: opt.id as RedFlagStatus,
                              })
                            }
                            className={`px-2.5 py-1 rounded-full border text-xs font-medium transition ${
                              value.status === opt.id
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Plan textarea for redFlag / unsure */}
                      {(value.status === 'redFlag' ||
                        value.status === 'unsure') && (
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-600">
                            Planned follow-up / actions
                            <span className="text-slate-400 font-normal">
                              {' '}
                              (optional)
                            </span>
                          </label>
                          <textarea
                            className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-400/60 focus:border-rose-400 resize-vertical min-h-[60px]"
                            placeholder="E.g., schedule meeting with student, discuss with LIC director, increase observation, etc."
                            value={value.plan}
                            onChange={e =>
                              updateRedFlagBenchmark(comp.key, {
                                plan: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 6: Review */}
      {step === 6 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-4">
              📋 Evaluation Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Student</p>
                <p className="font-semibold text-slate-800">
                  {data.students.find(s => s.id === form.studentId)?.name || '-'}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Date</p>
                <p className="font-semibold text-slate-800">{form.date}</p>
              </div>
              <div>
                <p className="text-slate-400">Week / Phase</p>
                <p className="font-semibold text-slate-800">
                  Week {form.weekNumber} •{' '}
                  <span className={PHASE_CONFIG[effectivePhase].color}>
                    {PHASE_CONFIG[effectivePhase].label}
                  </span>
                  {form.phaseOverride && (
                    <span className="ml-1 text-xs text-amber-600">(manual)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Session Type</p>
                <p className="font-semibold text-slate-800">
                  {form.sessionType}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Patient Encounters</p>
                <p className="font-semibold text-slate-800">
                  {form.patientEncounters}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Overall Rating</p>
                <p className="font-semibold text-indigo-600 text-lg">
                  {form.overallRating}/5 ⭐
                </p>
              </div>
            </div>
          </div>

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
