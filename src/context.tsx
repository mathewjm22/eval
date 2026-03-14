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

function mergeIntoAppData(input: unknown, currentData: AppData): AppData {
  const parsed = (input ?? {}) as Partial<AppData>;
  const remotePreceptor = { ...DEFAULT_DATA.preceptor, ...(parsed.preceptor || {}) };
  const remoteStudents = Array.isArray(parsed.students) ? parsed.students : [];
  const remoteEvaluations = Array.isArray(parsed.evaluations) ? parsed.evaluations : [];

  // Merge Preceptor
  const isLocalPreceptorBlank =
    !currentData.preceptor.name &&
    !currentData.preceptor.title &&
    !currentData.preceptor.institution &&
    !currentData.preceptor.specialty &&
    !currentData.preceptor.email;

  const mergedPreceptor = isLocalPreceptorBlank ? remotePreceptor : currentData.preceptor;

  // Merge Students
  const mergedStudents = [...currentData.students];
  const idMapping: Record<string, string> = {}; // old remote ID -> new assigned ID

  remoteStudents.forEach((remoteStudent) => {
    const existingLocal = mergedStudents.find((s) => s.id === remoteStudent.id);

    if (!existingLocal) {
      // No ID collision, add as new
      mergedStudents.push(remoteStudent);
    } else if (existingLocal.name === remoteStudent.name) {
      // ID collision AND same name: keep local version (already in mergedStudents)
      // We could also merge fields here, but keeping local is fine per user request
    } else {
      // ID collision BUT different name: generate new ID for remote student
      const newId = crypto.randomUUID();
      idMapping[remoteStudent.id] = newId;
      mergedStudents.push({ ...remoteStudent, id: newId });
    }
  });

  // Merge Evaluations
  const mergedEvaluations = [...currentData.evaluations];

  remoteEvaluations.forEach((remoteEval) => {
    // Update studentId if the remote student was given a new ID
    const studentIdToUse = idMapping[remoteEval.studentId] || remoteEval.studentId;
    const mappedEval = { ...remoteEval, studentId: studentIdToUse };

    const existingLocal = mergedEvaluations.find((e) => e.id === mappedEval.id);

    if (!existingLocal) {
      // No ID collision, add as new
      mergedEvaluations.push(mappedEval);
    } else {
      // ID collision: check if content is exactly the same
      // Create copies without 'id' to compare content
      const { id: _idLocal, ...localContent } = existingLocal;
      const { id: _idRemote, ...remoteContent } = mappedEval;

      if (JSON.stringify(localContent) === JSON.stringify(remoteContent)) {
        // Content is exactly the same, ignore the duplicate (already in mergedEvaluations)
      } else {
        // Content is different, generate new ID for the incoming evaluation
        mergedEvaluations.push({ ...mappedEval, id: crypto.randomUUID() });
      }
    }
  });

  return {
    ...DEFAULT_DATA,
    ...parsed, // to pick up 'version' or other top-level fields
    preceptor: mergedPreceptor,
    students: mergedStudents,
    evaluations: mergedEvaluations,
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
  // Keep a ref that always holds the current driveStatus so async callbacks
  // (like scheduleDriveSave and reloadFromDrive) never read a stale closure value.
  const driveStatusRef = useRef<DriveStatus>('disconnected');

  useEffect(() => {
    latestDataRef.current = data;
    cacheData(data);
  }, [data]);

  // Helper that updates both React state AND the ref atomically so every
  // subsequent access – including inside pending async callbacks – sees the
  // correct value without waiting for a re-render.
  const setDriveStatusSync = useCallback((status: DriveStatus) => {
    driveStatusRef.current = status;
    setDriveStatus(status);
  }, []);

  const scheduleDriveSave = useCallback(() => {
    // Use the ref so this callback never reads a stale driveStatus value even
    // when it was closed-over before the most recent setDriveStatus call.
    if (driveStatusRef.current !== 'connected') return;

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
        if (message.includes('expired') || message.includes('authenticate')) {
          setDriveStatusSync('disconnected');
          setDriveMessage('Session expired. Please reconnect to Google Drive.');
        } else {
          setDriveStatusSync('error');
          setDriveMessage(`Auto-save failed: ${message}`);
        }
      }
    }, 1000);
  }, [setDriveStatusSync]);

  const reloadFromDrive = useCallback(async () => {
    // Guard with the ref, not driveStatus state, so this works correctly even
    // when called immediately after setDriveStatus('connected') inside connect()
    // before React has re-rendered with the new status value.
    if (driveStatusRef.current !== 'connected') return;

    setDriveMessage('Loading from Google Drive...');
    try {
      const json = await loadFromGoogleDrive(DRIVE_FILENAME);
      if (!json) {
        setDriveMessage('No saved data found on Google Drive yet.');
        return;
      }

      const merged = mergeIntoAppData(JSON.parse(json), latestDataRef.current);
      // Update the ref before scheduling the save so the timer captures the
      // latest merged data even before the React re-render flushes.
      latestDataRef.current = merged;
      setData(merged);
      setLastSyncedAt(new Date().toISOString());
      setDriveMessage('Loaded from Google Drive.');
      // Push merged result (which may include local-only data not yet on Drive)
      // back to Drive so both sides stay in sync.
      scheduleDriveSave();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('expired') || message.includes('authenticate')) {
        setDriveStatusSync('disconnected');
        setDriveMessage('Session expired. Please reconnect to Google Drive.');
      } else {
        setDriveStatusSync('error');
        setDriveMessage(`Drive load failed: ${message}`);
      }
    }
  }, [scheduleDriveSave, setDriveStatusSync]);

  const connect = useCallback(async () => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;

    if (!clientId || !clientId.trim()) {
      setDriveStatusSync('error');
      setDriveMessage('Missing VITE_GOOGLE_CLIENT_ID. Set it in your Pages build environment.');
      return;
    }

    setDriveStatusSync('connecting');
    setDriveMessage('Connecting to Google Drive...');
    try {
      const ok = await initGoogleAPI(clientId);
      if (!ok) {
        setDriveStatusSync('error');
        setDriveMessage('Google Drive connection failed. Check your OAuth client ID/config.');
        return;
      }

      // Update the ref BEFORE calling reloadFromDrive so its internal guard
      // (driveStatusRef.current !== 'connected') passes immediately, without
      // waiting for React to re-render with the new driveStatus state value.
      setDriveStatusSync('connected');
      setDriveMessage('Connected. Loading from Google Drive...');
      await reloadFromDrive();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setDriveStatusSync('error');
      setDriveMessage(`Connection error: ${message}`);
    }
  }, [reloadFromDrive, setDriveStatusSync]);

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
      const merged = mergeIntoAppData(JSON.parse(json), latestDataRef.current);
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
