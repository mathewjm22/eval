I will implement both features for you.

### **Feature 1: Google Drive Integration (Default ID)**
I will update `Settings.tsx` to automatically use your Google Client ID. This means you (and anyone else using your deployed app) won't need to look it up or paste it in manually.

### **Feature 2: Visual Analytics (Performance Charts)**
I will update `ProgressView.tsx` to include a **Line Chart** that visualizes the student's performance trend over time.

**Prerequisite:**
You need to install the charting library. In your terminal, run:
```bash
npm install recharts
```

---

### **File Updates**

Here are the two files you need to replace.

#### **1. Update `src/pages/Settings.tsx`**
This sets your Google Client ID as the default and handles the connection logic.

```typescript
import { useState } from 'react';
import { useAppData } from '../context';
import { PreceptorProfile } from '../types';
import { exportToJSON } from '../store';
import { downloadAsFile, uploadFromFile, initGoogleAPI, saveToGoogleDrive, loadFromGoogleDrive } from '../googleDrive';

// Your provided Google Client ID
const DEFAULT_GOOGLE_CLIENT_ID = "1047921307956-bbtpdhhigflsn6aoa5geu7rqvq7h03qj.apps.googleusercontent.com";

export function Settings() {
  const { data, updatePreceptor, importData } = useAppData();
  const [profile, setProfile] = useState<PreceptorProfile>({ ...data.preceptor });
  const [profileSaved, setProfileSaved] = useState(false);
  
  // Use default ID if nothing in local storage
  const [gdClientId, setGdClientId] = useState(() => localStorage.getItem('gd_client_id') || DEFAULT_GOOGLE_CLIENT_ID);
  
  const [gdStatus, setGdStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [gdMessage, setGdMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  const handleSaveProfile = () => {
    updatePreceptor(profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleDownload = () => {
    const json = exportToJSON();
    const date = new Date().toISOString().split('T')[0];
    downloadAsFile(json, `preceptor_evaluations_${date}.json`);
  };

  const handleUpload = async () => {
    try {
      const json = await uploadFromFile();
      importData(json);
      setSaveStatus('Data imported successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      setSaveStatus('Failed to import data.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleConnectGoogleDrive = async () => {
    const clientIdToUse = gdClientId.trim();
    if (!clientIdToUse) {
      setGdMessage('Please enter a Google Cloud Client ID');
      return;
    }
    localStorage.setItem('gd_client_id', clientIdToUse);
    setGdStatus('loading');
    try {
      const ok = await initGoogleAPI(clientIdToUse);
      if (ok) {
        setGdStatus('connected');
        setGdMessage('Connected to Google Drive!');
      } else {
        setGdStatus('error');
        setGdMessage('Failed to connect. Check your Client ID.');
      }
    } catch {
      setGdStatus('error');
      setGdMessage('Connection error.');
    }
  };

  const handleSaveToGDrive = async () => {
    setSaveStatus('Saving to Google Drive...');
    try {
      const json = exportToJSON();
      await saveToGoogleDrive(json, 'preceptor_evaluations.json');
      setSaveStatus('Saved to Google Drive! ✅');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setSaveStatus(`Error: ${message}`);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  const handleLoadFromGDrive = async () => {
    setSaveStatus('Loading from Google Drive...');
    try {
      const json = await loadFromGoogleDrive('preceptor_evaluations.json');
      if (json) {
        importData(json);
        setSaveStatus('Loaded from Google Drive! ✅');
      } else {
        setSaveStatus('No saved data found on Google Drive.');
      }
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setSaveStatus(`Error: ${message}`);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('⚠️ Are you sure you want to delete ALL data? This cannot be undone! Download a backup first.')) {
      localStorage.removeItem('preceptor_eval_data');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">⚙️ Settings</h2>
        <p className="text-sm text-slate-400 mt-1">Configure your profile and data management</p>
      </div>

      {/* Preceptor Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-lg mb-4">🩺 Preceptor Profile</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                placeholder="Dr. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={profile.title}
                onChange={e => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                placeholder="Assistant Professor of Medicine"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Institution</label>
              <input
                type="text"
                value={profile.institution}
                onChange={e => setProfile({ ...profile, institution: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                placeholder="University Medical Center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
              <input
                type="text"
                value={profile.specialty}
                onChange={e => setProfile({ ...profile, specialty: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                placeholder="Family Medicine"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="preceptor@university.edu"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
          >
            {profileSaved ? '✅ Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Local File Backup */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-lg mb-2">💾 Local File Backup</h3>
        <p className="text-sm text-slate-400 mb-4">
          Download your data as a JSON file or import a previously saved backup.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownload}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
          >
            ⬇️ Download Backup
          </button>
          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
          >
            ⬆️ Import from File
          </button>
        </div>
      </div>

      {/* Google Drive */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-lg mb-2">☁️ Google Drive Sync</h3>
        <p className="text-sm text-slate-400 mb-4">
          Save and load your evaluations to/from Google Drive.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Google Cloud Client ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={gdClientId}
                onChange={e => setGdClientId(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                placeholder="your-client-id.apps.googleusercontent.com"
              />
              <button
                onClick={handleConnectGoogleDrive}
                disabled={gdStatus === 'loading'}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0"
              >
                {gdStatus === 'loading' ? '...' : gdStatus === 'connected' ? '✅ Connected' : 'Connect'}
              </button>
            </div>
            {gdMessage && (
              <p className={`text-xs mt-1.5 ${gdStatus === 'connected' ? 'text-emerald-600' : 'text-red-500'}`}>
                {gdMessage}
              </p>
            )}
          </div>

          {gdStatus === 'connected' && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveToGDrive}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
              >
                ☁️ Save to Google Drive
              </button>
              <button
                onClick={handleLoadFromGDrive}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
              >
                📥 Load from Google Drive
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      {saveStatus && (
        <div className={`rounded-xl p-4 text-sm font-medium ${
          saveStatus.includes('✅') || saveStatus.includes('success')
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : saveStatus.includes('Error') || saveStatus.includes('Failed')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {saveStatus}
        </div>
      )}

      {/* Data Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-lg mb-4">📊 Data Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-indigo-600">{data.students.length}</p>
            <p className="text-xs text-slate-400">Students</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-indigo-600">{data.evaluations.length}</p>
            <p className="text-xs text-slate-400">Evaluations</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-indigo-600">
              {(JSON.stringify(data).length / 1024).toFixed(1)} KB
            </p>
            <p className="text-xs text-slate-400">Data Size</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
        <h3 className="font-bold text-red-700 text-lg mb-2">⚠️ Danger Zone</h3>
        <p className="text-sm text-slate-400 mb-4">This action cannot be undone. Make sure to download a backup first.</p>
        <button
          onClick={handleClearAllData}
          className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-red-700 transition-colors"
        >
          🗑️ Clear All Data
        </button>
      </div>
    </div>
  );
}
```

#### **2. Update `src/pages/ProgressView.tsx`**
This adds the performance trend chart using `recharts`.

```typescript
import { useState, useMemo } from 'react';
import { useAppData } from '../context';
import { PHASE_CONFIG, Phase, SCORE_CATEGORIES, SCORE_LABELS, PREPOPULATED_CONDITIONS, TEACHING_TOPIC_CATEGORIES, CLINICAL_OBJECTIVES, CLINICAL_OBJECTIVES_V2, expectationId, TOTAL_OBJECTIVE_EXPECTATIONS, CLINICAL_SKILLS, ClinicalSkillRating } from '../types';
// Import Recharts components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function ProgressView() {
  const { data, updateStudent } = useAppData();
  const [selectedStudent, setSelectedStudent] = useState<string>(data.students[0]?.id || '');

  const studentEvals = useMemo(() => {
    return [...data.evaluations]
      .filter(e => e.studentId === selectedStudent)
      .sort((a, b) => a.weekNumber - b.weekNumber);
  }, [data.evaluations, selectedStudent]);

  const phaseEvals = (phase: Phase) => studentEvals.filter(e => e.phase === phase);

  const phaseAverages = (phase: Phase) => {
    const evals = phaseEvals(phase);
    if (evals.length === 0) return null;

    const result: Record<string, number> = {};
    SCORE_CATEGORIES.forEach(cat => {
      result[cat.key] = evals.reduce((s, e) => s + e.scores[cat.key], 0) / evals.length;
    });
    result['overall'] = evals.reduce((s, e) => s + e.overallRating, 0) / evals.length;
    return result;
  };

  const student = data.students.find(s => s.id === selectedStudent);

  // Calculate trend data
  const trendData = useMemo(() => {
    if (studentEvals.length < 2) return null;
    const first = studentEvals[0];
    const last = studentEvals[studentEvals.length - 1];
    const firstAvg = Object.values(first.scores).reduce((a, b) => a + b, 0) / Object.values(first.scores).length;
    const lastAvg = Object.values(last.scores).reduce((a, b) => a + b, 0) / Object.values(last.scores).length;
    return {
      change: lastAvg - firstAvg,
      firstAvg,
      lastAvg,
      sessions: studentEvals.length,
    };
  }, [studentEvals]);

  // Prepare Data for Chart
  const chartData = useMemo(() => {
    return studentEvals.map(ev => {
      const avg = Object.values(ev.scores).reduce((a, b) => a + b, 0) / Object.values(ev.scores).length;
      return {
        name: `W${ev.weekNumber}`,
        date: ev.date,
        'Average Score': parseFloat(avg.toFixed(2)),
        'Overall Rating': ev.overallRating,
      };
    });
  }, [studentEvals]);

  // Conditions tracking for selected student
  const allConditionsSeen = useMemo(() => {
    return new Set(studentEvals.flatMap(e => [...(e.conditionsSeen || []), ...(e.customConditions || [])]));
  }, [studentEvals]);

  // Teaching topics for selected student
  const allTeachingTopics = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    studentEvals.forEach(e => {
      (e.teachingTopics || []).forEach(({ category, topics }) => {
        if (!map[category]) map[category] = new Set();
        topics.forEach(t => map[category].add(t));
      });
    });
    return map;
  }, [studentEvals]);

  // Objectives achieved for selected student across all evals
  const allObjectivesAchieved = useMemo(() => {
    return new Set(studentEvals.flatMap(e => e.objectivesAchieved || []));
  }, [studentEvals]);

  // For each objective, which eval(s) first achieved it
  const objectiveFirstSession = useMemo(() => {
    const result: Record<string, string> = {};
    studentEvals.forEach(e => {
      (e.objectivesAchieved || []).forEach(i => {
        const key = String(i);
        if (!(key in result)) {
          result[key] = e.date;
        }
      });
    });
    return result;
  }, [studentEvals]);

  // Clinical skill scores for selected student
  const clinicalSkillScores = useMemo(() => {
    return student?.clinicalSkillScores || [];
  }, [student]);

  const getSkillRating = (skillId: string): ClinicalSkillRating | undefined => {
    return clinicalSkillScores.find(s => s.skillId === skillId)?.rating;
  };

  const toggleSkillRating = (skillId: string) => {
    if (!student) return;
    const current = student.clinicalSkillScores || [];
    const existing = current.find(s => s.skillId === skillId);
    let updated;
    if (!existing || existing.rating === 'not-yet') {
      updated = current.filter(s => s.skillId !== skillId).concat({
        skillId,
        rating: 'demonstrating' as ClinicalSkillRating,
        date: new Date().toISOString().split('T')[0],
      });
    } else {
      updated = current.filter(s => s.skillId !== skillId).concat({
        skillId,
        rating: 'not-yet' as ClinicalSkillRating,
        date: new Date().toISOString().split('T')[0],
      });
    }
    updateStudent({ ...student, clinicalSkillScores: updated });
  };

  if (data.students.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">📈</div>
          <h3 className="text-lg font-semibold text-slate-700">No Students Yet</h3>
          <p className="text-sm text-slate-400 mt-2">Add students and evaluations to see progress data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">📈 Student Progress</h2>
          <p className="text-sm text-slate-400 mt-1">Track growth through Early, Middle, and Final phases</p>
        </div>
        <select
          value={selectedStudent}
          onChange={e => setSelectedStudent(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
        >
          {data.students.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Student Summary Card */}
      {student && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold">{student.name}</h3>
              <p className="text-indigo-200 text-sm">{student.program} • {student.yearLevel} • Started {student.startDate}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{studentEvals.length}</p>
              <p className="text-xs text-indigo-100">Sessions</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{phaseEvals('early').length}</p>
              <p className="text-xs text-indigo-100">Early Phase</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{phaseEvals('middle').length}</p>
              <p className="text-xs text-indigo-100">Middle Phase</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{phaseEvals('final').length}</p>
              <p className="text-xs text-indigo-100">Final Phase</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Trend Chart */}
      {studentEvals.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-4">📊 Performance Trend</h3>
          {chartData.length > 1 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" />
                  <YAxis domain={[1, 5]} tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}
                    itemStyle={{ color: '#334155' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Average Score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Overall Rating" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-slate-400 text-sm py-8">Need at least 2 sessions to generate a trend chart.</p>
          )}
        </div>
      )}

      {/* Trend Summary */}
      {trendData && (
        <div className={`rounded-xl border p-5 ${
          trendData.change > 0 ? 'bg-emerald-50 border-emerald-200' : trendData.change < 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{trendData.change > 0 ? '📈' : trendData.change < 0 ? '📉' : '➡️'}</span>
            <div>
              <p className={`font-bold text-lg ${
                trendData.change > 0 ? 'text-emerald-700' : trendData.change < 0 ? 'text-red-700' : 'text-slate-700'
              }`}>
                {trendData.change > 0 ? '+' : ''}{trendData.change.toFixed(2)} average score change
              </p>
              <p className="text-sm text-slate-500">
                From {trendData.firstAvg.toFixed(1)} → {trendData.lastAvg.toFixed(1)} across {trendData.sessions} sessions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Phase-by-Phase Comparison */}
      <div className="space-y-6">
        {(['early', 'middle', 'final'] as Phase[]).map((phase) => {
          const config = PHASE_CONFIG[phase];
          const evals = phaseEvals(phase);
          const avgs = phaseAverages(phase);

          return (
            <div key={phase} className={`bg-white rounded-2xl border ${config.borderColor} shadow-sm overflow-hidden`}>
              <div className={`px-6 py-4 ${config.bgColor} border-b ${config.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-bold ${config.color}`}>{config.label}</h3>
                    <p className="text-sm text-slate-500">{config.weeks} • {evals.length} session{evals.length !== 1 ? 's' : ''}</p>
                  </div>
                  {avgs && (
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${config.color}`}>{avgs['overall'].toFixed(1)}</p>
                      <p className="text-xs text-slate-400">Avg Overall</p>
                    </div>
                  )}
                </div>
              </div>

              {evals.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No evaluations in this phase yet.
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Category bars */}
                  <div className="space-y-3">
                    {SCORE_CATEGORIES.map(cat => {
                      const avg = avgs![cat.key];
                      return (
                        <div key={cat.key} className="flex items-center gap-3">
                          <div className="w-44 sm:w-52 shrink-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{cat.label}</p>
                          </div>
                          <div className="flex-1 bg-slate-100 rounded-full h-3 relative">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                avg < 2 ? 'bg-red-400' : avg < 3 ? 'bg-orange-400' : avg < 4 ? 'bg-yellow-400' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${(avg / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-600 w-10 text-right">{avg.toFixed(1)}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Individual session list */}
                  <div>
                    <h4 className="font-semibold text-slate-700 text-sm mb-3">Session Details</h4>
                    <div className="space-y-2">
                      {evals.map(ev => {
                        const avg = (Object.values(ev.scores).reduce((a, b) => a + b, 0) / Object.values(ev.scores).length).toFixed(1);
                        return (
                          <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-sm">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-indigo-600 w-8">W{ev.weekNumber}</span>
                              <span className="text-slate-600">{ev.date}</span>
                              <span className="hidden sm:inline text-slate-400">• {ev.sessionType}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500">Avg: {avg}</span>
                              <span className={`font-bold ${
                                ev.overallRating >= 4 ? 'text-emerald-600' : ev.overallRating >= 3 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {SCORE_LABELS[ev.overallRating]}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Conditions Tracker */}
      {studentEvals.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-4">🩺 Conditions Tracker</h3>
          <p className="text-sm text-slate-400 mb-4">
            {allConditionsSeen.size} condition{allConditionsSeen.size !== 1 ? 's' : ''} seen across all sessions.
          </p>
          <div className="space-y-4">
            {PREPOPULATED_CONDITIONS.map(({ category, conditions }) => {
              const seenInCat = conditions.filter(c => allConditionsSeen.has(c));
              const unseenInCat = conditions.filter(c => !allConditionsSeen.has(c));
              if (seenInCat.length === 0 && unseenInCat.length === 0) return null;
              return (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-slate-600 mb-2">
                    {category}
                    <span className="ml-2 text-xs text-slate-400">{seenInCat.length}/{conditions.length}</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {conditions.map(cond => {
                      const seen = allConditionsSeen.has(cond);
                      return (
                        <span
                          key={cond}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                            seen
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          {seen && '✓ '}{cond}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Teaching Topics */}
      {Object.keys(allTeachingTopics).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-4">📚 Teaching Topics</h3>
          <div className="space-y-4">
            {TEACHING_TOPIC_CATEGORIES.map(({ category }) => {
              const topics = allTeachingTopics[category];
              if (!topics || topics.size === 0) return null;
              return (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-slate-600 mb-2">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(topics).map(topic => (
                      <span key={topic} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-50 border border-teal-300 text-teal-700">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Clinical Objectives */}
      {studentEvals.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-2">🎯 Clinical Objectives (EPAs)</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-slate-100 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-purple-500 transition-all"
                style={{ width: `${(allObjectivesAchieved.size / Math.max(TOTAL_OBJECTIVE_EXPECTATIONS, 1)) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-purple-700 whitespace-nowrap">
              {allObjectivesAchieved.size} achieved
            </span>
          </div>
          <div className="space-y-4">
            {CLINICAL_OBJECTIVES_V2.map((obj) => {
              const allExpIds = [
                ...obj.expectations.middle.map((_, i) => expectationId(obj.id, 'middle', i)),
                ...obj.expectations.final.map((_, i) => expectationId(obj.id, 'final', i)),
              ];
              const achievedCount = allExpIds.filter(id => allObjectivesAchieved.has(id)).length;

              return (
                <div key={obj.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className={`px-4 py-3 border-b border-slate-200 flex items-center justify-between ${achievedCount > 0 ? 'bg-purple-50' : 'bg-slate-50'}`}>
                    <div>
                      <span className="text-xs font-bold text-indigo-600 mr-2">Outcome {obj.id}</span>
                      <span className="text-sm font-semibold text-slate-800">{obj.outcome}</span>
                    </div>
                    <span className="text-xs font-bold text-purple-700 whitespace-nowrap">{achievedCount}/{allExpIds.length}</span>
                  </div>
                  <div className="p-3 space-y-3">
                    {(['middle', 'final'] as const).map(phase => (
                      <div key={phase}>
                        <p className={`text-xs font-bold uppercase mb-1 ${phase === 'middle' ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {phase === 'middle' ? 'Middle Phase' : 'Final Phase'}
                        </p>
                        <div className="space-y-1">
                          {obj.expectations[phase].map((exp, ei) => {
                            const id = expectationId(obj.id, phase, ei);
                            const achieved = allObjectivesAchieved.has(id);
                            const firstDate = objectiveFirstSession[id];
                            return (
                              <div
                                key={id}
                                className={`flex items-start gap-2 p-2 rounded-lg ${achieved ? 'bg-emerald-50' : 'bg-slate-50'}`}
                              >
                                <span className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center text-xs mt-0.5 ${
                                  achieved ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                                }`}>
                                  {achieved ? '✓' : ''}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <span className={`text-xs font-bold mr-1 ${achieved ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {String.fromCharCode(97 + ei)}.
                                  </span>
                                  <span className={`text-xs ${achieved ? 'text-emerald-800' : 'text-slate-500'}`}>{exp}</span>
                                  {achieved && firstDate && (
                                    <p className="text-xs text-emerald-400 mt-0.5">First achieved: {firstDate}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {/* Backward compat: show legacy numeric objectives */}
            {Array.from(allObjectivesAchieved).filter(id => typeof id === 'number' || !isNaN(Number(id))).length > 0 && (
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-500 mb-2">Legacy Objectives</p>
                {Array.from(allObjectivesAchieved)
                  .filter(id => typeof id === 'number' || (!String(id).includes('-') && !isNaN(Number(id))))
                  .map(id => (
                    <div key={String(id)} className="flex items-start gap-2 text-xs text-slate-500 mt-1">
                      <span className="text-emerald-500">✓</span>
                      <span>EPA {Number(id) + 1}: {CLINICAL_OBJECTIVES[Number(id)]}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clinical Skills Assessment */}
      {student && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-1">🏅 Clinical Skills Assessment</h3>
          <p className="text-sm text-slate-400 mb-4">Toggle each behavior to track the student's ongoing clinical skill development. Changes are saved immediately.</p>
          <div className="space-y-6">
            {CLINICAL_SKILLS.map(skill => (
              <div key={skill.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
                  <p className="text-xs font-bold text-indigo-500 uppercase mb-0.5">{skill.category}</p>
                  <p className="text-sm font-semibold text-slate-800">{skill.title}</p>
                </div>
                <div className="p-4 space-y-5">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Minimal Expectations</p>
                    <div className="space-y-2">
                      {skill.minimalExpectations.map(beh => {
                        const rating = getSkillRating(beh.id);
                        const demonstrating = rating === 'demonstrating';
                        return (
                          <div
                            key={beh.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                              demonstrating ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleSkillRating(beh.id)}
                              className={`flex-shrink-0 mt-0.5 w-8 h-5 rounded-full border-2 flex items-center transition-all ${
                                demonstrating
                                  ? 'bg-emerald-500 border-emerald-500 justify-end pr-0.5'
                                  : 'bg-slate-200 border-slate-300 justify-start pl-0.5'
                              }`}
                              title={demonstrating ? 'Demonstrating Consistently' : 'Not Yet'}
                            >
                              <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm block" />
                            </button>
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs font-bold mr-1 ${demonstrating ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {beh.id.split('-').pop()}.
                              </span>
                              <span className={`text-sm ${demonstrating ? 'text-emerald-800' : 'text-slate-600'}`}>{beh.description}</span>
                            </div>
                            <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              demonstrating ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {demonstrating ? 'Demonstrating' : 'Not Yet'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Exemplary Behaviors</p>
                    <div className="space-y-2">
                      {skill.exemplaryBehaviors.map(beh => {
                        const rating = getSkillRating(beh.id);
                        const demonstrating = rating === 'demonstrating';
                        return (
                          <div
                            key={beh.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                              demonstrating ? 'bg-purple-50 border-purple-300' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleSkillRating(beh.id)}
                              className={`flex-shrink-0 mt-0.5 w-8 h-5 rounded-full border-2 flex items-center transition-all ${
                                demonstrating
                                  ? 'bg-purple-500 border-purple-500 justify-end pr-0.5'
                                  : 'bg-slate-200 border-slate-300 justify-start pl-0.5'
                              }`}
                              title={demonstrating ? 'Demonstrating Consistently' : 'Not Yet'}
                            >
                              <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm block" />
                            </button>
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs font-bold mr-1 ${demonstrating ? 'text-purple-600' : 'text-slate-400'}`}>
                                {beh.id.split('-').pop()}.
                              </span>
                              <span className={`text-sm ${demonstrating ? 'text-purple-800' : 'text-slate-600'}`}>{beh.description}</span>
                            </div>
                            <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              demonstrating ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {demonstrating ? 'Demonstrating' : 'Not Yet'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week-by-week timeline */}
      {studentEvals.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-4">📅 Weekly Progress Timeline</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Week</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Date</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-medium hidden sm:table-cell">Type</th>
                  {SCORE_CATEGORIES.map(c => (
                    <th key={c.key} className="text-center py-2 px-1 text-slate-500 font-medium hidden md:table-cell">
                      <span title={c.label}>{c.label.slice(0, 4)}</span>
                    </th>
                  ))}
                  <th className="text-center py-2 px-2 text-slate-500 font-medium">Overall</th>
                </tr>
              </thead>
              <tbody>
                {studentEvals.map(ev => {
                  const phaseConf = PHASE_CONFIG[ev.phase];
                  return (
                    <tr key={ev.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 px-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${phaseConf.bgColor} ${phaseConf.color}`}>
                          W{ev.weekNumber}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-slate-600">{ev.date}</td>
                      <td className="py-2 px-2 text-slate-500 hidden sm:table-cell">{ev.sessionType}</td>
                      {SCORE_CATEGORIES.map(c => (
                        <td key={c.key} className="text-center py-2 px-1 hidden md:table-cell">
                          <span className={`font-bold ${
                            ev.scores[c.key] >= 4 ? 'text-emerald-600' : ev.scores[c.key] >= 3 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {ev.scores[c.key]}
                          </span>
                        </td>
                      ))}
                      <td className="text-center py-2 px-2">
                        <span className={`font-bold text-base ${
                          ev.overallRating >= 4 ? 'text-emerald-600' : ev.overallRating >= 3 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {ev.overallRating}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
```
