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
        // 确保对象数据包含id
        const dataWithId = { ...objectData, id };
        
        const sprite = this.add.image(objectData.x, objectData.y, objectData.image).setInteractive({ useHandCursor: true });
        sprite.setData('id', id);
        sprite.setData('data', dataWithId);
        this.sceneObjects[id] = sprite;
        sprite.on('pointerover', () => {
            sprite.setTint(0xffff00);
            if (objectData.look) {
                (this.scene.get('UIScene') as any).showHoverInteraction(objectData.look, sprite.x, sprite.y);
            }
        });
        sprite.on('pointerout', () => {
            sprite.clearTint();
            (this.scene.get('UIScene') as any).hideHoverInteraction();
        });
        sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (objectData.navTo) {
                this.changeScene(objectData.navTo);
            } else if (objectData.actions && objectData.actions.length > 0) {
                (this.scene.get('UIScene') as any).showActionMenu(dataWithId, pointer);
            } else if (objectData.look) {
                this.gameState.log(objectData.look);
                this.game.events.emit('gameStateChanged');
            }
        });
        return sprite;
    }

    // 添加物品与场景交互的处理方法
    handleItemDrop(itemId: string, x: number, y: number): void {
        console.log(`物品 ${itemId} 被拖拽到场景位置 (${x}, ${y})`);
        
        // 检查是否拖拽到可交互对象上
        const targetObject = this.findObjectAtPosition(x, y);
        if (targetObject) {
            this.handleItemObjectInteraction(itemId, targetObject);
        } else {
            // 拖拽到空地上，创建物品在场景中
            this.dropItemInScene(itemId, x, y);
        }
    }

    findObjectAtPosition(x: number, y: number): any {
        // 查找指定位置的对象
        for (const [objectId, object] of Object.entries(this.sceneObjects)) {
            if (object && object.getBounds) {
                const bounds = object.getBounds();
                if (bounds.contains(x, y)) {
                    return { id: objectId, object: object, data: this.sceneObjects[objectId].getData('data') };
                }
            }
        }
        return null;
    }

    handleItemObjectInteraction(itemId: string, target: any): void {
        const itemData = this.gameData.items[itemId];
        const targetData = target.data;
        
        console.log(`物品 ${itemData?.name} 与 ${targetData?.name} 交互`);
        
        // 根据物品和目标的组合执行不同操作
        const interactionKey = `${itemId}_${target.id}`;
        
        switch (interactionKey) {
            case 'fish_item_sofa':
                this.gameState.log('你把小鱼干藏在沙发下面了！');
                this.gameState.removeFromInventory(itemId);
                this.gameState.progress.humanComingHome = Math.min(100, (this.gameState.progress.humanComingHome || 0) + 5);
                break;
                
            case 'fish_item_cat_villa':
                this.gameState.log('你把小鱼干藏在猫别墅里了！');
                this.gameState.removeFromInventory(itemId);
                this.gameState.progress.humanComingHome = Math.min(100, (this.gameState.progress.humanComingHome || 0) + 3);
                break;
                
            case 'fish_item_cat_nest':
                this.gameState.log('你把小鱼干藏在猫窝里了！');
                this.gameState.removeFromInventory(itemId);
                this.gameState.progress.humanComingHome = Math.min(100, (this.gameState.progress.humanComingHome || 0) + 2);
                break;
                
            default:
                // 通用交互
                if (itemData && targetData) {
                    this.gameState.log(`你把 ${itemData.name} 放在了 ${targetData.name} 上`);
                    this.gameState.removeFromInventory(itemId);
                    this.gameState.progress.humanComingHome = Math.min(100, (this.gameState.progress.humanComingHome || 0) + 1);
                }
        }
        
        // 刷新UI
        this.game.events.emit('gameStateChanged');
    }

    dropItemInScene(itemId: string, x: number, y: number): void {
        const itemData = this.gameData.items[itemId];
        if (!itemData) return;
        
        // 创建场景中的物品对象
        const sceneItem = this.add.image(x, y, itemData.image).setDisplaySize(60, 60);
        sceneItem.setInteractive({ useHandCursor: true });
        
        // 设置物品属性
        sceneItem.setData('itemId', itemId);
        sceneItem.setData('isSceneItem', true);
        
        // 点击拾取
        sceneItem.on('pointerdown', () => {
            this.pickupSceneItem(sceneItem, itemId);
        });
        
        // 悬停提示
        sceneItem.on('pointerover', () => {
            this.showHoverText(`${itemData.name} - 点击拾取`, x, y);
        });
        
        sceneItem.on('pointerout', () => {
            this.hideHoverText();
        });
        
        this.gameState.log(`你把 ${itemData.name} 放在了地上`);
        this.gameState.removeFromInventory(itemId);
        
        // 刷新UI
        this.game.events.emit('gameStateChanged');
    }

    pickupSceneItem(sceneItem: any, itemId: string): void {
        const itemData = this.gameData.items[itemId];
        if (!itemData) return;
        
        this.gameState.addToInventory(itemId);
        this.gameState.log(`你捡起了 ${itemData.name}`);
        sceneItem.destroy();
        
        // 刷新UI
        this.game.events.emit('gameStateChanged');
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