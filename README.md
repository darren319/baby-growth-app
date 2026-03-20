# 宝宝成长记录 App

一个面向新手父母的 Next.js MVP，支持：

- 邮箱注册 / 登录
- Google 登录入口
- 多宝宝档案管理
- 家庭共享基础版
- 成长记录 CRUD
- 图片 / 视频上传
- 时间轴回顾
- 相册聚合
- 里程碑管理
- 成长数据趋势图
- 搜索与筛选
- 家庭共享 / AI 周报 / 提醒功能占位

## 技术栈

- Next.js 15 + App Router
- TypeScript
- Tailwind CSS 4
- Supabase Auth / Database / Storage
- React Hook Form + Zod
- Recharts
- Capacitor（已预留 iOS / Android 容器配置）

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

可选配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

如果不配置 Supabase，项目会自动进入本地演示模式：

- 使用本地 Mock 登录
- 自动加载示例宝宝 / 记录 / 里程碑 / 成长数据
- 适合快速预览 UI 和流程

### 3. 启动开发环境

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 4. 生产构建

```bash
npm run build
```

构建后会导出静态站点到 `out/`。

本地预览导出结果：

```bash
npm run start
```

## Supabase 初始化

1. 在 Supabase 创建新项目
2. 打开 SQL Editor
3. 执行 [supabase/schema.sql](./supabase/schema.sql)
4. 确认 `baby-media` Storage bucket 已创建
5. 将项目 URL 和 anon key 填入 `.env.local`

## 目录结构

```text
src/
  app/
    (auth)/login
    (app)/dashboard
    (app)/babies
    (app)/memories
    (app)/timeline
    (app)/gallery
    (app)/family
    (app)/milestones
    (app)/growth
    (app)/future
  components/
    auth/
    babies/
    memories/
    milestones/
    growth/
    layout/
    providers/
    shared/
    ui/
  lib/
    repository/
    supabase/
    constants.ts
    mock-data.ts
    types.ts
    utils.ts
    validation.ts
supabase/
  schema.sql
capacitor.config.ts
```

## 主要脚本

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run mobile:sync
npm run mobile:open:android
npm run mobile:open:ios
```

## iOS / Android 容器

项目已配置 `capacitor.config.ts`，适合把 `out/` 导出的静态应用包进原生容器。

初始化原生工程后可使用：

```bash
npm run build
npm run mobile:sync
```

说明：

- Android APK 真正打包依赖本机 Android Studio / Android SDK / Java 环境
- iOS App 真正打包依赖 Xcode / CocoaPods
- 本仓库当前已经准备好 Web + Capacitor 结构，后续只需要在原生环境里继续打包签名

## MVP 实现范围

已完成：

- 登录 / 注册页
- Google OAuth 登录入口
- Dashboard 首页
- 宝宝档案管理
- 家庭共享基础成员管理
- 成长记录 CRUD
- 图片 / 视频媒体管理
- 时间轴页
- 相册页
- 里程碑页
- 成长数据图表
- 搜索与筛选
- Mock 数据演示
- Supabase schema + RLS policy 示例

已预留 TODO：

- AI 自动成长周报
- AI 自动打标签
- AI 成长年册
- 疫苗 / 体检 / 生日 / 纪念日提醒
- 家庭共享接受邀请 / 邮件通知 / 更细粒度权限

## 说明

- 当前为了兼容静态导出与 Capacitor，认证和数据加载采用客户端模式
- 未配置 Supabase 时，登录会走本地演示模式
- 视频在演示模式下以占位封面为主，正式接入 Supabase Storage 后可使用真实播放链接
- 如果你之前已经执行过旧版 `schema.sql`，升级后请重新补齐 `baby_members` 的 `invite_email`、`display_name` 和相关 policy
