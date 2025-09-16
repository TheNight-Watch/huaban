# 画伴 APP 后端开发计划（MVP 严格版）

原则
- 快速联调：尽可能不改动前端 UI 结构；仅在需要时新增极少量接口调用。
- 先跑通功能：不引入冗余安全策略；媒体走存储桶，Mongo 仅存指针与文本。
- 分阶段递进：每个阶段完成可验证的目标，测试通过后进入下一阶段。

技术要点
- 后端：Node.js（Express），MongoDB（artworks 集合），S3 兼容对象存储（私有桶，预签名），豆包（Ark 视频、Chat 文本），OpenSpeech（录音转写）。
- 前缀：
  - 图片 IMAGES_PREFIX=`public/images/`
  - 音频 AUDIO_PREFIX=`private/audio/`
  - 视频 GALLERY_PREFIX=`public/videos/`

数据模型（Mongo：artworks）
- 字段：
  - `_id` ObjectId
  - `imageKey?` 拍照图片 key（IMAGES_PREFIX）
  - `audioKey?` 录音 key（AUDIO_PREFIX）
  - `videoKey?` 成片 key（GALLERY_PREFIX）
  - `descriptionText?` 录音转写文本（STT 输出）
  - `llmText?` 文本大模型（豆包 Chat）处理后的提示语
  - `status` `'draft'|'transcribed'|'llm_ready'|'generating'|'ready'|'failed'`
  - `generation?` `{ jobId?, provider?, progress?, error?, startedAt?, completedAt? }`
  - `createdAt`, `updatedAt`
- 索引：`{ videoKey: 1 }` 唯一+稀疏，`{ createdAt: -1 }`

接口概览（最小集）
- 展示：
  - `GET /gallery` → 列出 `GALLERY_PREFIX` 下视频（预签名可播）
  - `GET /artworks/by-video-key?key=` → 返回 `{ descriptionText, llmText?, audio?:{key,url} }`
- 上传与作品：
  - `POST /upload/presign` → 直传签名（自动按 contentType 决定前缀）
  - `POST /artworks/from-image-key` → `{ imageKey }` 建作品，返 `{ artworkId }`
  - `POST /artworks/:id/audio/presign` → 音频直传签名（m4a/webm）
  - `POST /artworks/:id/audio/commit` → `{ audioKey }`
- 转写与生成：
  - `POST /artworks/:id/transcribe` → MVP 支持 `{ text }` 直填；后续接 OpenSpeech（submit+query）
  - `POST /artworks/:id/run-llm` → 用 `descriptionText` 调豆包 Chat，存 `llmText`
  - `POST /artworks/:id/generate` → 用 `imageKey + (llmText||descriptionText)` 调 Ark 图生视频
  - `GET /generation/jobs/:id` → 查询 Ark 任务
  - `POST /generation/jobs/:id/capture` → 下载 Ark 成片并上传至 `GALLERY_PREFIX`，更新 `artworks.videoKey`

分阶段里程碑（每阶段均含“前端改动最小化”的对接点与验收）

阶段 1：画廊与详情页视频（需求 1）
- 目标：前端画廊展示桶中视频；详情页可播放同一视频。
- 后端：`GET /gallery`（已就绪）
- 前端：进入画廊调用 `/gallery`；选中项在详情页用返回的 `url` 播放（已接入）。
- 验收：
  - 画廊出现桶中视频（`GALLERY_PREFIX`），点击进入详情页可播放。

阶段 2：详情页文案与录音（需求 2）
- 目标：详情页展示 Mongo 中的 `descriptionText` 与录音（如有）。
- 后端：`GET /artworks/by-video-key?key=`（已就绪）
- 前端：详情页在有 `videoKey` 时调用该接口并渲染文本；播放按钮使用返回的 `audio.url`。
- 验收：
  - 在 Mongo 插入一条与某个 `videoKey` 匹配的文档，前端详情页能显示文本并播放音频。

阶段 3：上传/录音/转写/文本 LLM/发起生成（需求 3）
- 目标：拍照→建作品→录音并转写→文本大模型→生成任务。
- 后端：已实现接口（见上），STT 先走 `{ text }` 路径；随后接 OpenSpeech：
  - `submit(audioUrl)` → 返回 taskId；`query(taskId)` 取转写结果写入 `descriptionText`
- 前端：
  - 拍照后（或选图）后台：`/upload/presign(image)`→PUT→`/artworks/from-image-key` 缓存 `artworkId`
  - 描述页“下一步”：若有音频，则 `audio/presign`→PUT→`audio/commit`；调用 `transcribe`（先传 `text`）；调 `run-llm`；进入生成页调用 `generate`
- 验收：
  - 后台日志可见 `artworkId`、`descriptionText`、`llmText`、`jobId` 均成功写入；`GET /generation/jobs/:id` 状态有效。

阶段 4：成片回桶与前端展示（需求 4）
- 目标：生成完成后视频写回桶，详情页显示视频+文案+录音。
- 后端：`POST /generation/jobs/:id/capture`（已就绪，且会更新 `artworks.videoKey`）
- 前端：生成完成后后台调用 `capture`；画廊刷新可见新视频；详情页按 `videoKey` 调 `by-video-key` 渲染。
- 验收：
  - 新视频出现在画廊；详情页展示 `descriptionText` 与录音播放按钮；Mongo 中 `videoKey` 正确更新。

前端改动范围（最小化）
- 画廊：`GET /gallery`（已接入）
- 详情页：在有 `videoKey` 时调用 `GET /artworks/by-video-key`（新增极少量代码）
- 上传/生成：后台调用接口（不改 UI），保留现有交互与动效

环境变量（后端 .env）
- Mongo：`MONGODB_URI`、`MONGODB_DB`
- S3：`S3_ENDPOINT`、`S3_REGION`、`S3_BUCKET`、`S3_ACCESS_KEY_ID`、`S3_SECRET_ACCESS_KEY`、`S3_FORCE_PATH_STYLE`
- 前缀：`IMAGES_PREFIX`、`AUDIO_PREFIX`、`GALLERY_PREFIX`
- 预签名：`PRESIGN_EXPIRES_S`
- 豆包/Ark：`ARK_API_KEY`、`ARK_BASE_URL`、`VIDEO_MODEL`、`TEXT_MODEL`
- OpenSpeech：`STT_BASE_URL`、`STT_APP_ID`、`STT_ACCESS_TOKEN`、`STT_RESOURCE_ID`

说明
- 录音真实接入可在阶段 3 后半段进行（先用 `text` 直填验证链路）。
- 若需要“公共画廊仅按桶展示”且不登录，`artworks` 只作为详情页数据源与生成编排的状态存储。

