import { GameState, GameData, Achievement } from '../types/index';

export interface AchievementCondition {
    type: 'counter' | 'flag' | 'all_sub_achievements' | 'human_coming_home_low' | 'all_rooms_unlocked' | 'all_traps_set_and_defend';
    counter?: string;
    flag?: string;
    value?: number;
    humanComingHomeThreshold?: number;
    noDestruction?: boolean;
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

    constructor(gameState: GameState, gameData: GameData) {
        this.gameState = gameState;
        this.gameData = gameData;
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
        // 检查子成就
        Object.values(this.achievementConfig.achievements).forEach(achievementData => {
            if (!achievementData.isMainAchievement && !this.gameState.achievements[achievementData.id]) {
                if (this.checkAchievementCondition(achievementData.condition)) {
                    this.unlockAchievement(achievementData);
                }
            }
        });

        // 检查主成就
        Object.values(this.achievementConfig.achievementPaths).forEach(path => {
            const mainAchievementData = this.achievementConfig.achievements[path.mainAchievement];
            if (mainAchievementData && !this.gameState.achievements[path.mainAchievement]) {
                if (this.checkAchievementPathCondition(path)) {
                    this.unlockAchievement(mainAchievementData);
                }
            }
        });
    }

    /**
     * 检查单个成就条件
     */
    private checkAchievementCondition(condition: AchievementCondition): boolean {
        switch (condition.type) {
            case 'counter':
                if (condition.counter && condition.value !== undefined) {
                    const currentValue = this.getCounterValue(condition.counter);
                    return currentValue >= condition.value;
                }
                break;

            case 'flag':
                if (condition.flag) {
                    return this.gameState.flags?.[condition.flag] === true;
                }
                break;

            case 'all_sub_achievements':
                // 这个条件通常用于主成就，在checkAchievementPathCondition中处理
                return false;

            case 'human_coming_home_low':
                if (condition.humanComingHomeThreshold !== undefined) {
                    const humanProgress = this.gameState.progress.humanComingHome || 0;
                    return humanProgress <= condition.humanComingHomeThreshold;
                }
                break;

            case 'all_rooms_unlocked':
                // 检查是否所有房间都已解锁
                return this.checkAllRoomsUnlocked();

            case 'all_traps_set_and_defend':
                // 检查是否所有陷阱都已设置并成功防御
                return this.checkAllTrapsSetAndDefend();
        }
        return false;
    }

    /**
     * 检查成就路径条件（主成就）
     */
    private checkAchievementPathCondition(path: AchievementPath): boolean {
        const condition = path.endCondition;

        switch (condition.type) {
            case 'all_sub_achievements':
                // 检查所有子成就是否都已解锁
                return path.subAchievements.every(achievementId => 
                    this.gameState.achievements[achievementId]
                );

            case 'human_coming_home_low':
                if (condition.humanComingHomeThreshold !== undefined) {
                    const humanProgress = this.gameState.progress.humanComingHome || 0;
                    const isLowProgress = humanProgress <= condition.humanComingHomeThreshold;
                    
                    if (condition.noDestruction) {
                        // 检查是否没有进行破坏活动
                        const destructionCounters = [
                            'waterBowlKnockOverCount',
                            'tableItemPushCount',
                            'scratchCount',
                            'toiletPaperDestroyCount'
                        ];
                        const hasDestruction = destructionCounters.some(counter => 
                            this.getCounterValue(counter) > 0
                        );
                        return isLowProgress && !hasDestruction;
                    }
                    
                    return isLowProgress;
                }
                break;

            case 'all_rooms_unlocked':
                return this.checkAllRoomsUnlocked();

            case 'all_traps_set_and_defend':
                return this.checkAllTrapsSetAndDefend();
        }
        return false;
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
        
        // 发送成就解锁事件
        if (window.game && window.game.events) {
            window.game.events.emit('achievementUnlocked', achievement);
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
        this.gameState.flags = {};
        console.log('所有成就已重置');
    }

    /**
     * 游戏结束时专用：结算"智人首席奴才"成就
     */
    public checkChiefServantAchievement(): void {
        const path = this.achievementConfig.achievementPaths['obedient'];
        if (!path) return;
        const mainAchievementData = this.achievementConfig.achievements[path.mainAchievement];
        if (!mainAchievementData || this.gameState.achievements[path.mainAchievement]) return;
        if (this.checkAchievementPathCondition(path)) {
            this.unlockAchievement(mainAchievementData);
        }
    }
}

// 全局类型声明
declare global {
    interface Window {
        game: any;
        achievementConfig: any;
    }
} 