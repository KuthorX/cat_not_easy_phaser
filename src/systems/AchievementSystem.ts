import { GameState, GameData, Achievement } from '../types/index';

export interface AchievementCondition {
    type: 'play_completion' | 'destruction_completion' | 'obedient_completion' | 'escape_completion' | 'trap_completion' | 'material_completion' | 'strategist_completion';
    
    // 玩耍成就条件
    requiredToys?: string[];
    requiredInteractions?: string[];
    
    // 破坏成就条件
    requiredDestructions?: string[];
    
    // 温顺成就条件
    noDestruction?: boolean;
    greetAtDoor?: boolean;
    
    // 逃脱成就条件
    balconyAccess?: boolean;
    neighborFight?: boolean;
    neighborEscape?: boolean;
    energyRequirement?: number;
    
    // 陷阱成就条件
    requiredTraps?: number;
    
    // 材料成就条件
    requiredMaterials?: string[];
    
    // 通用条件
    timeLimit?: number; // 时间限制（分钟）
}

export interface AchievementData {
    id: string;
    name: string;
    description: string;
    category: string;
    isMainAchievement: boolean;
    condition: AchievementCondition;
}

export interface AchievementPath {
    id: string;
    name: string;
    description: string;
    mainAchievement: string;
    mainAchievements?: string[]; // 支持多个主成就
    subAchievements: string[];
    endCondition: AchievementCondition;
}

export interface AchievementConfig {
    achievements: Record<string, AchievementData>;
    achievementPaths: Record<string, AchievementPath>;
}

export default class AchievementSystem {
    private gameState: GameState;
    private gameData: GameData;
    private achievementConfig: AchievementConfig;
    private game: Phaser.Game;

    constructor(gameState: GameState, gameData: GameData, game: Phaser.Game) {
        this.gameState = gameState;
        this.gameData = gameData;
        this.game = game;
        this.achievementConfig = this.loadAchievementConfig();
    }

    private loadAchievementConfig(): AchievementConfig {
        // 从缓存中加载成就配置
        return (window as any).achievementConfig || {
            achievements: {},
            achievementPaths: {}
        };
    }

    /**
     * 检查并更新成就状态
     */
    public checkAchievements(): void {
        // 检查所有成就
        Object.values(this.achievementConfig.achievements).forEach(achievementData => {
            if (!this.gameState.achievements[achievementData.id]) {
                if (this.checkAchievementCondition(achievementData.condition)) {
                    this.unlockAchievement(achievementData);
                }
            }
        });
    }

    /**
     * 检查成就条件
     */
    private checkAchievementCondition(condition: AchievementCondition): boolean {
        // 检查时间限制
        if (condition.timeLimit && this.gameState.currentTime > condition.timeLimit) {
            return false;
        }

        switch (condition.type) {
            case 'play_completion':
                return this.checkPlayCompletion(condition);
                
            case 'destruction_completion':
                return this.checkDestructionCompletion(condition);
                
            case 'obedient_completion':
                return this.checkObedientCompletion(condition);
                
            case 'escape_completion':
                return this.checkEscapeCompletion(condition);
                
            case 'trap_completion':
                return this.checkTrapCompletion(condition);
                
            case 'material_completion':
                return this.checkMaterialCompletion(condition);
                
            case 'strategist_completion':
                return this.checkStrategistCompletion(condition);
        }
        return false;
    }

    /**
     * 检查玩耍成就完成条件
     */
    private checkPlayCompletion(condition: AchievementCondition): boolean {
        if (!condition.requiredToys || !condition.requiredInteractions) {
            return false;
        }

        // 检查是否收集了所有玩具
        const hasAllToys = condition.requiredToys.every(toyId => 
            this.gameState.inventory.includes(toyId)
        );

        // 检查是否进行了所有玩耍交互
        const hasAllInteractions = condition.requiredInteractions.every(interactionId => 
            this.gameState.achievementCounters.playInteractionCount > 0
        );

        return hasAllToys && hasAllInteractions;
    }

    /**
     * 检查破坏成就完成条件
     */
    private checkDestructionCompletion(condition: AchievementCondition): boolean {
        if (!condition.requiredDestructions) {
            return false;
        }

        // 检查是否破坏了所有昂贵物品
        return this.gameState.achievementCounters.expensiveItemDestroyCount >= condition.requiredDestructions.length;
    }

    /**
     * 检查温顺成就完成条件
     */
    private checkObedientCompletion(condition: AchievementCondition): boolean {
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
    private checkEscapeCompletion(condition: AchievementCondition): boolean {
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
    private checkTrapCompletion(condition: AchievementCondition): boolean {
        if (!condition.requiredTraps) {
            return false;
        }

        return this.gameState.achievementCounters.trapSetupCount >= condition.requiredTraps;
    }

    /**
     * 检查材料成就完成条件
     */
    private checkMaterialCompletion(condition: AchievementCondition): boolean {
        if (!condition.requiredMaterials) {
            return false;
        }

        // 检查是否准备了所有材料
        return condition.requiredMaterials.every(materialId => 
            this.gameState.inventory.includes(materialId)
        );
    }

    /**
     * 检查策略成就完成条件
     */
    private checkStrategistCompletion(condition: AchievementCondition): boolean {
        // 策略成就需要完成陷阱和材料两个成就
        const trapMasterUnlocked = this.gameState.achievements['trap_master'];
        const logisticsOfficerUnlocked = this.gameState.achievements['logistics_officer'];
        
        return !!(trapMasterUnlocked && logisticsOfficerUnlocked);
    }

    /**
     * 获取计数器值
     */
    private getCounterValue(counterName: string): number {
        // 从achievementCounters中获取值
        return (this.gameState.achievementCounters as any)[counterName] || 0;
    }

    /**
     * 设置计数器值
     */
    private setCounterValue(counterName: string, value: number): void {
        (this.gameState.achievementCounters as any)[counterName] = value;
    }

    /**
     * 检查所有房间是否都已解锁
     */
    private checkAllRoomsUnlocked(): boolean {
        const requiredFlags = [
            'balcony_visited',
            'room_c_unlocked',
            'outside_escaped'
        ];
        return requiredFlags.every(flag => this.gameState.flags?.[flag] === true);
    }

    /**
     * 检查所有陷阱是否都已设置并成功防御
     */
    private checkAllTrapsSetAndDefend(): boolean {
        const requiredFlags = [
            'alarm_set',
            'traps_configured'
        ];
        const requiredCounters = [
            'fishHideCount',
            'trapSetCount',
            'invasionDefendCount'
        ];
        
        const flagsOk = requiredFlags.every(flag => this.gameState.flags?.[flag] === true);
        const countersOk = requiredCounters.every(counter => 
            this.getCounterValue(counter) > 0
        );
        
        return flagsOk && countersOk;
    }

    /**
     * 解锁成就
     */
    private unlockAchievement(achievementData: AchievementData): void {
        const achievement: Achievement = {
            name: achievementData.name,
            description: achievementData.description,
            unlockedAt: new Date().toISOString(),
            category: achievementData.category as any,
            isMainAchievement: achievementData.isMainAchievement
        };

        this.gameState.achievements[achievementData.id] = achievement;
        
        // 记录日志
        this.gameState.log(`🏆 成就解锁: ${achievementData.name}`);
        
        // 发送成就解锁事件 - 使用Phaser的事件系统
        console.log(`🎯 准备发送成就事件: ${achievementData.name}`);
        console.log(`🎯 game对象存在: ${!!this.game}`);
        console.log(`🎯 game.events存在: ${!!this.game?.events}`);
        
        if (this.game && this.game.events) {
            this.game.events.emit('achievementUnlocked', achievement);
            console.log(`✅ 成就事件已发送: ${achievementData.name}`);
        } else {
            console.error(`❌ 无法发送成就事件: game或game.events不存在`);
        }
        
        console.log(`🎉 成就解锁: ${achievementData.name} - ${achievementData.description}`);
    }

    /**
     * 增加计数器
     */
    public incrementCounter(counterName: string, amount: number = 1): void {
        const currentValue = this.getCounterValue(counterName);
        this.setCounterValue(counterName, currentValue + amount);
        this.checkAchievements();
    }

    /**
     * 设置标志
     */
    public setFlag(flagName: string, value: boolean = true): void {
        if (!this.gameState.flags) {
            this.gameState.flags = {};
        }
        this.gameState.flags[flagName] = value;
        this.checkAchievements();
    }

    /**
     * 触发成就解锁（公共方法）
     */
    public triggerAchievement(achievementId: string): void {
        // 不要直接解锁成就，而是让checkAchievements方法来处理
        // 这样可以确保成就条件被正确检查
        console.log(`触发成就检查: ${achievementId}`);
        this.checkAchievements();
    }

    /**
     * 获取成就配置
     */
    public getAchievementConfig(): AchievementConfig {
        return this.achievementConfig;
    }

    /**
     * 获取成就路径
     */
    public getAchievementPaths(): Record<string, AchievementPath> {
        return this.achievementConfig.achievementPaths;
    }

    /**
     * 获取单个成就数据
     */
    public getAchievementData(achievementId: string): AchievementData | null {
        return this.achievementConfig.achievements[achievementId] || null;
    }

    /**
     * 检查成就是否已解锁
     */
    public isAchievementUnlocked(achievementId: string): boolean {
        return !!this.gameState.achievements[achievementId];
    }

    /**
     * 获取成就统计信息
     */
    public getAchievementStats(): { unlocked: number; total: number; percentage: number } {
        const unlocked = Object.keys(this.gameState.achievements).length;
        const total = Object.keys(this.achievementConfig.achievements).length;
        const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
        
        return { unlocked, total, percentage };
    }

    /**
     * 重置所有成就（用于测试）
     */
    public resetAllAchievements(): void {
        this.gameState.achievements = {};
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
        this.gameState.flags = {};
        console.log('所有成就已重置');
    }

    /**
     * 游戏结束时专用：结算"智人首席奴才"成就
     */
    public checkChiefServantAchievement(): void {
        const achievementData = this.achievementConfig.achievements['human_ally'];
        if (!achievementData || this.gameState.achievements['human_ally']) return;
        if (this.checkAchievementCondition(achievementData.condition)) {
            this.unlockAchievement(achievementData);
        }
    }

    /**
     * 检查是否有破坏类成就
     */
    private hasDestructionAchievements(): boolean {
        return this.gameState.achievementCounters.expensiveItemDestroyCount > 0;
    }
}

// 全局类型声明
declare global {
    interface Window {
        game: any;
        achievementConfig: any;
    }
} 