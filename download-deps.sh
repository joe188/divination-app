#!/bin/bash
# Gradle 依赖包手动下载脚本
# 将下载所有需要的 Maven 依赖到 ~/.m2/repository/ 本地仓库
# 用法：在有网络的环境执行：bash download-deps.sh

set -e

BASE_DIR="$HOME/.m2/repository"
mkdir -p "$BASE_DIR"

download() {
    # 参数: groupId artifactId version
    groupPath=$(echo "$1" | tr '.' '/')
    artifact="$2"
    version="$3"
    dest_dir="$BASE_DIR/$groupPath/$artifact/$version"
    mkdir -p "$dest_dir"

    # Maven 中央仓库（优先使用国内镜像）
    mirrors=(
        "https://repo.huaweicloud.com/repository/maven/"
        "https://mirrors.tuna.tsinghua.edu.cn/apache/maven"
        "https://repo1.maven.org/maven2"
    )

    for base_url in "${mirrors[@]}"; do
        jar_url="$base_url/$groupPath/$artifact/$version/$artifact-$version.jar"
        pom_url="$base_url/$groupPath/$artifact/$version/$artifact-$version.pom"

        echo -n "Downloading $artifact:$version from $base_url ... "

        # 尝试下载 jar
        if curl -sSL --fail "$jar_url" -o "$dest_dir/$artifact-$version.jar" 2>/dev/null; then
            # 下载 pom 文件（可选）
            curl -sSL "$pom_url" -o "$dest_dir/$artifact-$version.pom" 2>/dev/null || true
            echo "✓"
            return 0
        else
            echo "✗"
        fi
    done

    echo "❌ FAILED: $artifact-$version"
    return 1
}

echo "=========================================="
echo "LingshuPaipan 依赖包手动下载脚本"
echo "=========================================="
echo ""

# Gradle Plugin dependencies
echo "📦 下载 Gradle 插件..."
download "com.android.tools.build" "gradle" "8.12.0"
download "org.jetbrains.kotlin" "kotlin-gradle-plugin" "2.1.20"
# react-native-gradle-plugin 从 node_modules 本地加载，无需下载
download "org.gradle.toolchains" "foojay-resolver" "0.5.0"

# React Native core
echo "📦 下载 React Native 核心..."
download "com.facebook.react" "react-native" "0.85.1"
download "com.facebook.react" "hermes-android" "0.85.1"
download "com.facebook.fbjni" "fbjni-java-only" "0.3.0"

# React Native libraries
echo "📦 下载 React Native 第三方库..."
download "com.facebook.react" "react-native-reanimated" "3.3.0"
download "com.facebook.react" "react-native-gesture-handler" "2.12.1"
download "com.facebook.react" "react-native-screens" "4.24.0"
download "com.facebook.react" "react-native-safe-area-context" "5.7.0"
download "com.swmansion" "gesture-handler" "2.12.0"
download "com.swmansion" "reanimated" "3.3.0"

# AndroidX
echo "📦 下载 AndroidX 库..."
download "androidx.appcompat" "appcompat" "1.6.1"
download "androidx.swiperefreshlayout" "swiperefreshlayout" "1.1.0"
download "androidx.core" "core-ktx" "1.12.0"
download "androidx.lifecycle" "lifecycle-runtime-ktx" "2.7.0"

# Fresco
echo "📦 下载 Fresco 图片库..."
download "com.facebook.fresco" "fresco" "3.0.0"
download "com.facebook.fresco" "animated-gif" "3.0.0"
download "com.facebook.fresco" "webpsupport" "3.0.0"
download "com.facebook.fresco" "imagepipeline-okhttp3" "3.0.0"

# Kotlin
echo "📦 下载 Kotlin 库..."
download "org.jetbrains.kotlin" "kotlin-stdlib" "2.1.20"
download "org.jetbrains.kotlinx" "kotlinx-coroutines-core" "1.8.0"
download "org.jetbrains.kotlinx" "kotlinx-coroutines-android" "1.8.0"

# Other RN dependencies
echo "📦 下载其他依赖..."
download "com.facebook" "react-native" "0.85.1"

echo ""
echo "=========================================="
echo "✅ 下载完成！所有依赖已安装到 $BASE_DIR"
echo "=========================================="
echo ""
echo "现在可以离线构建了："
echo "  cd /Users/joel/.openclaw/workspace/LingshuPaipan/android"
echo "  ./gradlew assembleDebug --offline"
echo ""
