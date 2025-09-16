require('dotenv').config();

function bool(v, def = false) {
  if (v === undefined) return def;
  return ["1", "true", "yes", "on"].includes(String(v).toLowerCase());
}

const cfg = {
  env: process.env.NODE_ENV || 'production',
  port: parseInt(process.env.PORT || '8080', 10),
  logLevel: process.env.LOG_LEVEL || 'info',

  mongo: {
    uri: process.env.MONGODB_URI || '',
    db: process.env.MONGODB_DB || 'huaban'
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT || '',
    region: process.env.S3_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || '',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    forcePathStyle: bool(process.env.S3_FORCE_PATH_STYLE, true)
  },

  presign: {
    expiresSec: parseInt(process.env.PRESIGN_EXPIRES_S || '600', 10)
  },

  gallery: {
    prefix: process.env.GALLERY_PREFIX || 'public/videos/'
  },

  images: {
    prefix: process.env.IMAGES_PREFIX || 'public/images/'
  },

  audio: {
    prefix: process.env.AUDIO_PREFIX || 'private/audio/'
  },

  stt: {
    baseURL: process.env.STT_BASE_URL || 'https://openspeech.bytedance.com',
    appId: process.env.STT_APP_ID || process.env.STT_APP_KEY || '',
    accessToken: process.env.STT_ACCESS_TOKEN || '',
    resourceId: process.env.STT_RESOURCE_ID || 'volc.bigasr.auc'
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  },

  ark: {
    baseURL: process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com',
    apiKey: process.env.ARK_API_KEY || '',
    videoModel: process.env.VIDEO_MODEL || 'doubao-seedance-1-0-pro-250528',
    textModel: process.env.TEXT_MODEL || 'doubao-1-5-pro-256k-250115',
    callbackURL: process.env.ARK_CALLBACK_URL || ''
  }
};

module.exports = cfg;
