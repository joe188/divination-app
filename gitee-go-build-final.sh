#!/bin/bash
# 修复 Gitee Go 构建脚本

echo "🚀 开始构建灵枢智能排盘..."

# 1. 进入工作目录
cd /root/workspace/joelinfo/divination-apk || { echo "❌ 无法进入工作目录"; exit 1; }
echo "📁 工作目录：$(pwd)"

# 2. 配置 Java 环境
echo "☕ 配置 Java 环境..."
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

# 3. 配置 Gradle 镜像
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

# 4. 安装依赖
echo "📦 安装项目依赖..."
npm install --legacy-peer-deps

# 5. 构建 APK
echo "🏗️ 开始构建 APK..."
cd android
chmod +x gradlew
./gradlew assembleRelease --no-daemon

# 6. 验证结果
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
  echo "✅ APK 构建成功!"
  ls -lh "$APK_PATH"
  # 将 APK 复制到根目录
  cp "$APK_PATH" ../../lingshu-paipan.apk
  echo "📦 APK 已复制到：/lingshu-paipan.apk"
else
  echo "❌ APK 文件未找到"
  exit 1
fi

echo "🎉 灵枢智能排盘构建完成!"