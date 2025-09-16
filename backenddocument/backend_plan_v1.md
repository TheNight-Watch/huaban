请你# 画伴 APP 后端开发计划（V1）

本计划基于：
- PRD：backenddocument/PRD_儿童绘画AI记录APP.md
- 平台：Sealos（MongoDB、对象存储“存储桶”/S3 兼容）
- 技术栈：Node.js（无登录版本），MongoDB，S3 兼容对象存储
- 约束：不使用 Redis；对象直接落“存储桶”；前端已部署

## 1. 目标与范围
- 支撑 MVP 全流程：上传/描述 → 生成 → 回看 → AI 分析 → 成长页
- 无账号登录：以匿名设备/客户端标识管理数据隔离（单设备可用）
- 降本提速：不引入 Redis/Kafka；用 MongoDB + S3 即可上线
- 对隐私友好：私有桶 + 预签名访问；最小化收集与脱敏

不在本次范围：多端同步、家长账号、第三方登录、向量检索推荐（后续迭代）

## 2. 架构设计
- API 服务：Node.js（建议 Express/Hono），REST + 轮询为主，可渐进增强为 SSE
- 数据库：MongoDB（Sealos 实例），TTL 索引实现过期清理与频控
- 存储桶：S3 兼容（Sealos 对象存储），全部私有；预签名上传/下载
- 任务执行：生成/分析作业由「Worker 进程」消费 MongoDB jobs 集合（原子抢占+续租）
- 外部依赖：
  - 文字模型：Doubao-1.5-pro-256k（生成说明/洞察）
  - 动画生成：doubao-seedance-1-0-pro-250528（生成视频）

参考部署形态：
- `api`（HTTP 服务）
- `worker`（定时轮询 jobs；可按副本数扩缩）
- 可选 `cron`（清理任务、统计聚合）

## 3. 配置与环境变量
- MongoDB：`MONGODB_URI`、`MONGODB_DB`
- S3：`S3_ENDPOINT`、`S3_REGION`、`S3_BUCKET`、`S3_ACCESS_KEY_ID`、`S3_SECRET_ACCESS_KEY`、`S3_FORCE_PATH_STYLE`（MinIO/厂商时 true）
- 预签名：`PRESIGN_EXPIRES_S`（默认 600s）
- AI API：`AI_DOU_BAO_API_KEY`、`AI_SCAN_API_KEY`（按需）
- 运行：`NODE_ENV`、`PORT`、`LOG_LEVEL`

Secrets 均通过 Sealos 控制台注入（不写入仓库）。

## 4. 标识与鉴别（无登录）
- 客户端生成并持久化 `clientId`（`nanoid`），所有请求携带 `X-Client-Id` 头
- 服务器以 `clientId` 作为数据隔离键；跨端同步不保证（引入账号后再合并）
- 简单防刷：
  - `request_counters`（Mongo）记录窗口内调用次数 + TTL
  - 关键接口校验 `Origin/Referer` 与签名有效期（预签名仅短期有效）

## 5. API 设计（MVP）
- 健康检查
  - `GET /healthz`：存活与依赖探针
- 客户端初始化
  - `POST /init`：校验/登记 `clientId`，返回可用的上传策略与限制
- 画廊
  - `GET /gallery?cursor=&limit=`：按时间倒序分页返回该 `clientId` 的作品摘要
- 上传与素材
  - `POST /upload/presign`：请求图片/音频/视频等对象的预签名 URL（类型、mime、期望大小）
  - `POST /media/commit`：上报已上传对象的 `key/etag/mime/size`，生成可用 `mediaAsset` 记录
- 作品
  - `POST /artworks`：创建作品（标题、描述、封面 `mediaAssetId`、录音 `mediaAssetId` 等）
  - `GET /artworks/:id`：作品详情（含视频、文本、关联分析状态）
  - `PATCH /artworks/:id`：编辑标题/描述（后续迭代）
- 生成任务
  - `POST /generation/jobs`：提交生成视频任务（输入图+口述文本/音频），返回 `jobId`
  - `GET /generation/jobs/:id`：查询状态 progress=[0..100]，`phase=queued|generating|compositing|completed|failed`
- AI 分析
  - `GET /ai/analyses/:artworkId`：分析结果（结构化要点+标注框+文案）
- 成长页
  - `GET /grow/profile`：儿童档案（匿名存储：昵称/年龄/描述/头像）
  - `POST /grow/profile`：创建/更新档案
  - `GET /grow/report?period=week&range=1`：周报与能力雷达（从历史作品聚合）

说明：所有接口要求 `X-Client-Id`，除 `/healthz` 外。

## 6. 媒体与对象存储策略
- 桶权限：私有；仅通过服务端生成的预签名 URL 访问
- Key 规范：`clients/{clientId}/artworks/{artworkId}/{type}/v{n}/file.{ext}`，`type=original|thumb|audio|video|analysis`
- 前端直传：后端签名，客户端直传桶，上传后 `commit` 校验 etag/size/mime
- 下载：短期预签名（或通过私有 CDN 回源）

## 7. 任务与工作流（无 Redis）
- `jobs` 集合：`_id, type('generate'|'analyze'), clientId, artworkId, inputRefs[], status, priority, attempts, lockedAt, leaseUntil, progress, error, createdAt, updatedAt`
- 抢占：`findOneAndUpdate({status:'queued', $or:[{leaseUntil:{$lt:now}}, {leaseUntil:null}]}, {$set:{status:'processing',lockedAt:now,leaseUntil:now+lease}})`
- 续租：worker 定时续租，避免长任务被其他实例抢占
- 完成：写回产物 `mediaAsset` 与 `aiAnalyses`，更新 `artworks` 字段
- 通知：前端轮询 `GET /generation/jobs/:id`；后续可加 SSE

## 8. 数据模型（占位，待确认后细化）
提示：本节仅列集合与核心字段，详细 Schema 与索引将于确认后输出至 `backenddocument/db_schema_v1.md`。
- `clients`：`_id(clientId), createdAt, lastSeenAt, device`（UA/IP）
- `mediaAssets`：`_id, clientId, key, etag, mime, size, width?, height?, duration?, hash?, createdAt`
- `artworks`：`_id, clientId, title, description, coverAssetId, audioAssetId?, videoAssetId?, status('draft'|'ready'), createdAt, updatedAt`
- `jobs`：见上（带索引：`status+priority`、`leaseUntil TTL`）
- `aiAnalyses`：`_id, clientId, artworkId, summary, tags[], boxes[], scores, abilities, createdAt`
- `profiles`：`_id, clientId, nickname, age, avatarAssetId?, description, createdAt, updatedAt`
- `request_counters`：`_id(route+clientId+window), count, expiresAt(TTL)`

## 9. 安全与合规
- 数据最小化：不收集 PII；`clientId` 为匿名标识
- 桶私有：统一用预签名；URL 有效期短；服务端仅保存指针与元信息
- 输入校验：使用 `zod/joi` 校验体积、mime、字段范围
- 频控：Mongo TTL 计数；关键接口做大小与速率限制
- 日志与审计：屏蔽对象 key 中的敏感 path；错误日志不含用户内容

## 10. 监控与运维
- 健康检查：`/healthz` 自检依赖（Mongo/S3）
- 应用日志：`pino`（JSON），Sealos 控制台聚合
- 指标：基础 QPS、错误率、任务时长、生成成功率；可导出到 Prometheus（后续）
- 清理：定期清理失败任务、过期计数、孤儿对象（Cron）

## 11. 代码结构与依赖建议
- 目录
  - `src/app.ts`（入口）
  - `src/routes/*.ts`（路由）
  - `src/services/{db,s3,ai,job}.ts`
  - `src/models/*.ts`（Schema/索引）
  - `src/workers/generation.ts`
  - `src/utils/{logger,validator}.ts`
- 关键依赖（建议）：`express` 或 `hono`、`mongodb`、`@aws-sdk/client-s3`、`pino`、`zod`、`dotenv`、`nanoid`

## 12. 交付里程碑（MVP）
- M0（今天）：输出后端开发计划（当前文档）
- M1（1–2 天）：落项目骨架 + 基础路由 + Mongo/S3 接入 + `/healthz`
- M2（2–3 天）：上传签名/commit、artworks CRUD、gallery 列表
- M3（3–5 天）：jobs + worker、生成流程打通（对接外部 API 的桩）
- M4（2 天）：AI 分析结果接口、成长页汇总
- M5（1 天）：监控/清理/限流、文档与验收

## 13. 验收标准
- PRD 主流程端到端可用（单设备）
- 所有对象私有可控，通过预签名访问；Mongo 有必要索引
- 失败任务可重试；系统指标与日志可观测
- 关键接口具备输入校验与基础频控

## 14. 后续路线（V2+）
- 登录与多端同步（邮箱/手机号/三方）
- 向量检索（Milvus）与推荐
- SSE/WS 实时进度与消息中心
- Kafka 引入支撑高吞吐与多消费组

—— 以上为 V1 计划，请确认。确认后我将输出详细数据库 Schema 与索引（db_schema_v1.md），并开始实现项目骨架。

前后端联调：
- 重启后端: 在 backend 终端 Ctrl+C 后，npm start
  - 重启前端: 在 pilates-app 终端 Ctrl+C 后，npm start（端口 3003）
  - 看画廊:
      - 桶 public/videos/ 下已有视频时，前端画廊应显示列表；点击任意项可在详情页播放
      - 桶为空或后端不可用时，回退显示原本 mock 数据（UI 不受影响）
  - 生成链路（可选）:
      - 在前端“上传→描述→生成”流程，生成页阶段后台会自动上传图片并发起 Doubao 任务（请看浏览器控制台的 jobId 日志）
  - 后端辅助验证（可在终端执行）:
      - curl -s http://localhost:8080/images?limit=10 | jq
      - Doubao 完成后抓取成片并写回画廊:
          - curl -s -X POST http://localhost:8080/generation/jobs/<jobId>/capture -H "Content-Type: application/json"
  -d '{}' | jq
          - curl -s http://localhost:8080/gallery | jq 查看新视频

  前端变更文件

  - pilates-app/src/services/api.ts 新增后端 API 封装
  - pilates-app/src/App.tsx 加入画廊加载与生成任务的异步副作用；修复 hooks 位置与依赖
  - pilates-app/src/pages/ArtworkDetailPage.tsx 支持传入 videoUrl 播放
  - pilates-app/src/pages/CameraPage.tsx/DescriptionPage.tsx 清理未用图标与变量
  - pilates-app/.env 增加 REACT_APP_API_BASE=http://localhost:8080

  后端变更文件

  - backend/src/app.js 新增 /images 与 /generation/jobs/:id/capture
  - backend/src/services/s3.js 增加 putObjectStream
  - backend/src/services/ark.js 增加 findFirstMediaUrl
  - backend/README.md 更新新增接口说明

  下一步提议

  - 我可以在前端生成页检测到 Doubao 任务完成时，自动调用 capture 并刷新画廊，从而用户生成的视频自动出现在画廊里。需要
  我继续加上这一步吗？如果你先跑上述验证，我随后就补这段自动化。

  MVP 前后端功能开发计划
  总体：尽可能简单快捷，快速进行前后端联调。尽可能不改动前端代码（在写前端接口的时候需要改动）
  不需要冗余的各种安全策略，先跑通功能
  

  1、画廊页展示对象存储桶里的视频（画作的动态视频），点击后的画作详情页同样展示画作动态视频。
  2、画作详情页展示 mongoDB 数据库中对于画面的描述和录音文件
  3、上传画作页点击拍照之后图片会自动发送到mongoDB，下一步的画面描述页面中，，用户录音完成点击下一步时，录音会调用录音转写 API，转成文字稿之后上传到 mongoDB，同时作为输入发送给 Doubao文字大模型进行处理。处理结果上传到 mongoDB 的同时作为输入发送给视频生成模型与图片一起发送给视频生成模型生成动态视频。
  4、动态视频生成后保存在对象存储中，同时根据前端交互逻辑，在画面详情页进行显示，同时调用mongoDB 中文字大模型的处理结果显示在前端，调用mongoDB 中用户录音显示在前端。

请你生成一个详细的开发文档和 todolist与我讨论，讨论之后按照 todolist 一条一条进行开发与测试，保证功能正常后才进行下一步操作
