import Phaser from 'phaser';
import ActionSystem from '../systems/ActionSystem';
import AchievementSystem from '../systems/AchievementSystem';
import { GameData, GameState, SceneData, ObjectData, Action } from '../types/index';

export default class GameScene extends Phaser.Scene {
    actionSystem: ActionSystem | null = null;
    achievementSystem: AchievementSystem | null = null;
    gameState!: GameState;
    gameData!: GameData;
    sceneObjects: Record<string, Phaser.GameObjects.Image> = {};
    currentSceneId?: string;
    hoverText: Phaser.GameObjects.Text | null = null;

    constructor() {
        super('GameScene');
    }

    create(): void {
        // 初始化游戏状态（如果不存在）
        if (!(this.game as any).gameState) {
            (this.game as any).gameState = {
                currentLocation: 'living_room',
                inventory: [],
                actionLog: [],
                progress: {
                    energy: 50,
                    happiness: 50,
                    mischief: 0,
                    humanComingHome: 0,
                    hungry: 10,
                    needPoop: 5
                },
                achievements: {},
                achievementCounters: {
                    knockOverCount: 0,
                    scratchCount: 0,
                    sleepCount: 0,
                    fishPickupCount: 0,
                    drinkCount: 0,
                    patrolCount: 0,
                    areaVisitCount: 0,
                    waterBowlKnockOverCount: 0,
                    tableItemPushCount: 0,
                    toiletPaperDestroyCount: 0,
                    meowCount: 0,
                    sleepLocationCount: 0,
                    litterBoxCount: 0,
                    toyInteractionCount: 0,
                    keyFindCount: 0,
                    roomUnlockCount: 0,
                    fishHideCount: 0,
                    trapSetCount: 0,
                    invasionDefendCount: 0
                },
                addToInventory: function(itemId: string) {
                    if (!this.inventory.includes(itemId)) this.inventory.push(itemId);
                },
                removeFromInventory: function(itemId: string) {
                    const idx = this.inventory.indexOf(itemId);
                    if (idx > -1) this.inventory.splice(idx, 1);
                },
                log: function(msg: string) {
                    this.actionLog.push(msg);
                },
                history: []
            } as GameState;
        }
        // 确保currentLocation存在
        if (!(this.game as any).gameState.currentLocation) {
            (this.game as any).gameState.currentLocation = 'living_room';
        }
        // 确保achievements对象存在
        if (!(this.game as any).gameState.achievements) {
            (this.game as any).gameState.achievements = {};
        }
        // 确保achievementCounters对象存在
        if (!(this.game as any).gameState.achievementCounters) {
            (this.game as any).gameState.achievementCounters = {
                knockOverCount: 0,
                scratchCount: 0,
                sleepCount: 0,
                fishPickupCount: 0,
                drinkCount: 0,
                patrolCount: 0,
                areaVisitCount: 0,
                waterBowlKnockOverCount: 0,
                tableItemPushCount: 0,
                toiletPaperDestroyCount: 0,
                meowCount: 0,
                sleepLocationCount: 0,
                litterBoxCount: 0,
                toyInteractionCount: 0,
                keyFindCount: 0,
                roomUnlockCount: 0,
                fishHideCount: 0,
                trapSetCount: 0,
                invasionDefendCount: 0
            };
        }
        this.gameState = (this.game as any).gameState as GameState;
        this.gameData = (this.game as any).gameData as GameData;
        
        // 获取成就系统实例
        this.achievementSystem = (this.game as any).achievementSystem as AchievementSystem;
        
        // 检查gameData是否已加载
        if (!this.gameData) {
            console.warn('GameData not loaded yet! Waiting for data to be ready...');
            // 等待一帧后重试
            this.time.delayedCall(100, () => {
                this.gameData = (this.game as any).gameData as GameData;
                if (this.gameData) {
                    console.log('GameData loaded successfully!');
                    this.initializeScene();
                } else {
                    console.error('GameData still not available after retry!');
                    // 如果还是失败，尝试重新加载
                    this.scene.start('BootScene');
                }
            });
            return;
        }
        
        this.initializeScene();
    }

    private initializeScene(): void {
        this.actionSystem = new ActionSystem(this);
        // Centralized event handling
        this.game.events.on('performAction', this.handleAction, this);
        this.game.events.on('changeScene', this.changeScene, this);
        this.game.events.on('undoAction', this.undoAction, this);
        this.events.on('objectRemoved', (objectId: string) => {
            console.log(`objectRemoved event received for: ${objectId}`);
            const objectSprite = this.sceneObjects[objectId];
            if (objectSprite) {
                console.log(`Destroying sprite for object: ${objectId}`);
                objectSprite.destroy();
                delete this.sceneObjects[objectId];
            } else {
                console.log(`No sprite found for object: ${objectId}`);
            }
        });
        // When this scene shuts down, clean up listeners
        this.events.on('shutdown', () => {
            this.game.events.off('performAction', this.handleAction, this);
            this.game.events.off('changeScene', this.changeScene, this);
            this.game.events.off('undoAction', this.undoAction, this);
        });
        console.log('Loading scene:', this.gameState.currentLocation);
        this.loadScene(this.gameState.currentLocation);
    }

    loadScene(sceneId: string): void {
        this.currentSceneId = sceneId;
        const gameData = this.gameData;
        const sceneData = gameData.scenes[sceneId];
        if (!sceneData) {
            console.error(`Scene data not found for: ${sceneId}`);
            return;
        }
        // Clear existing objects
        if (this.sceneObjects) {
            Object.values(this.sceneObjects).forEach(obj => obj.destroy());
        }
        this.sceneObjects = {};
        // Set background
        this.add.image(960, 540, sceneData.background).setOrigin(0.5);
        // Create cat back indicator (使用存在的图片)
        this.add.image(960, 1030, 'placeholder_80x80')
            .setOrigin(0.5, 1)
            .setScale(1.2)
            .setAlpha(0.9);
        // Create all interactive objects
        if (sceneData.objects) {
            Object.entries(sceneData.objects).forEach(([id, objectData]) => {
                // Skip non-interactive objects
                if (objectData.interactive === false) {
                    this.add.image(objectData.x, objectData.y, objectData.image);
                    return;
                }
                // Check if item should be hidden (already in inventory)
                if (objectData.actions && objectData.actions.length > 0) {
                    // 检查是否有拾取动作
                    const hasPickupAction = objectData.actions.some(actionId => {
                        const action = this.actionSystem?.getAction(actionId);
                        return action?.effects?.inventory?.action === 'add';
                    });
                    
                    if (hasPickupAction) {
                        // 找到对应的物品ID
                        const pickupAction = objectData.actions.find(actionId => {
                            const action = this.actionSystem?.getAction(actionId);
                            return action?.effects?.inventory?.action === 'add';
                        });
                        
                        if (pickupAction) {
                            const action = this.actionSystem?.getAction(pickupAction);
                            const itemId = action?.effects?.inventory?.item;
                            if (itemId && this.gameState.inventory.includes(itemId)) {
                                return; // Don't create item if it's already in inventory
                            }
                        }
                    }
                }
                this.createInteractable(id, objectData);
            });
        }
        // Launch UI scene
        this.scene.launch('UIScene');
        // Emit location change event
        this.game.events.emit('locationChanged', sceneData.name);
        console.log(`Scene loaded: ${sceneId}`);
    }

    changeScene(targetSceneId: string): void {
        this.saveState();
        const gameData = this.gameData;
        const targetSceneName = gameData.scenes[targetSceneId].name;
        this.gameState.actionLog.push(`移动到了【${targetSceneName}】`);
        this.gameState.currentLocation = targetSceneId;
        this.loadScene(targetSceneId);
    }

    saveState(): void {
        if (!this.gameState.history) this.gameState.history = [];
        const historyState = JSON.parse(JSON.stringify(this.gameState));
        this.gameState.history.push(historyState);
    }

    handleAction(actionId: string, targetObject: ObjectData): void {
        if (this.actionSystem) {
            this.actionSystem.handleAction(actionId, targetObject);
            
            // 检查是否需要隐藏物品（拾取后）
            const action = this.actionSystem.getAction(actionId);
            if (action?.effects?.inventory?.action === 'add') {
                const itemId = action.effects.inventory.item;
                if (itemId && this.gameState.inventory.includes(itemId)) {
                    // 需要找到被点击的那个特定物品
                    // 由于targetObject可能没有id，我们需要通过位置或其他方式识别
                    // 这里我们通过比较对象的位置和动作来找到正确的物品
                    let targetFound = false;
                    for (const [objectId, sprite] of Object.entries(this.sceneObjects)) {
                        const objectData = sprite.getData('objectData') as ObjectData;
                        if (objectData && 
                            objectData.actions && 
                            objectData.actions.includes(actionId) &&
                            objectData.x === targetObject.x && 
                            objectData.y === targetObject.y) {
                            // 找到被点击的那个特定物品，隐藏它
                            sprite.destroy();
                            delete this.sceneObjects[objectId];
                            console.log(`隐藏物品: ${itemId} (对象ID: ${objectId})`);
                            targetFound = true;
                            break;
                        }
                    }
                    
                    // 如果通过位置没找到，尝试通过名称匹配
                    if (!targetFound) {
                        for (const [objectId, sprite] of Object.entries(this.sceneObjects)) {
                            const objectData = sprite.getData('objectData') as ObjectData;
                            if (objectData && 
                                objectData.actions && 
                                objectData.actions.includes(actionId) &&
                                objectData.name === targetObject.name) {
                                // 通过名称匹配找到物品
                                sprite.destroy();
                                delete this.sceneObjects[objectId];
                                console.log(`隐藏物品: ${itemId} (对象ID: ${objectId}, 通过名称匹配)`);
                                break;
                            }
                        }
                    }
                }
            }
            
            // 动作执行后检查成就
            if (this.achievementSystem) {
                this.achievementSystem.checkAchievements();
            }
        }
        (this.scene.get('UIScene') as any).hideActionMenu();
    }

    undoAction(): void {
        if (this.gameState.history && this.gameState.history.length > 0) {
            const lastState = this.gameState.history.pop();
            Object.assign(this.gameState, lastState);
            this.loadScene(this.gameState.currentLocation);
        } else {
            this.game.events.emit('showInteraction', '已经无法再返回了。', 'log');
        }
    }

    createInteractable(id: string, objectData: ObjectData): Phaser.GameObjects.Image {
        const sprite = this.add.image(objectData.x, objectData.y, objectData.image);
        sprite.setInteractive({ useHandCursor: true });
        
        // 存储对象数据
        sprite.setData('objectData', objectData);
        sprite.setData('id', id);
        
        // 悬停显示对象信息
        sprite.on('pointerover', () => {
            const uiScene = this.scene.get('UIScene') as any;
            if (uiScene && uiScene.interactionMode && uiScene.selectedItemId) {
                // 交互模式：显示可能的交互
                this.showInteractionPreview(uiScene.selectedItemId, id, objectData, sprite.x, sprite.y);
            } else {
                // 普通模式：显示对象描述
                this.showHoverText(objectData.look || objectData.name, sprite.x, sprite.y);
            }
        });
        
        sprite.on('pointerout', () => {
            this.hideHoverText();
            const uiScene = this.scene.get('UIScene') as any;
            if (uiScene) {
                uiScene.hideInteractionPreview();
            }
        });
        
        // 点击处理
        sprite.on('pointerdown', (pointer: any) => {
            const uiScene = this.scene.get('UIScene') as any;
            
            if (uiScene && uiScene.interactionMode && uiScene.selectedItemId) {
                // 交互模式：执行物品交互
                this.handleItemObjectInteraction(uiScene.selectedItemId, id, objectData);
                // 退出交互模式
                uiScene.selectedItemId = null;
                uiScene.interactionMode = false;
                uiScene.hideInteractionHint();
                uiScene.updateInventoryDisplay();
            } else if (objectData.navTo) {
                // 场景跳转：直接跳转到目标场景
                console.log(`跳转到场景: ${objectData.navTo}`);
                this.changeScene(objectData.navTo);
            } else if (objectData.actions && objectData.actions.length > 0) {
                // 普通模式：显示动作菜单
                this.game.events.emit('showActionMenu', objectData, pointer);
            } else if (objectData.look) {
                // 只有描述的对象：显示描述
                this.gameState.log(objectData.look);
                this.game.events.emit('gameStateChanged');
            }
        });
        
        this.sceneObjects[id] = sprite;
        return sprite;
    }

    // 显示交互预览
    showInteractionPreview(selectedItemId: string, objectKey: string, targetObject: ObjectData, x: number, y: number): void {
        const itemInteractions = this.gameData.itemInteractions[selectedItemId];
        if (!itemInteractions) {
            this.showHoverText('🐱 这个物品好像没什么用...', x, y);
            return;
        }
        
        const interaction = itemInteractions.interactions[objectKey];
        if (!interaction) {
            // 没有定义交互，显示更友好的提示
            this.showHoverText('🐱 这个组合好像行不通...', x, y);
            return;
        }
        
        // 特殊处理：检查是否已经藏过鱼干
        if (selectedItemId === 'fish_item' && interaction.triggerAchievement === 'strategic_reserve') {
            const hideLocationKey = `${this.currentSceneId}_${targetObject.name}`;
            if (this.gameState.flags && this.gameState.flags[hideLocationKey]) {
                // 已经藏过鱼干，显示不同提示
                this.showHoverText('🐱 这里已经藏过小鱼干了~', x, y);
                return;
            }
        }
        
        // 显示交互预览
        this.showHoverText(`🐱 ${interaction.text}`, x, y);
    }

    // 处理物品与对象的交互
    handleItemObjectInteraction(selectedItemId: string, objectKey: string, targetObject: ObjectData): void {
        console.log(`处理物品交互: ${selectedItemId} 与 ${objectKey} (${targetObject.name})`);
        
        const itemInteractions = this.gameData.itemInteractions[selectedItemId];
        if (!itemInteractions) {
            this.gameState.log('🐱 这个物品好像没什么用...');
            return;
        }
        
        const interaction = itemInteractions.interactions[objectKey];
        if (!interaction) {
            this.gameState.log('🐱 这个组合好像行不通...');
            return;
        }
        
        // 特殊处理：检查是否已经藏过鱼干
        if (selectedItemId === 'fish_item' && interaction.triggerAchievement === 'strategic_reserve') {
            const hideLocationKey = `${this.currentSceneId}_${targetObject.name}`;
            if (this.gameState.flags && this.gameState.flags[hideLocationKey]) {
                this.gameState.log('🐱 这里已经藏过小鱼干了，换个地方吧~');
                return;
            }
        }
        
        // 执行交互效果
        this.executeInteraction(interaction, selectedItemId, targetObject);
    }

    // 执行交互效果
    executeInteraction(interaction: any, selectedItemId: string, targetObject: ObjectData): void {
        // 记录交互日志
        this.gameState.log(interaction.log);
        
        // 处理进度效果
        if (interaction.effects?.progress) {
            for (const [key, value] of Object.entries(interaction.effects.progress)) {
                const currentValue = this.gameState.progress[key as keyof typeof this.gameState.progress] || 0;
                this.gameState.progress[key as keyof typeof this.gameState.progress] = Math.max(0, Math.min(100, currentValue + (value as number)));
            }
        }
        
        // 处理物品效果
        if (interaction.effects?.inventory) {
            if (interaction.effects.inventory.action === 'remove') {
                this.gameState.removeFromInventory(selectedItemId);
            }
        }
        
        // 特殊处理：小鱼干被藏起来时增加计数器
        if (selectedItemId === 'fish_item' && interaction.effects?.inventory?.action === 'remove') {
            // 检查是否已经在这个位置藏过鱼干
            const hideLocationKey = `${this.currentSceneId}_${targetObject.name}`;
            if (!this.gameState.flags) {
                this.gameState.flags = {};
            }
            
            if (this.gameState.flags[hideLocationKey]) {
                // 已经在这个位置藏过鱼干，不允许重复
                this.gameState.log('🐱 这里已经藏过小鱼干了，换个地方吧~');
                // 把鱼干还回去
                this.gameState.addToInventory(selectedItemId);
                return;
            }
            
            // 标记这个位置已经藏过鱼干
            this.gameState.flags[hideLocationKey] = true;
            
            const achievementSystem = (this.game as any).achievementSystem;
            if (achievementSystem) {
                achievementSystem.incrementCounter('fishHideCount');
            }
        }
        
        // 处理特殊效果
        if (interaction.effects?.special) {
            this.handleSpecialEffects(interaction.effects.special, targetObject);
        }
        
        // 触发成就
        if (interaction.triggerAchievement) {
            const achievementSystem = (this.game as any).achievementSystem;
            if (achievementSystem) {
                achievementSystem.triggerAchievement(interaction.triggerAchievement);
            }
        }
        
        // 刷新UI
        this.game.events.emit('gameStateChanged');
    }

    // 处理特殊效果
    handleSpecialEffects(specialEffects: any, targetObject: ObjectData): void {
        if (specialEffects.unlockArea) {
            console.log(`解锁区域: ${specialEffects.unlockArea}`);
            // 这里可以添加解锁区域的逻辑
        }
    }

    showHoverText(text: string, x: number, y: number): void {
        this.hideHoverText();
        
        this.hoverText = this.add.text(x, y - 50, text, {
            fontFamily: '"Noto Sans SC", sans-serif',
            fontSize: '16px',
            color: '#fff',
            backgroundColor: '#000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
        this.hoverText.setDepth(15);
    }

    hideHoverText(): void {
        if (this.hoverText) {
            this.hoverText.destroy();
            this.hoverText = null;
        }
    }
} 