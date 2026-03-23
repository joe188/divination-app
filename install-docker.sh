#!/bin/bash
# 一键安装 Docker Desktop for Mac
# 🦐 周易排盘项目专用脚本

echo "🦐 正在下载 Docker Desktop..."
curl -L https://download.docker.com/mac/stable/Docker.dmg -o /tmp/Docker.dmg

echo "📦 正在安装 Docker Desktop..."
# 挂载 DMG
hdiutil attach /tmp/Docker.dmg
# 复制到应用程序目录
cp -R /Volumes/Docker/Docker.app /Applications/
# 卸载 DMG
hdiutil detach /Volumes/Docker

echo "✅ 安装完成！"
echo "⚠️  请执行以下操作以激活 Docker："
echo "1. 打开 /Applications/Docker.app (首次启动需同意协议)"
echo "2. 等待左下角显示 'Engine running'"
echo "3. 回到终端，运行：cd /Users/joel/.openclaw/workspace/divination-app && ./build-apk.sh"
echo ""
echo "🚀 现在打开 Docker 吗？(y/n)"
read -p "> " answer
if [ "$answer" == "y" ]; then
  open /Applications/Docker.app
  echo "Docker 已启动，请在弹窗中点击同意并等待 'Engine running'..."
else
  echo "稍后请手动打开 /Applications/Docker.app"
fi
