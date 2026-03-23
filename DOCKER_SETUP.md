# 周易排盘 APP - Docker 构建指南

## 📦 概述

本项目使用 Docker 容器化构建 Android APK，无需在本地安装 Android SDK 或配置复杂的环境。

## 🚀 快速开始

### 前提条件

1. **Docker 已安装** - 确保已安装 Docker Desktop 或 Docker Engine
   - macOS: [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
   - Windows: [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
   - Linux: [Docker Engine](https://docs.docker.com/engine/install/)

2. **Node.js 18+** - 用于开发调试（可选，仅用于本地开发）

### 一键构建 APK

```bash
# 进入项目目录
cd divination-app

# 执行构建脚本
./build-apk.sh
```

构建完成后，APK 文件将生成在 `build/apk/` 目录下：
- `app-debug.apk` - 调试版本（包含调试信息，文件较大）
- `app-release.apk` - 发布版本（已优化，文件较小）

## 📱 安装到设备

### 使用 ADB 安装

```bash
# 连接 Android 设备后执行
adb install build/apk/app-debug.apk

# 或者安装 Release 版本
adb install build/apk/app-release.apk
```

### 直接传输安装

将 APK 文件通过以下方式传输到手机安装：
- USB 传输到手机后直接点击安装
- 通过微信/QQ 等工具发送到手机
- 通过云盘下载

## 🔧 高级用法

### 仅构建 Debug 版本

```bash
docker run --rm -v "$(pwd)":/app -w /app/android divination-app-android-build:latest ./gradlew assembleDebug
```

### 仅构建 Release 版本

```bash
docker run --rm -v "$(pwd)":/app -w /app/android divination-app-android-build:latest ./gradlew assembleRelease
```

### 清理构建缓存

```bash
# 清理 Docker 缓存
docker image rm divination-app-android-build:latest

# 清理 Gradle 缓存
docker run --rm -v "$(pwd)":/app -w /app/android divination-app-android-build:latest ./gradlew clean
```

### 查看 Gradle 任务

```bash
docker run --rm -v "$(pwd)":/app -w /app/android divination-app-android-build:latest ./gradlew tasks
```

## 📋 项目结构

```
divination-app/
├── android/                 # Android 原生项目
│   ├── app/
│   │   ├── build.gradle    # Android 构建配置
│   │   └── src/main/       # Android 源码
│   ├── build.gradle        # 根项目构建配置
│   └── gradlew             # Gradle 包装器
├── src/                    # React Native 源码
│   ├── components/         # UI 组件
│   ├── screens/            # 页面组件
│   └── styles/             # 样式文件
├── App.tsx                 # 应用入口
├── index.js                # React Native 入口
├── package.json            # 依赖配置
├── Dockerfile              # Docker 构建配置
├── build-apk.sh            # 构建脚本
└── DOCKER_SETUP.md         # 本文档
```

## 🐛 故障排查

### 问题：Docker 镜像构建失败

**解决方案：**
1. 确保网络连接正常
2. 检查 Docker 服务是否运行
3. 尝试重新拉取基础镜像：
   ```bash
   docker pull reactnativecommunity/react-native-android:latest
   ```

### 问题：构建过程中内存不足

**解决方案：**
1. 在 Docker Desktop 中增加内存限制（建议至少 4GB）
2. 关闭其他占用内存的应用

### 问题：Gradle 构建超时

**解决方案：**
1. 检查网络连接（Gradle 需要下载依赖）
2. 尝试使用国内镜像源（在 `android/build.gradle` 中配置）

### 问题：APK 文件未生成

**解决方案：**
1. 检查 `android/app/build/outputs/apk/` 目录
2. 查看 Gradle 构建日志定位错误
3. 确保 `package.json` 中的依赖已正确安装

## 📚 相关资源

- [React Native 官方文档](https://reactnative.dev/)
- [Android Gradle Plugin 文档](https://developer.android.com/studio/build)
- [Docker 官方文档](https://docs.docker.com/)

## 📝 版本信息

- React Native: 0.73.0
- Android SDK: 34
- Gradle: 8.3
- Kotlin: 1.9.22

---

**构建日期**: 2026-03-23  
**维护者**: 周易排盘开发团队
