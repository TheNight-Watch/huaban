const cfg = require('../config');
const { nanoid } = require('nanoid');

function required(v, name) {
  if (!v) throw new Error(`${name} not configured`);
  return v;
}

function pickFormatFromUrl(url) {
  const u = (url || '').split('?')[0].toLowerCase();
  if (u.endsWith('.mp3')) return 'mp3';
  if (u.endsWith('.wav')) return 'wav';
  if (u.endsWith('.ogg')) return 'ogg';
  // Heuristics for common cases
  if (u.endsWith('.m4a') || u.endsWith('.mp4')) return 'mp3'; // provider doc doesn't list m4a; try mp3 as a fallback
  if (u.endsWith('.webm')) return 'ogg'; // webm usually contains opus; provider doc lists ogg/opus
  return 'mp3';
}

async function submit({ audioUrl, format }) {
  const base = required(cfg.stt.baseURL, 'STT_BASE_URL');
  const appId = required(cfg.stt.appId, 'STT_APP_ID');
  const access = required(cfg.stt.accessToken, 'STT_ACCESS_TOKEN');
  const resource = cfg.stt.resourceId || 'volc.bigasr.auc';
  const endpoint = `${base.replace(/\/$/, '')}/api/v3/auc/bigmodel/submit`;
  const reqId = nanoid(16);
  const body = {
    user: { uid: 'huaban-client' },
    audio: {
      format: format || pickFormatFromUrl(audioUrl),
      url: audioUrl
    },
    request: {
      model_name: 'bigmodel',
      enable_itn: true,
      enable_punc: true
    }
  };
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-App-Key': appId,
      'X-Api-Access-Key': access,
      'X-Api-Resource-Id': resource,
      'X-Api-Request-Id': reqId,
      'X-Api-Sequence': '-1'
    },
    body: JSON.stringify(body)
  });
  // Spec: body empty; status conveyed via headers
  const ok = resp.ok;
  if (!ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`STT submit failed ${resp.status}: ${text}`);
  }
  const code = resp.headers.get('X-Api-Status-Code') || '';
  if (code && code !== '20000000') {
    const msg = resp.headers.get('X-Api-Message') || 'STT submit error';
    throw new Error(`${msg} (code=${code})`);
  }
  return { requestId: reqId };
}

async function query({ requestId }) {
  const base = required(cfg.stt.baseURL, 'STT_BASE_URL');
  const appId = required(cfg.stt.appId, 'STT_APP_ID');
  const access = required(cfg.stt.accessToken, 'STT_ACCESS_TOKEN');
  const resource = cfg.stt.resourceId || 'volc.bigasr.auc';
  const endpoint = `${base.replace(/\/$/, '')}/api/v3/auc/bigmodel/query`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-App-Key': appId,
      'X-Api-Access-Key': access,
      'X-Api-Resource-Id': resource,
      'X-Api-Request-Id': requestId,
      'X-Api-Sequence': '-1'
    },
    body: JSON.stringify({})
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`STT query failed ${resp.status}: ${text}`);
  }
  const data = await resp.json().catch(() => ({}));
  return data;
}

async function submitAndWait({ audioUrl, format, maxWaitMs = 15000, intervalMs = 1200 }) {
  const { requestId } = await submit({ audioUrl, format });
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const data = await query({ requestId });
    const text = data?.result?.text || data?.data?.result?.text;
    if (text && String(text).trim()) {
      return { text: String(text), requestId, raw: data };
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return { text: null, requestId, raw: null };
}

module.exports = { submit, query, submitAndWait, pickFormatFromUrl };

