import { Achievement } from '../types/GameState';

export class AchievementRegistry {
  private achievements: Map<string, Achievement> = new Map();

  constructor() {
    this.initializeAchievements();
  }

  private initializeAchievements(): void {
    // 玩耍时光成就
    this.registerAchievement({
      id: 'play_time',
      name: '玩耍时光',
      description: '尽！情！玩！个！爽！收集到所有猫玩具并进行过所有玩耍交互。',
      conditions: [
        { type: 'action_completed', value: 'chew_rope' },
        { type: 'action_completed', value: 'chase_ball' }
      ]
    });

    // 猫中哈士奇成就
    this.registerAchievement({
      id: 'hooligan',
      name: '猫中哈士奇',
      description: '两脚兽回来时可能会心肺骤止。破坏所有昂贵的可破坏物。',
      conditions: [
        { type: 'action_completed', value: 'sweep_table' },
        { type: 'action_completed', value: 'attack_tv' }
      ]
    });

    // 两脚兽的盟友成就
    this.registerAchievement({
      id: 'good_cat',
      name: '两脚兽的盟友',
      description: '做一只温顺的好猫。没有进行任何破坏类交互，并在主子回家时选择门口迎接。',
      conditions: [
        { type: 'story_flag', value: 'no_destruction' },
        { type: 'story_flag', value: 'greet_owner' }
      ]
    });

    // 再见了两脚兽成就
    this.registerAchievement({
      id: 'runaway',
      name: '再见了两脚兽',
      description: '今天我就要远航。成功离家出走。',
      conditions: [
        { type: 'story_flag', value: 'escaped_through_balcony' },
        { type: 'story_flag', value: 'fought_neighbor_cat' },
        { type: 'story_flag', value: 'escaped_through_neighbor' }
      ]
    });

    // 后勤官成就
    this.registerAchievement({
      id: 'logistics',
      name: '后勤官',
      description: '提前准备好材料，让两脚兽能构筑堡垒抵御隔壁的猫入侵。',
      conditions: [
        { type: 'inventory_has', value: 'defense_materials' },
        { type: 'story_flag', value: 'prepared_defense' }
      ]
    });

    // 走路小心点成就
    this.registerAchievement({
      id: 'trap_master',
      name: '走路小心点',
      description: '布置好一套陷害铲屎官的陷阱。',
      conditions: [
        { type: 'story_flag', value: 'placed_toy_mouse_trap' },
        { type: 'story_flag', value: 'placed_other_traps' }
      ]
    });

    // 探索者成就
    this.registerAchievement({
      id: 'explorer',
      name: '探索者',
      description: '访问了所有可进入的房间。',
      conditions: [
        { type: 'room_visited', value: 'living_room_north' },
        { type: 'room_visited', value: 'living_room_east' },
        { type: 'room_visited', value: 'living_room_west_low' },
        { type: 'room_visited', value: 'living_room_west_high' },
        { type: 'room_visited', value: 'living_room_door' },
        { type: 'room_visited', value: 'hallway' },
        { type: 'room_visited', value: 'room_b' }
      ]
    });

    // 时间管理大师成就
    this.registerAchievement({
      id: 'time_master',
      name: '时间管理大师',
      description: '在时间结束前完成了多个主要目标。',
      conditions: [
        { type: 'action_completed', value: 'sunbathing' },
        { type: 'action_completed', value: 'sleep_on_bed' },
        { type: 'action_completed', value: 'eat_fish_treat' },
        { type: 'action_completed', value: 'play_in_house' }
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
  public checkAchievementUnlock(achievementId: string, gameState: any): boolean {
    const achievement = this.getAchievement(achievementId);
    if (!achievement) return false;

    return achievement.conditions.every(condition => {
      switch (condition.type) {
        case 'action_completed':
          return gameState.completedActions.has(condition.value);
        case 'item_destroyed':
          return gameState.destroyedItems.has(condition.value);
        case 'room_visited':
          return gameState.visitedRooms.has(condition.value);
        case 'inventory_has':
          return gameState.inventory.includes(condition.value);
        case 'story_flag':
          return gameState.storyFlags.get(condition.value) === condition.value;
        default:
          return false;
      }
    });
  }

  // 获取所有可解锁的成就
  public getUnlockableAchievements(gameState: any): Achievement[] {
    return this.getAllAchievements().filter(achievement => {
      return !gameState.achievements.includes(achievement.id) && 
             this.checkAchievementUnlock(achievement.id, gameState);
    });
  }

  // 获取成就进度
  public getAchievementProgress(achievementId: string, gameState: any): { current: number; total: number } {
    const achievement = this.getAchievement(achievementId);
    if (!achievement) return { current: 0, total: 0 };

    let completed = 0;
    achievement.conditions.forEach(condition => {
      switch (condition.type) {
        case 'action_completed':
          if (gameState.completedActions.has(condition.value)) completed++;
          break;
        case 'item_destroyed':
          if (gameState.destroyedItems.has(condition.value)) completed++;
          break;
        case 'room_visited':
          if (gameState.visitedRooms.has(condition.value)) completed++;
          break;
        case 'inventory_has':
          if (gameState.inventory.includes(condition.value)) completed++;
          break;
        case 'story_flag':
          if (gameState.storyFlags.get(condition.value) === condition.value) completed++;
          break;
      }
    });

    return { current: completed, total: achievement.conditions.length };
  }
} 