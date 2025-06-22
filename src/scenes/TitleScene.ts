import Phaser from 'phaser';

const FONT_STYLE = {
    fontFamily: '"Noto Sans SC", sans-serif',
};

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create(): void {
        // --- Title Text ---
        const title = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 3, 
            '猫不易', 
            { ...FONT_STYLE, fontSize: '96px', color: '#fff' }
        );
        title.setOrigin(0.5, 0.5);

        // --- Start Button ---
        const startButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            '睡醒，看看四周',
            { 
                ...FONT_STYLE,
                fontSize: '48px', 
                color: '#fff', 
                backgroundColor: '#555',
                padding: { left: 30, right: 30, top: 15, bottom: 15 }
            }
        );
        startButton.setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

        // --- Button Interactivity ---
        startButton.on('pointerover', () => {
            startButton.setBackgroundColor('#777');
        });

        startButton.on('pointerout', () => {
            startButton.setBackgroundColor('#555');
        });

        startButton.on('pointerdown', () => {
            const initialScene = this.registry.get('gameState').currentLocation;
            this.scene.start('GameScene', { sceneId: initialScene });
        });
    }
} 