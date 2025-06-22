#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
猫咪游戏快速启动脚本
一键启动游戏服务器并打开浏览器
"""

import os
import sys
import time
import subprocess
import trace
import traceback
import webbrowser
import requests
from pathlib import Path

def check_python_version():
    """检查Python版本"""
    if sys.version_info < (3, 7):
        print("❌ 需要Python 3.7或更高版本")
        sys.exit(1)
    print(f"✅ Python版本: {sys.version.split()[0]}")

def install_dependencies():
    """安装依赖"""
    print("📦 检查并安装依赖...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True)
        print("✅ 依赖安装完成")
    except subprocess.CalledProcessError as e:
        print(f"❌ 依赖安装失败: {traceback.format_exc()}")
        sys.exit(1)

def start_server():
    """启动游戏服务器"""
    print("🚀 启动游戏服务器...")
    
    # 获取项目根目录
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    # 启动Node.js服务器
    try:
        server_process = subprocess.Popen(
            ["npm", "run", "dev"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # 等待服务器启动
        print("⏳ 等待服务器启动...")
        time.sleep(3)
        
        # 检查服务器是否启动成功
        try:
            response = requests.get("http://localhost:3000", timeout=5)
            if response.status_code == 200:
                print("✅ 服务器启动成功")
                return server_process
        except requests.RequestException:
            pass
        
        print("❌ 服务器启动失败")
        server_process.terminate()
        sys.exit(1)
        
    except FileNotFoundError:
        print("❌ 未找到npm，请确保已安装Node.js")
        sys.exit(1)

def open_browser():
    """打开浏览器"""
    print("🌐 打开浏览器...")
    try:
        webbrowser.open("http://localhost:3000")
        print("✅ 浏览器已打开")
    except Exception as e:
        print(f"❌ 无法打开浏览器: {e}")
        print("请手动访问: http://localhost:3000")

def show_game_info():
    """显示游戏信息"""
    print("\n" + "="*50)
    print("🐱 猫咪的一日 - 游戏启动成功！")
    print("="*50)
    print("🎮 游戏说明:")
    print("   • 扮演一只猫咪，体验从主人上班到回家的一天")
    print("   • 点击场景中的物品进行交互")
    print("   • 管理饥饿、拉屎、主人回家等进度条")
    print("   • 解锁各种成就，体验不同的猫咪生活")
    print("\n🎯 游戏目标:")
    print("   • 探索所有区域")
    print("   • 完成各种成就")
    print("   • 体验不同的结局")
    print("\n⌨️  操作说明:")
    print("   • 左键点击：与物品交互")
    print("   • 右键点击：显示物品菜单")
    print("   • 拖拽物品：将物品拖到场景中")
    print("   • 右下角按钮：查看日志、成就、存档")
    print("\n🛑 按 Ctrl+C 停止游戏")
    print("="*50)

def main():
    """主函数"""
    print("🐱 猫咪游戏快速启动器")
    print("="*30)
    
    # 检查Python版本
    check_python_version()
    
    # 安装依赖
    install_dependencies()
    
    # 启动服务器
    server_process = start_server()
    
    # 打开浏览器
    open_browser()
    
    # 显示游戏信息
    show_game_info()
    
    try:
        # 保持脚本运行
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 正在停止游戏...")
        server_process.terminate()
        print("✅ 游戏已停止")

if __name__ == "__main__":
    main() 