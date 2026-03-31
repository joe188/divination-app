# 灵枢智能排盘 - 周易八字排盘应用

> 🦐 让传统文化触手可及

[![Platform](https://img.shields.io/badge/platform-Android-blue.svg)](https://reactnative.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73.0-61DAFB.svg)](https://reactnative.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

## 📱 应用简介

灵枢智能排盘是一款基于传统周易文化的八字排盘应用，采用新国潮设计风格，让古老的东方智慧在现代科技中焕发新生。

### ✨ 特色功能

- 🎯 **八字排盘** - 精确计算生辰八字，支持真太阳时
- 🎨 **国潮设计** - 朱砂红、墨黑、米白等传统色彩
- 📊 **五行分析** - 可视化展示五行能量分布
- 🤖 **AI 解卦** - 智能分析排盘结果
- 📜 **历史记录** - 保存查询历史随时查看

## 🚀 快速开始

### 方式一：Docker 构建（推荐）

无需安装 Android Studio，一键打包 APK：

```bash
# 1. 进入项目目录
cd divination-app

# 2. 执行构建脚本
./build-apk.sh

# 3. 安装 APK 到手机
adb install build/apk/app-debug.apk
```

详细 Docker 构建指南请查看：[DOCKER_SETUP.md](./DOCKER_SETUP.md)

### 方式二：本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm start

# 3. 运行 Android
npm run android

# 4. 运行 iOS
npm run ios
```

## 📦 项目结构

```
divination-app/
├── android/                 # Android 原生项目
├── src/                     # React Native 源码
│   ├── components/         # UI 组件
│   │   ├── GuochaoButton.tsx
│   │   ├── GuochaoInput.tsx
│   │   └── GuochaoCard.tsx
│   ├── screens/            # 页面组件
│   │   ├── HomeScreen.tsx
│   │   ├── BaZiInputScreen.tsx
│   │   └── ResultScreen.tsx
│   └── styles/             # 样式和主题
│       └── theme.ts
├── assets/                  # 资源文件
├── App.tsx                  # 应用入口
├── index.js                 # React Native 入口
├── package.json             # 依赖配置
├── Dockerfile               # Docker 构建配置
├── build-apk.sh             # 构建脚本
└── README.md                # 本文档
```

## 🎨 设计系统

### 色彩系统

| 颜色 | 色值 | 用途 |
|------|------|------|
| 朱砂红 | `#C43C3C` | 主色调、按钮 |
| 墨黑 | `#1A1A1A` | 文字、边框 |
| 米白 | `#F5F0E6` | 背景色 |
| 金色 | `#D4A76A` | 装饰、强调 |

### 核心组件

- **GuochaoButton** - 国潮风格按钮，支持 4 种变体
- **GuochaoInput** - 极简输入框，宣纸质感
- **GuochaoCard** - 国潮卡片，支持多种装饰

## 🛠️ 技术栈

- **框架**: React Native 0.73.0
- **语言**: TypeScript 5.9.3
- **状态管理**: React Hooks
- **构建工具**: Metro + Gradle
- **构建环境**: Docker (可选)

## 📚 文档

- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker 构建详细指南
- [QUICKSTART.md](./QUICKSTART.md) - 快速启动指南
- [COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md) - 组件使用指南
- [DOCKER_BUILD_REPORT.md](./DOCKER_BUILD_REPORT.md) - Docker 构建报告

## 🔧 开发

### 环境要求

- Node.js >= 18
- npm 或 yarn
- Docker（用于打包）
- Android Studio（可选，仅本地开发需要）

### 构建命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# Android 运行
npm run android

# iOS 运行
npm run ios

# 清理缓存
npm run start -- --reset-cache
```

## 📱 APK 构建

### 使用 Docker 构建（推荐）

```bash
./build-apk.sh
```

输出目录：
- Debug: `build/apk/app-debug.apk`
- Release: `build/apk/app-release.apk`

### 本地构建（需要 Android Studio）

```bash
cd android
./gradlew assembleDebug
```

## 🐛 故障排查

### Docker 构建失败

1. 确保 Docker 服务正在运行
2. 检查网络连接
3. 增加 Docker 内存限制（建议 4GB+）

### 依赖安装失败

```bash
# 清理缓存
rm -rf node_modules package-lock.json
npm install --force
```

### Gradle 构建慢

配置国内镜像源，在 `android/build.gradle` 中添加：

```gradle
repositories {
    maven { url 'https://maven.aliyun.com/repository/google' }
    maven { url 'https://maven.aliyun.com/repository/public' }
    google()
    mavenCentral()
}
```

## 📝 开发进度

- [x] 项目初始化
- [x] 设计规范制定
- [x] 核心组件开发
- [x] 页面开发
- [x] Docker 环境配置
- [x] APK 构建流程
- [ ] 功能完善
- [ ] 性能优化
- [ ] 测试验证

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

ISC

---

**版本**: 1.0.0  
**更新日期**: 2026-03-23  
**维护者**: 周易排盘开发团队
