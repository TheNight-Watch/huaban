# 画伴 APP 数据库设计（MongoDB V1）

本设计基于无登录的匿名 `clientId` 模式，结合 Doubao 文字/视频生成能力与私有存储桶直传方案，覆盖 PRD 的画廊、作品、生成、分析与成长页。

## 命名与通用约定
- 主键：除 `clients._id` 为字符串 `clientId` 外，其余集合默认使用 `ObjectId`。
- 时间：统一 `createdAt/updatedAt`，UTC ISODate。
- 软删除：V1 不做软删，直接删除；重要产物依靠对象存储回收策略。
- 多租隔离：所有与用户相关集合均含 `clientId` 字段。
- 引用：通过 `ObjectId` 关联，必要时使用投影与 `$lookup`（尽量少用）。

## 集合一览
- clients：匿名客户端登记
- profiles：儿童档案（单客户端 0/1 条）
- mediaAssets：媒资元信息（图/音/视频/JSON）
- artworks：作品（聚合媒资与文本）
- jobs：生成/分析作业（Mongo 抢占 + 续租）
- aiAnalyses：AI 分析结果
- request_counters：接口频控计数（TTL 自动过期）

---

## clients
匿名设备标识登记与心跳。

示例文档：
```
{
  _id: "clt_7sJgYb8w3k", // 即 clientId
  createdAt: ISODate("2025-09-15T10:00:00Z"),
  lastSeenAt: ISODate("2025-09-15T10:05:12Z"),
  device: { ua: "Mozilla/5.0 ...", ipHash: "sha256:..." }
}
```
索引：
- `{ lastSeenAt: -1 }`

---

## profiles
儿童画像基础信息（V1 单个档案，后续可扩展为多子档案）。

示例文档：
```
{
  _id: ObjectId(),
  clientId: "clt_7sJgYb8w3k",
  nickname: "小苹果",
  age: 5,
  avatarAssetId: ObjectId("..."),
  description: "好奇心满满的科学家",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```
索引：
- `{ clientId: 1 }` 唯一（单客户端仅一个档案）

---

## mediaAssets
对象存储中的媒资指针与属性。

示例文档：
```
{
  _id: ObjectId(),
  clientId: "clt_7sJgYb8w3k",
  bucket: "huaban-prod",          // 可从环境变量注入，也建议落库以便多桶场景
  key: "clients/clt_7sJgYb8w3k/artworks/65f.../original/v1/file.png",
  kind: "image",                   // image | audio | video | json | other
  purpose: "artwork_cover",        // artwork_cover | artwork_audio | artwork_video | analysis_overlay | profile_avatar | tmp_upload | other
  etag: "\"d41d8cd98f00b204e9800998ecf8427e\"",
  mime: "image/png",
  size: 3482123,
  width: 1024,                      // 可选（image/video）
  height: 1024,                     // 可选
  durationSec: 5.02,                // 可选（audio/video）
  hash: "sha256:...",              // 可选，去重/校验
  createdAt: ISODate("...")
}
```
索引：
- `{ bucket: 1, key: 1 }` 唯一
- `{ clientId: 1, createdAt: -1 }`
- 可选 `{ hash: 1 }`（便于复用/查重）

---

## artworks
作品实体，聚合封面、描述、口述音频、生成视频与分析状态。

示例文档：
```
{
  _id: ObjectId(),
  clientId: "clt_7sJgYb8w3k",
  title: "小恐龙的探险",
  description: "在森林里和朋友们玩耍……",
  coverAssetId: ObjectId("..."),   // 图片媒资
  audioAssetId: ObjectId("..."),   // 可选：口述音频
  videoAssetId: ObjectId("..."),   // 可选：生成后写入
  analysisId: ObjectId("..."),     // 可选：AI 分析结果
  status: "ready",                  // draft | generating | ready | failed
  tags: ["恐龙", "森林"],
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```
索引：
- `{ clientId: 1, createdAt: -1 }`
- `{ status: 1, clientId: 1 }`

---

## jobs
生成/分析任务，使用 MongoDB 实现队列（原子抢占 + 续租）。

示例文档：
```
{
  _id: ObjectId(),
  type: "video_generate",           // video_generate | ai_analysis
  clientId: "clt_7sJgYb8w3k",
  artworkId: ObjectId("..."),
  input: {
    imageAssetId: ObjectId("..."),
    audioAssetId: ObjectId("..."),   // 可选
    promptText: "孩子口述或总结文本",   // 可选
    model: "doubao-seedance-1-0-pro-250528",
    options: { resolution: "1080p", duration: 5, camerafixed: false, watermark: true }
  },
  status: "queued",                  // queued | processing | completed | failed
  phase: "queued",                   // 细分阶段：queued|generating|compositing|completed|failed
  provider: "ark",                   // 抖音火山引擎 Ark 平台
  providerTaskId: null,               // 提交后回填
  priority: 0,
  attempts: { count: 0, max: 3 },
  progress: 0,
  error: null,                        // { code, message, providerRaw? }
  lockedAt: null,
  leaseUntil: null,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```
索引：
- `{ status: 1, priority: -1, createdAt: 1 }`
- `{ leaseUntil: 1 }`
- `{ provider: 1, providerTaskId: 1 }` 唯一（便于回查）
- `{ artworkId: 1 }`

---

## aiAnalyses
针对作品的 AI 结构化分析结果。

示例文档：
```
{
  _id: ObjectId(),
  clientId: "clt_7sJgYb8w3k",
  artworkId: ObjectId("..."),
  model: "doubao-1-5-pro-256k-250115",
  summary: "作品表达了……",
  bullets: ["主体是……", "配色偏……", "情绪……"],
  boxes: [
    { label: "小恐龙", score: 0.91, rect: { x: 0.12, y: 0.20, w: 0.30, h: 0.25 } }
  ],
  abilities: {                      // 0-100
    storytelling: 72,
    imagination: 85,
    emotion: 66,
    logic: 58,
    observation: 74
  },
  createdAt: ISODate("...")
}
```
索引：
- `{ artworkId: 1 }` 唯一（一个作品对应一份最新分析）
- `{ clientId: 1, createdAt: -1 }`

---

## request_counters
接口频控计数，按窗口聚合 + TTL 自动过期。

示例文档：
```
{
  _id: ObjectId(),
  route: "/upload/presign",
  clientId: "clt_7sJgYb8w3k",
  windowStart: ISODate("2025-09-15T10:00:00Z"), // 向下取整到分钟/秒
  count: 3,
  expiresAt: ISODate("2025-09-15T10:01:00Z")   // TTL = window + 粘性
}
```
索引：
- `{ route: 1, clientId: 1, windowStart: 1 }` 唯一
- `{ expiresAt: 1 }` TTL

---

## JSON Schema 校验（建议）
以下为关键集合的示例校验器（可在初始化阶段通过 `db.createCollection` 与 `validator` 设置）。字段可按需精简。

artworks：
```
{
  $jsonSchema: {
    bsonType: "object",
    required: ["clientId", "title", "coverAssetId", "status", "createdAt", "updatedAt"],
    properties: {
      clientId: { bsonType: "string", minLength: 8 },
      title: { bsonType: "string", minLength: 1, maxLength: 120 },
      description: { bsonType: ["string", "null"], maxLength: 2000 },
      coverAssetId: { bsonType: "objectId" },
      audioAssetId: { bsonType: ["objectId", "null"] },
      videoAssetId: { bsonType: ["objectId", "null"] },
      analysisId: { bsonType: ["objectId", "null"] },
      status: { enum: ["draft", "generating", "ready", "failed"] },
      tags: { bsonType: ["array", "null"], items: { bsonType: "string", maxLength: 36 }, maxItems: 20 },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" }
    }
  }
}
```

mediaAssets：
```
{
  $jsonSchema: {
    bsonType: "object",
    required: ["clientId", "bucket", "key", "kind", "purpose", "etag", "mime", "size", "createdAt"],
    properties: {
      clientId: { bsonType: "string" },
      bucket: { bsonType: "string" },
      key: { bsonType: "string" },
      kind: { enum: ["image", "audio", "video", "json", "other"] },
      purpose: { enum: ["artwork_cover", "artwork_audio", "artwork_video", "analysis_overlay", "profile_avatar", "tmp_upload", "other"] },
      etag: { bsonType: "string" },
      mime: { bsonType: "string" },
      size: { bsonType: "int" },
      width: { bsonType: ["int", "null"] },
      height: { bsonType: ["int", "null"] },
      durationSec: { bsonType: ["double", "int", "null"] },
      hash: { bsonType: ["string", "null"] },
      createdAt: { bsonType: "date" }
    }
  }
}
```

jobs：
```
{
  $jsonSchema: {
    bsonType: "object",
    required: ["type", "clientId", "artworkId", "input", "status", "priority", "attempts", "createdAt", "updatedAt"],
    properties: {
      type: { enum: ["video_generate", "ai_analysis"] },
      clientId: { bsonType: "string" },
      artworkId: { bsonType: "objectId" },
      input: {
        bsonType: "object",
        required: ["model"],
        properties: {
          imageAssetId: { bsonType: ["objectId", "null"] },
          audioAssetId: { bsonType: ["objectId", "null"] },
          promptText: { bsonType: ["string", "null"] },
          model: { bsonType: "string" },
          options: { bsonType: ["object", "null"] }
        }
      },
      status: { enum: ["queued", "processing", "completed", "failed"] },
      phase: { enum: ["queued", "generating", "compositing", "completed", "failed"], description: "仅 video_generate 使用" },
      provider: { enum: ["ark"], description: "Volcengine Ark" },
      providerTaskId: { bsonType: ["string", "null"] },
      priority: { bsonType: "int" },
      attempts: { bsonType: "object", required: ["count", "max"], properties: { count: { bsonType: "int" }, max: { bsonType: "int" } } },
      progress: { bsonType: ["int", "double", "null"] },
      error: { bsonType: ["object", "null"] },
      lockedAt: { bsonType: ["date", "null"] },
      leaseUntil: { bsonType: ["date", "null"] },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" }
    }
  }
}
```

aiAnalyses：
```
{
  $jsonSchema: {
    bsonType: "object",
    required: ["clientId", "artworkId", "model", "summary", "abilities", "createdAt"],
    properties: {
      clientId: { bsonType: "string" },
      artworkId: { bsonType: "objectId" },
      model: { bsonType: "string" },
      summary: { bsonType: "string" },
      bullets: { bsonType: ["array", "null"], items: { bsonType: "string" }, maxItems: 20 },
      boxes: {
        bsonType: ["array", "null"],
        items: {
          bsonType: "object",
          required: ["label", "score", "rect"],
          properties: {
            label: { bsonType: "string" },
            score: { bsonType: ["double", "int"] },
            rect: { bsonType: "object", required: ["x", "y", "w", "h"], properties: { x: { bsonType: ["double", "int"] }, y: { bsonType: ["double", "int"] }, w: { bsonType: ["double", "int"] }, h: { bsonType: ["double", "int"] } } }
          }
        }
      },
      abilities: {
        bsonType: "object",
        required: ["storytelling", "imagination", "emotion", "logic", "observation"],
        properties: {
          storytelling: { bsonType: ["int", "double"] },
          imagination: { bsonType: ["int", "double"] },
          emotion: { bsonType: ["int", "double"] },
          logic: { bsonType: ["int", "double"] },
          observation: { bsonType: ["int", "double"] }
        }
      },
      createdAt: { bsonType: "date" }
    }
  }
}
```

request_counters：
```
{
  $jsonSchema: {
    bsonType: "object",
    required: ["route", "clientId", "windowStart", "count", "expiresAt"],
    properties: {
      route: { bsonType: "string" },
      clientId: { bsonType: "string" },
      windowStart: { bsonType: "date" },
      count: { bsonType: "int" },
      expiresAt: { bsonType: "date" }
    }
  }
}
```

---

## 索引初始化脚本片段
供参考（伪代码/`mongosh` 风格）：
```
db.clients.createIndex({ lastSeenAt: -1 })

db.profiles.createIndex({ clientId: 1 }, { unique: true })

db.mediaAssets.createIndex({ bucket: 1, key: 1 }, { unique: true })
db.mediaAssets.createIndex({ clientId: 1, createdAt: -1 })

db.artworks.createIndex({ clientId: 1, createdAt: -1 })
db.artworks.createIndex({ status: 1, clientId: 1 })

db.jobs.createIndex({ status: 1, priority: -1, createdAt: 1 })
db.jobs.createIndex({ leaseUntil: 1 })
db.jobs.createIndex({ provider: 1, providerTaskId: 1 }, { unique: true, sparse: true })
db.jobs.createIndex({ artworkId: 1 })

db.aiAnalyses.createIndex({ artworkId: 1 }, { unique: true })
db.aiAnalyses.createIndex({ clientId: 1, createdAt: -1 })

db.request_counters.createIndex({ route: 1, clientId: 1, windowStart: 1 }, { unique: true })
db.request_counters.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

---

## 与 PRD 的字段映射
- 画廊（GalleryPage）：`artworks` 列表，封面 `coverAssetId` 取缩略图；分页基于 `createdAt`。
- 作品详情（ArtworkDetailPage）：`artworks` + 生成后 `videoAssetId`，附 `description` 与 `audioAssetId` 播放。
- AI 分析（AIAnalysisPage）：`aiAnalyses` 的 `summary/bullets/boxes/abilities`。
- 上传与描述（Camera/Description/Generation）：上传媒资 → `mediaAssets`；提交作业 → `jobs`；完成后回写 `artworks.videoAssetId` 与 `aiAnalyses`。
- 成长页（GrowPage）：`profiles` + 历史 `artworks` 聚合生成周报；雷达图来自 `aiAnalyses.abilities` 的时间窗口统计。

---

## 版本与迁移
- V1：当前文档。后续若引入账号体系，将把 `clientId` 过渡为 `userId` 并保留 `clientId` 作为设备维度字段。
- V2：支持多儿童档案（profiles 增加 `childId` 与 artworks 关联字段），以及向量检索相关集合。

