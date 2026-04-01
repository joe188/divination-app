# 灵枢智能排盘 v1.0.0 Release Package

## 📦 Release 信息

- **版本**: v1.0.0
- **发布名称**: 灵枢智能排盘 v1.0.0
- **APK 大小**: 65 MB
- **APK 路径**: `/Users/joel/.openclaw/workspace/divination-app/android/app/build/outputs/apk/release/app-release.apk`
- **构建时间**: 2026-04-01 10:17 (Asia/Shanghai)

## ✅ 本次更新内容

1. **更新应用图标**: 使用"灵枢智能排盘"品牌图标
2. **修复构建配置**: 
   - 添加 react-native-gradle-plugin 依赖
   - 降级 @react-native-async-storage/async-storage 到 2.0.0 (Kotlin 1.9.22 兼容)
   - 降级 react-native-safe-area-context 到 4.9.0 (新架构兼容)
   - 添加缺失的 rn_edit_text_material 资源
   - 简化 MainApplication.kt (移除新架构和 Flipper)
3. **代码已提交并推送到 Gitee**: https://gitee.com/joelinfo/divination-apk
4. **Git Tag**: v1.0.0

## 📤 Gitee Release 上传步骤

由于 API 上传限制，请手动上传 APK 文件：

1. 访问: https://gitee.com/joelinfo/divination-apk/releases
2. 找到 Tag: `v1.0.0` (已创建)
3. 点击 "上传新的资源文件"
4. 选择文件: `/Users/joel/.openclaw/workspace/divination-app/android/app/build/outputs/apk/release/app-release.apk`
5. 文件名: `app-release.apk`
6. 点击 "确定" 完成上传

## 🔧 技术细节

- **React Native**: 0.73.0
- **最低 SDK**: 21 (Android 5.0)
- **目标 SDK**: 最新
- **签名算法**: RSA 2048-bit
- **签名别名**: lingshu-release-key
- **Keystore**: android/app/release.keystore (本地保存)

## 📱 测试建议

安装到真实设备测试:
```bash
adb install /Users/joel/.openclaw/workspace/divination-app/android/app/build/outputs/apk/release/app-release.apk
```

## 📝 签名信息

- Keystore 位置: `android/app/release.keystore`
- 密码: Lingshu@123
- 别名: lingshu-release-key
- 别名密码: Lingshu@123

⚠️ **重要**: 请妥善备份 release.keystore 文件，这是应用签名的唯一凭证。

---

构建完成时间: 2026-04-01 10:17
生成者: OpenClaw Assistant
