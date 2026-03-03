import React, { Component, ErrorInfo, ReactNode } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { EvaluateSession } from './pages/EvaluateSession';
import { EvaluationsList } from './pages/EvaluationsList';
import { ProgressView } from './pages/ProgressView';
import { Settings } from './pages/Settings';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/evaluate" element={<EvaluateSession />} />
              <Route path="/evaluate/:id" element={<EvaluateSession />} />
              <Route path="/evaluations" element={<EvaluationsList />} />
              <Route path="/evaluations/:id" element={<EvaluationsList />} />
              <Route path="/progress" element={<ProgressView />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </AppProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}
