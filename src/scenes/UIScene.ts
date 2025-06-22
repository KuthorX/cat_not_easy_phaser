import Phaser from 'phaser';
import { GameState, Action, ObjectData, GameData, Achievement } from '../types/index';

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
    itemUseMenu: Phaser.GameObjects.Container | null = null;
    hoverContainer: Phaser.GameObjects.Container | null = null;
    private actionButtons: Phaser.GameObjects.Container[] = [];
    private logText!: Phaser.GameObjects.Text;
    private inventoryText!: Phaser.GameObjects.Text;
    private achievementPopup?: Phaser.GameObjects.Container;
    private achievementList?: Phaser.GameObjects.Container;
    private wheelListener?: Function;

    constructor() {
        super({ key: 'UIScene', active: false });
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
        this.game.events.on('achievementUnlocked', this.showAchievementPopup, this);
        this.game.events.on('gameEnd', this.showGameEnd, this);
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
        const barX = 60;
        let barY = 40;
        const barWidth = 320;
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
                fontSize: '20px',
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
        const barX = 60;
        let barY = 40;
        const barWidth = 320;
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
        this.locationText = this.add.text(30, 1025, '', { ...FONT_STYLE, fontSize: '32px' }).setOrigin(0, 0.5);
        const btnY = 1020;
        const btnSize = 70;
        const btnStart = 1720;
        const btnGap = 100; // 增加按钮间隔
        
        this.logBtn = this.add.rectangle(btnStart, btnY, btnSize, btnSize, 0x222222, 0.85).setInteractive({ useHandCursor: true });
        this.add.text(btnStart, btnY, '📖', { fontSize: '44px' }).setOrigin(0.5);
        this.logBtn.on('pointerdown', () => this.showLogScene());
        
        this.achieveBtn = this.add.rectangle(btnStart + btnGap, btnY, btnSize, btnSize, 0x222222, 0.85).setInteractive({ useHandCursor: true });
        this.add.text(btnStart + btnGap, btnY, '🏆', { fontSize: '44px' }).setOrigin(0.5);
        this.achieveBtn.on('pointerdown', () => this.showAchievementScene());
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
        const title = this.add.text(0, -panelHeight/2 + 30, '背包', { ...FONT_STYLE, fontSize: '28px' }).setOrigin(0.5);
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
        
        // 获取物品数据
        const itemData = this.gameData.items[itemId];
        if (!itemData) {
            console.error(`物品数据不存在: ${itemId}`);
            return;
        }
        
        // 检查是否有物品动作配置
        const itemActions = this.gameData.actions.item_actions[itemId];
        if (itemActions && itemActions.eat) {
            // 使用ActionSystem处理动作
            const gameScene = this.scene.get('GameScene') as any;
            if (gameScene && gameScene.actionSystem) {
                // 创建一个虚拟的目标对象用于动作处理
                const virtualTarget: ObjectData = {
                    id: 'inventory_item',
                    name: itemData.name,
                    x: 0,
                    y: 0,
                    image: itemData.image,
                    actions: []
                };
                // 使用item_actions中定义的动作ID
                gameScene.actionSystem.handleAction(itemActions.eat.id, virtualTarget);
            }
        } else {
            // 默认处理逻辑
            switch (itemId) {
                case 'fish_item':
                    this.gameState.removeFromInventory(itemId);
                    this.gameState.progress.hungry = Math.max(0, (this.gameState.progress.hungry || 0) - 30);
                    this.gameState.log('你吃掉了小鱼干，感觉饱了！');
                    break;
                default:
                    this.gameState.log(`你使用了 ${itemData.name}`);
            }
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

    showActionMenu(objectData: ObjectData, pointer: Phaser.Input.Pointer): void {
        this.hideActionMenu();
        
        if (!objectData.actions || objectData.actions.length === 0) {
            return;
        }

        const x = pointer.x;
        const y = pointer.y;
        
        this.actionMenu = this.add.container(x, y);
        this.actionMenu.setDepth(20);
        
        // 背景
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(-10, -10, 20, 20, 5);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-10, -10, 20, 20, 5);
        this.actionMenu.add(bg);
        
        let buttonY = 0;
        const buttonHeight = 40;
        const buttonGap = 5;
        
        // 为每个动作创建按钮
        objectData.actions.forEach((actionId, index) => {
            const action = this.gameData.actions.actions[actionId];
            if (!action || !this.actionMenu) return;
            
            const button = this.add.rectangle(0, buttonY, 120, buttonHeight, 0x444444, 0.9)
                .setInteractive({ useHandCursor: true });
            this.actionMenu.add(button);
            
            const buttonText = this.add.text(0, buttonY, action.text, { 
                ...FONT_STYLE, 
                fontSize: '16px', 
                color: '#fff'
            }).setOrigin(0.5);
            this.actionMenu.add(buttonText);
            
            button.on('pointerdown', () => {
                this.game.events.emit('performAction', actionId, objectData);
            });
            
            buttonY += buttonHeight + buttonGap;
        });
        
        // 调整背景大小
        const totalHeight = buttonY - buttonGap;
        bg.clear();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(-70, -10, 140, totalHeight + 20, 10);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-70, -10, 140, totalHeight + 20, 10);
        
        // 确保菜单不超出屏幕边界
        if (this.actionMenu) {
            const menuBounds = this.actionMenu.getBounds();
            if (menuBounds.right > 1920) {
                this.actionMenu.setX(x - menuBounds.width);
            }
            if (menuBounds.bottom > 1080) {
                this.actionMenu.setY(y - menuBounds.height);
            }
        }
    }

    hideActionMenu(): void {
        if (this.actionMenu) {
            this.actionMenu.destroy();
            this.actionMenu = null;
        }
        // 确保UI刷新
        this.refreshUI();
    }

    showInteractionDialog(text: string, type: string = 'normal'): void {
        // 实现交互对话框显示逻辑
        console.log(`显示对话框: ${text} (类型: ${type})`);
    }

    showHoverInteraction(text: string, x: number, y: number): void {
        // 隐藏之前的悬停文本
        this.hideHoverInteraction();
        
        // 创建悬停提示框
        const hoverContainer = this.add.container(x, y - 50);
        hoverContainer.setDepth(15);
        
        // 文本
        const textObj = this.add.text(0, 0, text, { 
            ...FONT_STYLE, 
            fontSize: '16px', 
            color: '#fff'
        }).setOrigin(0.5);
        hoverContainer.add(textObj);
        
        // 获取文本的本地边界
        const textWidth = textObj.width;
        const textHeight = textObj.height;
        
        // 背景 - 使用相对于容器的坐标
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(-textWidth/2 - 5, -textHeight/2 - 5, textWidth + 10, textHeight + 10, 5);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-textWidth/2 - 5, -textHeight/2 - 5, textWidth + 10, textHeight + 10, 5);
        hoverContainer.add(bg);
        
        // 确保背景在文字后面
        hoverContainer.sendToBack(bg);
        
        // 存储引用以便后续隐藏
        this.hoverContainer = hoverContainer;
    }

    hideHoverInteraction(): void {
        if (this.hoverContainer) {
            this.hoverContainer.destroy();
            this.hoverContainer = null;
        }
    }

    showAchievementPopup(achievement: any): void {
        // 移除之前的弹窗
        if (this.achievementPopup) {
            this.achievementPopup.destroy();
        }

        // 创建成就弹窗
        this.achievementPopup = this.add.container(960, 200);
        this.achievementPopup.setDepth(30);
        
        // 背景
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.95);
        bg.fillRoundedRect(-200, -80, 400, 160, 20);
        bg.lineStyle(4, 0xffd700, 1);
        bg.strokeRoundedRect(-200, -80, 400, 160, 20);
        
        // 成就图标
        const icon = this.add.text(0, -40, '🏆', { fontSize: '48px' }).setOrigin(0.5);
        
        // 成就标题
        const title = this.add.text(0, -10, '成就解锁！', { 
            ...FONT_STYLE, 
            fontSize: '24px', 
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 成就名称
        const name = this.add.text(0, 15, achievement.name, { 
            ...FONT_STYLE, 
            fontSize: '20px', 
            color: '#fff'
        }).setOrigin(0.5);
        
        // 成就描述
        const desc = this.add.text(0, 40, achievement.description, { 
            ...FONT_STYLE, 
            fontSize: '16px', 
            color: '#aaa'
        }).setOrigin(0.5);
        
        this.achievementPopup.add([bg, icon, title, name, desc]);
        
        // 初始状态：隐藏
        this.achievementPopup.setAlpha(0);
        this.achievementPopup.setScale(0.5);
        
        // 动画：淡入和缩放
        this.tweens.add({
            targets: this.achievementPopup,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                // 3秒后淡出
                this.tweens.add({
                    targets: this.achievementPopup,
                    alpha: 0,
                    y: 100,
                    duration: 1000,
                    delay: 2000,
                    ease: 'Power2',
                    onComplete: () => {
                        if (this.achievementPopup) {
                            this.achievementPopup.destroy();
                            this.achievementPopup = undefined;
                        }
                    }
                });
            }
        });
        
        console.log(`🎉 成就解锁: ${achievement.name} - ${achievement.description}`);
    }

    showAchievementScene(): void {
        this.scene.pause();
        this.scene.launch('AchievementScene');
    }

    showLogScene(): void {
        this.scene.pause();
        this.scene.launch('LogScene');
    }

    showGameEnd(endData: any): void {
        // 创建游戏结束界面
        const endContainer = this.add.container(960, 540);
        endContainer.setDepth(50);
        
        // 背景
        const background = this.add.graphics();
        background.fillStyle(0x000000, 0.9);
        background.fillRoundedRect(-400, -300, 800, 600, 20);
        background.lineStyle(3, 0xffff00);
        background.strokeRoundedRect(-400, -300, 800, 600, 20);
        
        // 标题
        const title = this.add.text(0, -200, endData.title, {
            ...FONT_STYLE,
            fontSize: '36px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 消息
        const message = this.add.text(0, -100, endData.message, {
            ...FONT_STYLE,
            fontSize: '24px',
            color: '#ffffff',
            wordWrap: { width: 700 }
        }).setOrigin(0.5);
        
        // 重新开始按钮
        const restartButton = this.add.rectangle(0, 100, 200, 60, 0x333333, 0.8)
            .setInteractive({ useHandCursor: true });
        const restartText = this.add.text(0, 100, '重新开始', {
            ...FONT_STYLE,
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        restartButton.on('pointerdown', () => {
            this.scene.restart();
            this.scene.get('GameScene').scene.restart();
        });
        
        endContainer.add([background, title, message, restartButton, restartText]);

        // 游戏结束时结算"智人首席奴才"成就
        const achievementSystem = (this.game as any).achievementSystem;
        if (achievementSystem && typeof achievementSystem.checkChiefServantAchievement === 'function') {
            achievementSystem.checkChiefServantAchievement();
        }
    }
}