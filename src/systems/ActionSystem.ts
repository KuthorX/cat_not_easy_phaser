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
            this.gameState.log(action.log);
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
        
        // 5. 处理特殊效果
        if (action.effects && action.effects.special) {
            this.handleSpecialEffects(action.effects.special, target);
        }
        
        // 6. 检查成就
        this.checkAchievements(action, target);
        
        // 7. 检查游戏结束条件
        this.checkGameEndConditions();
        
        // 发出状态更新事件，通知UI刷新
        this.scene.events.emit('gameStateChanged');
    }

    updateProgress(progressEffects: Record<string, number>): void {
        for (const key in progressEffects) {
            if (this.gameState.progress.hasOwnProperty(key)) {
                const currentValue = this.gameState.progress[key as keyof typeof this.gameState.progress] || 0;
                this.gameState.progress[key as keyof typeof this.gameState.progress] = currentValue + progressEffects[key];
                // Clamp values between 0 and 100
                const newValue = this.gameState.progress[key as keyof typeof this.gameState.progress] || 0;
                this.gameState.progress[key as keyof typeof this.gameState.progress] = Math.max(0, Math.min(100, newValue));
            }
        }
    }

    updateInventory(inventoryEffect: { action: 'add' | 'remove'; item: string }, target: ObjectData): void {
        if (inventoryEffect.action === 'add') {
            this.gameState.addToInventory(inventoryEffect.item);
            // 如果是拾取，通常需要从场景中移除该物品
            if (target.id) {
                this.scene.events.emit('objectRemoved', target.id);
            }
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
                fishPickupCount: 0,
                drinkCount: 0,
                patrolCount: 0,
                areaVisitCount: 0
            };
        }
        
        // 根据动作类型更新计数器
        switch (action.id) {
            case 'knock_over':
                this.gameState.achievementCounters.knockOverCount++;
                this.checkKnockOverAchievement();
                break;
            case 'scratch_sofa':
                this.gameState.achievementCounters.scratchCount++;
                this.checkScratchAchievement();
                break;
            case 'sleep_on_sofa':
            case 'sleep_villa':
            case 'sleep_nest':
                this.gameState.achievementCounters.sleepCount++;
                this.checkSleepAchievement();
                break;
            case 'pickup_fish':
                this.gameState.achievementCounters.fishPickupCount++;
                this.checkFishPickupAchievement();
                break;
            case 'drink':
                this.gameState.achievementCounters.drinkCount++;
                this.checkDrinkAchievement();
                break;
            case 'patrol_balcony':
                this.gameState.achievementCounters.patrolCount++;
                this.checkPatrolAchievement();
                break;
        }
        
        // 检查区域访问成就
        this.checkAreaVisitAchievement();
        
        // 检查主线成就
        this.checkMainStoryAchievements();
    }

    checkKnockOverAchievement(): void {
        const count = this.gameState.achievementCounters.knockOverCount;
        if (count >= 1 && !this.gameState.achievements.waterMess) {
            this.unlockAchievement('waterMess', '水漫金山', '成功打翻水碗！');
        }
        if (count >= 3 && !this.gameState.achievements.destructiveCat) {
            this.unlockAchievement('destructiveCat', '破坏王', '打翻3次物品！');
        }
    }

    checkScratchAchievement(): void {
        const count = this.gameState.achievementCounters.scratchCount;
        if (count >= 3 && !this.gameState.achievements.sofaDestroyer) {
            this.unlockAchievement('sofaDestroyer', '沙发毁灭者', '磨爪次数达到3次！');
        }
        if (count >= 10 && !this.gameState.achievements.scratchMaster) {
            this.unlockAchievement('scratchMaster', '磨爪大师', '磨爪次数达到10次！');
        }
    }

    checkSleepAchievement(): void {
        const count = this.gameState.achievementCounters.sleepCount;
        if (count >= 2 && !this.gameState.achievements.sleepyCat) {
            this.unlockAchievement('sleepyCat', '午睡达人', '在不同地方睡觉2次！');
        }
        if (count >= 5 && !this.gameState.achievements.sleepMaster) {
            this.unlockAchievement('sleepMaster', '睡眠大师', '睡觉5次！');
        }
    }

    checkFishPickupAchievement(): void {
        const count = this.gameState.achievementCounters.fishPickupCount;
        if (count >= 1 && !this.gameState.achievements.fishCollector) {
            this.unlockAchievement('fishCollector', '小鱼干收藏家', '成功收集小鱼干！');
        }
        if (count >= 3 && !this.gameState.achievements.fishHoarder) {
            this.unlockAchievement('fishHoarder', '囤货达人', '收集3根小鱼干！');
        }
    }

    checkDrinkAchievement(): void {
        const count = this.gameState.achievementCounters.drinkCount;
        if (count >= 5 && !this.gameState.achievements.waterLover) {
            this.unlockAchievement('waterLover', '爱喝水', '喝水5次！');
        }
    }

    checkPatrolAchievement(): void {
        const count = this.gameState.achievementCounters.patrolCount;
        if (count >= 3 && !this.gameState.achievements.patrolMaster) {
            this.unlockAchievement('patrolMaster', '巡逻大师', '巡逻3次！');
        }
    }

    checkAreaVisitAchievement(): void {
        // 检查是否访问了所有区域
        const visitedAreas = new Set();
        if (this.gameState.currentLocation) {
            visitedAreas.add(this.gameState.currentLocation);
        }
        
        if (visitedAreas.size >= 3 && !this.gameState.achievements.explorer) {
            this.unlockAchievement('explorer', '探险家', '访问了3个不同的区域！');
        }
    }

    checkMainStoryAchievements(): void {
        // 检查主线成就
        const progress = this.gameState.progress;
        const inventory = this.gameState.inventory;
        
        // 完美拆家王路线
        if (this.gameState.achievementCounters.knockOverCount >= 3 && 
            this.gameState.achievementCounters.scratchCount >= 5 &&
            !this.gameState.achievements.destructiveMaster) {
            this.unlockAchievement('destructiveMaster', '今日最佳破坏王', '完成了破坏王路线！');
        }
        
        // 温顺乖猫路线
        if (this.gameState.achievementCounters.sleepCount >= 3 &&
            this.gameState.achievementCounters.drinkCount >= 3 &&
            this.gameState.achievementCounters.knockOverCount === 0 &&
            !this.gameState.achievements.goodCat) {
            this.unlockAchievement('goodCat', '智人首席奴才', '完成了乖猫路线！');
        }
        
        // 大冒险家路线
        if (this.gameState.achievementCounters.patrolCount >= 5 &&
            this.gameState.achievementCounters.areaVisitCount >= 3 &&
            !this.gameState.achievements.adventurer) {
            this.unlockAchievement('adventurer', '这个家我说了算', '完成了冒险家路线！');
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

    handleSpecialEffects(specialEffects: any, target: ObjectData): void {
        // 处理特殊效果，如解锁区域、改变场景状态等
        if (specialEffects.unlockArea) {
            this.unlockArea(specialEffects.unlockArea);
        }
        
        if (specialEffects.changeSceneState) {
            this.changeSceneState(target, specialEffects.changeSceneState);
        }
        
        if (specialEffects.triggerEvent) {
            this.triggerEvent(specialEffects.triggerEvent);
        }
    }

    unlockArea(areaId: string): void {
        if (!this.gameState.flags) {
            this.gameState.flags = {};
        }
        this.gameState.flags[`${areaId}_unlocked`] = true;
        console.log(`区域解锁: ${areaId}`);
        this.scene.events.emit('areaUnlocked', areaId);
    }

    changeSceneState(target: ObjectData, stateChanges: any): void {
        // 改变场景中对象的状态
        Object.assign(target, stateChanges);
        console.log(`场景状态改变: ${target.name}`, stateChanges);
    }

    triggerEvent(eventId: string): void {
        // 触发特殊事件
        console.log(`触发事件: ${eventId}`);
        this.scene.events.emit('specialEvent', eventId);
    }

    checkGameEndConditions(): void {
        const progress = this.gameState.progress;
        
        // 检查两脚兽回家
        if ((progress.humanComingHome || 0) >= 100) {
            this.endGame('humanHome');
            return;
        }
        
        // 检查饥饿死亡
        if ((progress.hungry || 0) >= 100) {
            this.endGame('starved');
            return;
        }
        
        // 检查其他结束条件
        if ((progress.needPoop || 0) >= 100) {
            this.endGame('accident');
            return;
        }
    }

    endGame(endType: string): void {
        console.log(`游戏结束: ${endType}`);
        this.scene.events.emit('gameEnd', endType);
        
        // 根据结束类型显示不同的结局
        let endingText = '';
        switch (endType) {
            case 'humanHome':
                endingText = '两脚兽回家了！你的一天结束了。';
                break;
            case 'starved':
                endingText = '你太饿了，需要找点吃的...';
                break;
            case 'accident':
                endingText = '你忍不住了，发生了意外...';
                break;
            default:
                endingText = '游戏结束！';
        }
        
        this.scene.events.emit('showEnding', endingText);
    }
}

export default ActionSystem; 