// ─── Core Types ───────────────────────────────────────────────────────────────

export type Phase = 'early' | 'middle' | 'final';
export type ClinicalSkillRating = 'demonstrating' | 'not-yet';
export type BenchmarkAssessmentStatus = 'met' | 'notMet' | 'notAssessed';

export interface BenchmarkAssessment {
  status: BenchmarkAssessmentStatus;
}
export interface PreceptorProfile {
  name: string;
  title: string;
  institution: string;
  specialty: string;
  email: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  program: string;
  yearLevel: string;
  startDate: string;
  clinicalSkillScores?: { skillId: string; rating: ClinicalSkillRating; date: string }[];
}

export interface TeachingTopic {
  category: string;
  topics: string[];
}


// ─── Internal Medicine Red-Flag Benchmarks ───────────────────────────────────

export type RedFlagStatus = 'none' | 'redFlag' | 'unsure';

export interface RedFlagPlan {
  status: RedFlagStatus;
  plan: string;
}

export const RED_FLAG_COMPETENCIES = [
  {
    key: 'medicalKnowledge' as const,
    label: 'Medical Knowledge',
  },
  {
    key: 'clinicalReasoning' as const,
    label: 'Clinical Reasoning',
  },
  {
    key: 'communicationEmotional' as const,
    label: 'Communication & Emotional Intelligence',
  },
  {
    key: 'interpersonalCommunication' as const,
    label: 'Interpersonal & Communication Skills',
  },
];
export const RED_FLAG_DETAILS: Record<
  (typeof RED_FLAG_COMPETENCIES)[number]['key'],
  { redFlags: string[]; actions: string[] }
> = {
  medicalKnowledge: {
    redFlags: [
      'Limited differential diagnosis.',
      "Doesn't retain and apply things that you taught from one patient to the next.",
      'Limited answers to questions.',
      "Doesn't demonstrate growth in knowledge over time.",
    ],
    actions: [
      'Do not ignore!',
      'Need immediate correction if observed at any point in medical school.',
      'Additional resources exist that can help a struggling learner.',
    ],
  },
  clinicalReasoning: {
    redFlags: [
      'Unorganized presentations.',
      "Can’t explain or document clinical reasoning.",
      'Not using hypothesis-driven data gathering – consistently missing key aspects of history or physical exam.',
      'Difficulty prioritizing information.',
    ],
    actions: [
      'Meet with student.',
      'Share concerns about behavior with student and get their perspective.',
      'Address behavior with learner.',
      'Create plan together.',
      'Document what you see learner doing with specific examples throughout process.',
    ],
  },
  communicationEmotional: {
    redFlags: [
      'Interrupts others frequently.',
      'Awkward interactions.',
      'Lack of empathy.',
      'Lack of situational awareness.',
      'Challenges receiving or acting on feedback.',
    ],
    actions: [
      'Reach out and get support—you do not have to do this alone!',
      'Reach out to LIC director or liaison, even if not certain.',
      'Ask for support.',
    ],
  },
  interpersonalCommunication: {
    redFlags: [
      "Arrives late or doesn't follow clinic policy.",
      'Can’t be relied on to complete tasks or repeated reminders needed.',
      'Hesitant to seek help when needed.',
      'Poor communication.',
      'Does not accept responsibility for actions or is dismissive of feedback.',
    ],
    actions: [
      'Reach out and get support—you do not have to do this alone!',
      'Reach out to LIC director or liaison, even if not certain.',
      'Ask for support.',
    ],
  },
};
export interface SessionEvaluation {
  id: string;
  studentId: string;
  date: string;
  weekNumber: number;
  phase: Phase;
  phaseOverride?: Phase;
  sessionType: string;
  patientEncounters: number;
  scores: Record<string, number>;
  strengths: string;
  areasForImprovement: string;
  actionPlan: string;
  preceptorNotes: string;
  overallRating: number;
  createdAt: string;
  updatedAt: string;
  conditionsSeen?: string[];
  customConditions?: string[];
  teachingTopics?: TeachingTopic[];
  objectivesAchieved?: (string | number)[];

  // Internal-medicine benchmark red flag tracking (preceptor-only)
  redFlagBenchmarks?: {
    medicalKnowledge?: RedFlagPlan;
    clinicalReasoning?: RedFlagPlan;
    communicationEmotional?: RedFlagPlan;
    interpersonalCommunication?: RedFlagPlan;
  };
    benchmarkAssessments?: {
    [benchmarkId: string]: BenchmarkAssessment;
  };
}

export interface AppData {
  preceptor: PreceptorProfile;
  students: StudentProfile[];
  evaluations: SessionEvaluation[];
  version: string;
}

// ─── Score / Rubric Config ────────────────────────────────────────────────────

export type RubricMap = Record<number, string>;

export const SCORE_LABELS: Record<number, string> = {
  1: 'Below Expectations',
  2: 'Developing',
  3: 'Meets Expectations',
  4: 'Exceeds Expectations',
  5: 'Outstanding',
};

export const DEFAULT_SCORES: Record<string, number> = {
  clinicalKnowledge: 3,
  clinicalSkills: 3,
  communication: 3,
  professionalism: 3,
  criticalThinking: 3,
  teamwork: 3,
};

export const SCORE_CATEGORIES: {
  key: string;
  label: string;
  description: string;
  rubrics: RubricMap;
}[] = [
  {
    key: 'clinicalKnowledge',
    label: 'Clinical Knowledge',
    description: 'Understanding of medical concepts and evidence-based practice',
    rubrics: {
      1: 'Significant gaps in foundational knowledge; requires constant guidance',
      2: 'Basic knowledge present but struggles with application in clinical context',
      3: 'Adequate knowledge for level; applies concepts with moderate guidance',
      4: 'Strong knowledge base; applies concepts independently and accurately',
      5: 'Exceptional depth and breadth; teaches others and integrates evidence seamlessly',
    },
  },
  {
    key: 'clinicalSkills',
    label: 'Clinical Skills',
    description: 'Procedural and examination competencies',
    rubrics: {
      1: 'Unable to perform basic clinical skills safely without direct supervision',
      2: 'Performs skills with significant prompting; technique inconsistent',
      3: 'Performs core skills adequately with minimal supervision',
      4: 'Proficient and efficient; adapts technique to patient needs',
      5: 'Expert-level performance; innovates and models best practices',
    },
  },
  {
    key: 'communication',
    label: 'Communication',
    description: 'Patient interaction, history-taking, and interpersonal skills',
    rubrics: {
      1: 'Communication causes patient confusion or discomfort; non-empathic',
      2: 'Basic communication present; struggles with difficult conversations',
      3: 'Clear and respectful communication; appropriate for patient level',
      4: 'Excellent rapport-building; handles complex conversations well',
      5: 'Masterful communicator; adapts style fluidly, outstanding empathy',
    },
  },
  {
    key: 'professionalism',
    label: 'Professionalism',
    description: 'Reliability, ethics, appearance, and professional conduct',
    rubrics: {
      1: 'Multiple professionalism concerns; unreliable or unprofessional behaviour',
      2: 'Occasional lapses; needs reminders about professional standards',
      3: 'Consistently professional; meets all expected standards',
      4: 'Models professionalism; proactively upholds ethical standards',
      5: 'Exemplary; recognized by peers and staff as a professional role model',
    },
  },
  {
    key: 'criticalThinking',
    label: 'Critical Thinking',
    description: 'Clinical reasoning, differential diagnosis, and decision-making',
    rubrics: {
      1: 'Unable to generate differentials or reason through clinical problems',
      2: 'Narrow reasoning; misses key findings or alternatives',
      3: 'Develops reasonable differentials; reasoning is logical with guidance',
      4: 'Systematic and thorough reasoning; prioritizes well independently',
      5: 'Sophisticated reasoning; anticipates complications and synthesizes complexity',
    },
  },
  {
    key: 'teamwork',
    label: 'Teamwork',
    description: 'Collaboration with healthcare team and interdisciplinary work',
    rubrics: {
      1: 'Disrupts team function; poor interprofessional communication',
      2: 'Participates minimally; does not contribute to team decisions',
      3: 'Collaborative and supportive; fulfills assigned team role',
      4: 'Proactive team contributor; facilitates communication across disciplines',
      5: 'Outstanding team leader/member; elevates entire team performance',
    },
  },
];

// ─── Phase Config ─────────────────────────────────────────────────────────────

export const PHASE_CONFIG: Record<Phase, {
  label: string;
  weeks: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  early: {
    label: 'Early Phase',
    weeks: 'Wk 1–12',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  middle: {
    label: 'Middle Phase',
    weeks: 'Wk 13–30',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  final: {
    label: 'Final Phase',
    weeks: 'Wk 31–52',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
};

// ─── Session Types ────────────────────────────────────────────────────────────

export const SESSION_TYPES = [
  'Outpatient Clinic',
  'Inpatient Ward',
  'Emergency Department',
  'Surgical Suite',
  'Procedures',
  'Simulation',
  'Telemedicine',
  'Home Visit',
  'Long-Term Care',
  'Other',
];

// ─── Prepopulated Conditions ──────────────────────────────────────────────────

export const PREPOPULATED_CONDITIONS: { category: string; conditions: string[] }[] = [
  {
    category: 'Cardiovascular',
    conditions: ['Hypertension', 'Heart Failure', 'Atrial Fibrillation', 'Chest Pain / ACS', 'Peripheral Vascular Disease', 'Dyslipidemia'],
  },
  {
    category: 'Respiratory',
    conditions: ['Asthma', 'COPD', 'Pneumonia', 'Pulmonary Embolism', 'Sleep Apnea', 'URI / Sinusitis'],
  },
  {
    category: 'Gastrointestinal',
    conditions: ['GERD', 'IBS / IBD', 'Peptic Ulcer Disease', 'Liver Disease', 'Colorectal Issues', 'Nausea / Vomiting'],
  },
  {
    category: 'Endocrine / Metabolic',
    conditions: ['Type 2 Diabetes', 'Type 1 Diabetes', 'Hypothyroidism', 'Hyperthyroidism', 'Obesity', 'Metabolic Syndrome'],
  },
  {
    category: 'Musculoskeletal',
    conditions: ['Osteoarthritis', 'Rheumatoid Arthritis', 'Back Pain', 'Fracture', 'Gout', 'Fibromyalgia'],
  },
  {
    category: 'Neurological',
    conditions: ['Headache / Migraine', 'Stroke / TIA', 'Seizure', 'Dementia', 'Parkinson\'s', 'Neuropathy'],
  },
  {
    category: 'Mental Health',
    conditions: ['Depression', 'Anxiety', 'Substance Use', 'Psychosis', 'ADHD', 'PTSD'],
  },
  {
    category: 'Infectious Disease',
    conditions: ['UTI', 'Cellulitis', 'Sepsis', 'COVID-19', 'HIV', 'Influenza'],
  },
  {
    category: 'Preventive / Screening',
    conditions: ['Cancer Screening', 'Immunizations', 'Well Child Visit', 'Annual Physical', 'Prenatal Care', 'STI Screening'],
  },
];

// ─── Teaching Topic Categories ────────────────────────────────────────────────

export const TEACHING_TOPIC_CATEGORIES: { category: string; topics: string[] }[] = [
  {
    category: 'Cardiovascular',
    topics: ['ECG Interpretation', 'Heart Failure Management', 'Hypertension Guidelines', 'Anticoagulation', 'Lipid Management'],
  },
  {
    category: 'Pharmacology',
    topics: ['Polypharmacy Review', 'Drug Interactions', 'Antibiotic Stewardship', 'Pain Management', 'Insulin Dosing'],
  },
  {
    category: 'Clinical Reasoning',
    topics: ['Differential Diagnosis', 'Bayesian Reasoning', 'Evidence-Based Medicine', 'Diagnostic Uncertainty', 'Clinical Guidelines'],
  },
  {
    category: 'Procedures',
    topics: ['Venipuncture', 'IV Insertion', 'Urinary Catheterization', 'Wound Care', 'Joint Injection', 'Lumbar Puncture'],
  },
  {
    category: 'Communication',
    topics: ['Breaking Bad News', 'Motivational Interviewing', 'Shared Decision Making', 'Health Literacy', 'Cultural Competence'],
  },
  {
    category: 'Systems & Professionalism',
    topics: ['Documentation / Charting', 'Interprofessional Collaboration', 'Handoff Communication', 'Medical Ethics', 'Quality Improvement'],
  },
];

// ─── Clinical Objectives (Legacy) ────────────────────────────────────────────

export const CLINICAL_OBJECTIVES: string[] = [
  'Gather a history and perform a physical examination',
  'Prioritize a differential diagnosis following a clinical encounter',
  'Recommend and interpret common diagnostic and screening tests',
  'Enter and discuss orders and prescriptions',
  'Document a clinical encounter in the patient record',
  'Provide an oral presentation of a clinical encounter',
  'Form clinical questions and retrieve evidence to advance patient care',
  'Give or receive a patient handover to transition care responsibly',
  'Collaborate as a member of an interprofessional team',
  'Recognize a patient requiring urgent or emergent care',
  'Obtain informed consent for tests and/or procedures',
  'Perform general procedures of a physician',
  'Identify system failures and contribute to a culture of safety',
];

// ─── Clinical Objectives V2 (Structured EPAs) ────────────────────────────────

export interface ClinicalObjectiveV2 {
  id: number;
  outcome: string;
  expectations: {
    middle: string[];
    final: string[];
  };
}

export function expectationId(objId: number, phase: 'middle' | 'final', index: number): string {
  return `${objId}-${phase}-${String.fromCharCode(97 + index)}`;
}

export const CLINICAL_OBJECTIVES_V2: ClinicalObjectiveV2[] = [
  {
    id: 1,
    outcome: 'History & Physical Examination',
    expectations: {
      middle: [
        'Obtains a focused, relevant history with minimal prompting',
        'Performs a targeted physical exam appropriate to the presenting problem',
        'Identifies pertinent positive and negative findings',
      ],
      final: [
        'Independently obtains comprehensive and efficient history',
        'Performs complete physical exam and synthesizes findings accurately',
        'Adapts approach for complex, multi-system presentations',
      ],
    },
  },
  {
    id: 2,
    outcome: 'Differential Diagnosis & Clinical Reasoning',
    expectations: {
      middle: [
        'Generates a reasonable differential diagnosis with guidance',
        'Prioritizes differentials based on clinical likelihood',
      ],
      final: [
        'Independently constructs and prioritizes a thorough differential',
        'Integrates diagnostic findings to refine and narrow differentials',
        'Recognizes atypical presentations and adjusts reasoning accordingly',
      ],
    },
  },
  {
    id: 3,
    outcome: 'Diagnostic Tests & Investigations',
    expectations: {
      middle: [
        'Orders appropriate initial investigations with minimal prompting',
        'Interprets common lab and imaging results accurately',
      ],
      final: [
        'Independently selects and interprets a full range of investigations',
        'Understands test characteristics and applies them to clinical decisions',
      ],
    },
  },
  {
    id: 4,
    outcome: 'Patient Management & Treatment Planning',
    expectations: {
      middle: [
        'Develops a basic management plan with supervision',
        'Demonstrates awareness of treatment guidelines',
      ],
      final: [
        'Independently creates comprehensive, evidence-based management plans',
        'Adjusts plans based on patient response and evolving clinical picture',
        'Manages multiple concurrent problems effectively',
      ],
    },
  },
  {
    id: 5,
    outcome: 'Communication & Patient Education',
    expectations: {
      middle: [
        'Communicates diagnosis and plan clearly to patients',
        'Uses appropriate language for patient health literacy level',
      ],
      final: [
        'Engages in shared decision-making effectively',
        'Delivers difficult news with empathy and clarity',
        'Educates patients on chronic disease self-management',
      ],
    },
  },
  {
    id: 6,
    outcome: 'Professionalism & Interprofessional Collaboration',
    expectations: {
      middle: [
        'Demonstrates reliable, ethical professional behaviour',
        'Collaborates respectfully with the healthcare team',
      ],
      final: [
        'Models professionalism consistently across all settings',
        'Takes initiative in interprofessional communication and handoffs',
        'Advocates for patient safety and quality improvement',
      ],
    },
  },
];

export const TOTAL_OBJECTIVE_EXPECTATIONS = CLINICAL_OBJECTIVES_V2.reduce((sum, obj) => {
  return sum + obj.expectations.middle.length + obj.expectations.final.length;
}, 0);

// ─── Clinical Skills ──────────────────────────────────────────────────────────

export interface ClinicalBehavior {
  id: string;
  description: string;
}

export interface ClinicalSkill {
  id: string;
  category: string;
  title: string;
  minimalExpectations: ClinicalBehavior[];
  exemplaryBehaviors: ClinicalBehavior[];
}

export const CLINICAL_SKILLS: ClinicalSkill[] = [
  {
    id: 'history-taking',
    category: 'Core Clinical Skills',
    title: 'History Taking',
    minimalExpectations: [
      { id: 'history-taking-min-1', description: 'Introduces self and establishes rapport' },
      { id: 'history-taking-min-2', description: 'Obtains chief complaint and history of present illness' },
      { id: 'history-taking-min-3', description: 'Reviews past medical, surgical, family, and social history' },
      { id: 'history-taking-min-4', description: 'Documents medications and allergies accurately' },
    ],
    exemplaryBehaviors: [
      { id: 'history-taking-ex-1', description: 'Elicits patient\'s ideas, concerns, and expectations (ICE)' },
      { id: 'history-taking-ex-2', description: 'Efficiently adapts history to clinical context without missing key details' },
      { id: 'history-taking-ex-3', description: 'Demonstrates active listening and therapeutic empathy throughout' },
    ],
  },
  {
    id: 'physical-exam',
    category: 'Core Clinical Skills',
    title: 'Physical Examination',
    minimalExpectations: [
      { id: 'physical-exam-min-1', description: 'Performs a systematic, organized examination' },
      { id: 'physical-exam-min-2', description: 'Maintains patient comfort, dignity, and draping' },
      { id: 'physical-exam-min-3', description: 'Correctly identifies normal vs. abnormal findings' },
    ],
    exemplaryBehaviors: [
      { id: 'physical-exam-ex-1', description: 'Performs focused, efficient exam tailored to the clinical question' },
      { id: 'physical-exam-ex-2', description: 'Detects subtle findings and integrates them into clinical reasoning' },
    ],
  },
  {
    id: 'clinical-reasoning',
    category: 'Cognitive Skills',
    title: 'Clinical Reasoning & Decision Making',
    minimalExpectations: [
      { id: 'clinical-reasoning-min-1', description: 'Generates a differential diagnosis for common presentations' },
      { id: 'clinical-reasoning-min-2', description: 'Selects appropriate investigations to narrow the differential' },
      { id: 'clinical-reasoning-min-3', description: 'Formulates a basic management plan' },
    ],
    exemplaryBehaviors: [
      { id: 'clinical-reasoning-ex-1', description: 'Demonstrates Bayesian reasoning; adjusts pre-test probability explicitly' },
      { id: 'clinical-reasoning-ex-2', description: 'Recognizes and mitigates cognitive biases in clinical decisions' },
      { id: 'clinical-reasoning-ex-3', description: 'Manages diagnostic uncertainty confidently and safely' },
    ],
  },
  {
    id: 'communication-skills',
    category: 'Communication',
    title: 'Patient & Team Communication',
    minimalExpectations: [
      { id: 'communication-skills-min-1', description: 'Communicates findings and plan clearly to patient/family' },
      { id: 'communication-skills-min-2', description: 'Gives concise, structured oral presentations to the team' },
      { id: 'communication-skills-min-3', description: 'Documents accurately in the medical record' },
    ],
    exemplaryBehaviors: [
      { id: 'communication-skills-ex-1', description: 'Tailors communication style to audience (patient, peer, specialist)' },
      { id: 'communication-skills-ex-2', description: 'Navigates difficult conversations (bad news, goals of care) skillfully' },
      { id: 'communication-skills-ex-3', description: 'Ensures mutual understanding using teach-back and open-ended questions' },
    ],
  },
];



