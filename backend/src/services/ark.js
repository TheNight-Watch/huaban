const cfg = require('../config');

function arkUrl(path) {
  const base = cfg.ark.baseURL.replace(/\/$/, '');
  if (!path.startsWith('/')) return `${base}/${path}`;
  return `${base}${path}`;
}

async function createI2VTask({ imageUrl, text, options = {} }) {
  if (!cfg.ark.apiKey) throw new Error('ARK_API_KEY not configured');
  const merged = {
    resolution: options.resolution || '720p',
    ratio: options.ratio || 'adaptive',
    duration: options.duration ?? 5,
    camerafixed: options.camerafixed ?? false,
    watermark: options.watermark ?? false
  };
  const suffix = ` --resolution ${merged.resolution} --ratio ${merged.ratio} --duration ${merged.duration} --camerafixed ${merged.camerafixed} --watermark ${merged.watermark}`;
  const payload = {
    model: cfg.ark.videoModel,
    content: [
      { type: 'text', text: (text || '').trim() + suffix },
      { type: 'image_url', image_url: { url: imageUrl } }
    ]
  };
  if (cfg.ark.callbackURL) payload.callback_url = cfg.ark.callbackURL;
  const resp = await fetch(arkUrl('/api/v3/contents/generations/tasks'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.ark.apiKey}`
    },
    body: JSON.stringify(payload)
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`Ark create task failed: ${resp.status} ${resp.statusText} ${(data && JSON.stringify(data)).slice(0,300)}`);
  }
  const id = data?.id || data?.task_id || data?.data?.id || data?.TaskId || null;
  return { id, raw: data };
}

async function getTask(taskId) {
  if (!cfg.ark.apiKey) throw new Error('ARK_API_KEY not configured');
  const resp = await fetch(arkUrl(`/api/v3/contents/generations/tasks/${encodeURIComponent(taskId)}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.ark.apiKey}`
    }
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`Ark get task failed: ${resp.status} ${resp.statusText} ${(data && JSON.stringify(data)).slice(0,300)}`);
  }
  return data;
}

module.exports = { createI2VTask, getTask };

// Try to find a media url (mp4) in Ark response
function findFirstMediaUrl(obj) {
  const seen = new Set();
  function walk(v) {
    if (v == null) return null;
    if (typeof v === 'string') {
      if (/^https?:\/\//i.test(v) && /\.(mp4|mov|webm)(\?|$)/i.test(v)) return v;
      return null;
    }
    if (typeof v !== 'object') return null;
    if (seen.has(v)) return null;
    seen.add(v);
    if (Array.isArray(v)) {
      for (const it of v) {
        const r = walk(it);
        if (r) return r;
      }
      return null;
    }
    for (const k of Object.keys(v)) {
      const r = walk(v[k]);
      if (r) return r;
    }
    return null;
  }
  return walk(obj);
}

module.exports.findFirstMediaUrl = findFirstMediaUrl;

// Fallback: find the first HTTP(S) URL regardless of extension
function findFirstHttpUrl(obj) {
  const seen = new Set();
  function walk(v) {
    if (v == null) return null;
    if (typeof v === 'string') {
      if (/^https?:\/\//i.test(v)) return v;
      return null;
    }
    if (typeof v !== 'object') return null;
    if (seen.has(v)) return null;
    seen.add(v);
    if (Array.isArray(v)) {
      for (const it of v) {
        const r = walk(it);
        if (r) return r;
      }
      return null;
    }
    for (const k of Object.keys(v)) {
      const r = walk(v[k]);
      if (r) return r;
    }
    return null;
  }
  return walk(obj);
}

module.exports.findFirstHttpUrl = findFirstHttpUrl;

async function chatComplete(messages) {
  const cfg = require('../config');
  if (!cfg.ark.apiKey) throw new Error('ARK_API_KEY not configured');
  const resp = await fetch(arkUrl('/api/v3/chat/completions'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.ark.apiKey}` },
    body: JSON.stringify({ model: cfg.ark.textModel, messages })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`Ark chat failed: ${resp.status} ${resp.statusText} ${(data && JSON.stringify(data)).slice(0,300)}`);
  }
  return data;
}

module.exports.chatComplete = chatComplete;
