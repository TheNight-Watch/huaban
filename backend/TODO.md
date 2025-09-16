# 画伴后端 TODO（基于 MVP 开发计划，分阶段推进）

更新时间：请跟随每次开发与测试实时更新状态。

总目标（MVP）：快速联调、少改前端，分四个阶段依次打通。

— 阶段 1：画廊与详情页视频（需求 1）
- 目标：画廊展示桶内视频；详情页可播放同一视频。
- 后端：`GET /gallery`（就绪）
- 前端：进入画廊拉取 `/gallery`；详情页使用返回 `url` 播放（已接）
- 测试步骤：
  1) 往 `GALLERY_PREFIX` 放入 mp4
  2) 前端进入画廊应显示视频卡片
  3) 点击进入详情页能正常播放
- 状态：[x] 已完成（前后端联调通过）

— 阶段 2：详情页文案与录音（需求 2）
- 目标：详情页展示 Mongo 文案与录音。
- 后端：`GET /artworks/by-video-key?key=`（就绪）
- 前端：详情页在有 `videoKey` 时调用并渲染 `descriptionText`、`audio.url`
- 测试步骤：
  1) 在 Mongo 插入包含目标 `videoKey` 的 artworks 文档（含 `descriptionText`、可选 `audioKey`）
  2) 详情页应显示文本；如有 `audio.url`，播放正常
- 状态：[x] 已完成（前端能展示 description，音频可播放）

— 阶段 3：上传/录音/转写/文本 LLM/发起生成（需求 3）
- 目标：拍照→建作品→录音并转写→文本 LLM→Ark 任务。
- 后端：
  - `POST /artworks/from-image-key`（就绪）
  - `POST /artworks/:id/audio/presign` + `/commit`（就绪）
  - `POST /artworks/:id/transcribe`（先走 `{ text }` 直填；随后接 OpenSpeech submit+query）
  - `POST /artworks/:id/run-llm`（就绪）
  - `POST /artworks/:id/generate`（就绪）
- 前端：
  - 拍照后台上传图片并 `from-image-key` → 得到 `artworkId`
  - 描述页“下一步”后台：上传音频（可选）→ `transcribe`（先传文本）→ `run-llm` → 进入生成页调用 `generate`
- 测试步骤：
  1) `/upload/presign(image)` + PUT 上传图片
  2) `/artworks/from-image-key` 建作品，记录 `artworkId`
  3) `/artworks/:id/transcribe` 传文本
  4) `/artworks/:id/run-llm` 返回 `llmText`
  5) `/artworks/:id/generate` 返回 `jobId`
- 状态：[ ] 待联调验收；[ ] OpenSpeech 真接入（submit+query）

— 阶段 4：成片回桶与前端展示（需求 4）
- 目标：生成完成后写回桶，画廊与详情页显示成片与文案/录音。
- 后端：`POST /generation/jobs/:id/capture`（就绪，且更新 `videoKey`）
- 前端：后台在任务完成后调用 `capture` 并刷新画廊/详情
- 测试步骤：
  1) 轮询 `GET /generation/jobs/:id` 至完成
  2) 调 `POST /generation/jobs/:id/capture` 返回新 `key`
  3) `/gallery` 能看到新视频；详情页按 `videoKey` 能拉到文案与音频
- 状态：[ ] 待联调验收

—— 常用测试片段 ——
- 创建作品：
```
RESP=$(curl -s -X POST http://localhost:8080/upload/presign -H 'Content-Type: application/json' -d '{"contentType":"image/png"}')
IMG_KEY=$(echo "$RESP" | jq -r .key); PUT=$(echo "$RESP" | jq -r .put.url)
# 上传图片
curl -X PUT "$PUT" -H 'Content-Type: image/png' --data-binary @your.png
# 建作品
ART=$(curl -s -X POST http://localhost:8080/artworks/from-image-key -H 'Content-Type: application/json' -d "{\"imageKey\":\"$IMG_KEY\"}")
ART_ID=$(echo "$ART" | jq -r .artworkId)
```
- 转写与文本 LLM：
```
curl -s -X POST http://localhost:8080/artworks/$ART_ID/transcribe -H 'Content-Type: application/json' -d '{"text":"孩子描述..."}'
curl -s -X POST http://localhost:8080/artworks/$ART_ID/run-llm | jq
```
- 生成与捕获：
```
curl -s -X POST http://localhost:8080/artworks/$ART_ID/generate | jq
# 记录 jobId 后轮询状态 → 完成后：
curl -s -X POST http://localhost:8080/generation/jobs/$JOBID/capture -H 'Content-Type: application/json' -d '{}' | jq
```
- 详情数据：
```
curl -s "http://localhost:8080/artworks/by-video-key?key=public/videos/xxx.mp4" | jq
```

---
说明：此文件为开发过程的活文档，随开发推进实时更新状态与步骤。
