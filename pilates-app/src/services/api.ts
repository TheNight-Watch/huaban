export type GalleryItem = {
  key: string;
  url: string;
  size: number;
  lastModified: string;
};

export type ArtworkDetail = {
  descriptionText?: string;
  llmText?: string;
  audio?: { key: string; url: string } | null;
};

export type PresignPut = { method: string; url: string; headers?: Record<string, string> };

const API_BASE = (process.env.REACT_APP_API_BASE || '').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error('API base not configured');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getHealth(): Promise<any> {
  return request('/healthz');
}

export async function getGallery(limit = 30, cursor?: string): Promise<{ items: GalleryItem[]; nextCursor: string | null }>
{
  return request(`/gallery?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
}

export async function presignUpload(contentType: string): Promise<{ key: string; put: { method: string; url: string; headers?: Record<string, string> } }> {
  return request('/upload/presign', { method: 'POST', body: JSON.stringify({ contentType }) });
}

export async function createJobFromKey(key: string, text?: string, expiresSec?: number): Promise<{ jobId: string }>{
  return request('/generation/jobs/from-key', { method: 'POST', body: JSON.stringify({ key, text, expiresSec }) });
}

export async function getJob(id: string): Promise<{ jobId: string; status: string; progress?: number }>{
  return request(`/generation/jobs/${encodeURIComponent(id)}`);
}

export async function getArtworkByVideoKey(key: string): Promise<ArtworkDetail> {
  return request(`/artworks/by-video-key?key=${encodeURIComponent(key)}`);
}

// Stage 3 endpoints
export async function createArtworkFromImageKey(imageKey: string): Promise<{ artworkId: string }>{
  return request('/artworks/from-image-key', { method: 'POST', body: JSON.stringify({ imageKey }) });
}

export async function presignAudio(artworkId: string, contentType?: string): Promise<{ key: string; put: PresignPut }>{
  return request(`/artworks/${encodeURIComponent(artworkId)}/audio/presign`, { method: 'POST', body: JSON.stringify({ contentType }) });
}

export async function commitAudio(artworkId: string, audioKey: string): Promise<{ ok: boolean }>{
  return request(`/artworks/${encodeURIComponent(artworkId)}/audio/commit`, { method: 'POST', body: JSON.stringify({ audioKey }) });
}

export async function transcribeText(artworkId: string, text: string): Promise<{ ok: boolean }>{
  return request(`/artworks/${encodeURIComponent(artworkId)}/transcribe`, { method: 'POST', body: JSON.stringify({ text }) });
}

export async function runLLM(artworkId: string): Promise<{ ok: boolean; llmText: string }>{
  return request(`/artworks/${encodeURIComponent(artworkId)}/run-llm`, { method: 'POST', body: JSON.stringify({}) });
}

export async function generateForArtwork(artworkId: string): Promise<{ jobId: string }>{
  return request(`/artworks/${encodeURIComponent(artworkId)}/generate`, { method: 'POST', body: JSON.stringify({}) });
}

export async function transcribe(artworkId: string): Promise<{ ok: boolean; mode: 'stt'|'text'; pending?: boolean; text?: string }>{
  return request(`/artworks/${encodeURIComponent(artworkId)}/transcribe`, { method: 'POST', body: JSON.stringify({}) });
}

export async function captureJob(id: string): Promise<{ key: string; url: string }>{
  return request(`/generation/jobs/${encodeURIComponent(id)}/capture`, { method: 'POST', body: JSON.stringify({}) });
}
