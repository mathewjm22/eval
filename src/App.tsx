import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { EvaluateSession } from './pages/EvaluateSession';
import { EvaluationsList } from './pages/EvaluationsList';
import { ProgressView } from './pages/ProgressView';
import { Settings } from './pages/Settings';
import { ThemeProvider } from "./theme"; // <-- add

export function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/evaluate" element={<EvaluateSession />} />
            <Route path="/evaluations" element={<EvaluationsList />} />
            <Route path="/evaluations/:id" element={<EvaluateSession />} />
            <Route path="/progress" element={<ProgressView />} />
            <Route path="/settings" element={<Settings />} />
            {/* Fallback route */}
            <Route path="*" element={<Dashboard />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
