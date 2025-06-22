import Phaser from 'phaser';
import { GameData, GameState, ObjectData, Action, Achievement } from '../types/index.js';
import { SaveSystem } from '../systems/SaveSystem.js';

const FONT_STYLE = {
    fontFamily: '"Noto Sans SC", sans-serif',
};

export default class UIScene extends Phaser.Scene {
    gameState!: GameState;
    gameData!: GameData;
    progressBars: Record<string, Phaser.GameObjects.Graphics> = {};
    locationText!: Phaser.GameObjects.Text;
    textBox!: Phaser.GameObjects.Text;
    isHoverText: boolean = false;
    actionMenu: Phaser.GameObjects.Container | null = null;
    inventoryPanel: Phaser.GameObjects.Container | null = null;
    logPanel: Phaser.GameObjects.Container | null = null;
    settingsPanel: Phaser.GameObjects.Container | null = null;
    progressBarConfig: any[] = [];
    progressBarBg!: Phaser.GameObjects.Container;
    progressBarFg!: Phaser.GameObjects.Container;
    progressBarLabels!: Phaser.GameObjects.Container;
    inventoryContainer!: Phaser.GameObjects.Container;
    inventoryItemsContainer!: Phaser.GameObjects.Container;
    selectedItemId: string | null = null;
    logBtn!: Phaser.GameObjects.Rectangle;
    achieveBtn!: Phaser.GameObjects.Rectangle;
    achievePanel: Phaser.GameObjects.Container | null = null;
    saveSystem: SaveSystem;

    constructor() {
        super({ key: 'UIScene', active: false });
        this.saveSystem = new SaveSystem('http://localhost:3000');
    }

    create(): void {
        this.gameState = (this.game as any).gameState as GameState;
        this.gameData = (this.game as any).gameData as GameData;
        // --- Event Listeners from GameScene ---
        this.game.events.on('gameStateChanged', this.refreshUI, this);
        this.game.events.on('showActionMenu', this.showActionMenu, this);
        this.game.events.on('hideActionMenu', this.hideActionMenu, this);
        this.game.events.on('showInteraction', this.showInteractionDialog, this);
        this.game.events.on('hideHoverInteraction', this.hideHoverInteraction, this);
        this.game.events.on('locationChanged', this.updateLocationDisplay, this);
        this.game.events.on('achievementUnlocked', this.showAchievementUnlocked, this);
        this.createTopRightIcons();
        this.createTopBar();
        this.createBottomBar();
        this.createInventoryPanel();
        this.refreshUI();
    }

    refreshUI(): void {
        this.updateInventoryDisplay();
        this.updateLocationDisplay();
        this.updateProgressBars();
    }

    createTopBar(): void {
        this.progressBarConfig = [
            { key: 'humanComingHome', label: '两脚兽回家', color: 0xffd700 },
            { key: 'hungry', label: '我饿了', color: 0xff6666 },
            { key: 'needPoop', label: '我要拉屎了', color: 0x66ccff }
        ];
        this.progressBars = {};
        const barX = 40;
        let barY = 40;
        const barWidth = 340;
        const barHeight = 28;
        const barGap = 38;
        this.progressBarBg = this.add.container();
        this.progressBarFg = this.add.container();
        this.progressBarLabels = this.add.container();
        this.progressBarBg.setDepth(10);
        this.progressBarFg.setDepth(11);
        this.progressBarLabels.setDepth(12);
        this.progressBarBg.removeAll(true);
        this.progressBarFg.removeAll(true);
        this.progressBarLabels.removeAll(true);
        this.progressBarConfig.forEach((bar, i) => {
            const bg = this.add.graphics();
            bg.fillStyle(0x222222, 0.85);
            bg.fillRoundedRect(barX, barY, barWidth, barHeight, 10);
            this.progressBarBg.add(bg);
            const fg = this.add.graphics();
            this.progressBarFg.add(fg);
            this.progressBars[bar.key] = fg;
            const label = this.add.text(barX + barWidth + 18, barY + barHeight/2, bar.label, { ...FONT_STYLE, fontSize: '24px', color: '#fff' }).setOrigin(0,0.5);
            this.progressBarLabels.add(label);
            barY += barGap;
        });
    }

    updateProgressBars(): void {
        const progress = this.gameState.progress;
        const barX = 40;
        let barY = 40;
        const barWidth = 340;
        const barHeight = 28;
        const barGap = 38;
        this.progressBarConfig.forEach((bar, i) => {
            const fg = this.progressBars[bar.key];
            fg.clear();
            const value = Math.max(0, Math.min(100, progress[bar.key]));
            fg.fillStyle(bar.color, 1);
            fg.fillRoundedRect(barX, barY, (value/100)*barWidth, barHeight, 10);
            barY += barGap;
        });
    }

    createBottomBar(): void {
        this.locationText = this.add.text(30, 1050, '', { ...FONT_STYLE, fontSize: '32px' }).setOrigin(0, 0.5);
        const btnY = 1020;
        const btnSize = 70;
        this.logBtn = this.add.rectangle(1820, btnY, btnSize, btnSize, 0x222222, 0.85).setInteractive({ useHandCursor: true });
        this.add.text(1820, btnY, '📖', { fontSize: '44px' }).setOrigin(0.5);
        this.logBtn.on('pointerdown', () => this.showLogPanel());
        this.achieveBtn = this.add.rectangle(1920-btnSize/2-20, btnY, btnSize, btnSize, 0x222222, 0.85).setInteractive({ useHandCursor: true });
        this.add.text(1920-btnSize/2-20, btnY, '🏆', { fontSize: '44px' }).setOrigin(0.5);
        this.achieveBtn.on('pointerdown', () => this.showAchievementPanel());
        const saveBtn = this.add.rectangle(1700, btnY, btnSize, btnSize, 0x228822, 0.85).setInteractive({ useHandCursor: true });
        this.add.text(1700, btnY, '💾', { fontSize: '38px' }).setOrigin(0.5);
        saveBtn.on('pointerdown', () => this.saveGame());
        const loadBtn = this.add.rectangle(1600, btnY, btnSize, btnSize, 0x2266cc, 0.85).setInteractive({ useHandCursor: true });
        this.add.text(1600, btnY, '📂', { fontSize: '38px' }).setOrigin(0.5);
        loadBtn.on('pointerdown', () => this.loadGame());
    }

    updateLocationDisplay(): void {
        const sceneName = this.gameData.scenes[this.gameState.currentLocation]?.name || '未知地点';
        this.locationText.setText(`当前位置: ${sceneName}`);
    }

    createInventoryPanel(): void {
        const panelX = 150;
        const panelY = 540;
        const panelWidth = 220;
        const panelHeight = 600;
        const itemSize = 100;
        const padding = 20;
        this.inventoryContainer = this.add.container(panelX, panelY);
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.7);
        graphics.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 15);
        this.inventoryContainer.add(graphics);
        const title = this.add.text(0, -panelHeight/2 + 30, '猫后脑勺', { ...FONT_STYLE, fontSize: '28px' }).setOrigin(0.5);
        this.inventoryContainer.add(title);
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        const maskY = -panelHeight/2 + 70;
        const maskHeight = panelHeight - 110;
        maskShape.fillRect(panelX - (panelWidth-10)/2, panelY + maskY, panelWidth-10, maskHeight);
        const mask = maskShape.createGeometryMask();
        this.inventoryItemsContainer = this.add.container(0, 0);
        this.inventoryContainer.add(this.inventoryItemsContainer);
        this.inventoryItemsContainer.setMask(mask);
        this.selectedItemId = null;
    }

    updateInventoryDisplay(): void {
        this.inventoryItemsContainer.removeAll(true);
        const inventory = this.gameState.inventory;
        const itemsData = this.gameData.items;
        const itemSize = 100;
        const padding = 20;
        const startY = -220;
        inventory.forEach((itemId, index) => {
            const itemData = itemsData[itemId];
            if (!itemData) return;
            const y = startY + index * (itemSize + padding);
            const itemGroup = this.add.container(0, y);
            const isSelected = this.selectedItemId === itemId;
            const borderColor = isSelected ? 0xffff00 : 0x333333;
            const itemBg = this.add.graphics();
            itemBg.fillStyle(0x333333, 1);
            itemBg.fillRoundedRect(-itemSize/2, -itemSize/2, itemSize, itemSize, 10);
            itemBg.lineStyle(4, borderColor, 1);
            itemBg.strokeRoundedRect(-itemSize/2, -itemSize/2, itemSize, itemSize, 10);
            itemGroup.add(itemBg);
            const itemSprite = this.add.image(0, 0, itemData.image).setDisplaySize(itemSize*0.8, itemSize*0.8);
            itemGroup.add(itemSprite);
            itemGroup.setSize(itemSize, itemSize);
            itemGroup.setInteractive(new Phaser.Geom.Rectangle(-itemSize/2, -itemSize/2, itemSize, itemSize), Phaser.Geom.Rectangle.Contains);
            itemGroup.on('pointerdown', () => {
                if (this.selectedItemId === itemId) {
                    this.selectedItemId = null;
                } else {
                    this.selectedItemId = itemId;
                }
                this.updateInventoryDisplay();
            });
            this.inventoryItemsContainer.add(itemGroup);
        });
    }

    async saveGame() {
        const result = await this.saveSystem.saveGame(this.gameState);
        this.showInteractionDialog(result.success ? '游戏已保存！' : '保存失败：' + result.message, 'log');
    }

    async loadGame() {
        const result = await this.saveSystem.loadGame();
        if (result.success && result.data) {
            Object.assign(this.gameState, result.data);
            this.scene.get('GameScene').loadScene(this.gameState.currentLocation);
            this.refreshUI();
            this.showInteractionDialog('存档读取成功！', 'log');
        } else {
            this.showInteractionDialog('读取失败：' + result.message, 'log');
        }
    }

    // 其余方法（showInteractionDialog、showActionMenu、showAchievementUnlocked等）可按原有逻辑迁移，类型补全
    // ...（省略，迁移时会全部类型化）
} 