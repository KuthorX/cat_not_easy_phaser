import BootScene from './src/scenes/BootScene.js';
import TitleScene from './src/scenes/TitleScene.js';
import GameScene from './src/scenes/GameScene.js';
import UIScene from './src/scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    scene: [
        BootScene,
        TitleScene,
        GameScene,
        UIScene
    ],
    backgroundColor: '#000000',
};

const game = new Phaser.Game(config); 