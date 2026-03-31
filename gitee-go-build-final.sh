#!/bin/bash
# 强制进入工作目录，解决 getcwd 错误
cd /root/workspace/joelinfo/divination-apk || { echo "❌ 无法进入工作目录"; exit 1; }
echo "📁 工作目录：$(pwd)"

echo "🚀 开始构建灵枢智能排盘..."

# 1. 安装 Node.js 18
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "18" ]; then
    echo "📦 安装 Node.js 18..."
    NODE_URL="https://nodejs.org/dist/v18.20.2/node-v18.20.2-linux-x64.tar.gz"
    curl -fsSL "$NODE_URL" | tar -xz -C /usr/local --strip-components=1
    echo "✅ Node.js 18 安装完成"
fi

echo "🔍 Node.js 版本:"
node -v
npm -v

# 2. 进入工作目录
cd /root/workspace/joelinfo/divination-apk || { echo "❌ 无法进入工作目录"; exit 1; }
echo "📁 工作目录：$(pwd)"

# 3. 配置 Java 11 环境（关键！）
echo "☕ 配置 Java 11 环境..."
if [ -d "/usr/lib/jvm/java-11-openjdk" ]; then
    export JAVA_HOME=/usr/lib/jvm/java-11-openjdk
    export PATH=$JAVA_HOME/bin:$PATH
    echo "✅ Java 11 已配置"
elif [ -d "/usr/lib/jvm/java-17-openjdk" ]; then
    export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
    export PATH=$JAVA_HOME/bin:$PATH
    echo "✅ Java 17 已配置"
else
    echo "⚠️ 未找到 Java 11/17，尝试使用系统默认 Java"
fi
java -version

# 4. 配置 Gradle 镜像
echo "⚙️ 配置 Gradle 镜像..."
mkdir -p ~/.gradle
cat > ~/.gradle/init.gradle << 'GRADLE_EOF'
allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        mavenCentral()
    }
}
GRADLE_EOF
echo "✅ Gradle 镜像配置完成"

# 5. 安装依赖
echo "📦 安装项目依赖..."
npm install --legacy-peer-deps

# 6. 构建 APK
echo "🏗️ 开始构建 APK..."
cd android
chmod +x gradlew
export GRADLE_OPTS="-Dorg.gradle.daemon=false -Dorg.gradle.http.timeout=300000"
./gradlew assembleRelease --no-daemon

# 7. 验证结果
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK 构建成功!"
    ls -lh "$APK_PATH"
    cp "$APK_PATH" ../../lingshu-paipan.apk
    echo "📦 APK 已复制到：/lingshu-paipan.apk"
else
    echo "❌ APK 文件未找到"
    exit 1
fi

echo "🎉 灵枢智能排盘构建完成!"
