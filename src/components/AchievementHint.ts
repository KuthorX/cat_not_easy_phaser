import Phaser from 'phaser';

const FONT_STYLE = {
    fontFamily: '"Noto Sans SC", sans-serif',
};

export default class AchievementHint extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private icon: Phaser.GameObjects.Text;
    private title: Phaser.GameObjects.Text;
    private isVisible: boolean = false;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
        
        // 设置初始位置（屏幕右侧外）
        this.setPosition(1920, 100);
        this.setDepth(50);
        
        // 创建背景
        this.background = this.scene.add.graphics();
        this.background.fillStyle(0x000000, 0.9);
        this.background.fillRoundedRect(-200, -40, 400, 80, 20);
        this.background.lineStyle(3, 0xffd700, 1);
        this.background.strokeRoundedRect(-200, -40, 400, 80, 20);
        this.add(this.background);
        
        // 创建成就图标
        this.icon = this.scene.add.text(-150, 0, '🏆', { 
            fontSize: '32px' 
        }).setOrigin(0.5);
        this.add(this.icon);
        
        // 创建成就标题
        this.title = this.scene.add.text(-50, 0, '', { 
            ...FONT_STYLE, 
            fontSize: '20px', 
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.add(this.title);
        
        // 初始状态：隐藏
        this.setAlpha(0);
        
        // 添加到场景
        this.scene.add.existing(this);
    }

    /**
     * 显示成就提示
     */
    show(achievementName: string): void {
        if (this.isVisible) {
            // 如果已经在显示，先隐藏再重新显示
            this.hide();
            this.scene.time.delayedCall(100, () => {
                this.show(achievementName);
            });
            return;
        }

        this.isVisible = true;
        this.title.setText(achievementName);
        
        // 设置初始位置（屏幕右侧外）
        this.setPosition(1920, 100);
        this.setAlpha(0);
        
        // 动画：从右到左移动并淡入
        this.scene.tweens.add({
            targets: this,
            x: 1520, // 移动到右上角
            alpha: 1,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                // 停留5秒后淡出
                this.scene.tweens.add({
                    targets: this,
                    x: 1920, // 移动到屏幕右侧外
                    alpha: 0,
                    duration: 600,
                    delay: 5000,
                    ease: 'Power2',
                    onComplete: () => {
                        this.isVisible = false;
                    }
                });
            }
        });
        
        console.log(`🎉 显示成就提示: ${achievementName}`);
    }

    /**
     * 隐藏成就提示
     */
    hide(): void {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.scene.tweens.killTweensOf(this);
        
        this.scene.tweens.add({
            targets: this,
            x: 1920,
            alpha: 0,
            duration: 300,
            ease: 'Power2'
        });
    }

    /**
     * 销毁组件
     */
    destroy(): void {
        this.scene.tweens.killTweensOf(this);
        super.destroy();
    }
} 