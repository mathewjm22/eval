export interface Student {
  id: string;
  name: string;
  grade: string;
  email: string;
}

export interface Evaluation {
  id: string;
  studentId: string;
  date: string;
  subject: string;
  score: number;
  notes: string;
}

export interface AppState {
  students: Student[];
  evaluations: Evaluation[];
}
