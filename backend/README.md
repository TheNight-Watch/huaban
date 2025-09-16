# Huaban Backend

Node.js + MongoDB + S3-compatible object storage (Sealos bucket). No login; anonymous `clientId` per device.

## Run (local)
1. Copy `.env.example` to `.env` and fill values.
2. Install deps: npm install
3. Start: npm start

## Env Vars
- `PORT` (default 8080)
- `MONGODB_URI`, `MONGODB_DB`
- `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE`
- `PRESIGN_EXPIRES_S` (default 600)
- `ARK_API_KEY`, `ARK_BASE_URL`, `VIDEO_MODEL`, `TEXT_MODEL`
- `CORS_ORIGINS` (comma separated), optional

## Key API
- `GET /healthz` health check
- `POST /init` register/refresh clientId
- `GET /gallery` list artworks
- `POST /upload/presign` create pre-signed URL
- `POST /media/commit` commit uploaded object to mediaAssets
- `POST /artworks` create artwork
- `GET /artworks/:id` get artwork details
- `POST /generation/jobs` create generation job
- `GET /generation/jobs/:id` get job status
- `GET /ai/analyses/:artworkId` analysis result
- `GET/POST /grow/profile` get/update profile
 - `GET /images` list images under `IMAGES_PREFIX`

See backenddocument/backend_plan_v1.md and backenddocument/db_schema_v1.md for details.
## Doubao (Volcengine Ark)
- Env: `ARK_API_KEY`, `ARK_BASE_URL`, `VIDEO_MODEL`, `TEXT_MODEL`
- Create I2V job:
  - POST `/generation/jobs` body: `{ "imageUrl": "https://...", "text": "描述", "options": { "resolution": "1080p", "duration": 5, "camerafixed": false, "watermark": true } }`
- Query:
  - GET `/generation/jobs/:id`

For demo, we proxy to Ark and return `jobId` and raw payload. Poll until status is completed/failed.

### Capture result to bucket (optional)
- `POST /generation/jobs/:id/capture` → downloads provider's result video URL and uploads to `GALLERY_PREFIX`, returns `{ key, url }`.
### Demo: Image -> Video with private bucket
1) Upload image
   - `curl -s -X POST http://localhost:8080/upload/presign -H "Content-Type: application/json" -d '{"contentType":"image/jpeg"}' | jq > resp.json`
   - `KEY=$(jq -r .key resp.json); PUT_URL=$(jq -r .put.url resp.json)`
   - `curl -X PUT "$PUT_URL" -H "Content-Type: image/jpeg" --data-binary @your.jpg`
2) Create job from key (server presigns GET for Ark)
   - `curl -s -X POST http://localhost:8080/generation/jobs/from-key -H "Content-Type: application/json" -d "{\"key\":\"$KEY\",\"text\":\"请生成5秒1080p动画\"}" | jq`
3) Poll status
   - `curl -s http://localhost:8080/generation/jobs/<jobId> | jq`
## Artworks (Mongo-backed)
- `POST /artworks/from-image-key` → body `{ imageKey }` → `{ artworkId }`
- `POST /artworks/:id/audio/presign` → presign PUT for audio (m4a)
- `POST /artworks/:id/audio/commit` → body `{ audioKey }` store pointer
- `POST /artworks/:id/transcribe` → body `{ text }` (MVP) store as `descriptionText`
- `POST /artworks/:id/run-llm` → refine `descriptionText` with Doubao, store as `llmText`
- `POST /artworks/:id/generate` → uses `imageKey + (llmText||descriptionText)` to create Ark I2V task, returns `{ jobId }`
- `GET /artworks/by-video-key?key=` → returns `{ descriptionText, llmText?, audio?:{key,url} }`

## Audio/Image/Video prefixes
- `IMAGES_PREFIX=public/images/` (camera uploads)
- `AUDIO_PREFIX=private/audio/` (recordings)
- `GALLERY_PREFIX=public/videos/` (generated videos shown in gallery)
