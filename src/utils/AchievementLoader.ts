import { AchievementConfig } from '../systems/AchievementSystem';

export class AchievementLoader {
    /**
     * 加载成就配置
     */
    public static async loadAchievementConfig(): Promise<AchievementConfig> {
        try {
            // 从JSON文件加载成就配置
            const response = await fetch('/assets/data/achievements.json');
            if (!response.ok) {
                throw new Error(`Failed to load achievements config: ${response.statusText}`);
            }
            
            const config = await response.json();
            
            // 验证配置格式
            this.validateConfig(config);
            
            // 将配置存储到全局变量中，供AchievementSystem使用
            (window as any).achievementConfig = config;
            
            console.log('✅ 成就配置加载成功');
            return config;
            
        } catch (error) {
            console.error('❌ 成就配置加载失败:', error);
            // 返回默认配置
            return this.getDefaultConfig();
        }
    }

    /**
     * 验证成就配置格式
     */
    private static validateConfig(config: any): void {
        if (!config.achievements || typeof config.achievements !== 'object') {
            throw new Error('Invalid achievements config: missing or invalid achievements object');
        }
        
        if (!config.achievementPaths || typeof config.achievementPaths !== 'object') {
            throw new Error('Invalid achievements config: missing or invalid achievementPaths object');
        }

        // 验证每个成就的格式
        Object.entries(config.achievements).forEach(([id, achievement]: [string, any]) => {
            if (!achievement.name || !achievement.description) {
                throw new Error(`Invalid achievement config for ${id}: missing required fields (name, description)`);
            }
            
            // 主要成就不需要condition字段，因为它们通过子成就解锁
            if (!achievement.isMainAchievement && !achievement.condition) {
                throw new Error(`Invalid achievement config for ${id}: non-main achievement missing condition field`);
            }
        });

        // 验证每个成就路径的格式
        Object.entries(config.achievementPaths).forEach(([id, path]: [string, any]) => {
            if (!path.name || !path.description || !path.mainAchievement || !path.subAchievements) {
                throw new Error(`Invalid achievement path config for ${id}: missing required fields`);
            }
        });
    }

    /**
     * 获取默认成就配置
     */
    private static getDefaultConfig(): AchievementConfig {
        return {
            achievements: {
                water_overflow: {
                    id: 'water_overflow',
                    name: '水漫金山',
                    description: '打翻所有水碗',
                    category: 'destruction',
                    isMainAchievement: false,
                    condition: {
                        type: 'counter',
                        counter: 'waterBowlKnockOverCount',
                        value: 3
                    }
                },
                table_justice: {
                    id: 'table_justice',
                    name: '天降正义',
                    description: '将桌子上的特定物品推到地上',
                    category: 'destruction',
                    isMainAchievement: false,
                    condition: {
                        type: 'counter',
                        counter: 'tableItemPushCount',
                        value: 2
                    }
                }
            },
            achievementPaths: {
                destruction: {
                    id: 'destruction',
                    name: '完美拆家王',
                    description: '作为一个精力旺盛的猫，把制造混乱作为首要目标',
                    mainAchievement: 'best_destroyer',
                    subAchievements: ['water_overflow', 'table_justice'],
                    endCondition: {
                        type: 'all_sub_achievements',
                        humanComingHomeThreshold: 100
                    }
                }
            }
        };
    }

    /**
     * 重新加载成就配置
     */
    public static async reloadConfig(): Promise<AchievementConfig> {
        console.log('🔄 重新加载成就配置...');
        return this.loadAchievementConfig();
    }

    /**
     * 获取当前加载的配置
     */
    public static getCurrentConfig(): AchievementConfig | null {
        return (window as any).achievementConfig || null;
    }

    /**
     * 检查配置是否已加载
     */
    public static isConfigLoaded(): boolean {
        return !!(window as any).achievementConfig;
    }
} 