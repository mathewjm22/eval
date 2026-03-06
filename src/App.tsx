import React from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppProvider } from "./context";
import { Layout } from "./components/Layout";
import { PageWrapper } from "./components/PageWrapper";
import { Dashboard } from "./pages/Dashboard";
import { Students } from "./pages/Students";
import { EvaluateSession } from "./pages/EvaluateSession";
import { EvaluationsList } from "./pages/EvaluationsList";
import { ProgressView } from "./pages/ProgressView";
import { Settings } from "./pages/Settings";
import { ThemeProvider } from "./theme";
import { EvaluationCalendar } from "./pages/EvaluationCalendar";
import { RotationSummary } from "./pages/RotationSummary"; // NEW

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/students" element={<PageWrapper><Students /></PageWrapper>} />
        <Route path="/evaluate" element={<PageWrapper><EvaluateSession /></PageWrapper>} />
        <Route path="/evaluations" element={<PageWrapper><EvaluationsList /></PageWrapper>} />
        <Route path="/evaluations/:id" element={<PageWrapper><EvaluateSession /></PageWrapper>} />
        <Route path="/progress" element={<PageWrapper><ProgressView /></PageWrapper>} />
        <Route path="/calendar" element={<PageWrapper><EvaluationCalendar /></PageWrapper>} />
        <Route path="/summary/:studentId" element={<PageWrapper><RotationSummary /></PageWrapper>} /> {/* NEW */}
        <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><Dashboard /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <HashRouter>
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </HashRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
