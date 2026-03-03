import { AppData, PreceptorProfile, StudentProfile, SessionEvaluation } from './types';

const STORAGE_KEY = 'preceptor_eval_data';

const DEFAULT_DATA: AppData = {
  preceptor: {
    name: '',
    title: '',
    institution: '',
    specialty: '',
    email: '',
  },
  students: [],
  evaluations: [],
  version: '1.0.0',
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppData;
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_DATA };
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updatePreceptor(profile: PreceptorProfile): AppData {
  const data = loadData();
  data.preceptor = profile;
  saveData(data);
  return data;
}

export function addStudent(student: StudentProfile): AppData {
  const data = loadData();
  data.students.push(student);
  saveData(data);
  return data;
}

export function updateStudent(student: StudentProfile): AppData {
  const data = loadData();
  const idx = data.students.findIndex(s => s.id === student.id);
  if (idx >= 0) data.students[idx] = student;
  saveData(data);
  return data;
}

export function deleteStudent(studentId: string): AppData {
  const data = loadData();
  data.students = data.students.filter(s => s.id !== studentId);
  data.evaluations = data.evaluations.filter(e => e.studentId !== studentId);
  saveData(data);
  return data;
}

export function addEvaluation(evaluation: SessionEvaluation): AppData {
  const data = loadData();
  data.evaluations.push(evaluation);
  saveData(data);
  return data;
}

export function updateEvaluation(evaluation: SessionEvaluation): AppData {
  const data = loadData();
  const idx = data.evaluations.findIndex(e => e.id === evaluation.id);
  if (idx >= 0) data.evaluations[idx] = evaluation;
  saveData(data);
  return data;
}

export function deleteEvaluation(evalId: string): AppData {
  const data = loadData();
  data.evaluations = data.evaluations.filter(e => e.id !== evalId);
  saveData(data);
  return data;
}

export function exportToJSON(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

export function importFromJSON(jsonStr: string): AppData {
  const data = JSON.parse(jsonStr) as AppData;
  saveData(data);
  return data;
}
