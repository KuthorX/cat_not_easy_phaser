import { Action } from '../types/GameState';

export interface ConditionMessage {
  message: string;
  type: 'warning' | 'error' | 'info';
}

export class ConditionsFormatter {
  /**
   * 检查动作条件并返回用户友好的提示信息
   * @param action 动作对象
   * @param gameState 游戏状态
   * @returns 条件检查结果和提示信息
   */
  public static checkActionConditions(action: Action, gameState: any): { canExecute: boolean; message?: string } {
    if (!action.conditions || action.conditions.length === 0) {
      return { canExecute: true };
    }

    // 检查每个条件
    for (const condition of action.conditions) {
      const result = this.checkSingleCondition(condition, gameState);
      if (!result.canExecute) {
        return {
          canExecute: false,
          message: result.message
        };
      }
    }

    return { canExecute: true };
  }

  /**
   * 检查单个条件
   * @param condition 条件对象
   * @param gameState 游戏状态
   * @returns 条件检查结果
   */
  private static checkSingleCondition(condition: any, gameState: any): { canExecute: boolean; message?: string } {
    let actualValue: any;
    let expectedValue: any;

    switch (condition.type) {
      case 'energy':
        actualValue = gameState.energy || 0;
        expectedValue = condition.value;
        
        if (condition.operator === 'gte' && actualValue < expectedValue) {
          return {
            canExecute: false,
            message: `精力不够，需要至少 ${expectedValue} 点精力`
          };
        }
        break;

      case 'hunger':
        actualValue = gameState.hunger || 0;
        expectedValue = condition.value;
        
        if (condition.operator === 'gte' && actualValue < expectedValue) {
          return {
            canExecute: false,
            message: `饥饿度不够，需要至少 ${expectedValue} 点饥饿度`
          };
        }
        break;

      case 'inventory':
        const hasItem = gameState.inventory && gameState.inventory.includes(condition.value);
        if (condition.operator === 'has' && !hasItem) {
          return {
            canExecute: false,
            message: `缺少物品：${this.getItemDisplayName(condition.value)}`
          };
        }
        break;

      case 'story_flag':
        const flagValue = gameState.storyFlags && gameState.storyFlags.get(condition.value);
        if (condition.operator === 'has' && !flagValue) {
          return {
            canExecute: false,
            message: `需要先完成前置条件`
          };
        }
        break;

      case 'action_completed':
        const actionCompleted = gameState.completedActions && gameState.completedActions.has(condition.value);
        if (condition.operator === 'has' && !actionCompleted) {
          return {
            canExecute: false,
            message: `需要先完成其他动作`
          };
        }
        break;
    }

    return { canExecute: true };
  }

  /**
   * 获取物品的显示名称
   * @param itemId 物品ID
   * @returns 显示名称
   */
  private static getItemDisplayName(itemId: string): string {
    const itemNames: { [key: string]: string } = {
      'cat_bites_rope': '猫咬绳',
      'cat_bites_air': '咬空气',
      'toy_mouse': '玩具老鼠',
      'medium_box': '中等箱子',
      'heavy_water_bottle': '重水瓶',
      'expired_drink': '过期饮料',
      'large_box': '大箱子'
    };

    return itemNames[itemId] || itemId;
  }

  /**
   * 格式化特殊条件的失败消息
   * @param specialCondition 特殊条件
   * @returns 格式化的消息
   */
  public static formatSpecialConditionMessage(specialCondition: any): string {
    if (specialCondition && specialCondition.failureMessage) {
      return specialCondition.failureMessage;
    }
    return '无法执行此动作';
  }
} 