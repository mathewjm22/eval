export type Phase = 'early' | 'middle' | 'final';

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
  email: string;
  program: string;
  yearLevel: string;
  startDate: string;
  photo?: string;
  clinicalSkillScores?: ClinicalSkillScore[];
}

export interface EvaluationScores {
  clinicalKnowledge: number;
  clinicalReasoning: number;
  patientCommunication: number;
  professionalBehavior: number;
  technicalSkills: number;
  documentation: number;
  teamwork: number;
  initiative: number;
}

export interface SessionEvaluation {
  id: string;
  studentId: string;
  date: string;
  weekNumber: number;
  phase: Phase;
  phaseOverride?: Phase;
  sessionType: string;
  patientEncounters: number;
  scores: EvaluationScores;
  strengths: string;
  areasForImprovement: string;
  actionPlan: string;
  preceptorNotes: string;
  overallRating: number;
  createdAt: string;
  updatedAt: string;
  teachingTopics?: { category: string; topics: string[] }[];
  conditionsSeen?: string[];
  customConditions?: string[];
  objectivesAchieved?: string[];
}

export interface AppData {
  preceptor: PreceptorProfile;
  students: StudentProfile[];
  evaluations: SessionEvaluation[];
  version: string;
}

export const SCORE_LABELS: Record<number, string> = {
  1: 'Below Expectations',
  2: 'Approaching Expectations',
  3: 'Meets Expectations',
  4: 'Exceeds Expectations',
  5: 'Outstanding',
};

// New Rubric Type
export type RubricMap = Record<number, string>;

// Updated Categories with Rubrics
export const SCORE_CATEGORIES: { key: keyof EvaluationScores; label: string; description: string; rubrics: RubricMap }[] = [
  {
    key: 'clinicalKnowledge',
    label: 'Clinical Knowledge',
    description: 'Medical knowledge, pathophysiology, pharmacology',
    rubrics: {
      1: 'Significant knowledge gaps; frequently unable to apply basic sciences to clinical scenarios.',
      2: 'Developing knowledge; makes occasional errors in application; needs frequent guidance.',
      3: 'Solid foundational knowledge; accurately applies knowledge to common clinical presentations.',
      4: 'Strong knowledge base; effectively applies complex concepts; understands nuances.',
      5: 'Exceptional depth; demonstrates mastery and teaches others; integrates complex pathophysiology.',
    },
  },
  {
    key: 'clinicalReasoning',
    label: 'Clinical Reasoning',
    description: 'Differential diagnosis, diagnostic workup, treatment planning',
    rubrics: {
      1: 'Unable to generate a differential; misses critical findings; disorganized approach.',
      2: 'Generates basic differential but lacks prioritization; workup often incomplete.',
      3: 'Develops prioritized differential for common conditions; appropriate initial workup.',
      4: 'Efficiently prioritizes; integrates data to refine plans; anticipates complications.',
      5: 'Sophisticated reasoning; considers rare conditions appropriately; highly efficient diagnostic planning.',
    },
  },
  {
    key: 'patientCommunication',
    label: 'Patient Communication',
    description: 'History taking, patient education, empathy',
    rubrics: {
      1: 'Disorganized history; misses critical info; lacks empathy or respect for autonomy.',
      2: 'Gathers basic history but misses context; communication is functional but lacks depth.',
      3: 'Conducts complete patient-centered history; demonstrates empathy; explains plans clearly.',
      4: 'Adapts style to diverse patients; handles difficult conversations effectively.',
      5: 'Exceptional rapport; addresses all psychosocial dimensions; patient feels deeply heard.',
    },
  },
  {
    key: 'professionalBehavior',
    label: 'Professional Behavior',
    description: 'Punctuality, ethics, appearance, responsibility',
    rubrics: {
      1: 'Frequently late/unprepared; lapses in integrity or ethical standards.',
      2: 'Occasional lapses in punctuality or preparedness; needs reminders.',
      3: 'Consistently punctual, prepared, and professionally dressed; maintains confidentiality.',
      4: 'Role model behavior; proactive in team duties; demonstrates high integrity.',
      5: 'Exemplary professionalism; leads by example; advocates for patients and profession.',
    },
  },
  {
    key: 'technicalSkills',
    label: 'Technical/Procedural Skills',
    description: 'Physical exam, procedures, clinical techniques',
    rubrics: {
      1: 'Unable to perform basic maneuvers correctly; causes patient discomfort.',
      2: 'Performs basic maneuvers but technique is awkward; often misses subtle findings.',
      3: 'Performs accurate exams for common conditions; maintains patient comfort.',
      4: 'Highly skilled technique; identifies subtle findings; adapts exam to context.',
      5: 'Mastery of advanced techniques; excellent procedural competence; teaches peers.',
    },
  },
  {
    key: 'documentation',
    label: 'Documentation',
    description: 'Notes, orders, prescriptions, referrals',
    rubrics: {
      1: 'Incomplete, inaccurate, or delayed documentation.',
      2: 'Complete but verbose/disorganized; occasional omissions in plan.',
      3: 'Accurate, timely, organized documentation for common encounters.',
      4: 'Concise, insightful notes; anticipates billing/coding; excellent problem representation.',
      5: 'Exemplary documentation; serves as a model; clinically insightful.',
    },
  },
  {
    key: 'teamwork',
    label: 'Teamwork & Collaboration',
    description: 'Interprofessional communication, consultations',
    rubrics: {
      1: 'Works in isolation; disrespectful to staff; fails to communicate critical info.',
      2: 'Communicates basic needs but does not actively engage with broader team.',
      3: 'Communicates effectively with nurses/staff; respects roles; responsive.',
      4: 'Proactively collaborates; facilitates smooth care transitions.',
      5: 'Leader in team dynamics; effectively coordinates complex care; improves team function.',
    },
  },
  {
    key: 'initiative',
    label: 'Initiative & Self-Directed Learning',
    description: 'Proactive learning, literature review, questions',
    rubrics: {
      1: 'Passive learner; waits to be told what to study; disengaged.',
      2: 'Completes tasks but rarely seeks additional knowledge or experience.',
      3: 'Asks relevant questions; reads about cases; seeks feedback.',
      4: 'Brings new evidence to rounds; identifies own knowledge gaps and addresses them.',
      5: 'Highly self-motivated; drives own learning curriculum; engages in scholarly activity.',
    },
  },
];

export const SESSION_TYPES = [
  'Clinic Day',
  'Hospital Rounds',
  'Procedure Day',
  'Emergency/Urgent Care',
  'Telehealth',
  'Case Presentation',
  'Didactic/Teaching Session',
  'On-Call/Night Shift',
  'Community Health',
  'Other',
];

export const PHASE_CONFIG: Record<Phase, { label: string; color: string; bgColor: string; borderColor: string; weeks: string }> = {
  early: { label: 'Early Phase', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', weeks: 'Weeks 1–12' },
  middle: { label: 'Middle Phase', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', weeks: 'Weeks 13–30' },
  final: { label: 'Final Phase', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', weeks: 'Weeks 31–52' },
};

export const DEFAULT_SCORES: EvaluationScores = {
  clinicalKnowledge: 3,
  clinicalReasoning: 3,
  patientCommunication: 3,
  professionalBehavior: 3,
  technicalSkills: 3,
  documentation: 3,
  teamwork: 3,
  initiative: 3,
};

export const TEACHING_TOPIC_CATEGORIES: { category: string; topics: string[] }[] = [
  { category: 'Cardiovascular', topics: ['Chest pain', 'Heart failure', 'Arrhythmias', 'Hypertension', 'Valvular disease', 'Peripheral vascular disease', 'ASCVD', 'Syncope'] },
  { category: 'Pulmonary/Respiratory', topics: ['Asthma', 'COPD', 'Pneumonia', 'Pulmonary embolism', 'Dyspnea', 'Cough', 'Pleural effusion', 'Lung cancer'] },
  { category: 'Gastrointestinal', topics: ['Abdominal pain', 'GI bleed', 'Liver disease', 'GERD', 'Diarrhea', 'Constipation', 'Nausea/Vomiting', 'Jaundice', 'Hernia', 'Inflammatory bowel disease'] },
  { category: 'Endocrinology', topics: ['Diabetes', 'Thyroid disorders', 'Obesity', 'Osteoporosis', 'Hyperlipidemia', 'Adrenal disorders', 'Metabolic syndrome'] },
  { category: 'Neurology', topics: ['Headache', 'Stroke', 'Seizure', 'Dementia', 'Altered mental status', 'Dizziness', 'Neuropathy', 'Abnormal movements'] },
  { category: 'Psychiatry/Behavioral Health', topics: ['Depression', 'Anxiety', 'Sleep disorders', 'Substance abuse', 'Chronic pain', 'PTSD', 'Bipolar disorder'] },
  { category: 'Musculoskeletal', topics: ['Back pain', 'Osteoarthritis', 'Fractures', 'Rheumatologic conditions', 'Joint pain', 'Gout', 'Fibromyalgia'] },
  { category: 'Renal/Urinary', topics: ['AKI', 'CKD', 'Hematuria', 'Dysuria', 'UTI', 'Electrolyte abnormalities', 'Nephrolithiasis'] },
  { category: 'Hematology/Oncology', topics: ['Anemia', 'DVT/PE', 'Cancer screening', 'Lymphadenopathy', 'Thrombocytopenia', 'Leukemia/Lymphoma'] },
  { category: 'Dermatology', topics: ['Rash', 'Skin cancer', 'Wound care', 'Eczema', 'Psoriasis', 'Cellulitis', 'Acne'] },
  { category: 'Infectious Disease', topics: ['Fever', 'Pneumonia', 'UTI', 'Cellulitis', 'HIV', 'Sepsis', 'COVID-19', 'STI'] },
  { category: "Women's Health", topics: ['Breast complaint', 'Pelvic pain', 'Abnormal uterine bleeding', 'Contraception', 'Menopause', 'Pregnancy complications', 'Cervical cancer screening'] },
  { category: 'Preventive Medicine', topics: ['Cancer screening', 'Diet counseling', 'Disease prevention', 'Immunizations', 'Smoking cessation', 'Exercise counseling'] },
  { category: 'Geriatrics', topics: ['Falls', 'Capacity evaluation', 'Polypharmacy', 'End-of-life care', 'Delirium', 'Frailty'] },
  { category: 'Other/General', topics: ['Preop assessment', 'Failure to thrive', 'Toxic ingestion', 'Fatigue', 'Weight loss'] },
];

export const PREPOPULATED_CONDITIONS: { category: string; conditions: string[] }[] = [
  { category: 'General/Pediatric', conditions: ['Fever', 'Failure to Thrive', 'Toxic Ingestion'] },
  { category: 'Hematology', conditions: ['Anemia'] },
  { category: 'GI', conditions: ['Acute Abdominal Pain', 'Jaundice/Hepatobiliary Disease', 'Diarrhea', 'Vomiting', 'GI Bleed', 'Hernia', 'Liver Disease'] },
  { category: 'Pulmonary', conditions: ['Asthma', 'Cough', 'Pneumonia', 'COPD', 'Dyspnea'] },
  { category: 'Cardiovascular', conditions: ['Hypertension', 'ASCVD', 'CHF', 'Syncope', 'DVT/PE'] },
  { category: 'Dermatology', conditions: ['Rash', 'Skin Cancer'] },
  { category: 'Neurology', conditions: ['Altered Mental Status', 'Headache', 'Dementia', 'Seizure', 'Abnormal Movements', 'Stroke', 'Vision Changes', 'Dizziness'] },
  { category: 'Psychiatry', conditions: ['Anxiety', 'Depression', 'Chronic Pain', 'Sleep Disorders'] },
  { category: 'Endocrine', conditions: ['Diabetes', 'Obesity', 'Osteoporosis', 'Thyroid Disorders', 'Hyperlipidemia'] },
  { category: "Women's Health", conditions: ['Breast Complaint', 'Pelvic Pain', 'Abnormal Uterine Bleeding'] },
  { category: 'Renal/Urinary', conditions: ['Hematuria', 'Dysuria', 'AKI', 'CKD'] },
  { category: 'Musculoskeletal', conditions: ['Back Pain', 'Osteoarthritis', 'Rheumatologic Conditions', 'Fractures'] },
  { category: 'Preventive Care', conditions: ['Capacity Evaluation', 'Cancer Screening', 'Diet Counseling', 'Disease Prevention'] },
  { category: 'Other', conditions: ['Preop Assessment'] },
];

export const CLINICAL_OBJECTIVES: string[] = [
  'Gather a comprehensive and accurate patient-centered history from an adult patient with a common clinical condition',
  'Perform a physical examination for a medically stable adult patient with a common clinical condition',
  'Develop an initial assessment (supported by clinical data), a prioritized differential diagnosis and problem list for an adult patient with a common clinical condition',
  'Recommend and interpret common diagnostic tests in an adult patient with a common clinical condition',
  'Provide preventive care and anticipatory guidance for health-care maintenance in adult patients',
  'With support from faculty, develop an evidence-based patient-centered management plan for a common clinical condition for an adult',
  'With support from faculty, organize the safe and efficient care of at least 2 hospitalized patients simultaneously',
  'Provide written documentation of a patient encounter for an ambulatory adult patient with a common clinical condition',
  'Provide written documentation of a patient encounter for a hospitalized adult patient with a common clinical condition',
  'Present an ambulatory adult patient with a common clinical condition in an organized and efficient fashion',
  'Present a hospitalized adult patient with a common clinical condition in an organized and efficient fashion using a problem-based approach',
];

export interface ClinicalObjectiveExpectation {
  middle: string[];
  final: string[];
}

export interface ClinicalObjective {
  id: string;
  outcome: string;
  expectations: ClinicalObjectiveExpectation;
}

export const CLINICAL_OBJECTIVES_V2: ClinicalObjective[] = [
  {
    id: '1',
    outcome: 'Gather a comprehensive patient-centered history',
    expectations: {
      middle: [
        'Independently obtains a complete and accurate history in an organized fashion on a minimum of 2 patients per session.',
        'Starting to navigate more challenging/less straightforward patient encounters.',
      ],
      final: [
        'Independently obtains a complete and accurate history in an organized fashion for a minimum of 3-4 patients per session.',
        'Able to appropriately navigate patient encounters with more than 1 common chief concern.',
      ],
    },
  },
  {
    id: '2',
    outcome: 'Perform a physical exam',
    expectations: {
      middle: [
        'With minimal supervisor input, starting to perform an appropriately focused physical exam based on concern and history gathered.',
        'Demonstrates patient-centered physical examination techniques and skills.',
      ],
      final: [
        'Perform PE that is guided by patient\'s history, initial PE findings, and working differential diagnosis for common chief concerns.',
        'Adapts physical exam for individual patient characteristics and needs. Identify and describe abnormal PE findings.',
      ],
    },
  },
  {
    id: '3',
    outcome: 'Develop a prioritized differential diagnosis and select a working diagnosis following a patient encounter',
    expectations: {
      middle: [
        'Starting to develop an appropriate differential diagnosis based on patient characteristics, history, physical exam, and study results.',
        'Starting to provide justification and support for differential diagnosis using patient history and patient record.',
        'Can identify patients requiring urgent attention and seek appropriate help.',
      ],
      final: [
        'Independently develops a prioritized, accurate and age-appropriate differential diagnosis based on patient history, physical exam, and study results.',
        'Consistently provides justification and support for differential diagnosis using information gathered from patient, patient record, and outside sources.',
        'Knows when and how to escalate care.',
      ],
    },
  },
  {
    id: '4',
    outcome: 'Create and implement a management plan including entering and discussing patient orders/prescriptions and explaining the diagnosis and collaboratively discussing treatment plans',
    expectations: {
      middle: [
        'Starting to suggest management plans for primary concern addressed during clinical encounters.',
      ],
      final: [
        'Consistently suggests management plans and can develop appropriate management plans with support from the preceptor.',
        'Clearly communicates a patient-centered management plan to patients and their families.',
        'Engages in follow up of management plan including tests and referrals when prompted.',
        'Incorporates interprofessional health care team members in management plan.',
      ],
    },
  },
  {
    id: '5',
    outcome: 'Recommend and interpret common diagnostic and screening tests',
    expectations: {
      middle: [
        'Starting to recommend and interpret appropriate diagnostic tests and evaluations based on working differential diagnosis. Able to recognize critically abnormal results.',
      ],
      final: [
        'Appropriately recommends and interprets diagnostic tests and screening tools, including preventive care recommendations from reputable sources.',
      ],
    },
  },
  {
    id: '6',
    outcome: 'Provide written documentation of a clinical encounter',
    expectations: {
      middle: [
        'Able to write a note that accurately documents patient\'s history and physical exam findings.',
        'Notes have minimal omissions and are increasingly concise yet complete with accurate information, require some editing by supervisor.',
        'Documents assessment and plan as discussed with preceptor and team.',
        'Notes are completed in a timely fashion.',
      ],
      final: [
        'Documents history and physical following patient\'s encounter with minimal editing from supervisor in timely fashion.',
        'Documentation of patient encounter demonstrates understanding of differential diagnosis and reasoning behind diagnostic tests and management plans.',
        'Notes for common/straightforward internal medicine encounters are routinely used for billing purposes (if applicable) with minimal editing.',
        'Ensures all documentation is appropriately updated and original work, with appropriate prioritization of problem lists for each encounter.',
      ],
    },
  },
  {
    id: '7',
    outcome: 'Provide an oral presentation of a patient encounter',
    expectations: {
      middle: [
        'Consistently uses a standard medical presentation format when presenting and working to keep information in the correct section of the presentation.',
        'Working to minimize interpretation of subjective and objective information while presenting.',
        'Starting to distinguish important information from unimportant information when presenting.',
      ],
      final: [
        'Consistently presents pertinent information in an organized manner with minimal editorializing.',
        'Adjusts presentation content as well as length and complexity to match situation and audience (i.e. bedside, rounds, consultants, other interprofessional team members, etc.).',
      ],
    },
  },
];

/** Returns the expectation ID for a given outcome, phase, and 0-based index */
export function expectationId(outcomeId: string, phase: 'middle' | 'final', index: number): string {
  return `${outcomeId}-${phase}-${String.fromCharCode(97 + index)}`;
}

/** Total number of checkable expectation items across all phases */
export const TOTAL_OBJECTIVE_EXPECTATIONS = CLINICAL_OBJECTIVES_V2.reduce(
  (sum, obj) => sum + obj.expectations.middle.length + obj.expectations.final.length,
  0,
);

export type ClinicalSkillRating = 'not-yet' | 'demonstrating';

export interface ClinicalSkillScore {
  skillId: string;
  rating: ClinicalSkillRating;
  date: string;
}

export interface ClinicalSkillBehavior {
  id: string;
  description: string;
}

export interface ClinicalSkill {
  id: string;
  category: string;
  title: string;
  minimalExpectations: ClinicalSkillBehavior[];
  exemplaryBehaviors: ClinicalSkillBehavior[];
}

export const CLINICAL_SKILLS: ClinicalSkill[] = [
  {
    id: 'professionalism',
    category: 'Professionalism',
    title: 'Demonstrates core attributes of professionalism that build trust (reliability, willingness to ask for help/admit limits, integrity, duty, respect, & honesty)',
    minimalExpectations: [
      { id: 'prof-min-a', description: 'Takes responsibility for one\'s actions and learning, keeps commitments to others, and acknowledges limits, and shows integrity in interactions with patients and team.' },
      { id: 'prof-min-b', description: 'Demonstrates respect for patients, peers, faculty, and team members.' },
      { id: 'prof-min-c', description: 'Demonstrates humility and insight into growth opportunities in interactions with teams and patients.' },
      { id: 'prof-min-d', description: 'Punctual, prepared, and dressed appropriately for clinical sessions/shifts.' },
      { id: 'prof-min-e', description: 'Timely completion of clinical tasks.' },
      { id: 'prof-min-f', description: 'Demonstrates behaviors that uphold ethical and legal standards.' },
    ],
    exemplaryBehaviors: [
      { id: 'prof-ex-a', description: 'Consistently demonstrates self-awareness and management of personal bias or limitations.' },
      { id: 'prof-ex-b', description: 'Actively seeking to understand and respect diverse backgrounds of patients, patient families, and team members.' },
      { id: 'prof-ex-c', description: 'Takes initiative to correct errors or learn from them without prompting.' },
      { id: 'prof-ex-d', description: 'Consistently demonstrates maturity and ability to maintain composure and professionalism even in high-stakes situations or under stress.' },
      { id: 'prof-ex-e', description: 'Leads by example in ethical decision-making and professional conduct.' },
    ],
  },
  {
    id: 'interprofessional',
    category: 'Interprofessional Collaboration',
    title: 'Engage with an interprofessional team to facilitate patient care',
    minimalExpectations: [
      { id: 'ipc-min-a', description: 'Works in a professional and effective manner with health professionals other than physicians — e.g. medical assistants, nurses, psychologists, pharmacists, physical therapists, social workers, etc.' },
      { id: 'ipc-min-b', description: 'Can describe how each team member\'s unique experience and expertise can contribute to the interprofessional team.' },
      { id: 'ipc-min-c', description: 'Develops trusting and respectful relationships with team members.' },
    ],
    exemplaryBehaviors: [
      { id: 'ipc-ex-a', description: 'Appropriately requests assistance from interdisciplinary team members and incorporates interprofessional and community resources to address patient-specific barriers.' },
      { id: 'ipc-ex-b', description: 'Communicates with interprofessional team reliably and professionally and keeps others informed and up to date.' },
      { id: 'ipc-ex-c', description: 'Respectfully integrates into healthcare teams and values the roles of all members.' },
    ],
  },
  {
    id: 'ebm',
    category: 'Evidence-Based Medicine',
    title: 'Form clinical questions, retrieve and appraise evidence to advance patient care',
    minimalExpectations: [
      { id: 'ebm-min-a', description: 'Utilizes primary literature searches to inform patient care when prompted.' },
      { id: 'ebm-min-b', description: 'Retrieves basic information through information aggregators (e.g. Google and UpToDate) without prompting.' },
      { id: 'ebm-min-c', description: 'Able to find evidence about a topic, needs guidance in understanding various levels of evidence.' },
      { id: 'ebm-min-d', description: 'Use point of care resources to support development of differential diagnosis.' },
    ],
    exemplaryBehaviors: [
      { id: 'ebm-ex-a', description: 'Consistently demonstrates curiosity and forms answerable patient care questions.' },
      { id: 'ebm-ex-b', description: 'Consistently accesses the medical literature and national guidelines to answer clinical questions without prompting.' },
      { id: 'ebm-ex-c', description: 'Consistently using point of care resources to support development of differential diagnosis.' },
    ],
  },
];
