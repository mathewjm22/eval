import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppData, PreceptorProfile, StudentProfile, SessionEvaluation } from './types';
import * as store from './store';

interface AppContextType {
  data: AppData;
  refresh: () => void;
  updatePreceptor: (p: PreceptorProfile) => void;
  addStudent: (s: StudentProfile) => void;
  updateStudent: (s: StudentProfile) => void;
  deleteStudent: (id: string) => void;
  addEvaluation: (e: SessionEvaluation) => void;
  updateEvaluation: (e: SessionEvaluation) => void;
  deleteEvaluation: (id: string) => void;
  importData: (json: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => store.loadData());

  const refresh = useCallback(() => {
    setData(store.loadData());
  }, []);

  const updatePreceptor = useCallback((p: PreceptorProfile) => {
    setData(store.updatePreceptor(p));
  }, []);

  const addStudent = useCallback((s: StudentProfile) => {
    setData(store.addStudent(s));
  }, []);

  const updateStudent = useCallback((s: StudentProfile) => {
    setData(store.updateStudent(s));
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setData(store.deleteStudent(id));
  }, []);

  const addEvaluation = useCallback((e: SessionEvaluation) => {
    setData(store.addEvaluation(e));
  }, []);

  const updateEvaluation = useCallback((e: SessionEvaluation) => {
    setData(store.updateEvaluation(e));
  }, []);

  const deleteEvaluation = useCallback((id: string) => {
    setData(store.deleteEvaluation(id));
  }, []);

  const importData = useCallback((json: string) => {
    setData(store.importFromJSON(json));
  }, []);

  return (
    <AppContext.Provider
      value={{
        data,
        refresh,
        updatePreceptor,
        addStudent,
        updateStudent,
        deleteStudent,
        addEvaluation,
        updateEvaluation,
        deleteEvaluation,
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used within AppProvider');
  return ctx;
}
