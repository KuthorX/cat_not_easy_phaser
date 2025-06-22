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
    itemUseMenu: Phaser.GameObjects.Container | null = null;

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
            { key: 'humanComingHome', label: '两脚兽回家', color: 0xffd700, icon: '🏠' },
            { key: 'hungry', label: '我饿了', color: 0xff6666, icon: '🍽️' },
            { key: 'needPoop', label: '我要拉屎了', color: 0x66ccff, icon: '🚽' }
        ];
        this.progressBars = {};
        const barX = 40;
        let barY = 40;
        const barWidth = 340;
        const barHeight = 32;
        const barGap = 42;
        
        // 创建进度条容器
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
            // 背景条
            const bg = this.add.graphics();
            bg.fillStyle(0x222222, 0.9);
            bg.fillRoundedRect(barX, barY, barWidth, barHeight, 16);
            bg.lineStyle(2, 0x444444, 1);
            bg.strokeRoundedRect(barX, barY, barWidth, barHeight, 16);
            this.progressBarBg.add(bg);
            
            // 前景条（进度）
            const fg = this.add.graphics();
            this.progressBarFg.add(fg);
            this.progressBars[bar.key] = fg;
            
            // 图标
            const icon = this.add.text(barX - 35, barY + barHeight/2, bar.icon, { 
                fontSize: '24px' 
            }).setOrigin(0.5);
            this.progressBarLabels.add(icon);
            
            // 标签文字
            const label = this.add.text(barX + barWidth + 18, barY + barHeight/2, bar.label, { 
                ...FONT_STYLE, 
                fontSize: '22px', 
                color: '#fff',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            this.progressBarLabels.add(label);
            
            // 数值显示
            const valueText = this.add.text(barX + barWidth/2, barY + barHeight/2, '0%', { 
                ...FONT_STYLE, 
                fontSize: '18px', 
                color: '#fff'
            }).setOrigin(0.5);
            this.progressBarLabels.add(valueText);
            
            barY += barGap;
        });
    }

    updateProgressBars(): void {
        const progress = this.gameState.progress;
        const barX = 40;
        let barY = 40;
        const barWidth = 340;
        const barHeight = 32;
        const barGap = 42;
        
        this.progressBarConfig.forEach((bar, i) => {
            const fg = this.progressBars[bar.key];
            fg.clear();
            
            const value = Math.max(0, Math.min(100, progress[bar.key as keyof typeof progress] || 0));
            const fillWidth = (value / 100) * barWidth;
            
            // 使用简单的填充效果替代渐变
            fg.fillStyle(bar.color, 1);
            fg.fillRoundedRect(barX, barY, fillWidth, barHeight, 16);
            
            // 添加高光效果
            if (fillWidth > 0) {
                fg.fillStyle(0xffffff, 0.3);
                fg.fillRoundedRect(barX, barY + 2, fillWidth, barHeight/3, 16);
            }
            
            // 更新数值显示
            const valueText = this.progressBarLabels.getAt(i * 3 + 2) as Phaser.GameObjects.Text;
            if (valueText) {
                valueText.setText(`${Math.round(value)}%`);
                
                // 根据数值改变颜色
                if (value > 80) {
                    valueText.setColor('#ff4444');
                } else if (value > 60) {
                    valueText.setColor('#ffaa00');
                } else {
                    valueText.setColor('#ffffff');
                }
            }
            
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
            
            // 物品背景
            const itemBg = this.add.graphics();
            itemBg.fillStyle(0x333333, 1);
            itemBg.fillRoundedRect(-itemSize/2, -itemSize/2, itemSize, itemSize, 10);
            itemBg.lineStyle(4, borderColor, 1);
            itemBg.strokeRoundedRect(-itemSize/2, -itemSize/2, itemSize, itemSize, 10);
            itemGroup.add(itemBg);
            
            // 物品图片
            const itemSprite = this.add.image(0, 0, itemData.image).setDisplaySize(itemSize*0.8, itemSize*0.8);
            itemGroup.add(itemSprite);
            
            // 物品名称
            const itemName = this.add.text(0, itemSize/2 + 15, itemData.name, { 
                ...FONT_STYLE, 
                fontSize: '14px', 
                color: '#fff'
            }).setOrigin(0.5);
            itemGroup.add(itemName);
            
            // 设置交互区域
            itemGroup.setSize(itemSize, itemSize + 30);
            itemGroup.setInteractive(new Phaser.Geom.Rectangle(-itemSize/2, -itemSize/2, itemSize, itemSize + 30), Phaser.Geom.Rectangle.Contains);
            
            // 左键点击：选择物品
            itemGroup.on('pointerdown', (pointer: any) => {
                if (pointer.leftButtonDown()) {
                    if (this.selectedItemId === itemId) {
                        this.selectedItemId = null;
                    } else {
                        this.selectedItemId = itemId;
                    }
                    this.updateInventoryDisplay();
                }
            });
            
            // 右键点击：显示使用菜单
            itemGroup.on('pointerdown', (pointer: any) => {
                if (pointer.rightButtonDown()) {
                    this.showItemUseMenu(itemId, itemData, pointer.x, pointer.y);
                }
            });
            
            // 拖拽功能
            itemGroup.setInteractive({ draggable: true });
            itemGroup.on('dragstart', (pointer: any, dragX: number, dragY: number) => {
                this.startItemDrag(itemId, itemData, dragX, dragY);
            });
            
            this.inventoryItemsContainer.add(itemGroup);
        });
    }

    showItemUseMenu(itemId: string, itemData: any, x: number, y: number): void {
        // 隐藏之前的菜单
        this.hideItemUseMenu();
        
        // 创建使用菜单
        const menu = this.add.container(x, y);
        menu.setDepth(25);
        
        // 菜单背景
        const bg = this.add.graphics();
        bg.fillStyle(0x222222, 0.95);
        bg.fillRoundedRect(0, 0, 150, 120, 10);
        bg.lineStyle(2, 0x444444, 1);
        bg.strokeRoundedRect(0, 0, 150, 120, 10);
        menu.add(bg);
        
        // 使用按钮
        const useBtn = this.add.rectangle(75, 30, 130, 30, 0x44aa44, 0.8)
            .setInteractive({ useHandCursor: true });
        const useText = this.add.text(75, 30, '使用', { 
            ...FONT_STYLE, 
            fontSize: '16px', 
            color: '#fff' 
        }).setOrigin(0.5);
        useBtn.on('pointerdown', () => this.useItem(itemId));
        menu.add(useBtn);
        menu.add(useText);
        
        // 丢弃按钮
        const dropBtn = this.add.rectangle(75, 70, 130, 30, 0xaa4444, 0.8)
            .setInteractive({ useHandCursor: true });
        const dropText = this.add.text(75, 70, '丢弃', { 
            ...FONT_STYLE, 
            fontSize: '16px', 
            color: '#fff' 
        }).setOrigin(0.5);
        dropBtn.on('pointerdown', () => this.dropItem(itemId));
        menu.add(dropBtn);
        menu.add(dropText);
        
        // 查看按钮
        const infoBtn = this.add.rectangle(75, 110, 130, 30, 0x4444aa, 0.8)
            .setInteractive({ useHandCursor: true });
        const infoText = this.add.text(75, 110, '查看', { 
            ...FONT_STYLE, 
            fontSize: '16px', 
            color: '#fff' 
        }).setOrigin(0.5);
        infoBtn.on('pointerdown', () => this.showItemInfo(itemId, itemData));
        menu.add(infoBtn);
        menu.add(infoText);
        
        // 3秒后自动隐藏
        this.time.delayedCall(3000, () => {
            this.hideItemUseMenu();
        });
        
        this.itemUseMenu = menu;
    }

    hideItemUseMenu(): void {
        if (this.itemUseMenu) {
            this.itemUseMenu.destroy();
            this.itemUseMenu = null;
        }
    }

    useItem(itemId: string): void {
        this.hideItemUseMenu();
        console.log(`使用物品: ${itemId}`);
        
        // 根据物品类型执行不同操作
        switch (itemId) {
            case 'fish_item':
                this.gameState.removeFromInventory(itemId);
                this.gameState.progress.hungry = Math.max(0, (this.gameState.progress.hungry || 0) - 30);
                this.gameState.log('你吃掉了小鱼干，感觉饱了！');
                break;
            default:
                this.gameState.log(`你使用了 ${this.gameData.items[itemId]?.name || itemId}`);
        }
        
        this.refreshUI();
    }

    dropItem(itemId: string): void {
        this.hideItemUseMenu();
        this.gameState.removeFromInventory(itemId);
        this.gameState.log(`你丢弃了 ${this.gameData.items[itemId]?.name || itemId}`);
        this.refreshUI();
    }

    showItemInfo(itemId: string, itemData: any): void {
        this.hideItemUseMenu();
        
        const infoPopup = this.add.container(960, 540);
        infoPopup.setDepth(25);
        
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(-200, -150, 400, 300, 20);
        bg.lineStyle(3, 0x444444, 1);
        bg.strokeRoundedRect(-200, -150, 400, 300, 20);
        infoPopup.add(bg);
        
        const title = this.add.text(0, -120, itemData.name, { 
            ...FONT_STYLE, 
            fontSize: '24px', 
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        infoPopup.add(title);
        
        const desc = this.add.text(0, -60, itemData.description, { 
            ...FONT_STYLE, 
            fontSize: '16px', 
            color: '#aaa',
            wordWrap: { width: 350 }
        }).setOrigin(0.5);
        infoPopup.add(desc);
        
        const closeBtn = this.add.rectangle(0, 100, 100, 40, 0xff4444, 0.8)
            .setInteractive({ useHandCursor: true });
        const closeText = this.add.text(0, 100, '关闭', { 
            ...FONT_STYLE, 
            fontSize: '16px', 
            color: '#fff' 
        }).setOrigin(0.5);
        closeBtn.on('pointerdown', () => infoPopup.destroy());
        infoPopup.add(closeBtn);
        infoPopup.add(closeText);
    }

    startItemDrag(itemId: string, itemData: any, x: number, y: number): void {
        // 创建拖拽预览
        const dragPreview = this.add.image(x, y, itemData.image).setDisplaySize(60, 60);
        dragPreview.setDepth(30);
        dragPreview.setAlpha(0.8);
        
        // 设置拖拽目标
        this.input.setDraggable(dragPreview);
        
        // 拖拽结束处理
        this.input.on('dragend', (pointer: any, gameObject: any, dropped: boolean) => {
            if (dropped) {
                // 检查是否拖拽到场景中的可交互对象
                this.handleItemDrop(itemId, pointer.x, pointer.y);
            }
            dragPreview.destroy();
        });
    }

    handleItemDrop(itemId: string, x: number, y: number): void {
        // 检查是否拖拽到场景中的对象
        const gameScene = this.scene.get('GameScene') as any;
        if (gameScene && gameScene.handleItemDrop) {
            gameScene.handleItemDrop(itemId, x, y);
        }
    }

    async saveGame() {
        const result = await this.saveSystem.saveGame(this.gameState);
        this.showInteractionDialog(result.success ? '游戏已保存！' : '保存失败：' + result.message, 'log');
    }

    async loadGame() {
        const result = await this.saveSystem.loadGame();
        if (result.success && result.data) {
            Object.assign(this.gameState, result.data);
            this.game.events.emit('loadScene', this.gameState.currentLocation);
            this.refreshUI();
            this.showInteractionDialog('存档读取成功！', 'log');
        } else {
            this.showInteractionDialog('读取失败：' + result.message, 'log');
        }
    }

    createTopRightIcons(): void {
        // 创建右上角图标
        const iconX = 1880;
        const iconY = 40;
        const iconSize = 60;
        
        // 设置按钮
        const settingsBtn = this.add.rectangle(iconX, iconY, iconSize, iconSize, 0x222222, 0.85)
            .setInteractive({ useHandCursor: true });
        this.add.text(iconX, iconY, '⚙️', { fontSize: '32px' }).setOrigin(0.5);
        settingsBtn.on('pointerdown', () => this.showSettingsPanel());
    }

    showActionMenu(x: number, y: number, actions: Action[]): void {
        this.hideActionMenu();
        this.actionMenu = this.add.container(x, y);
        // 实现动作菜单显示逻辑
    }

    hideActionMenu(): void {
        if (this.actionMenu) {
            this.actionMenu.destroy();
            this.actionMenu = null;
        }
    }

    showInteractionDialog(text: string, type: string = 'normal'): void {
        // 实现交互对话框显示逻辑
        console.log(`显示对话框: ${text} (类型: ${type})`);
    }

    hideHoverInteraction(): void {
        // 实现隐藏悬停交互逻辑
    }

    showAchievementUnlocked(achievement: any): void {
        // 创建成就解锁弹窗
        const popup = this.add.container(960, 200);
        popup.setDepth(30);
        
        // 背景
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.95);
        bg.fillRoundedRect(-200, -80, 400, 160, 20);
        bg.lineStyle(4, 0xffd700, 1);
        bg.strokeRoundedRect(-200, -80, 400, 160, 20);
        popup.add(bg);
        
        // 成就图标
        const icon = this.add.text(0, -40, '🏆', { fontSize: '48px' }).setOrigin(0.5);
        popup.add(icon);
        
        // 成就标题
        const title = this.add.text(0, -10, '成就解锁！', { 
            ...FONT_STYLE, 
            fontSize: '24px', 
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        popup.add(title);
        
        // 成就名称
        const name = this.add.text(0, 15, achievement.name, { 
            ...FONT_STYLE, 
            fontSize: '20px', 
            color: '#fff'
        }).setOrigin(0.5);
        popup.add(name);
        
        // 成就描述
        const desc = this.add.text(0, 40, achievement.description, { 
            ...FONT_STYLE, 
            fontSize: '16px', 
            color: '#aaa'
        }).setOrigin(0.5);
        popup.add(desc);
        
        // 初始状态：隐藏
        popup.setAlpha(0);
        popup.setScale(0.5);
        
        // 动画：淡入和缩放
        this.tweens.add({
            targets: popup,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                // 添加粒子效果
                this.createAchievementParticles(960, 200);
                
                // 3秒后淡出
                this.tweens.add({
                    targets: popup,
                    alpha: 0,
                    y: 100,
                    duration: 1000,
                    delay: 2000,
                    ease: 'Power2',
                    onComplete: () => {
                        popup.destroy();
                    }
                });
            }
        });
        
        // 播放音效（如果有的话）
        console.log(`🎉 成就解锁: ${achievement.name} - ${achievement.description}`);
    }

    createAchievementParticles(x: number, y: number): void {
        // 创建粒子效果
        const particles = this.add.particles(x, y, 'particle', {
            speed: { min: 100, max: 200 },
            scale: { start: 0.5, end: 0 },
            lifespan: 1000,
            quantity: 20,
            blendMode: 'ADD',
            tint: [0xffd700, 0xffaa00, 0xffff00]
        });
        
        // 1秒后销毁粒子
        this.time.delayedCall(1000, () => {
            particles.destroy();
        });
    }

    showLogPanel(): void {
        if (this.logPanel) {
            this.logPanel.destroy();
        }
        
        this.logPanel = this.add.container(960, 540);
        this.logPanel.setDepth(20);
        
        // 背景
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(-400, -300, 800, 600, 20);
        bg.lineStyle(3, 0x444444, 1);
        bg.strokeRoundedRect(-400, -300, 800, 600, 20);
        this.logPanel.add(bg);
        
        // 标题
        const title = this.add.text(0, -250, '📖 游戏日志', { 
            ...FONT_STYLE, 
            fontSize: '32px', 
            color: '#66ccff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.logPanel.add(title);
        
        // 关闭按钮
        const closeBtn = this.add.rectangle(350, -250, 60, 60, 0xff4444, 0.8)
            .setInteractive({ useHandCursor: true });
        this.add.text(350, -250, '✕', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
        closeBtn.on('pointerdown', () => this.hideLogPanel());
        this.logPanel.add(closeBtn);
        
        // 清空按钮
        const clearBtn = this.add.rectangle(-350, -250, 80, 40, 0xff6666, 0.8)
            .setInteractive({ useHandCursor: true });
        this.add.text(-350, -250, '清空', { 
            ...FONT_STYLE, 
            fontSize: '16px', 
            color: '#fff' 
        }).setOrigin(0.5);
        clearBtn.on('pointerdown', () => this.clearLog());
        this.logPanel.add(clearBtn);
        
        // 日志内容区域
        const logContainer = this.add.container(0, 0);
        this.logPanel.add(logContainer);
        
        // 滚动区域
        const scrollArea = this.add.graphics();
        scrollArea.fillStyle(0x222222, 0.5);
        scrollArea.fillRoundedRect(-380, -200, 760, 400, 10);
        this.logPanel.add(scrollArea);
        
        // 日志条目
        const logs = this.gameState.actionLog || [];
        if (logs.length === 0) {
            const emptyText = this.add.text(0, 0, '暂无日志记录', { 
                ...FONT_STYLE, 
                fontSize: '20px', 
                color: '#666'
            }).setOrigin(0.5);
            logContainer.add(emptyText);
        } else {
            let yOffset = -180;
            logs.slice(-20).reverse().forEach((log, index) => {
                const logBg = this.add.graphics();
                logBg.fillStyle(index % 2 === 0 ? 0x333333 : 0x2a2a2a, 0.8);
                logBg.fillRoundedRect(-370, yOffset - 15, 740, 30, 5);
                logContainer.add(logBg);
                
                const logText = this.add.text(-360, yOffset, log, { 
                    ...FONT_STYLE, 
                    fontSize: '16px', 
                    color: '#fff',
                    wordWrap: { width: 720 }
                }).setOrigin(0, 0.5);
                logContainer.add(logText);
                
                const timeText = this.add.text(350, yOffset, 
                    new Date().toLocaleTimeString(), { 
                    ...FONT_STYLE, 
                    fontSize: '12px', 
                    color: '#666'
                }).setOrigin(1, 0.5);
                logContainer.add(timeText);
                
                yOffset += 35;
            });
        }
        
        // 统计信息
        const stats = this.add.text(0, 250, 
            `共 ${logs.length} 条记录`, { 
            ...FONT_STYLE, 
            fontSize: '18px', 
            color: '#66ccff'
        }).setOrigin(0.5);
        this.logPanel.add(stats);
    }

    hideLogPanel(): void {
        if (this.logPanel) {
            this.logPanel.destroy();
            this.logPanel = null;
        }
    }

    clearLog(): void {
        this.gameState.actionLog = [];
        this.hideLogPanel();
        this.showLogPanel();
    }

    showAchievementPanel(): void {
        if (this.achievePanel) {
            this.achievePanel.destroy();
        }
        
        this.achievePanel = this.add.container(960, 540);
        this.achievePanel.setDepth(20);
        
        // 背景
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(-400, -300, 800, 600, 20);
        bg.lineStyle(3, 0x444444, 1);
        bg.strokeRoundedRect(-400, -300, 800, 600, 20);
        this.achievePanel.add(bg);
        
        // 标题
        const title = this.add.text(0, -250, '🏆 成就系统', { 
            ...FONT_STYLE, 
            fontSize: '32px', 
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.achievePanel.add(title);
        
        // 关闭按钮
        const closeBtn = this.add.rectangle(350, -250, 60, 60, 0xff4444, 0.8)
            .setInteractive({ useHandCursor: true });
        this.add.text(350, -250, '✕', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
        closeBtn.on('pointerdown', () => this.hideAchievementPanel());
        this.achievePanel.add(closeBtn);
        
        // 成就分类
        const categories = [
            { name: '日常行为', achievements: ['waterMess', 'sleepyCat', 'fishCollector', 'waterLover'] },
            { name: '破坏王', achievements: ['destructiveCat', 'sofaDestroyer', 'scratchMaster', 'destructiveMaster'] },
            { name: '乖猫咪', achievements: ['goodCat', 'sleepMaster'] },
            { name: '探险家', achievements: ['explorer', 'patrolMaster', 'adventurer'] }
        ];
        
        let yOffset = -180;
        categories.forEach(category => {
            // 分类标题
            const catTitle = this.add.text(-350, yOffset, category.name, { 
                ...FONT_STYLE, 
                fontSize: '24px', 
                color: '#ffaa00',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            this.achievePanel?.add(catTitle);
            yOffset += 40;
            
            // 分类下的成就
            category.achievements.forEach(achievementId => {
                const achievement = this.gameState.achievements[achievementId];
                const isUnlocked = !!achievement;
                
                const achievementBg = this.add.graphics();
                achievementBg.fillStyle(isUnlocked ? 0x333333 : 0x222222, 0.8);
                achievementBg.fillRoundedRect(-350, yOffset - 15, 700, 30, 8);
                if (isUnlocked) {
                    achievementBg.lineStyle(2, 0xffd700, 1);
                    achievementBg.strokeRoundedRect(-350, yOffset - 15, 700, 30, 8);
                }
                this.achievePanel?.add(achievementBg);
                
                const icon = this.add.text(-330, yOffset, isUnlocked ? '✅' : '🔒', { 
                    fontSize: '20px' 
                }).setOrigin(0, 0.5);
                this.achievePanel?.add(icon);
                
                const name = this.add.text(-300, yOffset, 
                    isUnlocked && achievement ? achievement.name : '???', { 
                    ...FONT_STYLE, 
                    fontSize: '18px', 
                    color: isUnlocked ? '#fff' : '#666'
                }).setOrigin(0, 0.5);
                this.achievePanel?.add(name);
                
                if (isUnlocked && achievement) {
                    const desc = this.add.text(0, yOffset, achievement.description, { 
                        ...FONT_STYLE, 
                        fontSize: '14px', 
                        color: '#aaa'
                    }).setOrigin(0.5, 0.5);
                    this.achievePanel?.add(desc);
                    
                    const date = this.add.text(300, yOffset, 
                        new Date(achievement.unlockedAt).toLocaleDateString(), { 
                        ...FONT_STYLE, 
                        fontSize: '12px', 
                        color: '#666'
                    }).setOrigin(1, 0.5);
                    this.achievePanel?.add(date);
                }
                
                yOffset += 40;
            });
            
            yOffset += 20;
        });
        
        // 成就统计
        const totalAchievements = Object.keys(this.gameState.achievements).length;
        const totalPossible = 15; // 总成就数
        const stats = this.add.text(0, 250, 
            `已解锁: ${totalAchievements}/${totalPossible}`, { 
            ...FONT_STYLE, 
            fontSize: '20px', 
            color: '#ffd700'
        }).setOrigin(0.5);
        this.achievePanel?.add(stats);
    }

    hideAchievementPanel(): void {
        if (this.achievePanel) {
            this.achievePanel.destroy();
            this.achievePanel = null;
        }
    }

    showSettingsPanel(): void {
        // 实现设置面板显示逻辑
        console.log('显示设置面板');
    }
} 