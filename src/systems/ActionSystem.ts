import Phaser from 'phaser';
import { GameState, Action, ObjectData, GameData, Achievement, AchievementPath } from '../types/index';

class ActionSystem {
    scene: any;
    gameState: GameState;
    gameData: GameData;
    achievementsData: any;
    achievementPathsData: any;

    constructor(scene: any) {
        this.scene = scene;
        this.gameState = scene.game.gameState as GameState;
        this.gameData = scene.game.gameData as GameData;
        this.achievementsData = scene.game.achievementsData?.achievements;
        this.achievementPathsData = scene.game.achievementsData?.achievementPaths;
    }

    /**
     * 根据动作ID获取动作配置
     */
    getAction(actionId: string): Action | null {
        // 从actions中查找
        if (this.gameData.actions.actions[actionId]) {
            return this.gameData.actions.actions[actionId];
        }
        
        // 从item_actions中查找
        for (const itemId in this.gameData.actions.item_actions) {
            if (this.gameData.actions.item_actions[itemId][actionId]) {
                return this.gameData.actions.item_actions[itemId][actionId];
            }
        }
        
        // 从interactions中查找
        if (this.gameData.actions.interactions[actionId]) {
            return this.gameData.actions.interactions[actionId];
        }
        
        return null;
    }

    /**
     * 获取物品的所有可用动作
     */
    getItemActions(itemId: string): Record<string, Action> {
        return this.gameData.actions.item_actions[itemId] || {};
    }

    /**
     * 获取物品与目标的交互动作
     */
    getInteractionAction(itemId: string, targetId: string): Action | null {
        const interactionKey = `${itemId}_${targetId}`;
        return this.gameData.actions.interactions[interactionKey] || null;
    }

    /**
     * 处理玩家执行的动作并更新游戏状态
     */
    handleAction(actionId: string, target: ObjectData): void {
        const action = this.getAction(actionId);
        if (!action) {
            console.error(`Action not found: ${actionId}`);
            return;
        }

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

        // 4. 处理对象状态变化
        if (action.effects && action.effects.object) {
            this.updateObjectState(target, action.effects.object);
        }

        // 5. 处理场景变化
        if (action.effects && action.effects.scene) {
            this.updateSceneState(action.effects.scene);
        }
        
        // 6. 处理目标对象状态变化
        if (action.effects && action.effects.updateTarget) {
            this.updateTargetState(target, action.effects.updateTarget);
        }
        
        // 7. 处理特殊效果
        if (action.effects && action.effects.special) {
            this.handleSpecialEffects(action.effects.special, target);
        }
        
        // 8. 更新成就计数器
        this.updateAchievementCounters(action, target);
        
        // 9. 检查成就
        this.checkAchievements(action, target);
        
        // 10. 检查游戏结束条件
        this.checkGameEndConditions();
        
        // 发出状态更新事件，通知UI刷新
        this.scene.events.emit('gameStateChanged');
    }

    /**
     * 更新成就计数器
     */
    updateAchievementCounters(action: Action, target: ObjectData): void {
        // 初始化成就计数器（如果不存在）
        if (!this.gameState.achievementCounters) {
            this.gameState.achievementCounters = {
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
        
        // 根据动作类型更新计数器
        switch (action.id) {
            case 'knock_over':
                this.gameState.achievementCounters.knockOverCount++;
                if (target.name.includes('水碗')) {
                    this.gameState.achievementCounters.waterBowlKnockOverCount++;
                }
                break;
            case 'scratch_sofa':
                this.gameState.achievementCounters.scratchCount++;
                break;
            case 'sleep_on_sofa':
            case 'sleep_villa':
            case 'sleep_nest':
                this.gameState.achievementCounters.sleepCount++;
                this.gameState.achievementCounters.sleepLocationCount++;
                break;
            case 'pickup_fish':
                this.gameState.achievementCounters.fishPickupCount++;
                break;
            case 'drink':
                this.gameState.achievementCounters.drinkCount++;
                break;
            case 'patrol_balcony':
                this.gameState.achievementCounters.patrolCount++;
                break;
            case 'meow':
                this.gameState.achievementCounters.meowCount++;
                break;
            case 'push_table_item':
                this.gameState.achievementCounters.tableItemPushCount++;
                break;
            case 'destroy_toilet_paper':
                this.gameState.achievementCounters.toiletPaperDestroyCount++;
                break;
            case 'use_litter_box':
                this.gameState.achievementCounters.litterBoxCount++;
                break;
            case 'play_with_toy':
                this.gameState.achievementCounters.toyInteractionCount++;
                break;
            case 'find_key':
                this.gameState.achievementCounters.keyFindCount++;
                break;
            case 'unlock_room':
                this.gameState.achievementCounters.roomUnlockCount++;
                break;
            case 'set_trap':
                this.gameState.achievementCounters.trapSetCount++;
                break;
            case 'defend_invasion':
                this.gameState.achievementCounters.invasionDefendCount++;
                break;
        }

        // 检查特殊成就
        if (action.id.includes('hide_fish')) {
            this.gameState.achievementCounters.fishHideCount++;
        }
    }

    /**
     * 检查成就
     */
    checkAchievements(action: Action, target: ObjectData): void {
        if (!this.achievementsData) return;

        // 检查直接触发的成就
        if (action.triggerAchievement) {
            this.triggerAchievement(action.triggerAchievement);
        }

        // 检查所有成就条件
        for (const achievementId in this.achievementsData) {
            const achievement = this.achievementsData[achievementId];
            if (this.gameState.achievements[achievementId]) continue; // 已解锁

            if (this.checkAchievementCondition(achievement)) {
                this.unlockAchievement(achievementId, achievement.name, achievement.description);
            }
        }
    }

    /**
     * 检查成就条件
     */
    checkAchievementCondition(achievement: any): boolean {
        const condition = achievement.condition;
        if (!condition) return false;

        switch (condition.type) {
            case 'counter':
                const counterValue = this.gameState.achievementCounters[condition.counter as keyof typeof this.gameState.achievementCounters] || 0;
                return counterValue >= condition.value;
            
            case 'flag':
                return this.gameState.flags?.[condition.flag] === true;
            
            default:
                return false;
        }
    }

    /**
     * 解锁成就
     */
    unlockAchievement(id: string, name: string, description: string): void {
        if (this.gameState.achievements[id]) return; // 已解锁

        const achievement: Achievement = {
            name,
            description,
            unlockedAt: new Date().toISOString(),
            category: this.achievementsData[id]?.category,
            isMainAchievement: this.achievementsData[id]?.isMainAchievement
        };

        this.gameState.achievements[id] = achievement;
        
        // 记录成就解锁日志
        this.gameState.log(`🏆 解锁成就：${name} - ${description}`);
        
        // 发出成就解锁事件
        this.scene.events.emit('achievementUnlocked', achievement);
        
        console.log(`Achievement unlocked: ${name}`);
    }

    /**
     * 触发成就
     */
    triggerAchievement(achievementId: string): void {
        if (!this.achievementsData[achievementId]) return;
        
        const achievement = this.achievementsData[achievementId];
        this.unlockAchievement(achievementId, achievement.name, achievement.description);
    }

    /**
     * 检查游戏结束条件
     */
    checkGameEndConditions(): void {
        const humanComingHome = this.gameState.progress.humanComingHome || 0;
        const hungry = this.gameState.progress.hungry || 0;
        const needPoop = this.gameState.progress.needPoop || 0;
        
        // 检查两脚兽回家
        if (humanComingHome >= 100) {
            this.endGame('human_coming_home');
            return;
        }
        
        // 检查饥饿
        if (hungry >= 100) {
            this.endGame('hungry');
            return;
        }
        
        // 检查拉屎需求
        if (needPoop >= 100) {
            this.endGame('need_poop');
            return;
        }

        // 只有在游戏真正结束时才检查主要成就线路
        // 这里不检查，因为游戏还没结束
    }

    /**
     * 检查主要成就线路
     */
    checkMainAchievementPaths(): void {
        if (!this.achievementPathsData) return;

        for (const pathId in this.achievementPathsData) {
            const path = this.achievementPathsData[pathId];
            const mainAchievementId = path.mainAchievement;
            
            // 如果主要成就已解锁，跳过
            if (this.gameState.achievements[mainAchievementId]) continue;

            // 检查是否满足主要成就条件
            if (this.checkMainAchievementCondition(path)) {
                const achievement = this.achievementsData[mainAchievementId];
                this.unlockAchievement(mainAchievementId, achievement.name, achievement.description);
                // 不在这里调用endGame，因为endGame已经在调用这个方法
                console.log(`主要成就解锁: ${achievement.name}`);
                return;
            }
        }
    }

    /**
     * 检查主要成就条件
     */
    checkMainAchievementCondition(path: any): boolean {
        const endCondition = path.endCondition;
        
        switch (endCondition.type) {
            case 'all_sub_achievements':
                // 检查所有子成就是否解锁
                return path.subAchievements.every((subId: string) => 
                    this.gameState.achievements[subId]
                );
            
            case 'obedient_achievement':
                // 检查所有子成就是否解锁
                const obedientSubAchievementsUnlocked = path.subAchievements.every((subId: string) => 
                    this.gameState.achievements[subId]
                );
                
                // 检查是否有破坏活动
                const obedientNoDestruction = endCondition.noDestruction ? 
                    !this.hasDestructionAchievements() : true;
                
                return obedientSubAchievementsUnlocked && obedientNoDestruction;
            
            case 'human_coming_home_low':
                // 只有在两脚兽回家进度>=100%时才检查这个成就
                const humanComingHome = this.gameState.progress.humanComingHome || 0;
                if (humanComingHome < 100) {
                    return false; // 游戏还没结束，不检查这个成就
                }
                
                // 检查所有子成就是否解锁
                const lowSubAchievementsUnlocked = path.subAchievements.every((subId: string) => 
                    this.gameState.achievements[subId]
                );
                
                // 检查两脚兽回家进度是否低于阈值
                const isLow = humanComingHome <= endCondition.humanComingHomeThreshold;
                
                // 检查是否有破坏活动
                const lowNoDestruction = endCondition.noDestruction ? 
                    !this.hasDestructionAchievements() : true;
                
                return lowSubAchievementsUnlocked && isLow && lowNoDestruction;
            
            case 'all_rooms_unlocked':
                return this.gameState.achievementCounters.roomUnlockCount >= 3;
            
            case 'all_traps_set_and_defend':
                return this.gameState.achievementCounters.trapSetCount >= 3 && 
                       this.gameState.achievementCounters.invasionDefendCount >= 1;
            
            default:
                return false;
        }
    }

    /**
     * 检查是否有破坏类成就
     */
    hasDestructionAchievements(): boolean {
        const destructionAchievements = [
            'water_overflow', 'table_justice', 'sofa_destroyer', 'toilet_paper_terminator'
        ];
        return destructionAchievements.some(id => this.gameState.achievements[id]);
    }

    /**
     * 游戏结束
     */
    endGame(endType: string): void {
        // 在游戏结束时检查主要成就线路
        this.checkMainAchievementPaths();
        
        let endMessage = '';
        let endTitle = '';

        switch (endType) {
            case 'human_coming_home':
                endTitle = '两脚兽回家了！';
                endMessage = '你的一天结束了。';
                break;
            case 'hungry':
                endTitle = '太饿了！';
                endMessage = '你饿得不行了，需要找点吃的。';
                break;
            case 'need_poop':
                endTitle = '憋不住了！';
                endMessage = '你急需上厕所。';
                break;
            case 'destruction':
                endTitle = '今日最佳破坏王';
                endMessage = '你成功成为了这个家的破坏之王！';
                break;
            case 'obedient':
                endTitle = '智人首席奴才';
                endMessage = '你是一个完美的乖猫咪！';
                break;
            case 'explorer':
                endTitle = '这个家我说了算';
                endMessage = '你探索了所有的秘密！';
                break;
            case 'strategist':
                endTitle = '家庭安全顾问';
                endMessage = '你成功保护了这个家！';
                break;
            default:
                endTitle = '游戏结束';
                endMessage = '你的一天结束了。';
        }

        // 发出游戏结束事件
        this.scene.events.emit('gameEnd', { title: endTitle, message: endMessage, endType });
        
        console.log(`Game ended: ${endTitle} - ${endMessage}`);
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
        } else if (inventoryEffect.action === 'remove') {
            this.gameState.removeFromInventory(inventoryEffect.item);
        }
        
        // 确保UI更新
        this.scene.events.emit('gameStateChanged');
    }

    updateObjectState(target: ObjectData, objectEffect: { action: 'hide' | 'show' | 'change'; property?: string; value?: any }): void {
        console.log(`updateObjectState: ${target.id} - ${objectEffect.action}`);
        
        if (objectEffect.action === 'hide' && target.id) {
            console.log(`Hiding object: ${target.id}`);
            this.scene.events.emit('objectRemoved', target.id);
        } else if (objectEffect.action === 'show' && target.id) {
            console.log(`Showing object: ${target.id}`);
            this.scene.loadScene(this.gameState.currentLocation);
        } else if (objectEffect.action === 'change' && objectEffect.property && objectEffect.value !== undefined) {
            console.log(`Changing object property: ${target.id}.${objectEffect.property} = ${objectEffect.value}`);
            (target as any)[objectEffect.property] = objectEffect.value;
        }
    }

    updateSceneState(sceneEffect: { action: 'spawn_item' | 'remove_item' | 'change_state'; item?: string; position?: string; state?: any }): void {
        if (sceneEffect.action === 'spawn_item' && sceneEffect.item) {
            console.log(`Spawning item: ${sceneEffect.item} at position: ${sceneEffect.position}`);
        } else if (sceneEffect.action === 'remove_item') {
            console.log(`Removing item from scene`);
        } else if (sceneEffect.action === 'change_state' && sceneEffect.state) {
            console.log(`Changing scene state:`, sceneEffect.state);
        }
    }

    updateTargetState(target: ObjectData, updates: Record<string, any>): void {
        console.log(`Updating target ${target.name} with`, updates);
    }

    handleSpecialEffects(specialEffects: any, target: ObjectData): void {
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
        console.log(`Unlocking area: ${areaId}`);
        // 设置解锁标志
        if (!this.gameState.flags) {
            this.gameState.flags = {};
        }
        this.gameState.flags[`${areaId}_unlocked`] = true;
        
        // 特殊区域解锁成就
        if (areaId === 'balcony') {
            this.gameState.flags['balcony_visited'] = true;
        } else if (areaId === 'room_c') {
            this.gameState.flags['room_c_unlocked'] = true;
        } else if (areaId === 'outside') {
            this.gameState.flags['outside_escaped'] = true;
        }
    }

    changeSceneState(target: ObjectData, stateChanges: any): void {
        console.log(`Changing scene state for ${target.name}:`, stateChanges);
    }

    triggerEvent(eventId: string): void {
        console.log(`Triggering event: ${eventId}`);
    }
}

export default ActionSystem; 