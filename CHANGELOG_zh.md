# 灵枢智能排盘 - 更新日志

## [v1.0.0] - 2026-04-01

### 🎉 重大更新：完整功能版发布

本版本实现了两大新排盘系统（六爻占卜、奇门遁甲），完成了从单一八字排盘到全功能周易排盘平台的跨越。

---

## ✨ 新增功能

### 1️⃣ 六爻占卜系统
- **三种起卦方式**：
  - 🎲 **摇卦**：模拟铜钱摇掷，随机生成
  - ⏰ **时间起卦**：依当前时间自动计算
  - ✎ **手动设爻**：手动选择每一爻（阴阳）
- **完整卦象展示**：
  - 本卦（六爻）
  - 变卦（动爻变化）
  - 每爻象辞显示
- **AI 解卦**：支持本地规则 + 免费大模型 API

### 2️⃣ 奇门遁甲排盘
- **灵活排盘依据**：
  - 节气选择（支持 24 节气）
  - 时辰选择（12 时辰）
- **盘面展示**：
  - 值符、值使
  - 九宫八卦分布
  - 天盘、地盘、人盘
- **智能解读**：AI 分析奇门格局与吉凶

### 3️⃣ AI 智能解卦系统
- **本地规则引擎**：离线可用，基础解读
- **免费大模型接入**：
  - StepFun (step-1.5-flash)
  - DeepSeek (deepseek-chat)
- **双模式切换**：无 API Key 自动回退本地规则

### 4️⃣ 历史记录功能
- **内存存储**：记录每次排盘结果（四柱、五行、日期时间）
- **查看列表**：按时间倒序排列
- **管理操作**：单条删除、一键清空
- **Mock 数据**：预置示例记录展示效果

---

## 🔧 技术改进

### 架构优化
- ✅ **包名统一**：`com.lingshu.paipan`（全工程一致）
- ✅ **MainApplication 简化**：移除 PackageList 依赖，稳定编译
- ✅ **移除额外原生依赖**：
  - 删除 `react-native-safe-area-context`
  - 全部替换为 `View` 并手动 padding 控制
- ✅ **JSX 标签修复**：所有屏幕组件标签闭合无错误

### 构建系统
- **Java 环境**：OpenJDK 17（解决 Gradle 兼容性问题）
- **Release 签名**：
  - 生成 `release.keystore`
  - 配置 `build.gradle` release signing
- **Bundle 优化**：禁用 minify，确保兼容性

### 路由系统
- 定义 `type Screen = 'home' | 'bazi' | 'liuyao' | 'qimen' | 'result' | 'history'`
- 统一导航管理，Screen 间无状态传递错误

---

## 🐛 已知问题

1. **历史记录查看详情**：点击「查看」按钮暂无跳转（仅占位）
2. **AI API 配置**：需手动 input API Key（暂未持久化）
3. **持久化存储**：当前使用内存存储，应用重启后历史丢失
4. **六爻完整解读**：起卦逻辑完整，解卦内容为占位，需后续完善
5. **奇门遁甲算法**：当前为简化版，未实现完整飞盘转盘排盘规则

---

## 📦 发布说明

### APK 信息
- **版本**: 1.0.0
- **包名**: com.lingshu.paipan
- **签名**: lingshu-release-key
- **大小**: ~65MB
- **最低 Android**: API 23 (Android 6.0)

### 文件位置
```
android/app/build/outputs/apk/release/app-release.apk
```

### 安装提示
1. 卸载旧版（如有冲突）
2. 设置 → 安全 → 开启「未知来源」
3. 安装 APK
4. 首次启动可能需要授予权限

---

## 🎯 后续计划 (v1.1.0)

- [ ] **本地存储持久化**：使用 SharedPreferences 或 SQLite
- [ ] **真太阳时校正**：八字排盘加入真太阳时支持
- [ ] **六爻完整解卦**：基于《易经》原文的详细解读
- [ ] **奇门遁甲完善**：实现完整排盘规则（置闰、拆补）
- [ ] **AI 配置持久化**：保存 API Key 到本地
- [ ] **分享功能**：集成 `react-native-share`
- [ ] **暗色模式**：国潮炫夜主题
- [ ] **简体/繁体**：支持多语言界面

---

## 🧑‍💻 开发者笔记

### 构建命令
```bash
# Bundle
npx react-native bundle --platform android --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

# Release APK
cd android && ./gradlew assembleRelease
```

### 版本管理
- `versionCode` +1（每次发布）
- `versionName` 语义化版本（x.y.z）

---

**感谢所有测试和反馈！**  
有问题请提 Issue 或直接反馈。
