/* eslint-disable @typescript-eslint/no-explicit-any */
// Google Drive integration - save/load JSON files
// Uses file download/upload as primary method (works without API keys)
// Google Drive API available if user provides client ID

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

let tokenClient: any = null;
let gapiInited = false;
let gisInited = false;
let accessToken: string | null = null;

export async function initGoogleAPI(clientId: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!clientId) {
      resolve(false);
      return;
    }

    const w = window as any;

    // Load GAPI
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => {
      w.gapi.load('client', async () => {
        try {
          await w.gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC],
          });
          gapiInited = true;
          if (gapiInited && gisInited) resolve(true);
        } catch {
          resolve(false);
        }
      });
    };
    gapiScript.onerror = () => resolve(false);
    document.head.appendChild(gapiScript);

    // Load GIS
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
      tokenClient = w.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: () => { /* will be overridden */ },
      });
      gisInited = true;
      if (gapiInited && gisInited) resolve(true);
    };
    gisScript.onerror = () => resolve(false);
    document.head.appendChild(gisScript);

    // Timeout after 10 seconds
    setTimeout(() => resolve(false), 10000);
  });
}

export function requestAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google API not initialized'));
      return;
    }
    tokenClient.callback = (resp: any) => {
      if (resp.error) {
        reject(new Error(resp.error));
        return;
      }
      accessToken = resp.access_token;
      resolve(resp.access_token);
    };
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

export async function saveToGoogleDrive(data: string, fileName: string): Promise<string> {
  const w = window as any;
  if (!accessToken) {
    await requestAccessToken();
  }

  // Check if file already exists
  const listResp = await w.gapi.client.drive.files.list({
    q: `name='${fileName}' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  const files = listResp.result.files || [];
  const blob = new Blob([data], { type: 'application/json' });

  if (files.length > 0) {
    const fileId = files[0].id;
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: blob,
      }
    );
    const result = await response.json();
    return result.id;
  } else {
    const metadata = { name: fileName, mimeType: 'application/json' };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      }
    );
    const result = await response.json();
    return result.id;
  }
}

export async function loadFromGoogleDrive(fileName: string): Promise<string | null> {
  const w = window as any;
  if (!accessToken) {
    await requestAccessToken();
  }

  const listResp = await w.gapi.client.drive.files.list({
    q: `name='${fileName}' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  const files = listResp.result.files || [];
  if (files.length === 0) return null;

  const fileId = files[0].id;
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return await response.text();
}

// Fallback: download as file
export function downloadAsFile(data: string, fileName: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Fallback: upload from file
export function uploadFromFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };
    input.click();
  });
}
