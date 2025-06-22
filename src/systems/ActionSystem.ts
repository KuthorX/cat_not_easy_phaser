import { GameState, Action, ObjectData } from '../types/index.js';

class ActionSystem {
    scene: any;
    gameState: GameState;

    constructor(scene: any) {
        this.scene = scene;
        this.gameState = scene.game.gameState as GameState;
    }

    /**
     * 处理玩家执行的动作并更新游戏状态
     */
    handleAction(action: Action, target: ObjectData): void {
        console.log(`Executing action: ${action.id} on target: ${target.name}`);
        // 1. 记录动作日志
        if (action.log) {
            this.gameState.actionLog.push(action.log);
        }
        // 2. 更新进度条
        if (action.effects && action.effects.progress) {
            this.updateProgress(action.effects.progress);
        }
        // 3. 处理物品变化 (拾取/消耗)
        if (action.effects && action.effects.inventory) {
            this.updateInventory(action.effects.inventory, target);
        }
        // 4. 处理目标对象状态变化
        if (action.effects && action.effects.updateTarget) {
            this.updateTargetState(target, action.effects.updateTarget);
        }
        // 5. 检查成就
        this.checkAchievements(action, target);
        // 发出状态更新事件，通知UI刷新
        this.scene.events.emit('gameStateChanged');
    }

    updateProgress(progressEffects: Record<string, number>): void {
        for (const key in progressEffects) {
            if (this.gameState.progress.hasOwnProperty(key)) {
                this.gameState.progress[key] += progressEffects[key];
                // Clamp values between 0 and 100
                this.gameState.progress[key] = Math.max(0, Math.min(100, this.gameState.progress[key]));
            }
        }
    }

    updateInventory(inventoryEffect: { action: 'add' | 'remove'; item: string }, target: ObjectData): void {
        if (inventoryEffect.action === 'add') {
            this.gameState.addToInventory(inventoryEffect.item);
            // 如果是拾取，通常需要从场景中移除该物品
            this.scene.events.emit('objectRemoved', target.id);
        } else if (inventoryEffect.action === 'remove') {
            this.gameState.removeFromInventory(inventoryEffect.item);
        }
    }

    updateTargetState(target: ObjectData, updates: Record<string, any>): void {
        // 这个逻辑比较复杂，需要修改原始的 gameData 结构
        // 暂时只打印日志
        console.log(`Updating target ${target.name} with`, updates);
        // 后续将实现直接修改 target 对象的状态
    }

    checkAchievements(action: Action, target: ObjectData): void {
        // 初始化成就计数器（如果不存在）
        if (!this.gameState.achievementCounters) {
            this.gameState.achievementCounters = {
                knockOverCount: 0,
                scratchCount: 0,
                sleepCount: 0,
                fishPickupCount: 0
            };
        }
        // 根据动作类型更新计数器
        if (action.id === 'knock_over') {
            this.gameState.achievementCounters.knockOverCount++;
            this.checkKnockOverAchievement();
        } else if (action.id === 'scratch_sofa') {
            this.gameState.achievementCounters.scratchCount++;
            this.checkScratchAchievement();
        } else if (action.id === 'sleep_on_sofa' || action.id === 'sleep_villa' || action.id === 'sleep_nest') {
            this.gameState.achievementCounters.sleepCount++;
            this.checkSleepAchievement();
        } else if (action.id === 'pickup_fish') {
            this.gameState.achievementCounters.fishPickupCount++;
            this.checkFishPickupAchievement();
        }
    }

    checkKnockOverAchievement(): void {
        if (this.gameState.achievementCounters.knockOverCount >= 1 && !this.gameState.achievements.waterMess) {
            this.unlockAchievement('waterMess', '水漫金山', '成功打翻水碗！');
        }
    }

    checkScratchAchievement(): void {
        if (this.gameState.achievementCounters.scratchCount >= 3 && !this.gameState.achievements.sofaDestroyer) {
            this.unlockAchievement('sofaDestroyer', '沙发毁灭者', '磨爪次数达到3次！');
        }
    }

    checkSleepAchievement(): void {
        if (this.gameState.achievementCounters.sleepCount >= 2 && !this.gameState.achievements.sleepyCat) {
            this.unlockAchievement('sleepyCat', '午睡达人', '在不同地方睡觉2次！');
        }
    }

    checkFishPickupAchievement(): void {
        if (this.gameState.achievementCounters.fishPickupCount >= 1 && !this.gameState.achievements.fishCollector) {
            this.unlockAchievement('fishCollector', '小鱼干收藏家', '成功收集小鱼干！');
        }
    }

    unlockAchievement(id: string, name: string, description: string): void {
        if (!this.gameState.achievements[id]) {
            this.gameState.achievements[id] = {
                name: name,
                description: description,
                unlockedAt: new Date().toISOString()
            };
            // 发出成就解锁事件
            this.scene.events.emit('achievementUnlocked', {
                id: id,
                name: name,
                description: description
            });
            console.log(`🎉 成就解锁: ${name} - ${description}`);
        }
    }

    triggerAchievement(achievementId: string): void {
        console.log(`Triggering achievement: ${achievementId}`);
        if (this.gameState.achievements) {
            this.gameState.achievements[achievementId] = true as any;
        }
    }
}

export default ActionSystem; 