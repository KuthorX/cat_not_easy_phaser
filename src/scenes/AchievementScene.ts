import Phaser from 'phaser';
import { GameState, GameData, Achievement } from '../types/index';

const FONT_STYLE = {
    fontFamily: '"Noto Sans SC", sans-serif',
};

export default class AchievementScene extends Phaser.Scene {
    gameState!: GameState;
    gameData!: GameData;
    private achievementList?: Phaser.GameObjects.Container;
    private currentPage: number = 1;
    private pageSize: number = 10;
    private totalPages: number = 1;
    private pageText?: Phaser.GameObjects.Text;
    private prevBtn?: Phaser.GameObjects.Rectangle;
    private nextBtn?: Phaser.GameObjects.Rectangle;

    constructor() {
        super({ key: 'AchievementScene' });
    }

    create(): void {
        this.gameState = (this.game as any).gameState as GameState;
        this.gameData = (this.game as any).gameData as GameData;
        
        this.createBackground();
        this.createHeader();
        this.createAchievementContent();
        this.createBackButton();
    }

    private createBackground(): void {
        // 背景
        this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.95);
        
        // 装饰性边框
        const border = this.add.graphics();
        border.lineStyle(4, 0xffd700, 1);
        border.strokeRoundedRect(50, 50, 1820, 980, 20);
    }

    private createHeader(): void {
        // 标题
        const title = this.add.text(960, 100, '🏆 成就系统', { 
            ...FONT_STYLE, 
            fontSize: '48px', 
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 统计信息
        const totalAchievements = Object.keys(this.gameState.achievements).length;
        const totalPossible = Object.keys(this.cache.json.get('achievements').achievements).length;
        const stats = this.add.text(960, 160, 
            `已解锁: ${totalAchievements}/${totalPossible}`, { 
            ...FONT_STYLE, 
            fontSize: '24px', 
            color: '#ffd700'
        }).setOrigin(0.5);

        // 进度条
        const progressBarBg = this.add.graphics();
        progressBarBg.fillStyle(0x333333, 0.8);
        progressBarBg.fillRoundedRect(760, 180, 400, 20, 10);
        
        const progressBarFg = this.add.graphics();
        const progress = totalPossible > 0 ? totalAchievements / totalPossible : 0;
        progressBarFg.fillStyle(0xffd700, 1);
        progressBarFg.fillRoundedRect(760, 180, 400 * progress, 20, 10);
    }

    private createAchievementContent(): void {
        if (this.achievementList) {
            this.achievementList.destroy();
        }
        this.achievementList = this.add.container(960, 540);

        // 获取所有成就（主+子）
        const achievementsData = this.cache.json.get('achievements');
        const allAchievements = Object.values(achievementsData.achievements);
        this.totalPages = Math.ceil(allAchievements.length / this.pageSize);
        const startIdx = (this.currentPage - 1) * this.pageSize;
        const pageAchievements = allAchievements.slice(startIdx, startIdx + this.pageSize);

        let yOffset = -250;
        pageAchievements.forEach((achievementData: any) => {
            const isUnlocked = !!this.gameState.achievements[achievementData.id];
            const unlockedAchievement = this.gameState.achievements[achievementData.id];
            const bg = this.add.graphics();
            bg.fillStyle(isUnlocked ? 0x333333 : 0x222222, 0.8);
            bg.fillRoundedRect(-700, yOffset - 20, 1400, 60, 10);
            if (isUnlocked) {
                bg.lineStyle(2, 0xffd700, 1);
                bg.strokeRoundedRect(-700, yOffset - 20, 1400, 60, 10);
            }
            this.achievementList!.add(bg);
            const icon = this.add.text(-670, yOffset + 10, isUnlocked ? '✅' : '🔒', { fontSize: '28px' }).setOrigin(0, 0.5);
            this.achievementList!.add(icon);
            const name = this.add.text(-630, yOffset + 10, achievementData.name, {
                fontSize: '22px', color: isUnlocked ? '#fff' : '#666', fontFamily: 'Noto Sans SC', fontStyle: isUnlocked ? 'bold' : ''
            }).setOrigin(0, 0.5);
            this.achievementList!.add(name);
            const desc = this.add.text(-200, yOffset + 10, achievementData.description, {
                fontSize: '18px', color: isUnlocked ? '#aaa' : '#666', fontFamily: 'Noto Sans SC'
            }).setOrigin(0, 0.5);
            this.achievementList!.add(desc);
            if (isUnlocked && unlockedAchievement) {
                const date = this.add.text(600, yOffset + 10, new Date(unlockedAchievement.unlockedAt).toLocaleDateString(), {
                    fontSize: '14px', color: '#ffd700', fontFamily: 'Noto Sans SC'
                }).setOrigin(1, 0.5);
                this.achievementList!.add(date);
            }
            yOffset += 70;
        });

        // 分页按钮和页码
        this.createPaginationControls();
    }

    private createPaginationControls(): void {
        // 移除旧的按钮和文本
        if (this.pageText) this.pageText.destroy();
        if (this.prevBtn) this.prevBtn.destroy();
        if (this.nextBtn) this.nextBtn.destroy();

        // 页码文本
        this.pageText = this.add.text(960, 950, `第 ${this.currentPage} / ${this.totalPages} 页`, {
            fontSize: '22px', color: '#ffd700', fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);

        // 上一页按钮
        this.prevBtn = this.add.rectangle(860, 950, 60, 40, 0x444444, 0.8).setInteractive({ useHandCursor: true });
        this.add.text(860, 950, '<', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
        this.prevBtn.on('pointerdown', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.createAchievementContent();
            }
        });

        // 下一页按钮
        this.nextBtn = this.add.rectangle(1060, 950, 60, 40, 0x444444, 0.8).setInteractive({ useHandCursor: true });
        this.add.text(1060, 950, '>', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
        this.nextBtn.on('pointerdown', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.createAchievementContent();
            }
        });
    }

    private createBackButton(): void {
        const backBtn = this.add.rectangle(100, 100, 120, 60, 0x333333, 0.8)
            .setInteractive({ useHandCursor: true });
        const backText = this.add.text(100, 100, '返回', { 
            ...FONT_STYLE, 
            fontSize: '20px', 
            color: '#fff' 
        }).setOrigin(0.5);
        
        backBtn.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('UIScene');
        });
    }
} 