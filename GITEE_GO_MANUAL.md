# Gitee Go 手动配置指南

**问题**: Gitee 默认使用 Maven 构建，而我们需要 Node.js + Gradle  
**状态**: ✅ 构建脚本已推送

---

## 🚨 当前问题

Gitee Go 仍在运行 Maven 构建：
```
[ERROR] The goal you specified requires a project to execute but there is no POM
```

**原因**: Gitee Go 没有自动识别 `.gitee-go.yml`，需要手动配置流水线。

---

## ✅ 解决方案：手动创建流水线

### 步骤 1: 访问 Gitee Go 页面
打开：https://gitee.com/joelinfo/divination-apk → 点击顶部菜单 **"Gitee Go"** 或 **"服务"**

### 步骤 2: 创建新流水线
1. 点击 **"添加流水线"** 或 **"新建构建"**
2. 选择 **"空白模板"** 或 **"自定义"**
3. 填写配置：
   - **名称**: `灵枢智能排盘 - APK 构建`
   - **分支**: `master`
   - **构建类型**: 选择 **"自定义脚本"**

### 步骤 3: 配置构建命令
在构建命令/脚本区域，输入：
```bash
# 使用我们推送的构建脚本
bash gitee-go-build.sh
```

或者手动输入完整命令：
```bash
# 1. 安装依赖
npm install --legacy-peer-deps

# 2. 进入 Android 目录
cd android

# 3. 构建 APK
chmod +x gradlew
./gradlew assembleRelease

# 4. 输出结果
echo "✅ APK 构建完成"
ls -lh app/build/outputs/apk/release/
```

### 步骤 4: 配置运行条件
- **触发方式**: 
  - ✅ Push 到 master 分支
  - ✅ 手动触发
- **分支过滤**: `master`

### 步骤 5: 保存并运行
1. 点击 **"保存"**
2. 点击 **"立即运行"** 或 **"构建"**
3. 查看实时日志
4. 等待构建完成

---

## 📦 产物配置（可选）

如果需要自动下载 APK，配置产物：

**路径**: `android/app/build/outputs/apk/release/app-release.apk`  
**名称**: `lingshu-paipan.apk`  
**保留时间**: 7 天

---

## 🔍 验证成功

成功后应显示：
- ✅ 构建状态：**成功**
- ✅ 日志最后显示：`🎉 构建完成!`
- ✅ 产物区可下载 APK

---

## 📝 快速方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| **手动创建流水线** | 完全可控 | 需手动配置 |
| **使用 .gitee-go.yml** | 自动识别 | Gitee 可能不识别 |
| **使用构建脚本** | 灵活 | 需手动调用 |

**推荐**: 手动创建流水线 + 使用构建脚本

---

## 🆘 如果仍然失败

1. 检查 Gitee Go 是否已开通
2. 确认仓库权限
3. 查看完整日志
4. 尝试手动触发

---

**下一步**: 在 Gitee 页面手动创建流水线

**更新时间**: 2026-03-31 15:32
