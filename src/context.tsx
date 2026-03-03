import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppData, PreceptorProfile, StudentProfile, SessionEvaluation } from './types';
import {
  loadData, saveData, updatePreceptor as storeUpdatePreceptor,
  addStudent as storeAddStudent, updateStudent as storeUpdateStudent,
  deleteStudent as storeDeleteStudent, addEvaluation as storeAddEvaluation,
  updateEvaluation as storeUpdateEvaluation, deleteEvaluation as storeDeleteEvaluation,
  importFromJSON,
} from './store';

interface AppContextValue {
  data: AppData;
  updatePreceptor: (profile: PreceptorProfile) => void;
  addStudent: (student: StudentProfile) => void;
  updateStudent: (student: StudentProfile) => void;
  deleteStudent: (id: string) => void;
  addEvaluation: (evaluation: SessionEvaluation) => void;
  updateEvaluation: (evaluation: SessionEvaluation) => void;
  deleteEvaluation: (id: string) => void;
  importData: (json: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  const updatePreceptor = useCallback((profile: PreceptorProfile) => {
    setData(storeUpdatePreceptor(profile));
  }, []);

  const addStudent = useCallback((student: StudentProfile) => {
    setData(storeAddStudent(student));
  }, []);

  const updateStudent = useCallback((student: StudentProfile) => {
    setData(storeUpdateStudent(student));
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setData(storeDeleteStudent(id));
  }, []);

  const addEvaluation = useCallback((evaluation: SessionEvaluation) => {
    setData(storeAddEvaluation(evaluation));
  }, []);

  const updateEvaluation = useCallback((evaluation: SessionEvaluation) => {
    setData(storeUpdateEvaluation(evaluation));
  }, []);

  const deleteEvaluation = useCallback((id: string) => {
    setData(storeDeleteEvaluation(id));
  }, []);

  const importData = useCallback((json: string) => {
    try {
      setData(importFromJSON(json));
    } catch {
      alert('Failed to import data — the file may be corrupted or in the wrong format.');
    }
  }, []);

  return (
    <AppContext.Provider value={{
      data,
      updatePreceptor,
      addStudent,
      updateStudent,
      deleteStudent,
      addEvaluation,
      updateEvaluation,
      deleteEvaluation,
      importData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used inside AppProvider');
  return ctx;
}