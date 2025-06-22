import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import GameScene from './scenes/GameScene';
import UIScene from './scenes/UIScene';
import AchievementScene from './scenes/AchievementScene';
import LogScene from './scenes/LogScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
  },
  scene: [BootScene, TitleScene, GameScene, UIScene, AchievementScene, LogScene],
  backgroundColor: '#000000',
};

new Phaser.Game(config); 