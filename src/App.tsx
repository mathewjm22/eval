import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Students } from "./pages/Students";
import { EvaluateSession } from "./pages/EvaluateSession";
import { EvaluationsList } from "./pages/EvaluationsList";
import { ProgressView } from "./pages/ProgressView";
import { Settings } from "./pages/Settings";
import { ThemeProvider } from "./theme";
import { EvaluationCalendar } from "./pages/EvaluationCalendar";
import { RotationSummary } from "./pages/RotationSummary"; // NEW

export function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/evaluate" element={<EvaluateSession />} />
              <Route path="/evaluations" element={<EvaluationsList />} />
              <Route path="/evaluations/:id" element={<EvaluateSession />} />
              <Route path="/progress" element={<ProgressView />} />
              <Route path="/calendar" element={<EvaluationCalendar />} />
              <Route path="/summary/:studentId" element={<RotationSummary />} /> {/* NEW */}
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Layout>
        </HashRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
