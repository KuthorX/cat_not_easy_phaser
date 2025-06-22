import Phaser from 'phaser';
import { GameData, GameState } from '../types/index.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload(): void {
        // 先加载主配置文件
        this.load.json('gameData', 'assets/data/gameData.json');
    }

    async create(): Promise<void> {
        // 1. 读取主配置
        const gameData = this.cache.json.get('gameData');
        // 2. 加载items和各场景
        const itemsUrl: string = gameData.itemsFile;
        const sceneUrls: string[] = Object.values(gameData.scenes);
        // Phaser不支持async/await加载，需用fetch
        const [items, ...scenesArr] = await Promise.all([
            fetch(itemsUrl).then(r => r.json()),
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
            scenes
        };
        // 5. 挂载到全局
        (this.game as any).gameData = fullGameData;
        // 初始化全局gameState
        const gameState: GameState = {
            ...fullGameData.initialState,
            addToInventory: function(itemId: string) {
                if (!this.inventory.includes(itemId)) this.inventory.push(itemId);
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
        // 启动标题场景
        this.scene.start('TitleScene');
    }
} 