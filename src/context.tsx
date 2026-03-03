import React, { useEffect, useState } from 'react';
import { google } from 'googleapis';
import { debounce } from 'lodash';

const AppDataContext = React.createContext();

const AppDataProvider = ({ children }) => {
    const [appData, setAppData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load AppData from Google Drive after authentication
    const loadAppData = async () => {
        if (!isAuthenticated) return;
        const { data } = await google.drive('v3').files.list({
            q: "name='preceptor_evaluations.json'",
            fields: 'files(id, name)'
        });
        // Add logic to read file and set appData
    };

    // Debounced auto save function
    const saveAppData = debounce(async (data) => {
        if (isAuthenticated) {
            // Add save logic here
        }
    }, 1000);

    const handleDataChange = (data) => {
        setAppData(data);
        saveAppData(data);
    };

    const ensureAuthenticated = async (clientId) => {
        // OAuth logic here
        setIsAuthenticated(true);
        loadAppData();
    };

    useEffect(() => {
        // Add logic to get client ID from environment variables and authenticate
    }, []);

    return (
        <AppDataContext.Provider value={{ appData, handleDataChange }}>
            {children}
        </AppDataContext.Provider>
    );
};

export { AppDataContext, AppDataProvider, ensureAuthenticated, isAuthenticated };