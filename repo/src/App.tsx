import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  TrendingUp,
  GraduationCap,
  Plus,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { cn } from './utils/cn';
import { Student, Evaluation } from './types';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-900 min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <pre className="bg-white p-4 rounded border border-red-200 max-w-full overflow-auto text-xs">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Alex Johnson', grade: '10th', email: 'alex.j@example.com' },
  { id: '2', name: 'Sarah Miller', grade: '11th', email: 'sarah.m@example.com' },
];

const INITIAL_EVALUATIONS: Evaluation[] = [
  { id: 'e1', studentId: '1', date: '2024-02-15', subject: 'Mathematics', score: 85, notes: 'Good understanding.' },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'evaluations'>('dashboard');
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch (e) {
      return INITIAL_STUDENTS;
    }
  });
  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    try {
      const saved = localStorage.getItem('evaluations');
      return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
    } catch (e) {
      return INITIAL_EVALUATIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 text-emerald-600">
          <GraduationCap className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tight text-zinc-900">EduTrack</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<Users className="w-5 h-5" />} 
            label="Students" 
            active={activeTab === 'students'} 
            onClick={() => setActiveTab('students')} 
          />
          <NavItem 
            icon={<ClipboardCheck className="w-5 h-5" />} 
            label="Evaluations" 
            active={activeTab === 'evaluations'} 
            onClick={() => setActiveTab('evaluations')} 
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-zinc-900">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Students" value={students.length} icon={<Users className="text-blue-600" />} />
                <StatCard title="Evaluations" value={evaluations.length} icon={<ClipboardCheck className="text-purple-600" />} />
                <StatCard title="Avg Score" value="85%" icon={<TrendingUp className="text-emerald-600" />} />
              </div>
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div 
              key="students"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zinc-900">Students</h2>
                <button 
                  onClick={() => {
                    const name = prompt('Name?');
                    if (name) setStudents([...students, { id: uuidv4(), name, grade: '10th', email: '' }]);
                  }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Student
                </button>
              </div>
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Grade</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {students.map(s => (
                      <tr key={s.id}>
                        <td className="px-6 py-4 text-sm font-medium">{s.name}</td>
                        <td className="px-6 py-4 text-sm text-zinc-600">{s.grade}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => setStudents(students.filter(x => x.id !== s.id))} className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'evaluations' && (
            <motion.div 
              key="evaluations"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-zinc-900">Evaluations</h2>
              <div className="bg-white p-6 rounded-xl border border-zinc-200">
                <p className="text-zinc-500">Evaluation history and form will appear here.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
        active ? "bg-emerald-50 text-emerald-700" : "text-zinc-500 hover:bg-zinc-50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-zinc-50 rounded-lg">{icon}</div>
      </div>
      <p className="text-xs font-medium text-zinc-500 mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-zinc-900">{value}</h4>
    </div>
  );
}
