#!/bin/bash

# 周易排盘 APP - Android APK 构建脚本 (简化版)
# 使用 Docker 容器化构建，无需本地 Android 环境

set -e

# 配置变量
APP_NAME="divination-app"
DOCKER_IMAGE="divination-app-android-build:latest"
BUILD_DIR="$(pwd)/build"

echo "======================================"
echo "  周易排盘 APP - Android APK 构建"
echo "======================================"
echo ""

# 创建构建目录
mkdir -p "$BUILD_DIR/apk"

# 1. 构建 Docker 镜像
echo "🔨 [1/3] 构建 Docker 镜像..."
docker build -t "$DOCKER_IMAGE" .

# 2. 运行构建
echo "🚀 [2/3] 在容器中构建 APK..."
docker run --rm \
    -v "$(pwd)":/app \
    -w /app \
    "$DOCKER_IMAGE" \
    bash -c "yarn install && cd android && ./gradlew assembleDebug assembleRelease"

# 3. 拷贝 APK 到构建目录
echo "📂 [3/3] 拷贝 APK 到构建目录..."

# 创建输出目录
mkdir -p "$BUILD_DIR/apk"

# 查找并拷贝 APK 文件
APK_DEBUG=$(find android/app/build/outputs/apk -name "*debug*.apk" | head -1)
APK_RELEASE=$(find android/app/build/outputs/apk -name "*release*.apk" | head -1)

if [ -n "$APK_DEBUG" ] && [ -f "$APK_DEBUG" ]; then
    cp "$APK_DEBUG" "$BUILD_DIR/apk/"
    echo "✅ Debug APK 已生成：$BUILD_DIR/apk/$(basename $APK_DEBUG)"
else
    echo "⚠️  Debug APK 未找到"
fi

if [ -n "$APK_RELEASE" ] && [ -f "$APK_RELEASE" ]; then
    cp "$APK_RELEASE" "$BUILD_DIR/apk/"
    echo "✅ Release APK 已生成：$BUILD_DIR/apk/$(basename $APK_RELEASE)"
else
    echo "⚠️  Release APK 未找到"
fi

echo ""
echo "======================================"
echo "  构建完成!"
echo "======================================"
echo ""
echo "APK 文件位置：$BUILD_DIR/apk/"
echo ""
echo "测试安装 (需连接 Android 设备):"
echo "  adb install $BUILD_DIR/apk/$(basename $APK_DEBUG)"
echo ""
