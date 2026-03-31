# 快速启动指南

> 🦐 灵枢智能排盘 - 周易排盘 APP  
> 让传统文化触手可及

---

## 📦 安装步骤

### 1. 环境要求

- Node.js >= 16.0
- npm >= 7.0
- Expo CLI
- iOS Simulator (macOS) 或 Android Studio (跨平台)

### 2. 安装依赖

```bash
# 进入项目目录
cd divination-app

# 安装依赖
npm install

# 或使用 yarn
yarn install
```

### 3. 启动开发服务器

```bash
# 启动 Expo
npm start

# 或
npx expo start
```

### 4. 选择运行平台

启动后，终端会显示二维码和选项：

```bash
# 在 iOS 模拟器运行
Press i │ open in ios simulator

# 在 Android 模拟器运行  
Press a │ open in android emulator

# 在真机运行（需安装 Expo Go）
扫描屏幕二维码
```

---

## 📱 在模拟器中运行

### iOS (macOS)

```bash
# 确保已安装 Xcode 和模拟器
npx expo start --ios
```

### Android

```bash
# 确保已安装 Android Studio 和模拟器
npx expo start --android
```

### Web 浏览器

```bash
# 在浏览器中运行
npx expo start --web
```

---

## 📱 在真机上运行

### 步骤 1: 安装 Expo Go

**iOS**:
- 在 App Store 搜索 "Expo Go"
- 下载安装

**Android**:
- 在 Google Play 搜索 "Expo Go"
- 下载安装

### 步骤 2: 扫码运行

1. 启动开发服务器：`npm start`
2. 打开 Expo Go
3. 扫描二维码（iOS 用相机，Android 用应用内扫描）
4. 应用自动加载

---

## 🧪 验证安装

### 检查点

启动后应该看到：

1. ✅ 米白色背景
2. ✅ 顶部显示 "你好，有缘人 👋"
3. ✅ 中间有 "今日运势" 卡片
4. ✅ 底部有朱砂红色 "开始排盘" 按钮

### 测试流程

1. **点击 "开始排盘"**
   - 应跳转到排盘输入页
   - 看到年月日时选择器

2. **点击年月日时**
   - 应弹出选择器 Modal
   - 可以选择具体日期

3. **点击 "开始排盘" 提交**
   - 应跳转到结果页
   - 看到四柱八字展示
   - 看到五行分布图

---

## 🐛 常见问题

### 问题 1: 依赖安装失败

```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 问题 2: Expo 启动失败

```bash
# 全局安装 Expo CLI
npm install -g expo-cli

# 重新启动
npx expo start
```

### 问题 3: 模拟器无法启动

**iOS**:
```bash
# 确保 Xcode 已安装
xcode-select --install

# 打开 Xcode 安装模拟器
```

**Android**:
```bash
# 确保 Android Studio 已安装
# 创建虚拟设备 (AVD)
```

### 问题 4: 热更新不生效

```bash
# 完全重启
# 1. 停止 Expo
# 2. 删除 node_modules/.cache
# 3. 重新启动
rm -rf node_modules/.cache
npm start
```

---

## 📂 项目结构

```
divination-app/
├── App.tsx                    # 主入口
├── app.json                   # Expo 配置
├── package.json              # 依赖配置
├── tsconfig.json             # TypeScript 配置
├── assets/                   # 静态资源
│   └── README.md
├── src/
│   ├── components/           # UI 组件
│   │   ├── index.ts
│   │   ├── GuochaoButton.tsx
│   │   ├── GuochaoInput.tsx
│   │   └── GuochaoCard.tsx
│   ├── screens/              # 页面组件
│   │   ├── index.ts
│   │   ├── HomeScreen.tsx
│   │   ├── BaZiInputScreen.tsx
│   │   └── ResultScreen.tsx
│   └── styles/               # 样式和主题
│       └── theme.ts
├── UI_DEVELOPMENT.md         # UI 开发报告
├── COMPONENTS_GUIDE.md       # 组件使用指南
└── QUICKSTART.md             # 本文件
```

---

## 🎯 下一步

### 开发模式

```bash
# 开启开发者菜单
# iOS: 摇动设备或按 Cmd+D
# Android: 摇动设备或按 Cmd+M

# 功能:
# - Reload: 重新加载
# - Debug: 远程调试
# - Performance: 性能监控
# - Settings: 开发设置
```

### 代码编辑

```bash
# 推荐编辑器: VS Code

# 安装扩展:
# - ESLint
# - Prettier
# - React Native Tools
# - TypeScript

# 自动刷新:
# 保存文件后自动刷新（Fast Refresh）
```

---

## 📚 参考文档

- [Expo 文档](https://docs.expo.dev/)
- [React Native 文档](https://reactnative.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [UI 开发报告](./UI_DEVELOPMENT.md)
- [组件使用指南](./COMPONENTS_GUIDE.md)

---

## 🆘 获取帮助

遇到问题？

1. 查看 [UI_DEVELOPMENT.md](./UI_DEVELOPMENT.md)
2. 查看 [COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md)
3. 检查 Expo 文档
4. 查看项目 Issues

---

> 🦐 **灵虾寄语**: 让古老智慧在指尖流转，让传统文化焕发新生。
