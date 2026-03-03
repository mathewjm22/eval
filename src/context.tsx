import React, { createContext, useContext, useEffect, useState } from 'react';

const DriveContext = createContext();

const DriveProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const [driveStatus, setDriveStatus] = useState({ connected: false, message: '' });
    const debounceTimeoutRef = useRef(null);

    const updatePreceptor = (preceptor) => {
        const updatedData = { ...data, preceptor };
        handleDataUpdate(updatedData);
    };

    const addStudent = (student) => {
        const updatedData = { ...data, students: [...data.students, student] };
        handleDataUpdate(updatedData);
    };

    const updateStudent = (studentId, updatedInfo) => {
        const updatedData = { ...data, students: data.students.map(student => student.id === studentId ? { ...student, ...updatedInfo } : student) };
        handleDataUpdate(updatedData);
    };

    const deleteStudent = (studentId) => {
        const updatedData = { ...data, students: data.students.filter(student => student.id !== studentId) };
        handleDataUpdate(updatedData);
    };

    const addEvaluation = (evaluation) => {
        const updatedData = { ...data, evaluations: [...data.evaluations, evaluation] };
        handleDataUpdate(updatedData);
    };

    const updateEvaluation = (evaluationId, updatedInfo) => {
        const updatedData = { ...data, evaluations: data.evaluations.map(evaluation => evaluation.id === evaluationId ? { ...evaluation, ...updatedInfo } : evaluation) };
        handleDataUpdate(updatedData);
    };

    const deleteEvaluation = (evaluationId) => {
        const updatedData = { ...data, evaluations: data.evaluations.filter(evaluation => evaluation.id !== evaluationId) };
        handleDataUpdate(updatedData);
    };

    const importData = (importedData) => {
        setData(importedData);
    };

    const handleDataUpdate = (updatedData) => {
        setData(updatedData);
        if (!driveStatus.connected) {
            localStorage.setItem('preceptor_eval_data', JSON.stringify(updatedData));
        }
        scheduleSave(updatedData);
    };

    const scheduleSave = (updatedData) => {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => {
            if (driveStatus.connected) {
                saveToGoogleDrive(JSON.stringify(updatedData, null, 2), 'preceptor_evaluations.json');
            }
        }, 2000);
    };

    const drive = {
        connect: () => {
            // Implement Google Drive connection
            // Update driveStatus accordingly
            setDriveStatus({ connected: true, message: 'Connected to Google Drive' });
            autoLoadData();
        },
        status: () => driveStatus,
        message: () => driveStatus.message,
    };

    const autoLoadData = () => {
        // Auto-load from Google Drive if needed
    };

    useEffect(() => {
        // Load initial data from localStorage if any
        const cachedData = localStorage.getItem('preceptor_eval_data');
        if (cachedData) {
            setData(JSON.parse(cachedData));
        }
    }, []);

    return (
        <DriveContext.Provider value={{ data, updatePreceptor, addStudent, updateStudent, deleteStudent, addEvaluation, updateEvaluation, deleteEvaluation, importData, drive }}>
            {children}
        </DriveContext.Provider>
    );
};

const useDrive = () => useContext(DriveContext);

export { DriveProvider, useDrive };
