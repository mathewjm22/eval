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
