#!/bin/bash

echo "🐱 启动猫咪游戏..."
echo "=================="

# 检查Node.js版本
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="20.10.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    echo "✅ Node.js版本检查通过: $NODE_VERSION"
else
    echo "❌ Node.js版本过低，需要 >= $REQUIRED_VERSION，当前: $NODE_VERSION"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动服务器和客户端
echo "🚀 启动游戏服务器和客户端..."
echo "📡 服务器地址: http://localhost:3000"
echo "🎮 客户端地址: http://localhost:5173"
echo "=================="

npm run dev:full 