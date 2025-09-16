const { ObjectId } = require('mongodb');
const { connect } = require('./db');

async function col() {
  const db = await connect();
  return db.collection('artworks');
}

async function ensureIndexes() {
  const c = await col();
  await c.createIndex({ videoKey: 1 }, { unique: true, sparse: true });
  await c.createIndex({ createdAt: -1 });
}

async function createFromImageKey(imageKey) {
  const c = await col();
  const now = new Date();
  const doc = { imageKey, status: 'draft', createdAt: now, updatedAt: now };
  const r = await c.insertOne(doc);
  return r.insertedId;
}

async function setAudioKey(id, audioKey) {
  const c = await col();
  await c.updateOne({ _id: new ObjectId(id) }, { $set: { audioKey, updatedAt: new Date() } });
}

async function setDescriptionText(id, text) {
  const c = await col();
  await c.updateOne({ _id: new ObjectId(id) }, { $set: { descriptionText: text, status: 'transcribed', updatedAt: new Date() } });
}

async function setLLMText(id, text) {
  const c = await col();
  await c.updateOne({ _id: new ObjectId(id) }, { $set: { llmText: text, status: 'llm_ready', updatedAt: new Date() } });
}

async function setGenerationJob(id, jobId, provider = 'ark') {
  const c = await col();
  await c.updateOne({ _id: new ObjectId(id) }, { $set: { 'generation.jobId': jobId, 'generation.provider': provider, status: 'generating', updatedAt: new Date() } });
}

async function setVideoKeyByJob(jobId, videoKey) {
  const c = await col();
  await c.updateOne({ 'generation.jobId': jobId }, { $set: { videoKey, status: 'ready', updatedAt: new Date() } });
}

async function findByVideoKey(videoKey) {
  const c = await col();
  return c.findOne({ videoKey });
}

async function findById(id) {
  const c = await col();
  return c.findOne({ _id: new ObjectId(id) });
}

module.exports = {
  ensureIndexes,
  createFromImageKey,
  setAudioKey,
  setDescriptionText,
  setLLMText,
  setGenerationJob,
  setVideoKeyByJob,
  findByVideoKey,
  findById
};

