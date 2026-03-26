# Android Release 构建踩坑指南

## 📋 问题现象

**症状**：React Native 应用在真机/模拟器上启动后立即闪退

**错误日志**：
```
Unable to load script. Make sure you're either running Metro or that your bundle 'index.android.bundle' is packaged correctly for release.
```

或

```
ReferenceError: Property 'radii' doesn't exist
TypeError: Cannot read property 'HomeScreen' of undefined
```

## 🎯 根本原因

### 1. JS Bundle 缺失
Release 模式构建时，**不会自动打包 JavaScript 代码**。如果手动打包 Release APK，必须先生成 `index.android.bundle` 文件。

### 2. 导入导出不匹配
- ES6 默认导出 (`export default`) 用默认导入 (`import X from './X'`)
- ES6 具名导出 (`export const X`) 用具名导入 (`import { X } from './X'`)
- 混用会导致 `undefined` 错误

### 3. 资源文件缺失
样式文件中的 `radii`、`shadows` 等变量需要显式导入，否则会报 `Property doesn't exist` 错误。

## ✅ 解决方案

### 步骤 1: 生成 JS Bundle
```bash
cd /path/to/project
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res/
```

**关键参数说明**：
- `--platform android`: 针对 Android 平台
- `--dev false`: 生产环境，关闭调试模式
- `--entry-file index.js`: 入口文件（根据项目调整）
- `--bundle-output`: 输出路径（必须是 `android/app/src/main/assets/`）
- `--assets-dest`: 资源文件输出路径

### 步骤 2: 检查导入导出
**错误示例**：
```typescript
// HomeScreen.tsx
import { colors, fonts, spacing } from '../styles/theme'; // ❌ 缺少 radii
// 但代码里用了 radii.full

// App.tsx  
import { HomeScreen } from './src/screens/HomeScreen'; // ❌ 具名导入
// 但 HomeScreen 是 export default
```

**正确示例**：
```typescript
// HomeScreen.tsx
import { colors, fonts, spacing, radii } from '../styles/theme'; // ✅ 完整导入

// App.tsx
import HomeScreen from './src/screens/HomeScreen'; // ✅ 默认导入
```

### 步骤 3: 构建 Release APK
```bash
cd android
./gradlew clean assembleRelease
```

### 步骤 4: 验证 Bundle 是否打包成功
```bash
unzip -l app/build/outputs/apk/release/app-release.apk | grep bundle
# 应该看到：assets/index.android.bundle
```

## 📝 完整构建脚本

创建 `build-release.sh`：
```bash
#!/bin/bash
set -e

echo "🚀 开始构建 Release APK..."

# 1. 生成 JS Bundle
echo "📦 生成 JS Bundle..."
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res/

# 2. 构建 Release APK
echo "🔨 构建 Release APK..."
cd android
./gradlew clean assembleRelease

# 3. 验证
echo "✅ 验证构建..."
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
  echo "✅ APK 生成成功！"
  ls -lh app/build/outputs/apk/release/app-release.apk
  
  # 检查 bundle 是否存在
  if unzip -l app/build/outputs/apk/release/app-release.apk | grep -q "index.android.bundle"; then
    echo "✅ JS Bundle 已打包"
  else
    echo "❌ JS Bundle 缺失！"
    exit 1
  fi
else
  echo "❌ APK 生成失败"
  exit 1
fi

echo "🎉 构建完成！"
```

## 🔍 调试技巧

### 1. 查看崩溃日志
```bash
# 清空日志
adb logcat -c

# 启动应用
adb shell am start -n com.yourapp/.MainActivity

# 等待 5 秒
sleep 5

# 查看错误
adb logcat -d | grep -i -E "FATAL|CRASH|ReactNativeJS.*Error"
```

### 2. 检查 APK 内容
```bash
# 查看是否包含 bundle
unzip -l app-release.apk | grep bundle

# 查看 JS 文件大小
unzip -l app-release.apk | grep "index.android.bundle"
```

### 3. 验证导入导出
```bash
# 检查所有屏幕的导入
grep -r "import.*from.*theme" src/screens/

# 检查 theme.ts 的导出
grep "export" src/styles/theme.ts
```

## 📊 常见错误速查表

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Unable to load script` | 缺少 JS Bundle | 执行 `npx react-native bundle` |
| `Property 'xxx' doesn't exist` | 导入不完整 | 检查 `import` 语句是否包含所有需要的变量 |
| `Cannot read property 'X' of undefined` | 导入方式错误 | 检查是默认导出还是具名导出 |
| `Module not found` | 路径错误 | 检查导入路径是否正确 |

## 🎯 最佳实践

### 1. 统一导出方式
在 `src/screens/index.ts` 中统一导出：
```typescript
export { HomeScreen } from './HomeScreen';
export { BaZiInputScreen } from './BaZiInputScreen';
export { ResultScreen } from './ResultScreen';
```

然后在 `App.tsx` 中：
```typescript
import { HomeScreen, BaZiInputScreen, ResultScreen } from './src/screens';
```

### 2. Theme 完整导入
```typescript
// 推荐：一次性导入所有需要的
import { colors, fonts, spacing, radii, shadows } from '../styles/theme';

// 或者导入整个 theme 对象
import theme from '../styles/theme';
// 使用：theme.colors.primary, theme.radii.md
```

### 3. 构建前检查清单
- [ ] 所有屏幕文件是否导出了 `radii` 等样式变量？
- [ ] `App.tsx` 的导入方式是否正确？
- [ ] 是否生成了 `index.android.bundle`？
- [ ] Bundle 文件大小是否合理（通常 500KB-2MB）？
- [ ] 是否执行了 `clean` 避免缓存问题？

## 📚 参考资料

- [React Native 官方文档 - Signed APK](https://reactnative.dev/docs/signed-apk-android)
- [Metro Bundler 配置](https://metrobundler.dev/docs/configuration)
- [Gradle 构建配置](https://developer.android.com/studio/build/building-cmdline)

---

**最后更新**: 2026-03-26  
**项目**: 灵虾排盘 (DivinationApp)  
**React Native 版本**: 0.73.0  
**Gradle 版本**: 8.4  
**问题状态**: ✅ 已解决
