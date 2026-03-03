// Google Drive integration via Google Identity Services + Drive REST API

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

let accessToken: string | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export async function initGoogleAPI(clientId: string): Promise<boolean> {
  try {
    await loadScript('https://accounts.google.com/gsi/client');
    return new Promise((resolve) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.appdata',
        callback: (resp: any) => {
          if (resp.error) { resolve(false); return; }
          accessToken = resp.access_token;
          resolve(true);
        },
      });
      client.requestAccessToken();
    });
  } catch {
    return false;
  }
}

async function driveRequest(method: string, url: string, body?: BodyInit, extraHeaders?: Record<string, string>): Promise<Response> {
  if (!accessToken) throw new Error('Not authenticated with Google Drive');
  return fetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}`, ...extraHeaders },
    body,
  });
}

async function findFile(name: string): Promise<string | null> {
  const res = await driveRequest(
    'GET',
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${name}'&fields=files(id)`
  );
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

export async function saveToGoogleDrive(json: string, filename: string): Promise<void> {
  const existingId = await findFile(filename);
  const metadata = { name: filename, parents: existingId ? undefined : ['appDataFolder'] };
  const blob = new Blob([json], { type: 'application/json' });

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const url = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  const method = existingId ? 'PATCH' : 'POST';

  const res = await driveRequest(method, url, form);
  if (!res.ok) throw new Error(`Drive save failed: ${res.statusText}`);
}

export async function loadFromGoogleDrive(filename: string): Promise<string | null> {
  const id = await findFile(filename);
  if (!id) return null;
  const res = await driveRequest('GET', `https://www.googleapis.com/drive/v3/files/${id}?alt=media`);
  if (!res.ok) throw new Error(`Drive load failed: ${res.statusText}`);
  return res.text();
}

export function downloadAsFile(content: string, filename: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function uploadFromFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) { reject(new Error('No file selected')); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };
    input.click();
  });
}