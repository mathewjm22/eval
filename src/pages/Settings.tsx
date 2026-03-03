import { useEffect, useMemo, useState } from 'react';
import { useAppData } from '../context';
import { PreceptorProfile } from '../types';
import { exportToJSON } from '../store';
import { downloadAsFile, uploadFromFile } from '../googleDrive';

export function Settings() {
  const { data, updatePreceptor, importData, drive } = useAppData();

  const [profile, setProfile] = useState<PreceptorProfile>({ ...data.preceptor });
  const [profileSaved, setProfileSaved] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Option A: hide Client ID input entirely if env var exists.
  const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const hasEnvClientId = useMemo(() => !!envClientId && envClientId.trim().length > 0, [envClientId]);

  // Keep the editable profile state in sync with stored data (e.g., after Drive load/import).
  useEffect(() => {
    setProfile({ ...data.preceptor });
  }, [data.preceptor]);

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
    setSaveStatus('Connecting to Google Drive...');
    try {
      await drive.connect();
      setSaveStatus('Connected to Google Drive ✅');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setSaveStatus(`Error: ${message}`);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  const handleReloadFromDrive = async () => {
    setSaveStatus('Loading from Google Drive...');
    try {
      await drive.reloadFromDrive();
      setSaveStatus('Loaded from Google Drive ✅');
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
          Connect to Google Drive. Once connected, your changes will auto-save (debounced).
        </p>

        <div className="space-y-4">
          {!hasEnvClientId && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              VITE_GOOGLE_CLIENT_ID is not set. Add it to your GitHub Pages build environment to enable Drive sync.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleConnectGoogleDrive}
              disabled={!hasEnvClientId || drive.status === 'connecting' || drive.status === 'connected'}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {drive.status === 'connecting'
                ? 'Connecting...'
                : drive.status === 'connected'
                  ? '✅ Connected'
                  : 'Connect to Google Drive'}
            </button>

            <button
              onClick={handleReloadFromDrive}
              disabled={drive.status !== 'connected'}
              className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Reload from Drive
            </button>

            <span className="text-xs text-slate-400">
              Status: <span className="font-medium text-slate-600">{drive.message}</span>
              {drive.lastSyncedAt ? (
                <span className="ml-2">(last synced {new Date(drive.lastSyncedAt).toLocaleString()})</span>
              ) : null}
            </span>
          </div>
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
