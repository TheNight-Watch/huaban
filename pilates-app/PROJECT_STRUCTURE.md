# 项目架构设计

## 📂 目录结构

```
src/
├── components/              # 可复用组件
│   ├── common/             # 通用组件
│   │   ├── Button/         # 按钮组件
│   │   ├── Input/          # 输入框组件
│   │   ├── Modal/          # 模态框组件
│   │   ├── Loading/        # 加载组件
│   │   └── Toast/          # 提示组件
│   ├── layout/             # 布局组件
│   │   ├── Header/         # 头部组件
│   │   ├── Footer/         # 底部组件
│   │   ├── Sidebar/        # 侧边栏组件
│   │   └── Navigation/     # 导航组件
│   └── business/           # 业务组件
│       ├── ArtworkCard/    # 作品卡片
│       ├── DrawingCanvas/  # 绘画画布
│       ├── AIProcessor/    # AI处理组件
│       └── UploadArea/     # 上传区域
├── pages/                  # 页面组件
│   ├── SplashScreen.tsx    # 开屏页 ✅ 已完成
│   ├── Login/              # 登录相关页面
│   │   ├── LoginPage.tsx   # 登录页
│   │   └── RegisterPage.tsx # 注册页
│   ├── Home/               # 主页相关
│   │   ├── HomePage.tsx    # 主页
│   │   └── Dashboard.tsx   # 仪表板
│   ├── Gallery/            # 画廊/作品集
│   │   ├── GalleryPage.tsx # 作品列表
│   │   └── ArtworkDetail.tsx # 作品详情
│   ├── Create/             # 创作相关
│   │   ├── UploadPage.tsx  # 上传页面
│   │   ├── EditPage.tsx    # 编辑页面
│   │   └── ProcessPage.tsx # AI处理页面
│   └── Profile/            # 个人相关
│       ├── ProfilePage.tsx # 个人资料
│       └── SettingsPage.tsx # 设置页面
├── hooks/                  # 自定义Hook
│   ├── useAuth.ts          # 认证相关
│   ├── useUpload.ts        # 文件上传
│   ├── useAI.ts            # AI处理
│   └── useLocalStorage.ts  # 本地存储
├── context/                # React Context
│   ├── AuthContext.tsx     # 认证上下文
│   ├── AppContext.tsx      # 应用全局状态
│   └── ThemeContext.tsx    # 主题上下文
├── services/               # 服务层/API
│   ├── api/                # API调用
│   │   ├── auth.ts         # 认证API
│   │   ├── artwork.ts      # 作品API
│   │   ├── ai.ts           # AI服务API
│   │   └── upload.ts       # 上传API
│   ├── storage/            # 存储服务
│   │   ├── localStorage.ts # 本地存储
│   │   └── sessionStorage.ts # 会话存储
│   └── utils/              # 工具函数
│       ├── request.ts      # 请求封装
│       ├── constants.ts    # 常量定义
│       └── helpers.ts      # 辅助函数
├── types/                  # TypeScript类型定义
│   ├── auth.ts            # 认证相关类型
│   ├── artwork.ts         # 作品相关类型
│   ├── api.ts             # API响应类型
│   └── common.ts          # 通用类型
├── styles/                # 样式文件
│   ├── globals.css        # 全局样式
│   ├── components.css     # 组件样式
│   └── themes/            # 主题样式
│       ├── light.css      # 亮色主题
│       └── dark.css       # 暗色主题
├── assets/                # 静态资源
│   ├── images/            # 图片资源
│   ├── icons/             # 图标资源
│   └── fonts/             # 字体资源
├── config/                # 配置文件
│   ├── env.ts             # 环境配置
│   ├── routes.ts          # 路由配置
│   └── constants.ts       # 应用常量
└── tests/                 # 测试文件
    ├── components/        # 组件测试
    ├── pages/             # 页面测试
    ├── hooks/             # Hook测试
    └── utils/             # 工具函数测试
```

## 🎯 架构设计原则

### 1. 分层架构
- **表现层 (Presentation)**: Pages + Components
- **业务层 (Business)**: Hooks + Context
- **服务层 (Service)**: API + Utils
- **数据层 (Data)**: Types + Storage

### 2. 组件设计
- **原子组件 (Atoms)**: Button, Input, Icon
- **分子组件 (Molecules)**: SearchBox, Card, Form
- **有机体组件 (Organisms)**: Header, Gallery, Dashboard
- **模板组件 (Templates)**: PageLayout, ContentLayout
- **页面组件 (Pages)**: 具体业务页面

### 3. 状态管理
- **本地状态**: useState, useReducer
- **全局状态**: Context API
- **服务器状态**: React Query (可选)
- **表单状态**: React Hook Form

### 4. 路由设计
```typescript
/                    # 开屏页
/login              # 登录页
/register           # 注册页
/home               # 主页
/gallery            # 作品集
/gallery/:id        # 作品详情
/create             # 创作页面
/create/upload      # 上传页面
/create/edit/:id    # 编辑页面
/profile            # 个人资料
/settings           # 设置页面
```

## 🛠️ 技术栈建议

### 核心技术
- **React 18** + **TypeScript**
- **Tailwind CSS** (已配置)
- **React Router** (路由管理)
- **React Hook Form** (表单处理)

### 状态管理
- **Context API** (全局状态)
- **React Query** (服务器状态缓存)
- **Zustand** (轻量级状态管理,可选)

### UI/UX增强
- **Framer Motion** (动画效果)
- **React Spring** (过渡动画)
- **React Virtualized** (长列表优化)

### 工具库
- **Axios** (HTTP请求)
- **Day.js** (日期处理)
- **Lodash** (工具函数)
- **React DnD** (拖拽功能)

### AI集成
- **Canvas API** (画布处理)
- **File API** (文件上传)
- **WebRTC** (实时功能,可选)

## 🎨 设计系统

### 颜色主题
```css
:root {
  --primary: #3399E5;      /* 主色调-蓝色 */
  --secondary: #4DCC99;    /* 辅助色-绿色 */
  --background: #FFFFFF;   /* 背景色-白色 */
  --text-primary: #000000; /* 主文字-黑色 */
  --text-secondary: #666666; /* 次要文字-灰色 */
  --surface: #F9F7F3;     /* 表面色 */
}
```

### 组件规范
- **间距系统**: 4px 基础单位 (4, 8, 12, 16, 24, 32...)
- **圆角规范**: 小圆角 4px, 中圆角 8px, 大圆角 16px
- **阴影层级**: 卡片阴影, 浮层阴影, 模态框阴影
- **字体层级**: 标题, 副标题, 正文, 辅助文字

## 🚀 开发流程

### 1. 基础搭建 (已完成)
- ✅ 项目初始化
- ✅ Tailwind CSS配置
- ✅ 开屏页面

### 2. 核心组件 (进行中)
- 🔄 基础UI组件
- 🔄 布局组件
- 🔄 业务组件

### 3. 页面开发
- 📋 登录/注册页面
- 📋 主页/仪表板
- 📋 作品集页面
- 📋 创作页面

### 4. 功能集成
- 📋 用户认证
- 📋 文件上传
- 📋 AI处理
- 📋 数据存储

### 5. 优化完善
- 📋 性能优化
- 📋 错误处理
- 📋 测试覆盖
- 📋 部署配置
