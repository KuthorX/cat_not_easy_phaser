#!/bin/bash

echo "🐱 启动猫咪游戏..."

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node_version=$(node -v)
echo "当前Node.js版本: $node_version"

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p temp/saves

# 启动完整游戏（前端+后端）
echo "🚀 启动游戏服务器..."
echo "前端地址: http://localhost:5173"
echo "后端地址: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止游戏"
echo ""

# 使用concurrently同时启动前端和后端
npm run dev:full 