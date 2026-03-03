import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppData, PreceptorProfile, StudentProfile, SessionEvaluation } from './types';
import { initGoogleAPI, loadFromGoogleDrive, saveToGoogleDrive } from './googleDrive';

const STORAGE_KEY = 'preceptor_eval_data';
const DRIVE_FILENAME = 'preceptor_evaluations.json';

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

type DriveStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface DriveState {
  status: DriveStatus;
  message: string;
  lastSyncedAt: string | null;
  connect: () => Promise<void>;
  reloadFromDrive: () => Promise<void>;
}

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

  // New: Drive sync surface
  drive: DriveState;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadCachedData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      ...DEFAULT_DATA,
      ...parsed,
      preceptor: { ...DEFAULT_DATA.preceptor, ...(parsed.preceptor || {}) },
      students: Array.isArray(parsed.students) ? parsed.students : [],
      evaluations: Array.isArray(parsed.evaluations) ? parsed.evaluations : [],
    };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function cacheData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage failures
  }
}

function mergeIntoAppData(input: unknown): AppData {
  const parsed = (input ?? {}) as Partial<AppData>;
  return {
    ...DEFAULT_DATA,
    ...parsed,
    preceptor: { ...DEFAULT_DATA.preceptor, ...(parsed.preceptor || {}) },
    students: Array.isArray(parsed.students) ? parsed.students : [],
    evaluations: Array.isArray(parsed.evaluations) ? parsed.evaluations : [],
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Lenient mode: start from local cache so app works immediately.
  const [data, setData] = useState<AppData>(() => loadCachedData());

  const [driveStatus, setDriveStatus] = useState<DriveStatus>('disconnected');
  const [driveMessage, setDriveMessage] = useState<string>('Not connected — changes won’t sync.');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const latestDataRef = useRef<AppData>(data);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    latestDataRef.current = data;
    cacheData(data);
  }, [data]);

  const scheduleDriveSave = useCallback(() => {
    if (driveStatus !== 'connected') return;

    if (saveTimerRef.current != null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(async () => {
      try {
        const json = JSON.stringify(latestDataRef.current, null, 2);
        await saveToGoogleDrive(json, DRIVE_FILENAME);
        setLastSyncedAt(new Date().toISOString());
        setDriveMessage('Synced to Google Drive.');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setDriveStatus('error');
        setDriveMessage(`Auto-save failed: ${message}`);
      }
    }, 1000);
  }, [driveStatus]);

  const reloadFromDrive = useCallback(async () => {
    if (driveStatus !== 'connected') return;

    setDriveMessage('Loading from Google Drive...');
    try {
      const json = await loadFromGoogleDrive(DRIVE_FILENAME);
      if (!json) {
        setDriveMessage('No saved data found on Google Drive yet.');
        return;
      }

      const merged = mergeIntoAppData(JSON.parse(json));
      setData(merged);
      setLastSyncedAt(new Date().toISOString());
      setDriveMessage('Loaded from Google Drive.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setDriveStatus('error');
      setDriveMessage(`Drive load failed: ${message}`);
    }
  }, [driveStatus]);

  const connect = useCallback(async () => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;

    if (!clientId || !clientId.trim()) {
      setDriveStatus('error');
      setDriveMessage('Missing VITE_GOOGLE_CLIENT_ID. Set it in your Pages build environment.');
      return;
    }

    setDriveStatus('connecting');
    setDriveMessage('Connecting to Google Drive...');
    try {
      const ok = await initGoogleAPI(clientId);
      if (!ok) {
        setDriveStatus('error');
        setDriveMessage('Google Drive connection failed. Check your OAuth client ID/config.');
        return;
      }

      setDriveStatus('connected');
      setDriveMessage('Connected. Loading from Google Drive...');
      await reloadFromDrive();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setDriveStatus('error');
      setDriveMessage(`Connection error: ${message}`);
    }
  }, [reloadFromDrive]);

  // ---- Mutators (same API as before) ----

  const updatePreceptor = useCallback((profile: PreceptorProfile) => {
    setData(prev => ({ ...prev, preceptor: profile }));
    scheduleDriveSave();
  }, [scheduleDriveSave]);

  const addStudent = useCallback((student: StudentProfile) => {
    setData(prev => ({ ...prev, students: [...prev.students, student] }));
    scheduleDriveSave();
  }, [scheduleDriveSave]);

  const updateStudent = useCallback((student: StudentProfile) => {
    setData(prev => {
      const idx = prev.students.findIndex(s => s.id === student.id);
      if (idx < 0) return prev;
      const students = prev.students.slice();
      students[idx] = student;
      return { ...prev, students };
    });
    scheduleDriveSave();
  }, [scheduleDriveSave]);

  const deleteStudent = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id),
      evaluations: prev.evaluations.filter(e => e.studentId !== id),
    }));
    scheduleDriveSave();
  }, [scheduleDriveSave]);

  const addEvaluation = useCallback((evaluation: SessionEvaluation) => {
    setData(prev => ({ ...prev, evaluations: [...prev.evaluations, evaluation] }));
    scheduleDriveSave();
  }, [scheduleDriveSave]);

  const updateEvaluation = useCallback((evaluation: SessionEvaluation) => {
    setData(prev => {
      const idx = prev.evaluations.findIndex(e => e.id === evaluation.id);
      if (idx < 0) return prev;
      const evaluations = prev.evaluations.slice();
      evaluations[idx] = evaluation;
      return { ...prev, evaluations };
    });
    scheduleDriveSave();
  }, [scheduleDriveSave]);

  const deleteEvaluation = useCallback((id: string) => {
    setData(prev => ({ ...prev, evaluations: prev.evaluations.filter(e => e.id !== id) }));
    scheduleDriveSave();
  }, [scheduleDriveSave]);

  const importData = useCallback((json: string) => {
    try {
      const merged = mergeIntoAppData(JSON.parse(json));
      setData(merged);
      scheduleDriveSave();
    } catch {
      alert('Failed to import data — the file may be corrupted or in the wrong format.');
    }
  }, [scheduleDriveSave]);

  const drive = useMemo<DriveState>(() => ({
    status: driveStatus,
    message: driveMessage,
    lastSyncedAt,
    connect,
    reloadFromDrive,
  }), [driveStatus, driveMessage, lastSyncedAt, connect, reloadFromDrive]);

  const value = useMemo<AppContextValue>(() => ({
    data,
    updatePreceptor,
    addStudent,
    updateStudent,
    deleteStudent,
    addEvaluation,
    updateEvaluation,
    deleteEvaluation,
    importData,
    drive,
  }), [
    data,
    updatePreceptor,
    addStudent,
    updateStudent,
    deleteStudent,
    addEvaluation,
    updateEvaluation,
    deleteEvaluation,
    importData,
    drive,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used inside AppProvider');
  return ctx;
}
