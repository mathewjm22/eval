import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppData } from '../context';
import { useTheme } from '../theme';
import { PreceptorProfile } from '../types';
import { exportToJSON } from '../store';
import { downloadAsFile, uploadFromFile } from '../googleDrive';

/** Resize an image file to at most maxSize×maxSize and return a JPEG data URL. */
function resizeImageToDataUrl(file: File, maxSize = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function Settings() {
  const { data, updatePreceptor, importData, drive } = useAppData();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [profile, setProfile] = useState<PreceptorProfile>({ ...data.preceptor });
  const [profileSaved, setProfileSaved] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Option A: hide Client ID input entirely if env var exists.
  const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const hasEnvClientId = useMemo(() => !!envClientId && envClientId.trim().length > 0, [envClientId]);

  // Keep the editable profile state in sync with stored data (e.g., after Drive load/import).
  useEffect(() => {
    setProfile({ ...data.preceptor });
  }, [data.preceptor]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file, 128);
      const updated = { ...profile, avatarDataUrl: dataUrl };
      setProfile(updated);
      updatePreceptor(updated);
    } catch {
      setSaveStatus('Failed to process the image. Please try another file.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
    // Reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    const updated = { ...profile, avatarDataUrl: undefined };
    setProfile(updated);
    updatePreceptor(updated);
  };

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
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>⚙️ Settings</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Configure your profile and data management</p>
      </div>

      {/* Preceptor Profile */}
      <div className="rounded-2xl p-6 shadow-sm" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text)' }}>🩺 Preceptor Profile</h3>
        <div className="space-y-4">

          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="relative group flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed transition-colors focus:outline-none"
              style={{ borderColor: 'var(--border)' }}
              title="Click to upload avatar photo"
            >
              {profile.avatarDataUrl ? (
                <img
                  src={profile.avatarDataUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1" style={{ background: 'var(--panel-2)', color: 'var(--muted)' }}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-[10px] font-medium">Photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="block text-sm font-medium transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                {profile.avatarDataUrl ? 'Change photo' : 'Upload photo'}
              </button>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Any image format · Converted to 128×128 JPEG</p>
              {profile.avatarDataUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="block text-xs text-rose-500 hover:text-rose-600 transition-colors"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border outline-none"
                style={{ background: 'var(--panel-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                placeholder="Dr. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Title</label>
              <input
                type="text"
                value={profile.title}
                onChange={e => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border outline-none"
                style={{ background: 'var(--panel-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                placeholder="Assistant Professor of Medicine"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Institution</label>
              <input
                type="text"
                value={profile.institution}
                onChange={e => setProfile({ ...profile, institution: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border outline-none"
                style={{ background: 'var(--panel-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                placeholder="University Medical Center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Specialty</label>
              <input
                type="text"
                value={profile.specialty}
                onChange={e => setProfile({ ...profile, specialty: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border outline-none"
                style={{ background: 'var(--panel-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                placeholder="Family Medicine"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border outline-none"
              style={{ background: 'var(--panel-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="preceptor@university.edu"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            className="px-6 py-2.5 rounded-xl font-medium text-sm text-white transition-colors"
            style={{ background: 'var(--accent)' }}
          >
            {profileSaved ? '✅ Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Local File Backup */}
      <div className="rounded-2xl p-6 shadow-sm" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>💾 Local File Backup</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
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
      <div className="rounded-2xl p-6 shadow-sm" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>☁️ Google Drive Sync</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
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
              className="px-4 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
              style={{ background: 'var(--panel-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              Reload from Drive
            </button>

            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              Status: <span className="font-medium" style={{ color: 'var(--text)' }}>{drive.message}</span>
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
      <div className="rounded-2xl p-6 shadow-sm" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text)' }}>📊 Data Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-xl p-4" style={{ background: 'var(--panel-2)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{data.students.length}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Students</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'var(--panel-2)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{data.evaluations.filter(e => !e.isDraft).length}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Evaluations</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'var(--panel-2)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
              {(JSON.stringify(data).length / 1024).toFixed(1)} KB
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Data Size</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl p-6 shadow-sm" style={{ background: isDark ? 'rgba(255,71,87,0.08)' : '#fff1f2', border: isDark ? '1px solid rgba(255,71,87,0.25)' : '1px solid #fecdd3' }}>
        <h3 className="font-bold text-lg mb-2 text-red-600">⚠️ Danger Zone</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>This action cannot be undone. Make sure to download a backup first.</p>
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
