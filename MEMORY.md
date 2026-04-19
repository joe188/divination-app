# MEMORY.md - 长期记忆

## 🚨 开发强制规则（必须遵守）

### 1. APK发布流程（最高优先级）
**规则**：必须先在模拟器上测试所有功能正常后，才能构建正式版APK发给用户测试。

**流程**：
1. 完成代码开发
2. 在模拟器上安装并测试所有功能
3. 确认所有功能和按键正常工作
4. 修复所有发现的问题
5. 再次测试确认无误
6. 构建正式版APK
7. 发给用户测试
8.必须备份到Gitee和github上，不要随便去恢复，需要老板同意后才行

**禁止**：
- ❌ 未测试就构建正式版
- ❌ 未测试就发给用户
- ❌ 跳过测试步骤

**违反后果**：浪费用户时间，损害信任

### 2. 用户反馈处理
**规则**：用户每次反馈的问题，必须记录并确保不再犯同样的错误。

**流程**：
1. 记录用户反馈的问题
2. 分析问题原因
3. 修复问题
4. 测试确认修复
5. 更新相关文档

### 3. 代码质量
**规则**：所有代码必须经过测试，确保没有明显的bug。

**流程**：
1. 编写代码
2. 检查TypeScript错误
3. 在模拟器上测试
4. 修复所有问题
5. 再次测试

---

## 📝 记忆更新日志

### 2026-04-19 Release APK 构建成功

**⚠️ 重要教训：依赖版本问题的折腾**

今天花了很长时间在依赖软件版本问题上折腾，这是一个重要的教训！

**问题背景**：
- 构建时遇到各种依赖版本冲突
- Gradle 版本、Kotlin 版本、Android SDK 版本不匹配
- 第三方库版本与 React Native 版本不兼容

**折腾过程**：
1. 尝试升级 Gradle 版本 → 失败
2. 尝试降级 Kotlin 版本 → 失败
3. 尝试修改第三方库版本 → 失败
4. 最后发现：**不要轻易改动依赖版本！**

**关键经验**：
1. ✅ **保持现有依赖版本不变** - 如果能构建成功，就不要动
2. ✅ **不要盲目升级依赖** - 升级可能带来新的兼容性问题
3. ✅ **不要盲目降级依赖** - 降级可能导致功能缺失
4. ✅ **遇到问题时先检查配置** - 不是版本问题，可能是配置问题
5. ✅ **使用 `./gradlew clean` 清理缓存** - 很多时候是缓存问题

**正确的做法**：
```bash
# 遇到构建问题时，按顺序尝试：
1. ./gradlew clean                    # 清理缓存
2. ./gradlew assembleRelease          # 重新构建
3. 如果还是失败，检查错误日志        # 不要急着改版本
4. 如果确定是版本问题，再考虑升级/降级 # 但要谨慎
```

**依赖版本管理原则**：

| 依赖名称 | 版本号 | 官方仓库 | 国内镜像 |
|---------|--------|---------|--------|
| **Gradle** | 9.3.1 | services.gradle.org | mirrors.cloud.tencent.com/gradle |
| **Kotlin** | 2.1.20 | kotlinlang.org | kotlinlang.org |
| **Android SDK** | API 36 | developer.android.com | mirrors.tuna.tsinghua.edu.cn/android-sdk |
| **NDK** | 27.1.12297006 | developer.android.com | mirrors.tuna.tsinghua.edu.cn/android-sdk |
| **React Native** | 0.85.1 | github.com/facebook | registry.npmmirror.com |
| **React** | 19.2.3 | github.com/facebook | registry.npmmirror.com |
| **TypeScript** | 5.8.3 | github.com/microsoft | registry.npmmirror.com |
| **Node.js** | >= 22.11.0 | nodejs.org | npmmirror.com/mirrors/node |
| **Java (JDK)** | 17+ | adoptium.net | mirrors.tuna.tsinghua.edu.cn/Adoptium |

**npm 国内镜像源配置**：
```bash
npm config set registry https://registry.npmmirror.com  # 淘宝镜像
npm config set registry https://npm.aliyun.com           # 阿里云镜像
```

**Gradle 国内镜像源配置**：
```gradle
maven { url 'https://maven.aliyun.com/repository/google' }
maven { url 'https://maven.aliyun.com/repository/public' }
```

**本地仓库地址**：
- 项目本地依赖：`/Users/joel/.openclaw/workspace/LingshuPaipan/node_modules/`
- Gradle 本地缓存：`~/.gradle/caches/`
- Android SDK 本地路径：`~/Library/Android/sdk/`

**教训总结**：
- ❌ 不要因为看到版本警告就去升级
- ❌ 不要因为构建失败就降级版本
- ✅ 先清理缓存，再检查配置
- ✅ 确定是版本问题再改动
- ✅ 改动前备份，改动后测试

---

**构建信息**：
- **成功**：Release APK 构建成功（77MB，比 Debug 版 184MB 小很多）
- **构建时间**：10 分 29 秒
- **关键经验**：
  
  **1. 构建流程**：
  - 确认 Debug 版本运行正常
  - 执行：`cd android && ./gradlew assembleRelease`
  - APK 位置：`android/app/build/outputs/apk/release/app-release.apk`
  
  **2. 构建过程详解**：
  - 阶段 1：JS Bundle 打包（1-2分钟）- Metro 打包 JS 代码
  - 阶段 2：原生库编译（5-8分钟）- CMake 编译所有架构
  - 阶段 3：Kotlin/Java 编译（2-3分钟）- 编译所有模块
  - 阶段 4：资源优化和打包（1-2分钟）- 优化 APK 体积
  
  **3. 编译的架构**：
  - arm64-v8a（64位 ARM，真机用）
  - armeabi-v7a（32位 ARM，旧真机用）
  - x86（32位 x86，模拟器用）
  - x86_64（64位 x86，模拟器用）
  
  **4. 编译的原生库**：
  - libhermes.so（Hermes JS 引擎）
  - libop-sqlite.so（SQLite 数据库）
  - libgesturehandler.so（手势处理）
  - libreanimated.so（动画库）
  - libscreens.so（屏幕导航）
  
  **5. 常见问题解决**：
  - 构建失败：检查 TypeScript 错误 `npx tsc --noEmit`
  - 安装失败：先卸载旧版本 `adb uninstall com.lingshupaipan`
  - APK 闪退：查看日志 `adb logcat | grep -i "lingshupaipan"`
  
  **6. 性能优化**：
  - 启用 Gradle 缓存：`org.gradle.caching=true`
  - 启用并行构建：`org.gradle.parallel=true`
  - 启用代码压缩：`minifyEnabled true`
  
  **7. 构建时间对比**：
  - Debug 构建：3-5 分钟
  - Release 构建：10-15 分钟
  - 首次构建：15-20 分钟（下载依赖）
  - 后续构建：5-8 分钟（有缓存）
  
  **8. APK 大小对比**：
  - Debug APK: 184MB
  - Release APK: 77MB
  - 压缩率: 58%
  
  **9. 深入技术细节**：
  
  **JS Bundle 打包**：
  - Metro 打包器：解析依赖 → 转换代码 → 优化代码 → 生成 Bundle
  - 关键配置：metro.config.js, babel.config.js, tsconfig.json
  - Bundle 分析：`npx source-map-explorer bundle.js bundle.map`
  
  **CMake 编译**：
  - 流程：CMakeLists.txt → 生成构建系统 → 编译原生代码 → 链接
  - Hermes 编译：约 2-3 分钟（最大的库）
  - op-sqlite 编译：约 30 秒
  - react-native-screens 编译：约 1 分钟
  
  **DEX 打包**：
  - 流程：Java/Kotlin → .class → .dex → 合并 → 优化 → APK
  - DEX 优化：minifyEnabled, shrinkResources, R8 编译器
  - DEX 限制：单个 DEX 最多 65536 个方法引用
  
  **10. 实用经验**：
  
  **实际遇到的问题**：
  - 构建卡住：检查资源文件是否过大
  - Kotlin 警告太多：忽略或更新第三方库
  - APK 闪退：查看日志 `adb logcat | grep -i "lingshupaipan"`
  
  **构建过程中的坑**：
  - 不要在构建过程中修改代码
  - 不要忽略 TypeScript 错误
  - 不要使用 `--warning-mode all`（会淹没真正的问题）
  - 遇到奇怪问题时先清理缓存：`./gradlew clean`
  
  **如何判断构建成功**：
  - 看到 `BUILD SUCCESSFUL in X minutes Y seconds`
  - APK 文件存在且大小合理（70-100MB）
  - 可以安装并启动应用
  
  **11. 下次改进**：
  - 启用 Gradle 缓存：构建时间从 10 分钟减少到 5-6 分钟
  - 启用 R8 压缩：APK 大小从 77MB 减少到 60-70MB
  - 只编译需要的架构：构建时间减少 2-3 分钟
  - 使用构建缓存：后续构建更快
  - 监控构建性能：`./gradlew assembleRelease --profile`

### 2026-04-17
- **错误**：未在模拟器上测试就构建正式版APK，导致APK闪退
- **教训**：必须严格遵守开发流程，先测试后发布
- **改进**：将开发强制规则写入MEMORY.md，确保不再犯同样的错误

---

## 🎯 下次工作流程

1. 先修复APK闪退问题
2. 在模拟器上安装并测试所有功能
3. 确认所有功能正常后
4. 再构建正式版APK
5. 发给用户测试
