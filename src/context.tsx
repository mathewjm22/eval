import React, { createContext, useContext, useEffect, useState } from 'react';
import { initGoogleAPI, saveToGoogleDrive, loadFromGoogleDrive } from './googleDrive';
import { AppData } from './types';

const AppDataContext = createContext<AppData | undefined>(undefined);

export const AppProvider: React.FC = ({ children }) => {
    const [appData, setAppData] = useState<AppData | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const connectToGoogleDrive = async () => {
        await initGoogleAPI(import.meta.env.VITE_GOOGLE_CLIENT_ID);
        setIsConnected(true);
        // Load preceptor_evaluations.json after connecting
        autoLoadData();
    };

    const autoLoadData = async () => {
        const data = await loadFromGoogleDrive('preceptor_evaluations.json');
        setAppData(data);
    };

    useEffect(() => {
        const loadFromLocalStorage = () => {
            const data = localStorage.getItem('preceptor_evaluations');
            if (data) setAppData(JSON.parse(data));
        };
        if (!isConnected) loadFromLocalStorage();
    }, [isConnected]);

    const debouncedSave = (callback: () => void, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(callback, delay);
        };
    };

    const saveData = () => {
        if (isConnected && appData) {
            saveToGoogleDrive('preceptor_evaluations.json', appData);
        }
    };

    const updatePreceptor = (newData: any) => {
        setAppData((prev) => ({ ...prev, preceptors: newData }));
        debouncedSave(saveData, 1000)();
    };

    const addStudent = (student: any) => {
        setAppData((prev) => ({ ...prev, students: [...prev.students, student] }));
        debouncedSave(saveData, 1000)();
    };

    const updateStudent = (studentId: string, updatedData: any) => {
        setAppData((prev) => ({
            ...prev,
            students: prev.students.map((student) => 
                student.id === studentId ? { ...student, ...updatedData } : student
            )
        }));
        debouncedSave(saveData, 1000)();
    };

    const deleteStudent = (studentId: string) => {
        setAppData((prev) => ({ 
            ...prev,
            students: prev.students.filter(student => student.id !== studentId)
        }));
        debouncedSave(saveData, 1000)();
    }; 

    const addEvaluation = (evaluation: any) => {
        setAppData((prev) => ({ ...prev, evaluations: [...prev.evaluations, evaluation]}));
        debouncedSave(saveData, 1000)();
    };

    const updateEvaluation = (evaluationId: string, updatedData: any) => {
        setAppData((prev) => ({
            ...prev,
            evaluations: prev.evaluations.map(evaluation => 
                evaluation.id === evaluationId ? { ...evaluation, ...updatedData } : evaluation
            )
        }));
        debouncedSave(saveData, 1000)();
    };

    const deleteEvaluation = (evaluationId: string) => {
        setAppData((prev) => ({
            ...prev,
            evaluations: prev.evaluations.filter(evaluation => evaluation.id !== evaluationId)
        }));
        debouncedSave(saveData, 1000)();
    };

    const importData = (data: any) => {
        setAppData(data);
        debouncedSave(saveData, 1000)();
    };

    return (
        <AppDataContext.Provider value={{
            appData,
            updatePreceptor,
            addStudent,
            updateStudent,
            deleteStudent,
            addEvaluation,
            updateEvaluation,
            deleteEvaluation,
            importData,
            connectToGoogleDrive,
            isConnected
        }}> 
            {children} 
        </AppDataContext.Provider>
    );
};

export const useAppData = () => {
    const context = useContext(AppDataContext);
    if (context === undefined) {
        throw new Error('useAppData must be used within an AppProvider');
    }
    return context;
};