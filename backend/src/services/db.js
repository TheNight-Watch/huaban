const { MongoClient } = require('mongodb');
const cfg = require('../config');
const logger = require('../utils/logger');

let client; // MongoClient singleton
let db;

async function connect() {
  if (db) return db;
  if (!cfg.mongo.uri) {
    throw new Error('MONGODB_URI not configured');
  }
  client = new MongoClient(cfg.mongo.uri, { maxPoolSize: 10 });
  await client.connect();
  db = client.db(cfg.mongo.db);
  logger.info('Connected MongoDB', { db: cfg.mongo.db });
  try {
    const artworks = require('./artworks');
    await artworks.ensureIndexes();
  } catch (e) {
    logger.warn('Ensure indexes failed', { error: e.message });
  }
  return db;
}

async function ping() {
  if (!cfg.mongo.uri) return { ok: false, reason: 'disabled' };
  try {
    const database = await connect();
    const r = await database.admin().command({ ping: 1 });
    return { ok: r?.ok === 1 };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

async function upsertClient(clientId, device = {}) {
  const database = await connect();
  const now = new Date();
  await database.collection('clients').updateOne(
    { _id: clientId },
    {
      $setOnInsert: { createdAt: now },
      $set: { lastSeenAt: now, device }
    },
    { upsert: true }
  );
}

module.exports = { connect, ping, upsertClient };
