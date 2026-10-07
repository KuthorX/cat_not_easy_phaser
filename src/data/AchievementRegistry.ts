import { Achievement } from '../types/GameState';
import { OWNER_RETURNED_FLAG, ProgressState, getProgress, isAchievementMet } from '../logic/achievements';

export class AchievementRegistry {
  private achievements: Map<string, Achievement> = new Map();

  constructor() {
    this.initializeAchievements();
  }

  private initializeAchievements(): void {
    // 四个结局成就：条件全部达成时当天立即结束并展示对应结局插画
    // 玩耍时光成就
    this.registerAchievement({
      id: 'play_time',
      name: '玩耍时光',
      description: '尽！情！玩！个！爽！和家里所有的玩具都玩一遍。',
      conditions: [
        { type: 'action_completed', value: 'play_with_ball' },
        { type: 'action_completed', value: 'play_cat_tree' },
        { type: 'action_completed', value: 'play_in_house' },
        { type: 'action_completed', value: 'play' }
      ]
    });

    // 猫中哈士奇成就
    this.registerAchievement({
      id: 'hooligan',
      name: '猫中哈士奇',
      description: '两脚兽回来时可能会心肺骤停。破坏所有昂贵的可破坏物。',
      conditions: [
        { type: 'action_completed', value: 'sweep_table' },
        { type: 'action_completed', value: 'push_tv' },
        { type: 'action_completed', value: 'destroy' }
      ]
    });

    // 两脚兽的盟友成就
    this.registerAchievement({
      id: 'good_cat',
      name: '两脚兽的盟友',
      description: '做一只温顺的好猫。一整天不搞任何破坏，乖乖等两脚兽回家（21:00）。',
      conditions: [
        { type: 'no_destruction', value: true },
        { type: 'story_flag', value: OWNER_RETURNED_FLAG }
      ]
    });

    // 后勤官成就
    this.registerAchievement({
      id: 'logistics',
      name: '后勤官',
      description: '物色好材料（箱子、水瓶、饮料），帮两脚兽加固阳台的堡垒，抵御隔壁的猫。',
      conditions: [
        { type: 'action_completed', value: 'rummage' },
        { type: 'action_completed', value: 'rummage_water' },
        { type: 'action_completed', value: 'drink_carry' },
        { type: 'action_completed', value: 'reinforce' }
      ]
    });

    // 探索者成就（不结束游戏）
    this.registerAchievement({
      id: 'explorer',
      name: '探索者',
      description: '访问了所有可进入的房间。',
      conditions: [
        { type: 'room_visited', value: 'living_room_east' },
        { type: 'room_visited', value: 'living_room_west_low' },
        { type: 'room_visited', value: 'living_room_west_high' },
        { type: 'room_visited', value: 'hallway' },
        { type: 'room_visited', value: 'room_b' },
        { type: 'room_visited', value: 'balcony' }
      ]
    });
  }

  public registerAchievement(achievement: Achievement): void {
    this.achievements.set(achievement.id, achievement);
  }

  public getAchievement(achievementId: string): Achievement | null {
    return this.achievements.get(achievementId) || null;
  }

  public getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  public getAchievementIds(): string[] {
    return Array.from(this.achievements.keys());
  }

  // 检查成就是否解锁
  public checkAchievementUnlock(achievementId: string, gameState: ProgressState): boolean {
    const achievement = this.getAchievement(achievementId);
    return achievement ? isAchievementMet(achievement, gameState) : false;
  }

  // 获取所有可解锁的成就
  public getUnlockableAchievements(gameState: ProgressState & { achievements: string[] }): Achievement[] {
    return this.getAllAchievements().filter(achievement =>
      !gameState.achievements.includes(achievement.id) && isAchievementMet(achievement, gameState)
    );
  }

  // 获取成就进度
  public getAchievementProgress(achievementId: string, gameState: ProgressState): { current: number; total: number } {
    const achievement = this.getAchievement(achievementId);
    return achievement ? getProgress(achievement, gameState) : { current: 0, total: 0 };
  }
}
