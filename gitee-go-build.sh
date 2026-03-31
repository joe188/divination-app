#!/bin/bash
# 灵枢智能排盘 - Gitee Go 构建脚本 (最终版)
# 使用 Node.js 18 + 腾讯/阿里双镜像

set -e

echo "🚀 开始构建灵枢智能排盘..."

# ============================================
# 1. 安装 Node.js 18
# ============================================
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "18" ]; then
    echo "📦 安装 Node.js 18..."
    
    ARCH=$(uname -m)
    if [ "$ARCH" = "x86_64" ]; then
        NODE_URL="https://nodejs.org/dist/v18.20.2/node-v18.20.2-linux-x64.tar.gz"
    elif [ "$ARCH" = "aarch64" ]; then
        NODE_URL="https://nodejs.org/dist/v18.20.2/node-v18.20.2-linux-arm64.tar.gz"
    else
        echo "❌ 不支持的架构：$ARCH"
        exit 1
    fi
    
    echo "下载：$NODE_URL"
    curl -fsSL "$NODE_URL" | tar -xz -C /usr/local --strip-components=1
    echo "✅ Node.js 18 安装完成"
else
    echo "✅ Node.js 已安装"
fi

echo "🔍 Node.js 版本:"
node -v
npm -v

# ============================================
# 2. 进入工作目录
# ============================================
cd /root/workspace/joelinfo/divination-apk || {
    echo "❌ 无法进入工作目录"
    exit 1
}
echo "📁 工作目录：$(pwd)"

# ============================================
# 3. 配置 Gradle 镜像 (仅使用阿里云，移除代理)
# ============================================
echo "⚙️ 配置 Gradle 镜像..."
mkdir -p ~/.gradle

# 只配置 init.gradle，不使用 gradle.properties 的代理
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

# 配置 gradle-wrapper.properties 使用腾讯镜像
GRADLE_WRAPPER_PROPS="android/gradle/wrapper/gradle-wrapper.properties"
if [ -f "$GRADLE_WRAPPER_PROPS" ]; then
    echo "📝 修改 Gradle Wrapper 配置..."
    # 备份并修改
    cp "$GRADLE_WRAPPER_PROPS" "${GRADLE_WRAPPER_PROPS}.bak"
    cat > "$GRADLE_WRAPPER_PROPS" << 'EOF'
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.2-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
EOF
    echo "✅ Gradle Wrapper 已配置腾讯镜像"
fi

echo "✅ Gradle 镜像配置完成"

# ============================================
# 4. 安装项目依赖
# ============================================
echo "📦 安装项目依赖..."
npm install --legacy-peer-deps

# ============================================
# 5. 构建 Android APK
# ============================================
echo "🏗️ 开始构建 APK..."
cd android

chmod +x gradlew

# 设置环境变量（不设置代理）
export GRADLE_OPTS="-Dorg.gradle.daemon=false -Dorg.gradle.http.timeout=300000 -Dorg.gradle.http.connectionTimeout=300000"

# 执行构建
./gradlew assembleRelease --no-daemon

# ============================================
# 6. 验证并输出结果
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
