const express = require('express');
const cfg = require('./config');
const logger = require('./utils/logger');
const { ping: mongoPing, upsertClient } = require('./services/db');
const { headBucket, listObjects, presignGetObject, presignPutObject } = require('./services/s3');
const { createI2VTask, getTask, findFirstMediaUrl, findFirstHttpUrl, chatComplete } = require('./services/ark');
const { putObjectStream } = require('./services/s3');
const artworks = require('./services/artworks');
const { nanoid } = require('nanoid');
const { requireClientId, errorHandler } = require('./utils/middleware');

const app = express();
app.use(express.json({ limit: '2mb' }));

// CORS (optional)
if (cfg.cors.origins.length > 0) {
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && cfg.cors.origins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Content-Type, X-Client-Id');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
}

app.get('/healthz', async (req, res) => {
  const mongo = await mongoPing();
  let s3 = { ok: false, reason: 'disabled' };
  try { s3 = await headBucket(); } catch (_) {}
  const ok = (mongo.ok || mongo.reason === 'disabled') && (s3.ok || s3.reason === 'disabled');
  res.json({ ok, mongo, s3, uptimeSec: Math.round(process.uptime()) });
});

app.post('/init', requireClientId, async (req, res, next) => {
  try {
    const clientId = req.clientId;
    const device = { ua: req.headers['user-agent'] || '', ipHash: 'n/a' };
    await upsertClient(clientId, device);
    const uploadPolicy = {
      bucket: cfg.s3.bucket || 'unset',
      presignExpiresSec: cfg.presign.expiresSec,
      maxSizeMB: 200,
      mimeAllow: ['image/png', 'image/jpeg', 'image/webp', 'audio/mpeg', 'audio/mp4', 'video/mp4']
    };
    res.json({ clientId, upload: uploadPolicy });
  } catch (e) { next(e); }
});

// List images under IMAGES_PREFIX (for debugging / selection)
app.get('/images', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '30', 10);
    const cursor = req.query.cursor || undefined;
    const { items, nextCursor } = await listObjects({ prefix: cfg.images.prefix, limit, token: cursor });
    const presigned = await Promise.all(items.map(async it => {
      const url = (await presignGetObject({ key: it.key })).url;
      return { key: it.key, url, size: it.size, lastModified: it.lastModified };
    }));
    presigned.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    res.json({ items: presigned, nextCursor });
  } catch (e) { next(e); }
});

// Public gallery: list all objects under configured prefix (no login required)
app.get('/gallery', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '30', 10);
    const cursor = req.query.cursor || undefined;
    const { items, nextCursor } = await listObjects({ prefix: cfg.gallery.prefix, limit, token: cursor });

    // For demo, presign each item for playback
    const presigned = await Promise.all(items.map(async it => {
      const url = (await presignGetObject({ key: it.key })).url;
      return {
        key: it.key,
        url,
        size: it.size,
        lastModified: it.lastModified
      };
    }));
    // Sort newest first (S3 returns by UTF-8 order; we reorder by time desc)
    presigned.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    res.json({ items: presigned, nextCursor });
  } catch (e) { next(e); }
});

// Upload presign: returns a presigned PUT for a new public video key
app.post('/upload/presign', async (req, res, next) => {
  try {
    const { contentType } = req.body || {};
    const ct = contentType || 'video/mp4';
    const id = nanoid(12);
    let key;
    if (ct.startsWith('image/')) {
      const ext = ct === 'image/png' ? 'png' : (ct === 'image/webp' ? 'webp' : 'jpg');
      key = `${cfg.images.prefix}${id}.${ext}`;
    } else if (ct.startsWith('video/')) {
      const ext = ct === 'video/webm' ? 'webm' : (ct === 'video/quicktime' ? 'mov' : 'mp4');
      key = `${cfg.gallery.prefix}${id}.${ext}`;
    } else {
      key = `public/other/${id}`;
    }
    const put = await presignPutObject({ key, contentType: ct });
    res.json({ key, put });
  } catch (e) { next(e); }
});

// Doubao generation: create job (image->video via Ark)
app.post('/generation/jobs', async (req, res, next) => {
  try {
    const { imageUrl, text, options } = req.body || {};
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ error: 'imageUrl is required' });
    }
    const { id, raw } = await createI2VTask({ imageUrl, text, options });
    res.json({ jobId: id, provider: 'ark', raw });
  } catch (e) { next(e); }
});

// Doubao generation: query job
app.get('/generation/jobs/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await getTask(id);
    // Best-effort mapping
    const status = data?.status || data?.task?.status || data?.data?.status || 'unknown';
    const progress = data?.progress ?? data?.task?.progress ?? null;
    res.json({ jobId: id, status, progress, raw: data });
  } catch (e) { next(e); }
});

// Capture result video of a completed job and upload into gallery prefix
app.post('/generation/jobs/:id/capture', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { filename } = req.body || {};
    const data = await getTask(id);
    const status = (data?.status || data?.task?.status || data?.data?.status || '').toString();
    const logger = require('./utils/logger');
    logger.info('capture.getTask', { id, status });
    let url = findFirstMediaUrl(data);
    if (!url) {
      // fallback to any http(s) url; we'll validate content-type after fetching
      url = findFirstHttpUrl(data);
    }
    if (!url) return res.status(404).json({ error: 'No media url found in provider response', raw: data });
    const name = filename || url.split('?')[0].split('/').pop() || `${id}.mp4`;
    const key = `${cfg.gallery.prefix}${name}`;
    // try to download with a few retries as provider may lag publishing artifacts
    let resp;
    for (let i = 0; i < 3; i++) {
      resp = await fetch(url);
      if (resp.ok && resp.body) break;
      await new Promise(r => setTimeout(r, 1500));
    }
    if (!resp || !resp.ok || !resp.body) {
      const status = resp?.status || 0;
      const text = await resp?.text()?.catch(() => '') || '';
      return res.status(502).json({ error: 'Provider download failed', status, hint: 'Try again later', sourceUrl: url, providerMessage: text.slice(0, 200) });
    }
    const ct = resp.headers.get('content-type') || 'application/octet-stream';
    if (!/video\//i.test(ct) && !/octet-stream/i.test(ct)) {
      return res.status(415).json({ error: 'Provider returned non-video content-type', contentType: ct, sourceUrl: url });
    }
    await putObjectStream({ key, contentType: ct, body: resp.body });
    const getLink = await presignGetObject({ key });
    try { await artworks.setVideoKeyByJob(id, key); } catch (_) {}
    res.json({ key, url: getLink.url });
  } catch (e) {
    return res.status(500).json({ error: 'capture-failed', message: e?.message || String(e) });
  }
});

// Create artwork from image key
app.post('/artworks/from-image-key', async (req, res, next) => {
  try {
    const { imageKey } = req.body || {};
    if (!imageKey) return res.status(400).json({ error: 'imageKey is required' });
    const id = await artworks.createFromImageKey(imageKey);
    res.json({ artworkId: String(id) });
  } catch (e) { next(e); }
});

// Audio upload: presign and commit
app.post('/artworks/:id/audio/presign', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { contentType } = req.body || {};
    const ct = typeof contentType === 'string' ? contentType.split(';')[0] : undefined;
    // Map mime -> extension; default to m4a
    let ext = 'm4a';
    if (ct === 'audio/webm') ext = 'webm';
    else if (ct === 'audio/mpeg') ext = 'mp3';
    else if (ct === 'audio/mp4' || ct === 'audio/x-m4a') ext = 'm4a';
    const key = `${cfg.audio.prefix}${id}.${ext}`;
    const put = await presignPutObject({ key, contentType: ct || 'audio/mp4' });
    res.json({ key, put });
  } catch (e) { next(e); }
});

app.post('/artworks/:id/audio/commit', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { audioKey } = req.body || {};
    if (!audioKey) return res.status(400).json({ error: 'audioKey is required' });
    await artworks.setAudioKey(id, audioKey);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Transcribe: support text (MVP) or STT via OpenSpeech (submit+poll)
app.post('/artworks/:id/transcribe', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, force } = req.body || {};
    if (text && typeof text === 'string') {
      await artworks.setDescriptionText(id, text);
      return res.json({ ok: true, mode: 'text' });
    }
    // Try STT only when configured and audio exists
    const doc = await artworks.findById(id);
    if (!doc) return res.status(404).json({ error: 'artwork not found' });
    const audioKey = doc.audioKey || req.body?.audioKey;
    if (!audioKey) {
      return res.status(400).json({ error: 'audioKey missing; provide text or upload audio first' });
    }
    // Presign GET for provider to fetch audio
    const { presignGetObject } = require('./services/s3');
    const { submitAndWait, pickFormatFromUrl } = require('./services/stt');
    const link = await presignGetObject({ key: audioKey, expiresSec: Math.max(900, cfg.presign.expiresSec) });
    const format = pickFormatFromUrl(audioKey);
    const { text: result } = await submitAndWait({ audioUrl: link.url, format, maxWaitMs: 20000, intervalMs: 1500 });
    if (result && result.trim()) {
      await artworks.setDescriptionText(id, result.trim());
      return res.json({ ok: true, mode: 'stt', text: result.trim() });
    }
    return res.status(202).json({ ok: false, mode: 'stt', pending: true });
  } catch (e) { next(e); }
});

// Run LLM to refine text
app.post('/artworks/:id/run-llm', async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await artworks.findById(id);
    if (!doc) return res.status(404).json({ error: 'artwork not found' });
    const base = doc.descriptionText || '孩子的作品描述';
    const messages = [
      { role: 'system', content: '你是动画脚本助手，请将家长/孩子的口述转为简洁、具体、正向的动画生成提示，包含主体、动作、场景、情绪、镜头感。' },
      { role: 'user', content: base }
    ];
    const data = await chatComplete(messages);
    const llmText = data?.choices?.[0]?.message?.content || base;
    await artworks.setLLMText(id, llmText);
    res.json({ ok: true, llmText });
  } catch (e) { next(e); }
});

// Generate video via Ark I2V
app.post('/artworks/:id/generate', async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await artworks.findById(id);
    if (!doc) return res.status(404).json({ error: 'artwork not found' });
    if (!doc.imageKey) return res.status(400).json({ error: 'imageKey missing' });
    const link = await presignGetObject({ key: doc.imageKey, expiresSec: Math.max(1800, cfg.presign.expiresSec) });
    const text = doc.llmText || doc.descriptionText || '请生成5秒1080p动画';
    const { id: jobId, raw } = await createI2VTask({ imageUrl: link.url, text, options: {} });
    if (jobId) await artworks.setGenerationJob(id, jobId, 'ark');
    res.json({ jobId, raw });
  } catch (e) { next(e); }
});

// Details by video key
app.get('/artworks/by-video-key', async (req, res, next) => {
  try {
    const keyParam = req.query.key || req.query.videoKey;
    if (!keyParam) return res.status(400).json({ error: 'key or videoKey is required' });
    const key = String(keyParam);
    const doc = await artworks.findByVideoKey(key);
    if (!doc) return res.status(404).json({ error: 'not found' });
    let audio = null;
    if (doc.audioKey) {
      const link = await presignGetObject({ key: doc.audioKey });
      audio = { key: doc.audioKey, url: link.url };
    }
    res.json({ descriptionText: doc.descriptionText || null, llmText: doc.llmText || null, audio });
  } catch (e) { next(e); }
});

// Presign GET for any object key (e.g., to provide Ark with a fetchable image URL)
app.post('/download/presign', async (req, res, next) => {
  try {
    const { key, expiresSec } = req.body || {};
    if (!key) return res.status(400).json({ error: 'key is required' });
    const link = await presignGetObject({ key, expiresSec });
    res.json({ key, get: link });
  } catch (e) { next(e); }
});

// Convenience: create generation job from a bucket key (image)
app.post('/generation/jobs/from-key', async (req, res, next) => {
  try {
    const { key, text, options, expiresSec } = req.body || {};
    if (!key) return res.status(400).json({ error: 'key is required' });
    const link = await presignGetObject({ key, expiresSec: expiresSec || Math.max(900, cfg.presign.expiresSec) });
    const { id, raw } = await createI2VTask({ imageUrl: link.url, text, options });
    res.json({ jobId: id, provider: 'ark', sourceKey: key, raw });
  } catch (e) { next(e); }
});

// Fallback not-found
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use(errorHandler);

app.listen(cfg.port, () => {
  logger.info('Server started', { port: cfg.port, env: cfg.env });
});
