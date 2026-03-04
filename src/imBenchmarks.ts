// src/imBenchmarks.ts
export type BenchmarkPhase = 'midYear' | 'endOfYear';

export interface BenchmarkRow {
  id: string;
  area: string;              // e.g. "Gather a comprehensive patient-centered history."
  midYear: string[];         // bullet points
  endOfYear: string[];       // bullet points
}

// NOTE: Text abbreviated here – flesh out from your document.
export const IM_BENCHMARKS: BenchmarkRow[] = [
  {
    id: 'history',
    area: 'Gather a comprehensive patient-centered history.',
    midYear: [
      'Independently obtains a complete and accurate history in an organized fashion on a minimum of 2 patients per session.',
      'Starting to navigate more challenging/less straightforward patient encounters.',
    ],
    endOfYear: [
      'Independently obtains a complete and accurate history in an organized fashion for a minimum of 3–4 patients per session.',
      'Able to appropriately navigate patient encounters with more than one common concern.',
    ],
  },
  {
    id: 'physical-exam',
    area: 'Perform a physical exam.',
    midYear: [
      'With minimal supervisor input, starting to perform an appropriately focused physical exam based on concern and history gathered.',
      'Demonstrates patient-centered physical examination techniques and skills.',
    ],
    endOfYear: [
      'Performs physical exam guided by the patient’s history, initial findings, and working differential for common chief concerns.',
      'Adapts physical exam for individual patient characteristics and needs.',
      'Identifies and describes abnormal physical exam findings.',
    ],
  },
  {
    id: 'documentation',
    area: 'Provide written documentation of a clinical encounter.',
    midYear: [
      'Able to write a note that accurately documents patient’s history and physical exam findings.',
      'Notes have minimal omissions and are increasingly concise yet complete; require some editing by supervisor.',
      'Documents assessment and plan as discussed with preceptor and team.',
      'Notes are completed in a timely fashion.',
    ],
    endOfYear: [
      'Documents history and physical following patient’s encounter with minimal editing from supervisor in timely fashion.',
      'Documentation demonstrates understanding of differential diagnosis and reasoning behind diagnostic tests and management plans.',
      'Notes are suitable for billing purposes (if applicable) with minimal editing.',
      'Ensures all documentation is updated, original work, with appropriate prioritization of problem lists for each encounter.',
    ],
  },
  {
    id: 'ddx-management',
    area: 'Develop a prioritized differential diagnosis and select a working diagnosis following a patient encounter.',
    midYear: [
      'Starting to develop an appropriate differential diagnosis based on patient characteristics, history, physical exam, and study results.',
      'Starting to provide justification and support for differential diagnosis using patient history and patient record.',
      'Can identify patients requiring urgent attention and seek appropriate help.',
    ],
    endOfYear: [
      'Independently develops a prioritized, accurate, age-appropriate differential diagnosis based on patient history, physical exam, and study results.',
      'Consistently provides justification and support for differential diagnosis using information gathered from patient, patient record, and outside sources.',
      'Knows when and how to escalate care.',
    ],
  },
  {
    id: 'management-plan',
    area:
      'Create and implement a management plan including entering and discussing patient orders/prescriptions and explaining the diagnosis and collaboratively discussing treatment plans.',
    midYear: [
      'Starting to suggest management plans for primary concern addressed during clinical encounters.',
    ],
    endOfYear: [
      'Consistently suggests management plans and can develop appropriate management plans with support from the preceptor.',
      'Clearly communicates a patient-centered management plan to patients and families.',
      'Engages in follow-up of management plan including tests and referrals when prompted.',
      'Incorporates interprofessional health care team members in management plan.',
    ],
  },
  {
    id: 'diagnostic-tests',
    area: 'Recommend and interpret common diagnostic and screening tests.',
    midYear: [
      'Starting to recommend and interpret appropriate diagnostic tests and evaluations based on working differential diagnosis.',
      'Able to recognize critically abnormal results.',
    ],
    endOfYear: [
      'Appropriately recommends and interprets diagnostic tests and screening tools, including preventive care recommendations from reputable sources.',
    ],
  },
  {
    id: 'oral-presentation',
    area: 'Provide an oral presentation of a patient encounter.',
    midYear: [
      'Consistently uses a standard presentation format and is working to keep information in the correct section of the presentation.',
      'Working to minimize interpretation of subjective and objective information while presenting.',
      'Starting to distinguish important information from unimportant information.',
    ],
    endOfYear: [
      'Consistently presents pertinent information in an organized manner with minimal editorializing.',
      'Adjusts presentation content, length, and complexity to match situation and audience.',
    ],
  },
];
