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
  GAME_START_TIME: 8, // 早上8点开始
  GAME_END_TIME: 20,  // 晚上8点结束
  TIME_UNIT: 30,      // 最小时间单位30分钟
  
  // 状态相关
  MAX_HUNGER: 5,
  MAX_ENERGY: 5,
  INITIAL_HUNGER: 1,
  INITIAL_ENERGY: 1,
  
  // 交互消耗
  BASIC_ACTION_COST: 30,  // 基础交互30分钟
  ADVANCED_ACTION_COST: 60, // 高级交互60分钟
  
  // 恢复数值
  BASIC_HUNGER_RESTORE: 2,
  ADVANCED_HUNGER_RESTORE: 4,
  BASIC_ENERGY_RESTORE: 2,
  ADVANCED_ENERGY_RESTORE: 4,
  
  // 特殊事件时间
  SPECIAL_EVENTS: {
    OWNER_RETURN: 18, // 主人回家时间
    NEIGHBOR_CAT_FIGHT: 16 // 邻居猫战斗时间
  }
}; 