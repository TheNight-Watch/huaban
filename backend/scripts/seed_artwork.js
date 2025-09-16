#!/usr/bin/env node
// Seed a single artwork document for Stage 2 verification
// Usage:
//   npm run seed:artwork -- --videoKey "public/videos/xxx.mp4" --audioKey "private/audio/test.m4a" --desc "孩子描述..."

const { MongoClient } = require('mongodb');
require('dotenv').config();

function getArg(name, def) {
  const prefix = `--${name}=`;
  const hit = process.argv.find(a => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  return def;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'huaban';
  if (!uri) {
    console.error('Missing MONGODB_URI in env.');
    process.exit(1);
  }

  const videoKey = getArg('videoKey');
  const audioKey = getArg('audioKey');
  const descriptionText = getArg('desc') || getArg('description');
  if (!videoKey) {
    console.error('Missing --videoKey argument.');
    process.exit(2);
  }

  const client = new MongoClient(uri, { maxPoolSize: 5 });
  await client.connect();
  const db = client.db(dbName);
  const c = db.collection('artworks');

  // Ensure indexes (idempotent)
  await c.createIndex({ videoKey: 1 }, { unique: true, sparse: true });
  await c.createIndex({ createdAt: -1 });

  const now = new Date();
  const update = {
    $setOnInsert: { createdAt: now, status: 'ready' },
    $set: { updatedAt: now }
  };
  if (typeof descriptionText === 'string' && descriptionText.trim()) {
    update.$set.descriptionText = descriptionText.trim();
  }
  if (typeof audioKey === 'string' && audioKey.trim()) {
    update.$set.audioKey = audioKey.trim();
  }

  const r = await c.updateOne({ videoKey }, update, { upsert: true });
  const doc = await c.findOne({ videoKey });
  console.log('Upsert result:', r.result || { matchedCount: r.matchedCount, upsertedId: r.upsertedId });
  console.log('Document:', doc);
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(10);
});

