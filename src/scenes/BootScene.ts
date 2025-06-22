import Phaser from 'phaser';
import { GameData, GameState } from '../types/index';
import { AssetLoader } from '../utils/AssetLoader';
import { AchievementLoader } from '../utils/AchievementLoader';
import AchievementSystem from '../systems/AchievementSystem';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload(): void {
        // 使用资源加载器
        AssetLoader.preloadData(this);
        AssetLoader.preloadImages(this);
    }

    async create(): Promise<void> {
        // 1. 读取主配置
        const gameData = this.cache.json.get('gameData');
        const achievementsData = this.cache.json.get('achievements');
        const itemInteractionsData = this.cache.json.get('itemInteractions');
        
        // 2. 加载items、actions和各场景
        const itemsUrl: string = gameData.itemsFile;
        const actionsUrl: string = gameData.actionsFile;
        const itemInteractionsUrl: string = gameData.itemInteractionsFile;
        const sceneUrls: string[] = Object.values(gameData.scenes);
        
        // Phaser不支持async/await加载，需用fetch
        const [items, actions, itemInteractions, ...scenesArr] = await Promise.all([
            fetch(itemsUrl).then(r => r.json()),
            fetch(actionsUrl).then(r => r.json()),
            fetch(itemInteractionsUrl).then(r => r.json()),
            ...sceneUrls.map(url => fetch(url).then(r => r.json()))
        ]);
        
        // 3. 合并数据
        const scenesKeys = Object.keys(gameData.scenes);
        const scenes: Record<string, any> = {};
        scenesKeys.forEach((key, i) => { scenes[key] = scenesArr[i]; });
        
        // 4. 组装完整gameData
        const fullGameData: GameData = {
            initialState: gameData.initialState,
            items,
            actions,
            itemInteractions,
            scenes
        };
        
        // 5. 挂载到全局
        (this.game as any).gameData = fullGameData;
        (this.game as any).achievementsData = achievementsData;
        (this.game as any).itemInteractionsData = itemInteractionsData;
        
        // 初始化全局gameState
        const gameState: GameState = {
            ...fullGameData.initialState,
            addToInventory: function(itemId: string) {
                // 支持物品堆叠，允许添加多个相同的物品
                this.inventory.push(itemId);
            },
            removeFromInventory: function(itemId: string) {
                const idx = this.inventory.indexOf(itemId);
                if (idx > -1) this.inventory.splice(idx, 1);
            },
            log: function(msg: string) {
                this.actionLog.push(msg);
            }
        } as GameState;
        (this.game as any).gameState = gameState;
        this.registry.set('gameState', gameState);
        
        // 6. 加载成就配置并初始化成就系统
        try {
            await AchievementLoader.loadAchievementConfig();
            const achievementSystem = new AchievementSystem(gameState, fullGameData, this.game);
            (this.game as any).achievementSystem = achievementSystem;
            console.log('✅ 成就系统初始化成功');
        } catch (error) {
            console.error('❌ 成就系统初始化失败:', error);
        }
        
        // 启动标题场景
        this.scene.start('TitleScene');
    }
} 