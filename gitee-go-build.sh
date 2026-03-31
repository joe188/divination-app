#!/bin/bash
# 灵枢智能排盘 - Gitee Go 构建脚本 (优化版)
# 包含 Node.js 安装和 Gradle 镜像配置

set -e

echo "🚀 开始构建灵枢智能排盘..."

# ============================================
# 1. 安装 Node.js (如果未安装)
# ============================================
if ! command -v node &> /dev/null; then
    echo "📦 Node.js 未安装，开始安装..."
    
    ARCH=$(uname -m)
    if [ "$ARCH" = "x86_64" ]; then
        NODE_URL="https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.gz"
    elif [ "$ARCH" = "aarch64" ]; then
        NODE_URL="https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-arm64.tar.gz"
    else
        echo "❌ 不支持的架构：$ARCH"
        exit 1
    fi
    
    echo "下载 Node.js: $NODE_URL"
    curl -fsSL "$NODE_URL" | tar -xz -C /usr/local --strip-components=1
    
    echo "✅ Node.js 安装完成"
else
    echo "✅ Node.js 已安装"
fi

# 验证
echo "🔍 Node.js 版本:"
node -v
npm -v

# ============================================
# 2. 安装项目依赖
# ============================================
echo "📦 安装项目依赖..."
npm install --legacy-peer-deps

# ============================================
# 3. 配置 Gradle 镜像 (使用阿里云镜像)
# ============================================
echo "⚙️ 配置 Gradle 镜像..."
mkdir -p ~/.gradle
cat > ~/.gradle/init.gradle << 'EOF'
allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        mavenCentral()
    }
}
EOF

# ============================================
# 4. 构建 Android APK
# ============================================
echo "🏗️ 开始构建 APK..."
cd android

# 检查 Gradle wrapper
if [ ! -f "gradlew" ]; then
    echo "❌ Gradle wrapper 不存在"
    exit 1
fi
chmod +x gradlew

# 设置 Gradle 参数（增加超时时间）
export GRADLE_OPTS="-Dorg.gradle.daemon=false -Dorg.gradle.http.timeout=300000 -Dorg.gradle.http.connectionTimeout=300000"

# 执行构建
./gradlew assembleRelease --no-daemon

# ============================================
# 5. 验证并输出结果
# ============================================
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK 构建成功!"
    echo "📍 路径：$APK_PATH"
    echo "📊 文件大小："
    ls -lh "$APK_PATH"
    
    # 复制到工作区根目录
    cp "$APK_PATH" ../../lingshu-paipan.apk
    echo "📦 APK 已复制到：/lingshu-paipan.apk"
else
    echo "❌ APK 文件未找到"
    echo "🔍 查找 APK 文件..."
    find . -name "*.apk" -type f || echo "未找到任何 APK"
    exit 1
fi

echo "🎉 灵枢智能排盘构建完成!"
