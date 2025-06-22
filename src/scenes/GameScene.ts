import Phaser from 'phaser';
import ActionSystem from '../systems/ActionSystem.js';
import { GameData, GameState, SceneData, ObjectData, Action } from '../types/index.js';

export default class GameScene extends Phaser.Scene {
    actionSystem: ActionSystem | null = null;
    gameState!: GameState;
    gameData!: GameData;
    sceneObjects: Record<string, Phaser.GameObjects.Image> = {};
    currentSceneId?: string;

    constructor() {
        super('GameScene');
    }

    create(): void {
        // 初始化游戏状态（如果不存在）
        if (!this.game.gameState) {
            this.game.gameState = {
                currentLocation: 'living_room',
                inventory: [],
                actionLog: [],
                progress: {
                    energy: 50,
                    happiness: 50,
                    mischief: 0
                },
                achievements: {},
                achievementCounters: {
                    knockOverCount: 0,
                    scratchCount: 0,
                    sleepCount: 0,
                    fishPickupCount: 0
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
        if (!this.game.gameState.currentLocation) {
            this.game.gameState.currentLocation = 'living_room';
        }
        // 确保achievements对象存在
        if (!this.game.gameState.achievements) {
            this.game.gameState.achievements = {};
        }
        // 确保achievementCounters对象存在
        if (!this.game.gameState.achievementCounters) {
            this.game.gameState.achievementCounters = {
                knockOverCount: 0,
                scratchCount: 0,
                sleepCount: 0,
                fishPickupCount: 0
            };
        }
        this.gameState = this.game.gameState as GameState;
        this.gameData = this.game.gameData as GameData;
        if (!this.gameData) {
            console.error('GameData not loaded yet!');
            return;
        }
        this.actionSystem = new ActionSystem(this);
        // Centralized event handling
        this.game.events.on('performAction', this.handleAction, this);
        this.game.events.on('changeScene', this.changeScene, this);
        this.game.events.on('undoAction', this.undoAction, this);
        this.events.on('objectRemoved', (objectId: string) => {
            const objectSprite = this.sceneObjects[objectId];
            if (objectSprite) {
                objectSprite.destroy();
                delete this.sceneObjects[objectId];
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
        this.add.image(960, 1030, 'placeholder_80x80.png')
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
                if (objectData.actions && objectData.actions.some(action => 
                    action.effects && action.effects.inventory && action.effects.inventory.action === 'add'
                )) {
                    const itemId = objectData.actions.find(action => 
                        action.effects && action.effects.inventory && action.effects.inventory.action === 'add'
                    )!.effects!.inventory!.item;
                    if (this.gameState.inventory.includes(itemId)) {
                        return; // Don't create item if it's already in inventory
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

    handleAction(action: Action, targetObject: ObjectData): void {
        this.saveState();
        this.actionSystem?.handleAction(action, targetObject);
        this.scene.get('UIScene').hideActionMenu();
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
        const sprite = this.add.image(objectData.x, objectData.y, objectData.image).setInteractive({ useHandCursor: true });
        sprite.setData('id', id);
        sprite.setData('data', objectData);
        this.sceneObjects[id] = sprite;
        sprite.on('pointerover', () => {
            sprite.setTint(0xffff00);
            if (objectData.look) {
                this.scene.get('UIScene').showHoverInteraction(objectData.look, sprite.x, sprite.y);
            }
        });
        sprite.on('pointerout', () => {
            sprite.clearTint();
            this.scene.get('UIScene').hideHoverInteraction();
        });
        sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.stopPropagation();
            if (objectData.navTo) {
                this.changeScene(objectData.navTo);
            } else if (objectData.actions && objectData.actions.length > 0) {
                this.scene.get('UIScene').showActionMenu(objectData, pointer);
            } else if (objectData.look) {
                this.gameState.log(objectData.look);
                this.game.events.emit('gameStateChanged');
            }
        });
        return sprite;
    }
} 