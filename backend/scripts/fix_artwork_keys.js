#!/usr/bin/env node
// Update an existing artwork's keys to standardized full object keys
// Usage:
//   npm run fix:keys -- \
//     --oldVideoKey "守夜人 2025-09-09 03.38.16" \
//     --newVideoKey "public/videos/守夜人 2025-09-09 03.38.16.mp4" \
//     --audioKey "public/audio/test.mp3"

const { MongoClient } = require('mongodb');
require('dotenv').config();

function arg(name, fallback) {
  const x = process.argv.find(v => v.startsWith(`--${name}=`));
  return x ? x.split('=').slice(1).join('=') : fallback;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'huaban';
  if (!uri) {
    console.error('Missing MONGODB_URI in env');
    process.exit(1);
  }

  const oldVideoKey = arg('oldVideoKey');
  const id = arg('id');
  const newVideoKey = arg('newVideoKey');
  const audioKey = arg('audioKey');
  if ((!oldVideoKey && !id) || !newVideoKey) {
    console.error('Usage: (--oldVideoKey="..." | --id="<hex>") --newVideoKey="..." [--audioKey="..."]');
    process.exit(2);
  }

  const client = new MongoClient(uri, { maxPoolSize: 5 });
  await client.connect();
  const db = client.db(dbName);
  const c = db.collection('artworks');

  let query;
  if (id) {
    const { ObjectId } = require('mongodb');
    try {
      query = { _id: new ObjectId(id) };
    } catch (e) {
      console.error('Invalid --id provided, must be 24-char hex');
      process.exit(2);
    }
  } else {
    query = { videoKey: oldVideoKey };
  }
  const before = await c.findOne(query);
  if (!before) {
    console.error('No document found with oldVideoKey:', oldVideoKey);
    await client.close();
    process.exit(3);
  }

  console.log('Before:', before);
  const now = new Date();
  const update = { $set: { videoKey: newVideoKey, updatedAt: now } };
  if (audioKey) update.$set.audioKey = audioKey;
  const r = await c.updateOne({ _id: before._id }, update);
  console.log('Update result:', { matchedCount: r.matchedCount, modifiedCount: r.modifiedCount });

  const after = await c.findOne({ _id: before._id });
  console.log('After:', after);
  await client.close();
}

main().catch(e => {
  console.error(e);
  process.exit(10);
});
