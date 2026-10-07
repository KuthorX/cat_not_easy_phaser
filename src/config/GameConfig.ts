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

export { GameConstants } from './GameConstants';
