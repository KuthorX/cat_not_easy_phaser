import { InteractiveObjectCondition } from '../types/GameState';
import { GameState } from '../types/GameState';

/**
 * 条件检查工具类
 * 用于检查交互对象的显示条件
 */
export class ConditionChecker {
  /**
   * 检查单个条件是否满足
   * @param condition 条件对象
   * @param gameState 游戏状态
   * @returns 是否满足条件
   */
  public static checkCondition(condition: InteractiveObjectCondition, gameState: GameState): boolean {
    let actualValue: any;

    switch (condition.type) {
      case 'story_flag':
        actualValue = gameState.storyFlags.get(condition.value);
        break;
      case 'inventory':
        actualValue = gameState.inventory.includes(condition.value);
        break;
      case 'action_completed':
        actualValue = gameState.completedActions.has(condition.value);
        break;
      default:
        return true;
    }

    return this.compareValues(actualValue, condition.operator, condition.value);
  }

  /**
   * 检查多个条件是否都满足
   * @param conditions 条件数组
   * @param gameState 游戏状态
   * @returns 是否所有条件都满足
   */
  public static checkConditions(conditions: InteractiveObjectCondition[], gameState: GameState): boolean {
    if (!conditions || conditions.length === 0) {
      return true; // 没有条件限制，默认显示
    }

    return conditions.every(condition => this.checkCondition(condition, gameState));
  }

  /**
   * 比较值
   * @param actualValue 实际值
   * @param operator 操作符
   * @param expectedValue 期望值
   * @returns 比较结果
   */
  private static compareValues(actualValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'eq':
        return actualValue === expectedValue;
      case 'ne':
        return actualValue !== expectedValue;
      case 'has':
        if (Array.isArray(actualValue)) {
          return actualValue.includes(expectedValue);
        } else if (actualValue instanceof Set) {
          return actualValue.has(expectedValue);
        } else if (actualValue instanceof Map) {
          return actualValue.has(expectedValue);
        }
        return actualValue === true;
      case 'not_has':
        if (Array.isArray(actualValue)) {
          return !actualValue.includes(expectedValue);
        } else if (actualValue instanceof Set) {
          return !actualValue.has(expectedValue);
        } else if (actualValue instanceof Map) {
          return !actualValue.has(expectedValue);
        }
        return actualValue !== true;
      default:
        return true;
    }
  }
} 