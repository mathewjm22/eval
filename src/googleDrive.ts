// Google Drive integration via Google Identity Services + Drive REST API

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

let accessToken: string | null = null;
let googleTokenClient: any = null;

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
      googleTokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.appdata',
        callback: (resp: any) => {
          if (resp.error) { resolve(false); return; }
          accessToken = resp.access_token;
          resolve(true);
        },
      });
      googleTokenClient.requestAccessToken();
    });
  } catch {
    return false;
  }
}

function refreshAccessToken(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!googleTokenClient) {
      resolve(false);
      return;
    }
    const originalCallback = googleTokenClient.callback;
    googleTokenClient.callback = (resp: any) => {
      googleTokenClient.callback = originalCallback;
      if (resp.error) {
        resolve(false);
        return;
      }
      accessToken = resp.access_token;
      resolve(true);
    };
    googleTokenClient.requestAccessToken({ prompt: '' });
  });
}

async function driveRequest(method: string, url: string, body?: BodyInit, extraHeaders?: Record<string, string>): Promise<Response> {
  if (!accessToken) throw new Error('Not authenticated with Google Drive');
  let res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}`, ...extraHeaders },
    body,
  });

  // If token expired (401), try to refresh it silently and retry once.
  if (res.status === 401 && googleTokenClient) {
    const refreshed = await refreshAccessToken();
    if (refreshed && accessToken) {
      res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${accessToken}`, ...extraHeaders },
        body,
      });
    } else {
      throw new Error('Google Drive session expired. Please reconnect.');
    }
  }
  return res;
}

async function findFile(name: string): Promise<string | null> {
  const query = encodeURIComponent(`name='${name}'`);
  const res = await driveRequest(
    'GET',
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id)`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

export async function saveToGoogleDrive(json: string, filename: string): Promise<void> {
  const existingId = await findFile(filename);
  const metadata = { name: filename, parents: existingId ? undefined : ['appDataFolder'] };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const close_delim = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    json +
    close_delim;

  const url = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  const method = existingId ? 'PATCH' : 'POST';

  const res = await driveRequest(method, url, multipartRequestBody, {
    'Content-Type': `multipart/related; boundary=${boundary}`,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Drive save failed: ${res.statusText} - ${errorText}`);
  }
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
