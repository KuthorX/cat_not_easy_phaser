import { SceneKeys } from '../constants/SceneKeys';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#87CEEB', // 天蓝色背景
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [
    // 场景将在SceneManager中动态注册
  ],
  dom: {
    createContainer: true
  },
  render: {
    pixelArt: false,
    antialias: true
  }
};

// 游戏常量配置
export const GameConstants = {
  // 时间相关
  GAME_START_TIME: 9, // 早上9点开始
  GAME_END_TIME: 21,  // 晚上9点结束
  TIME_UNIT: 30,      // 最小时间单位30分钟
  
  // 状态相关
  MAX_ENERGY: 5,
  INITIAL_ENERGY: 1,
  
  // 交互消耗（翻倍）
  BASIC_ACTION_COST: 60,  // 基础交互60分钟（原30分钟）
  ADVANCED_ACTION_COST: 120, // 高级交互120分钟（原60分钟）
  
  // 恢复数值
  BASIC_ENERGY_RESTORE: 2,
  ADVANCED_ENERGY_RESTORE: 4,
  
  // 特殊事件时间
  SPECIAL_EVENTS: {
    OWNER_RETURN: 18, // 主人回家时间
    NEIGHBOR_CAT_FIGHT: 16 // 邻居猫战斗时间
  }
}; 