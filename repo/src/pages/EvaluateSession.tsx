Since I cannot generate a downloadable `.zip` file directly, I have compiled the **complete source code** for the files you need to update below.

You can simply copy the content of each code block and paste it into the corresponding file in your project. This will implement the **Anchored Rubrics** feature we discussed.

### 1. Update `src/types.ts`
This adds the detailed definitions for every score (1-5) for every category.

```typescript
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
```

### 2. Update `src/components/ScoreInput.tsx`
This updates the visual component to display the rubrics when a score is selected.

```typescript
import { SCORE_LABELS, RubricMap } from '../types';
import { useState } from 'react';

interface ScoreInputProps {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  rubrics: RubricMap;
}

const SCORE_COLORS: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-lime-500',
  5: 'bg-emerald-500',
};

export function ScoreInput({ label, description, value, onChange, rubrics }: ScoreInputProps) {
  const [showAll, setShowAll] = useState(false);
  const currentRubric = rubrics[value] || SCORE_LABELS[value];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="mb-3 flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">{label}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-indigo-600 hover:underline cursor-pointer focus:outline-none"
        >
          {showAll ? 'Hide Rubrics' : 'View Rubrics'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border-2 ${
              value === score
                ? `${SCORE_COLORS[score]} text-white border-transparent shadow-md scale-105`
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
            }`}
          >
            {score}
          </button>
        ))}
      </div>

      {/* Current Selection Definition */}
      <div className={`mt-3 p-2.5 rounded-lg text-xs border ${
        value <= 2 ? 'bg-red-50 border-red-100 text-red-800' : 
        value === 3 ? 'bg-yellow-50 border-yellow-100 text-yellow-800' : 
        'bg-emerald-50 border-emerald-100 text-emerald-800'
      }`}>
        <span className="font-bold">{SCORE_LABELS[value]}:</span> {currentRubric}
      </div>

      {/* Expanded View for all rubrics */}
      {showAll && (
        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
          {[1, 2, 3, 4, 5].map((score) => (
            <div key={score} className="flex gap-2 text-xs">
              <span className={`font-bold w-4 ${score === value ? 'text-indigo-600' : 'text-slate-400'}`}>
                {score}.
              </span>
              <p className={score === value ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                {rubrics[score]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. Update `src/pages/EvaluateSession.tsx`
This ensures the new `rubrics` prop is passed correctly to the component. Since this file is large, I have included the **full updated file** to ensure everything works perfectly.

```typescript
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
} from '../types';
import { ScoreInput } from '../components/ScoreInput';

const STEPS = ['Session Details', 'Diagnoses & Conditions', 'Teaching Topics', 'Clinical Objectives', 'Clinical Scores', 'Feedback & Notes', 'Review & Submit'];
const LAST_STEP = STEPS.length - 1;

export function EvaluateSession() {
  const { data, addEvaluation, updateEvaluation } = useAppData();
  const navigate = useNavigate();
  const { id } = useParams();

  const existingEval = id ? data.evaluations.find(e => e.id === id) : null;

  const [form, setForm] = useState<SessionEvaluation>(() => {
    if (existingEval) return { ...existingEval, scores: { ...existingEval.scores } };
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

  // Effective phase: manual override takes priority over auto
  const effectivePhase: Phase = form.phaseOverride || autoPhase;

  const updateForm = <K extends keyof SessionEvaluation>(key: K, value: SessionEvaluation[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateScore = (key: keyof typeof form.scores, value: number) => {
    setForm(prev => ({ ...prev, scores: { ...prev.scores, [key]: value } }));
  };

  const avgScore = useMemo(() => {
    const vals = Object.values(form.scores);
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [form.scores]);

  // Previously seen conditions for the selected student
  const previousConditions = useMemo(() => {
    return new Set(
      data.evaluations
        .filter(e => e.studentId === form.studentId && e.id !== form.id)
        .flatMap(e => [...(e.conditionsSeen || []), ...(e.customConditions || [])])
    );
  }, [data.evaluations, form.studentId, form.id]);

  // Previously achieved objectives for the selected student
  const previousObjectives = useMemo(() => {
    return new Set(
      data.evaluations
        .filter(e => e.studentId === form.studentId && e.id !== form.id)
        .flatMap(e => e.objectivesAchieved || [])
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
      const updated = current.map(t => t.category === category ? { ...t, topics: newTopics } : t);
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
    const updated = { ...form, phase: effectivePhase, updatedAt: new Date().toISOString() };
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
          <p className="text-sm text-slate-400 mt-2 mb-6">You need to add at least one student before creating an evaluation.</p>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Student *</label>
              <select
                value={form.studentId}
                onChange={e => updateForm('studentId', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              >
                {data.students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => updateForm('date', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Week Number (1-52)</label>
              <input
                type="number"
                min={1}
                max={52}
                value={form.weekNumber}
                onChange={e => updateForm('weekNumber', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
              <p className="text-xs mt-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PHASE_CONFIG[autoPhase].bgColor} ${PHASE_CONFIG[autoPhase].color} border ${PHASE_CONFIG[autoPhase].borderColor}`}>
                  Auto: {PHASE_CONFIG[autoPhase].label} ({PHASE_CONFIG[autoPhase].weeks})
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phase Override</label>
              <select
                value={form.phaseOverride || ''}
                onChange={e => updateForm('phaseOverride', e.target.value ? (e.target.value as Phase) : undefined)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              >
                <option value="">Auto (based on week)</option>
                <option value="early">Early Phase</option>
                <option value="middle">Middle Phase</option>
                <option value="final">Final Phase</option>
              </select>
              {form.phaseOverride && (
                <p className="text-xs mt-1 text-amber-600">
                  ⚠️ Manual override active — using <strong>{PHASE_CONFIG[form.phaseOverride].label}</strong> instead of auto-detected {PHASE_CONFIG[autoPhase].label}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Session Type</label>
              <select
                value={form.sessionType}
                onChange={e => updateForm('sessionType', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              >
                {SESSION_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patient Encounters</label>
              <input
                type="number"
                min={0}
                value={form.patientEncounters}
                onChange={e => updateForm('patientEncounters', parseInt(e.target.value) || 0)}
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
            <p className="text-sm text-slate-400 mt-1">Check all conditions encountered during this session.</p>
            {previousConditions.size > 0 && (
              <p className="text-xs text-emerald-600 mt-1">✅ Green indicates previously seen in prior sessions.</p>
            )}
          </div>
          {PREPOPULATED_CONDITIONS.map(({ category, conditions }) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-slate-600 mb-2">{category}</h4>
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
                      {prev && !checked && <span className="text-emerald-500">✓</span>}
                      {cond}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          {/* Custom conditions */}
          <div>
            <h4 className="text-sm font-semibold text-slate-600 mb-2">Custom Conditions</h4>
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
                  <span key={cond} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-100 border border-purple-300 text-purple-800 text-sm">
                    {cond}
                    <button type="button" onClick={() => removeCustomCondition(cond)} className="text-purple-500 hover:text-purple-700 font-bold">×</button>
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
            <p className="text-sm text-slate-400 mt-1">Select or add topics taught during this session, organized by body system.</p>
          </div>
          {TEACHING_TOPIC_CATEGORIES.map(({ category, topics }) => {
            const selectedTopics = getTopicsForCategory(category);
            return (
              <div key={category} className="border border-slate-100 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  {category}
                  {selectedTopics.length > 0 && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{selectedTopics.length} selected</span>
                  )}
                </h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {topics.map(topic => {
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
                    onChange={e => setCustomTopicInputs(prev => ({ ...prev, [category]: e.target.value }))}
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
            <h3 className="font-bold text-slate-800 text-lg">🎯 Clinical Objectives (EPAs)</h3>
            <p className="text-sm text-slate-400 mt-1">
              Check which expectations the student demonstrated during this session.
              Showing <span className={`font-semibold ${PHASE_CONFIG[effectivePhase].color}`}>{PHASE_CONFIG[effectivePhase].label}</span> expectations.
            </p>
            {previousObjectives.size > 0 && (
              <p className="text-xs text-emerald-600 mt-1">✅ Green border indicates expectations achieved in prior sessions.</p>
            )}
          </div>

          {effectivePhase === 'early' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              Phase-specific expectations begin at the Middle Phase. Continue building foundational skills during Early Phase.
            </div>
          ) : (
            <div className="space-y-5">
              {CLINICAL_OBJECTIVES_V2.map((obj) => {
                const phaseExpectations = effectivePhase === 'middle' ? obj.expectations.middle : obj.expectations.final;
                return (
                  <div key={obj.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <span className="text-xs font-bold text-indigo-600 mr-2">Outcome {obj.id}</span>
                      <span className="text-sm font-semibold text-slate-800">{obj.outcome}</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {phaseExpectations.map((exp, ei) => {
                        const id = expectationId(obj.id, effectivePhase === 'middle' ? 'middle' : 'final', ei);
                        const checked = (form.objectivesAchieved || []).includes(id);
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
                              <span className={`text-xs font-bold mr-1 ${checked ? 'text-indigo-600' : prev ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {String.fromCharCode(97 + ei)}.
                              </span>
                              <span className={`text-sm ${checked ? 'text-indigo-800 font-medium' : prev ? 'text-emerald-700' : 'text-slate-600'}`}>
                                {exp}
                              </span>
                              {prev && !checked && <span className="ml-2 text-xs text-emerald-500">✓ Previously achieved</span>}
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
            {(form.objectivesAchieved || []).length} expectation{(form.objectivesAchieved || []).length !== 1 ? 's' : ''} marked for this session
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
                value={form.scores[cat.key]}
                onChange={v => updateScore(cat.key, v)}
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

      {/* Step 5: Feedback */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">💪 Strengths</label>
            <textarea
              value={form.strengths}
              onChange={e => updateForm('strengths', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
              placeholder="What did the student do well today?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">🎯 Areas for Improvement</label>
            <textarea
              value={form.areasForImprovement}
              onChange={e => updateForm('areasForImprovement', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
              placeholder="What areas need more work?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">📋 Action Plan / Goals</label>
            <textarea
              value={form.actionPlan}
              onChange={e => updateForm('actionPlan', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
              placeholder="Specific goals or tasks for next session..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">📝 Preceptor Notes (private)</label>
            <textarea
              value={form.preceptorNotes}
              onChange={e => updateForm('preceptorNotes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
              placeholder="Additional notes for your records..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">⭐ Overall Session Rating</label>
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
        </div>
      )}

      {/* Step 6: Review */}
      {step === 6 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-4">📋 Evaluation Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Student</p>
                <p className="font-semibold text-slate-800">{data.students.find(s => s.id === form.studentId)?.name || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Date</p>
                <p className="font-semibold text-slate-800">{form.date}</p>
              </div>
              <div>
                <p className="text-slate-400">Week / Phase</p>
                <p className="font-semibold text-slate-800">
                  Week {form.weekNumber} •{' '}
                  <span className={PHASE_CONFIG[effectivePhase].color}>{PHASE_CONFIG[effectivePhase].label}</span>
                  {form.phaseOverride && (
                    <span className="ml-1 text-xs text-amber-600">(manual)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Session Type</p>
                <p className="font-semibold text-slate-800">{form.sessionType}</p>
              </div>
              <div>
                <p className="text-slate-400">Patient Encounters</p>
                <p className="font-semibold text-slate-800">{form.patientEncounters}</p>
              </div>
              <div>
                <p className="text-slate-400">Overall Rating</p>
                <p className="font-semibold text-indigo-600 text-lg">{form.overallRating}/5 ⭐</p>
              </div>
            </div>
          </div>

          {/* Conditions summary */}
          {((form.conditionsSeen || []).length > 0 || (form.customConditions || []).length > 0) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3">🩺 Conditions Seen</h4>
              <div className="flex flex-wrap gap-2">
                {[...(form.conditionsSeen || []), ...(form.customConditions || [])].map(c => (
                  <span key={c} className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs">{c}</span>
                ))}
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
                    <span className="text-xs font-semibold text-slate-500">{category}: </span>
                    <span className="text-xs text-slate-700">{topics.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Objectives summary */}
          {(form.objectivesAchieved || []).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3">🎯 Clinical Objectives Achieved</h4>
              <div className="space-y-2">
                {CLINICAL_OBJECTIVES_V2.map(obj => {
                  const achieved = (form.objectivesAchieved || []).filter(id =>
                    typeof id === 'string' && (id.startsWith(`${obj.id}-middle-`) || id.startsWith(`${obj.id}-final-`))
                  );
                  if (achieved.length === 0) return null;
                  return (
                    <div key={obj.id}>
                      <p className="text-xs font-bold text-indigo-600 mb-1">Outcome {obj.id}: {obj.outcome}</p>
                      {achieved.map(id => {
                        const parts = typeof id === 'string' ? id.split('-') : [];
                        const phase = parts[1] as 'middle' | 'final' | undefined;
                        const letter = parts[2];
                        const idx = letter ? letter.charCodeAt(0) - 97 : -1;
                        const text = phase && idx >= 0
                          ? (obj.expectations[phase]?.[idx] || id)
                          : String(id);
                        return (
                          <div key={String(id)} className="flex items-start gap-2 text-sm ml-3">
                            <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                            <span className="text-slate-600">
                              <span className={`text-xs font-medium mr-1 ${phase === 'middle' ? 'text-amber-600' : 'text-emerald-600'}`}>
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
                {(form.objectivesAchieved || []).filter(id => typeof id === 'number').map(i => (
                  <div key={String(i)} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                    <span className="text-slate-600"><span className="font-medium text-slate-700">EPA {Number(i) + 1}:</span> {CLINICAL_OBJECTIVES[Number(i)]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-3">Competency Scores</h4>
            <div className="grid grid-cols-2 gap-3">
              {SCORE_CATEGORIES.map(cat => (
                <div key={cat.key} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">{cat.label}</span>
                  <span className={`font-bold ${
                    form.scores[cat.key] >= 4 ? 'text-emerald-600' : form.scores[cat.key] >= 3 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {form.scores[cat.key]}/5
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="font-medium text-slate-700">Average</span>
              <span className="text-xl font-bold text-indigo-600">{avgScore}/5</span>
            </div>
          </div>

          {(form.strengths || form.areasForImprovement || form.actionPlan || form.preceptorNotes) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              {form.strengths && (
                <div>
                  <h4 className="font-semibold text-emerald-700 text-sm">💪 Strengths</h4>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{form.strengths}</p>
                </div>
              )}
              {form.areasForImprovement && (
                <div>
                  <h4 className="font-semibold text-amber-700 text-sm">🎯 Areas for Improvement</h4>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{form.areasForImprovement}</p>
                </div>
              )}
              {form.actionPlan && (
                <div>
                  <h4 className="font-semibold text-blue-700 text-sm">📋 Action Plan</h4>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{form.actionPlan}</p>
                </div>
              )}
              {form.preceptorNotes && (
                <div>
                  <h4 className="font-semibold text-slate-700 text-sm">📝 Preceptor Notes</h4>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{form.preceptorNotes}</p>
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
```
