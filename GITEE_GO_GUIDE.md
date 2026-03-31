# Gitee Go 激活指南 - 灵枢智能排盘

**更新时间**: 2026-03-31  
**状态**: ✅ 配置文件已推送

---

## 📋 快速激活步骤

### 步骤 1: 访问 Gitee 仓库
打开浏览器访问：
```
https://gitee.com/joelinfo/divination-apk
```

### 步骤 2: 进入 Gitee Go 管理
在仓库页面，找到并点击：
- 顶部菜单：**"Gitee Go"** 或 **"服务"**
- 或者右上角：**设置** ⚙️ → **"Gitee Go"**

### 步骤 3: 启用 Gitee Go
1. 点击 **"启用 Gitee Go"** 或 **"开通服务"**
2. 如果是首次使用，可能需要：
   - 同意 Gitee Go 服务协议
   - 绑定手机号（如果未绑定）
   - 开通 Gitee Go 免费版

### 步骤 4: 添加构建任务
1. 点击 **"添加流水线"** 或 **"新建构建"**
2. 选择 **"使用配置文件"** 或 **"YAML 模式"**
3. 选择分支：`master`
4. 配置文件会自动识别 `.gitee-go.yml`

### 步骤 5: 开始构建
1. 点击 **"立即构建"** 或 **"运行"**
2. 等待构建完成
3. 查看构建日志
4. 下载 APK 产物

---

## 🔧 配置文件说明

已推送两个配置文件：

### 1. `.gitee-go.yml` (推荐)
Gitee Go 专用格式，Gitee 官方推荐
```yaml
version: '1.0'
name: 灵枢智能排盘 - APK 构建
stages:
  - name: 构建
    jobs:
      - name: build-apk
        image: node:18
        script:
          - npm install
          - cd android
          - ./gradlew assembleRelease
```

### 2. `.gitee.yml` (备用)
兼容 GitHub Actions 格式
- 如果 Gitee Go 不支持 `.gitee-go.yml`
- 可以尝试使用此文件

---

## 📱 查看构建结果

### 构建成功后
1. 访问仓库的 **"Gitee Go"** 页面
2. 点击最新一次构建记录
3. 查看构建日志
4. 在 **"产物"** 或 **"Artifacts"** 中下载 APK

### APK 位置
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## ⚠️ 常见问题

### 问题 1: 找不到 Gitee Go 入口
**解决**:
- 确认已登录 Gitee 账号
- 确认是仓库管理员
- 检查仓库是否私有（私有仓库需要企业版）

### 问题 2: 提示需要开通 Gitee Go
**解决**:
- Gitee Go 免费版需要申请或开通
- 访问：https://gitee.com/features/gitee-go
- 点击 **"免费开通"** 或 **"申请试用"**

### 问题 3: 构建失败
**检查**:
1. 查看构建日志
2. 确认 Node.js 版本正确
3. 确认 Gradle 配置正确
4. 检查网络连接

### 问题 4: 没有构建选项
**解决**:
- Gitee 可能将 CI/CD 功能命名为 **"构建"**、**"流水线"** 或 **"服务"**
- 尝试在仓库设置中查找
- 或者在仓库首页查找 **"Gitee Go"** 标签

---

## 🎯 快速验证

激活成功后，您应该能看到：
- ✅ 构建任务列表
- ✅ 构建历史
- ✅ 构建日志
- ✅ 构建产物（APK）

---

## 📞 需要帮助？

如果以上步骤都无法解决，可以：
1. 查看 Gitee 官方文档：https://gitee.com/help
2. 查看 Gitee Go 文档：https://gitee.com/features/gitee-go
3. 联系 Gitee 客服支持

---

## 📝 当前状态

- ✅ 配置文件已推送 (`.gitee-go.yml`)
- ✅ 代码已提交到 Gitee
- ⏳ 等待在 Gitee 页面启用 Gitee Go
- ⏳ 等待首次构建

**下一步**: 在 Gitee 页面手动启用 Gitee Go 服务

---

**最后更新**: 2026-03-31 15:00  
**文档作者**: 🦐 虾仔
