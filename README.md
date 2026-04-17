# 灵枢智能排盘 (LingshuPaipan)

> 国潮风格设计，让传统文化触手可及

## 📱 项目简介

灵枢智能排盘是一款基于 React Native 0.85.1 开发的易学排盘应用，支持多种传统术数排盘功能。

## ✨ 功能特性

- 🔮 **六爻占卜** - 传统六爻预测
- 📅 **八字排盘** - 四柱八字命理分析
- 🌌 **奇门遁甲** - 奇门遁甲排盘
- 📊 **历史记录** - 保存和查看历史排盘记录
- 🎨 **国潮设计** - 现代国潮风格 UI

## 🛠️ 技术栈

- **React Native**: 0.85.1 (新架构)
- **React**: 19.2.3
- **数据库**: @op-engineering/op-sqlite
- **导航**: @react-navigation/native
- **UI**: 自定义国潮风格组件

## 📦 安装

```bash
# 克隆项目
git clone https://github.com/joe188/LingshuPaipan.git

# 安装依赖
cd LingshuPaipan
npm install

# 运行 Android
npx react-native run-android

# 运行 iOS
npx react-native run-ios
```

## 🔧 配置

### Android

- minSdkVersion: 24
- compileSdkVersion: 36
- targetSdkVersion: 36
- NDK: 27.0.12077973

### iOS

- iOS 15.1+
- Xcode 15+

## 📝 开发说明

### 数据库

使用 @op-engineering/op-sqlite 作为本地数据库，支持：
- 八卦数据存储
- 六十四卦数据存储
- 六爻解读数据存储
- 历史记录存储

### 架构

- **新架构**: 启用 React Native 新架构 (Fabric + TurboModules)
- **Hermes**: 启用 Hermes JavaScript 引擎
- **TypeScript**: 使用 TypeScript 进行类型安全开发

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [GitHub](https://github.com/joe188/LingshuPaipan)
- [Gitee](https://gitee.com/joelinfo/LingshuPaipan)

---

**让传统文化触手可及** 🎋
