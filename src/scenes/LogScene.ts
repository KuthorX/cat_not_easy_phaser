import Phaser from 'phaser';
import { GameState, GameData } from '../types/index';

const FONT_STYLE = {
    fontFamily: '"Noto Sans SC", sans-serif',
};

export default class LogScene extends Phaser.Scene {
    gameState!: GameState;
    gameData!: GameData;
    private currentPage: number = 1;
    private pageSize: number = 10;
    private totalPages: number = 1;
    private pageText?: Phaser.GameObjects.Text;
    private prevBtn?: Phaser.GameObjects.Rectangle;
    private nextBtn?: Phaser.GameObjects.Rectangle;
    private logList?: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'LogScene' });
    }

    create(): void {
        this.gameState = (this.game as any).gameState as GameState;
        this.gameData = (this.game as any).gameData as GameData;
        
        this.createBackground();
        this.createHeader();
        this.createLogContent();
        this.createBackButton();
    }

    private createBackground(): void {
        // 背景
        this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.95);
        
        // 装饰性边框
        const border = this.add.graphics();
        border.lineStyle(4, 0x66ccff, 1);
        border.strokeRoundedRect(50, 50, 1820, 980, 20);
    }

    private createHeader(): void {
        // 标题
        const title = this.add.text(960, 100, '📖 游戏日志', { 
            ...FONT_STYLE, 
            fontSize: '48px', 
            color: '#66ccff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 统计信息
        const logs = this.gameState.actionLog || [];
        const stats = this.add.text(960, 160, 
            `共 ${logs.length} 条记录`, { 
            ...FONT_STYLE, 
            fontSize: '24px', 
            color: '#66ccff'
        }).setOrigin(0.5);

        // 清空按钮
        const clearBtn = this.add.rectangle(1600, 100, 120, 60, 0xff6666, 0.8)
            .setInteractive({ useHandCursor: true });
        const clearText = this.add.text(1600, 100, '清空', { 
            ...FONT_STYLE, 
            fontSize: '20px', 
            color: '#fff' 
        }).setOrigin(0.5);
        
        clearBtn.on('pointerdown', () => this.clearLog());
    }

    private createLogContent(): void {
        if (this.logList) {
            this.logList.destroy();
        }
        this.logList = this.add.container(960, 540);
        const logs = this.gameState.actionLog || [];
        this.totalPages = Math.max(1, Math.ceil(logs.length / this.pageSize));
        const startIdx = (this.currentPage - 1) * this.pageSize;
        const pageLogs = logs.slice().reverse().slice(startIdx, startIdx + this.pageSize);
        let yOffset = -250;
        if (pageLogs.length === 0) {
            const emptyText = this.add.text(0, 0, '暂无日志记录', { 
                ...FONT_STYLE, 
                fontSize: '32px', 
                color: '#666'
            }).setOrigin(0.5);
            this.logList.add(emptyText);
        } else {
            pageLogs.forEach((log, index) => {
                const logBg = this.add.graphics();
                logBg.fillStyle(index % 2 === 0 ? 0x333333 : 0x2a2a2a, 0.8);
                logBg.fillRoundedRect(-700, yOffset - 20, 1400, 60, 10);
                this.logList!.add(logBg);
                const logText = this.add.text(-670, yOffset + 10, log, { 
                    ...FONT_STYLE, 
                    fontSize: '20px', 
                    color: '#fff',
                    wordWrap: { width: 1300 }
                }).setOrigin(0, 0.5);
                this.logList!.add(logText);
                const timeText = this.add.text(650, yOffset + 10, new Date().toLocaleTimeString(), { 
                    ...FONT_STYLE, 
                    fontSize: '14px', 
                    color: '#666'
                }).setOrigin(1, 0.5);
                this.logList!.add(timeText);
                yOffset += 70;
            });
        }
        this.createPaginationControls();
    }

    private createPaginationControls(): void {
        if (this.pageText) this.pageText.destroy();
        if (this.prevBtn) this.prevBtn.destroy();
        if (this.nextBtn) this.nextBtn.destroy();
        this.pageText = this.add.text(960, 950, `第 ${this.currentPage} / ${this.totalPages} 页`, {
            fontSize: '22px', color: '#66ccff', fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);
        this.prevBtn = this.add.rectangle(860, 950, 60, 40, 0x444444, 0.8).setInteractive({ useHandCursor: true });
        this.add.text(860, 950, '<', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
        this.prevBtn.on('pointerdown', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.createLogContent();
            }
        });
        this.nextBtn = this.add.rectangle(1060, 950, 60, 40, 0x444444, 0.8).setInteractive({ useHandCursor: true });
        this.add.text(1060, 950, '>', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
        this.nextBtn.on('pointerdown', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.createLogContent();
            }
        });
    }

    private clearLog(): void {
        this.gameState.actionLog = [];
        this.scene.restart();
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