#!/bin/bash
# 灵枢智能排盘 - Gitee Go 构建脚本
# 用于在 Gitee Go 环境中手动执行构建

set -e

echo "🚀 开始构建灵枢智能排盘..."

# 1. 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi
echo "✅ Node.js 版本：$(node -v)"

# 2. 安装依赖
echo "📦 安装依赖..."
npm install --legacy-peer-deps

# 3. 进入 Android 目录
cd android

# 4. 检查 Gradle
if [ ! -f "gradlew" ]; then
    echo "❌ Gradle wrapper 不存在"
    exit 1
fi
chmod +x gradlew

# 5. 构建 APK
echo "🏗️ 构建 APK..."
./gradlew assembleRelease

# 6. 检查输出
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK 构建成功!"
    echo "📍 路径：$APK_PATH"
    # 复制到工作区根目录，方便下载
    cp "$APK_PATH" ../../lingshu-paipan.apk
    echo "📦 APK 已复制到：/lingshu-paipan.apk"
else
    echo "❌ APK 文件未找到"
    exit 1
fi

echo "🎉 构建完成!"
