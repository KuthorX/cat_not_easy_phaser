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
        
        // 0. 检查动作是否可执行（状态值要求）
        if (!this.canExecuteAction(action)) {
            this.gameState.log(`无法执行动作：状态值不足`);
            return;
        }
        
        // 1. 消耗时间和状态值
        this.consumeActionCosts(action);
        
        // 2. 记录动作日志
        if (action.log) {
            this.gameState.log(action.log);
        }
        
        // 3. 更新进度条
        if (action.effects && action.effects.progress) {
            this.updateProgress(action.effects.progress);
        }
        
        // 4. 处理物品变化 (拾取/消耗)
        if (action.effects && action.effects.inventory) {
            this.updateInventory(action.effects.inventory, target);
        }

        // 5. 处理对象状态变化
        if (action.effects && action.effects.object) {
            this.updateObjectState(target, action.effects.object);
        }

        // 6. 处理场景变化
        if (action.effects && action.effects.scene) {
            this.updateSceneState(action.effects.scene);
        }
        
        // 7. 处理目标对象状态变化
        if (action.effects && action.effects.updateTarget) {
            this.updateTargetState(target, action.effects.updateTarget);
        }
        
        // 8. 处理特殊效果
        if (action.effects && action.effects.special) {
            this.handleSpecialEffects(action.effects.special, target);
        }
        
        // 9. 更新成就计数器
        this.updateAchievementCounters(action, target);
        
        // 10. 检查成就
        this.checkAchievements(action, target);
        
        // 11. 检查游戏结束条件
        this.checkGameEndConditions();
        
        // 发出状态更新事件，通知UI刷新
        this.scene.events.emit('gameStateChanged');
    }

    /**
     * 检查动作是否可执行
     */
    private canExecuteAction(action: Action): boolean {
        // 检查饥饿值要求
        if (action.hungryRequirement && this.gameState.hungry < action.hungryRequirement) {
            return false;
        }
        
        // 检查精力值要求
        if (action.energyRequirement && this.gameState.energy < action.energyRequirement) {
            return false;
        }
        
        // 检查精力值消耗
        if (action.energyCost && this.gameState.energy < action.energyCost) {
            return false;
        }
        
        // 检查时间是否足够
        const timeCost = action.timeCost || (action.category === 'simple' ? 30 : 60);
        if (this.gameState.timeRemaining < timeCost) {
            return false;
        }
        
        return true;
    }

    /**
     * 消耗动作的成本（时间和状态值）
     */
    private consumeActionCosts(action: Action): void {
        // 消耗时间
        const timeCost = action.timeCost || (action.category === 'simple' ? 30 : 60);
        this.gameState.currentTime += timeCost;
        this.gameState.timeRemaining -= timeCost;
        
        // 消耗精力值
        if (action.energyCost) {
            this.gameState.energy -= action.energyCost;
        }
        
        // 恢复状态值
        if (action.hungryRestore) {
            this.gameState.hungry = Math.min(5, this.gameState.hungry + action.hungryRestore);
        }
        
        if (action.energyRestore) {
            this.gameState.energy = Math.min(5, this.gameState.energy + action.energyRestore);
        }
        
        // 处理effects中的状态值变化
        if (action.effects) {
            if (action.effects.hungryChange) {
                this.gameState.hungry = Math.max(0, Math.min(5, this.gameState.hungry + action.effects.hungryChange));
            }
            if (action.effects.energyChange) {
                this.gameState.energy = Math.max(0, Math.min(5, this.gameState.energy + action.effects.energyChange));
            }
        }
    }

    /**
     * 更新成就计数器
     */
    updateAchievementCounters(action: Action, target: ObjectData): void {
        // 初始化成就计数器（如果不存在）
        if (!this.gameState.achievementCounters) {
            this.gameState.achievementCounters = {
                toyCollectionCount: 0,
                playInteractionCount: 0,
                expensiveItemDestroyCount: 0,
                balconyVisited: 0,
                neighborEscape: 0,
                trapSetupCount: 0,
                materialPreparationCount: 0,
                greetingAtDoor: 0,
                noDestructionFlag: false
            };
        }
        
        // 根据动作类型更新计数器
        switch (action.id) {
            // 玩耍相关
            case 'collect_toy':
                this.gameState.achievementCounters.toyCollectionCount++;
                break;
            case 'play_with_toy':
            case 'scratch_post':
            case 'house_run':
            case 'closet_hide':
            case 'hammock_sleep':
                this.gameState.achievementCounters.playInteractionCount++;
                break;
                
            // 破坏相关
            case 'destroy_tv':
            case 'destroy_computer':
            case 'destroy_table_items':
            case 'destroy_cat_nest':
                this.gameState.achievementCounters.expensiveItemDestroyCount++;
                break;
                
            // 探索相关
            case 'visit_balcony':
            case 'patrol_balcony':
                this.gameState.achievementCounters.balconyVisited++;
                break;
            case 'neighbor_escape':
                this.gameState.achievementCounters.neighborEscape++;
                break;
                
            // 策略相关
            case 'set_trap':
                this.gameState.achievementCounters.trapSetupCount++;
                break;
            case 'prepare_material':
                this.gameState.achievementCounters.materialPreparationCount++;
                break;
                
            // 其他
            case 'greet_at_door':
                this.gameState.achievementCounters.greetingAtDoor++;
                break;
        }
        
        // 设置标志
        if (action.effects && action.effects.special) {
            if (action.effects.special.triggerEvent === 'neighbor_fight_completed') {
                if (!this.gameState.flags) this.gameState.flags = {};
                this.gameState.flags.neighbor_fight_completed = true;
            }
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
        // 检查时间是否用完
        if (this.gameState.timeRemaining <= 0) {
            this.endGame('time_up');
            return;
        }
        
        // 检查饥饿值
        if (this.gameState.hungry <= 0) {
            this.endGame('hungry');
            return;
        }
        
        // 检查精力值
        if (this.gameState.energy <= 0) {
            this.endGame('energy_depleted');
            return;
        }
        
        // 检查两脚兽回家进度
        const humanComingHome = this.gameState.progress.humanComingHome || 0;
        if (humanComingHome >= 100) {
            this.endGame('human_coming_home');
            return;
        }
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
            case 'play_completion':
                return this.checkPlayCompletion(endCondition);
                
            case 'destruction_completion':
                return this.checkDestructionCompletion(endCondition);
                
            case 'obedient_completion':
                return this.checkObedientCompletion(endCondition);
                
            case 'escape_completion':
                return this.checkEscapeCompletion(endCondition);
                
            case 'trap_completion':
                return this.checkTrapCompletion(endCondition);
                
            case 'material_completion':
                return this.checkMaterialCompletion(endCondition);
                
            case 'strategist_completion':
                return this.checkStrategistCompletion(endCondition);
                
            default:
                return false;
        }
    }

    /**
     * 检查玩耍成就完成条件
     */
    private checkPlayCompletion(condition: any): boolean {
        if (!condition.requiredToys || !condition.requiredInteractions) {
            return false;
        }

        // 检查是否收集了所有玩具
        const hasAllToys = condition.requiredToys.every((toyId: string) => 
            this.gameState.inventory.includes(toyId)
        );

        // 检查是否进行了所有玩耍交互
        const hasAllInteractions = this.gameState.achievementCounters.playInteractionCount >= condition.requiredInteractions.length;

        return hasAllToys && hasAllInteractions;
    }

    /**
     * 检查破坏成就完成条件
     */
    private checkDestructionCompletion(condition: any): boolean {
        if (!condition.requiredDestructions) {
            return false;
        }

        return this.gameState.achievementCounters.expensiveItemDestroyCount >= condition.requiredDestructions.length;
    }

    /**
     * 检查温顺成就完成条件
     */
    private checkObedientCompletion(condition: any): boolean {
        // 检查是否没有进行破坏活动
        if (condition.noDestruction && this.gameState.achievementCounters.expensiveItemDestroyCount > 0) {
            return false;
        }

        // 检查是否在门口迎接
        if (condition.greetAtDoor && this.gameState.achievementCounters.greetingAtDoor === 0) {
            return false;
        }

        return true;
    }

    /**
     * 检查逃脱成就完成条件
     */
    private checkEscapeCompletion(condition: any): boolean {
        // 检查精力值要求
        if (condition.energyRequirement && this.gameState.energy < condition.energyRequirement) {
            return false;
        }

        // 检查是否访问了阳台
        if (condition.balconyAccess && this.gameState.achievementCounters.balconyVisited === 0) {
            return false;
        }

        // 检查是否与邻居猫战斗
        if (condition.neighborFight && !this.gameState.flags?.neighbor_fight_completed) {
            return false;
        }

        // 检查是否成功逃脱
        if (condition.neighborEscape && this.gameState.achievementCounters.neighborEscape === 0) {
            return false;
        }

        return true;
    }

    /**
     * 检查陷阱成就完成条件
     */
    private checkTrapCompletion(condition: any): boolean {
        if (!condition.requiredTraps) {
            return false;
        }

        return this.gameState.achievementCounters.trapSetupCount >= condition.requiredTraps;
    }

    /**
     * 检查材料成就完成条件
     */
    private checkMaterialCompletion(condition: any): boolean {
        if (!condition.requiredMaterials) {
            return false;
        }

        return condition.requiredMaterials.every((materialId: string) => 
            this.gameState.inventory.includes(materialId)
        );
    }

    /**
     * 检查策略成就完成条件
     */
    private checkStrategistCompletion(condition: any): boolean {
        const trapMasterUnlocked = this.gameState.achievements['trap_master'];
        const logisticsOfficerUnlocked = this.gameState.achievements['logistics_officer'];
        
        return !!(trapMasterUnlocked && logisticsOfficerUnlocked);
    }

    /**
     * 检查是否有破坏类成就
     */
    hasDestructionAchievements(): boolean {
        return this.gameState.achievementCounters.expensiveItemDestroyCount > 0;
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
            case 'time_up':
                endTitle = '时间到了！';
                endMessage = '12小时过去了，我的一天结束了。';
                break;
            case 'hungry':
                endTitle = '太饿了！';
                endMessage = '我饿得不行了，需要找点吃的。';
                break;
            case 'energy_depleted':
                endTitle = '精力耗尽！';
                endMessage = '我太累了，需要休息。';
                break;
            case 'human_coming_home':
                endTitle = '两脚兽回家了！';
                endMessage = '我的一天结束了。';
                break;
            case 'playtime_master':
                endTitle = '玩耍时光';
                endMessage = '我尽情地玩了个爽！';
                break;
            case 'destruction_king':
                endTitle = '猫中哈士奇';
                endMessage = '我成功成为了这个家的破坏之王！';
                break;
            case 'human_ally':
                endTitle = '两脚兽的盟友';
                endMessage = '我是一个完美的乖猫咪！';
                break;
            case 'escape_artist':
                endTitle = '再见了两脚兽今天我就要远航';
                endMessage = '我成功离家出走了！';
                break;
            case 'trap_master':
                endTitle = '走路小心点';
                endMessage = '我布置了完美的陷阱！';
                break;
            case 'logistics_officer':
                endTitle = '后勤官';
                endMessage = '我准备好了所有材料！';
                break;
            default:
                endTitle = '游戏结束';
                endMessage = '我的一天结束了。';
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