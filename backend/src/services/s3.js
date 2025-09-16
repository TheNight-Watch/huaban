const { S3Client, HeadBucketCommand, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const cfg = require('../config');

let s3Client;

function getS3() {
  if (!s3Client) {
    if (!cfg.s3.bucket || !cfg.s3.accessKeyId || !cfg.s3.secretAccessKey) {
      throw new Error('S3 not configured');
    }
    const ep = cfg.s3.endpoint
      ? (cfg.s3.endpoint.startsWith('http') ? cfg.s3.endpoint : `https://${cfg.s3.endpoint}`)
      : undefined;
    s3Client = new S3Client({
      region: cfg.s3.region,
      endpoint: ep,
      forcePathStyle: cfg.s3.forcePathStyle,
      credentials: {
        accessKeyId: cfg.s3.accessKeyId,
        secretAccessKey: cfg.s3.secretAccessKey
      }
    });
  }
  return s3Client;
}

async function headBucket() {
  if (!cfg.s3.bucket || !cfg.s3.accessKeyId || !cfg.s3.secretAccessKey) {
    return { ok: false, reason: 'disabled' };
  }
  try {
    const s3 = getS3();
    await s3.send(new HeadBucketCommand({ Bucket: cfg.s3.bucket }));
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      reason: e.name || 'S3Error',
      message: e.message,
      status: e.$metadata?.httpStatusCode,
      code: e.Code || e.code
    };
  }
}

async function presignPutObject({ key, contentType, expiresSec }) {
  const s3 = getS3();
  const command = new PutObjectCommand({
    Bucket: cfg.s3.bucket,
    Key: key,
    ContentType: contentType || 'application/octet-stream'
  });
  const url = await getSignedUrl(s3, command, { expiresIn: expiresSec || cfg.presign.expiresSec });
  return { method: 'PUT', url, headers: { 'Content-Type': contentType || 'application/octet-stream' } };
}

async function presignGetObject({ key, expiresSec }) {
  const s3 = getS3();
  const command = new GetObjectCommand({ Bucket: cfg.s3.bucket, Key: key });
  const url = await getSignedUrl(s3, command, { expiresIn: expiresSec || cfg.presign.expiresSec });
  return { method: 'GET', url };
}

async function listObjects({ prefix, limit, token }) {
  const s3 = getS3();
  const cmd = new ListObjectsV2Command({
    Bucket: cfg.s3.bucket,
    Prefix: prefix,
    MaxKeys: Math.min(Math.max(limit || 30, 1), 100),
    ContinuationToken: token || undefined
  });
  const resp = await s3.send(cmd);
  return {
    items: (resp.Contents || []).map(o => ({ key: o.Key, size: o.Size, lastModified: o.LastModified })),
    nextCursor: resp.IsTruncated ? resp.NextContinuationToken : null
  };
}

module.exports = { headBucket, presignPutObject, presignGetObject, listObjects };

// Extra helper: upload from a readable stream (using lib-storage for streaming support)
async function putObjectStream({ key, contentType, body }) {
  const { Upload } = require('@aws-sdk/lib-storage');
  const s3 = getS3();
  
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: cfg.s3.bucket,
      Key: key,
      ContentType: contentType,
      Body: body,
    },
  });
  
  await upload.done();
  return { key };
}

module.exports.putObjectStream = putObjectStream;
