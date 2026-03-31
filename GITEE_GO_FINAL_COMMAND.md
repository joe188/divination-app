# Gitee Go 最终构建命令

**复制以下完整内容到 Gitee Go 的"构建命令"或"脚本"区域**

---

## 📋 完整构建脚本（直接复制）

```bash
#!/bin/bash
set -e

echo "🚀 开始构建灵枢智能排盘..."

# 1. 安装 Node.js 18
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "18" ]; then
    echo "📦 安装 Node.js 18..."
    NODE_URL="https://nodejs.org/dist/v18.20.2/node-v18.20.2-linux-x64.tar.gz"
    echo "下载：$NODE_URL"
    curl -fsSL "$NODE_URL" | tar -xz -C /usr/local --strip-components=1
    echo "✅ Node.js 18 安装完成"
fi

echo "🔍 Node.js 版本:"
node -v
npm -v

# 2. 进入工作目录
cd /root/workspace/joelinfo/divination-apk || { echo "❌ 无法进入工作目录"; exit 1; }
echo "📁 工作目录：$(pwd)"

# 3. 配置 Gradle（仅阿里云镜像，无代理）
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
export GRADLE_OPTS="-Dorg.gradle.daemon=false -Dorg.gradle.http.timeout=300000"
./gradlew assembleRelease --no-daemon

# 6. 验证结果
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK 构建成功!"
    echo "📍 路径：$APK_PATH"
    ls -lh "$APK_PATH"
    cp "$APK_PATH" ../../lingshu-paipan.apk
    echo "📦 APK 已复制到：/lingshu-paipan.apk"
else
    echo "❌ APK 文件未找到"
    exit 1
fi

echo "🎉 灵枢智能排盘构建完成!"
```

---

## ⚠️ 重要说明

### 在 Gitee Go 页面操作时：

1. **删除旧的构建任务**（如果有 `image:` 开头的命令）
2. **创建新任务** 或 **编辑现有任务**
3. **构建类型** 选择：**"自定义脚本"** 或 **"Shell"**
4. **不要选择** "Maven"、"Gradle"、"Java" 等预设模板
5. **粘贴上面的完整脚本**
6. **保存并运行**

### 绝对不要做：
- ❌ 不要在任何地方写 `image: node:18`（这不是命令）
- ❌ 不要使用 Maven 模板
- ❌ 不要配置代理（proxy）

### 预期日志：
```
🚀 开始构建灵枢智能排盘...
📦 安装 Node.js 18...
✅ Node.js 18 安装完成
🔍 Node.js 版本: v18.20.2
📁 工作目录：/root/workspace/joelinfo/divination-apk
⚙️ 配置 Gradle 镜像...
✅ Gradle 镜像配置完成
📦 安装项目依赖...
🏗️ 开始构建 APK...
> Task :app:assembleRelease
✅ APK 构建成功!
🎉 灵枢智能排盘构建完成!
```

---

**复制上面的脚本，粘贴到 Gitee Go 即可！** 🦐
