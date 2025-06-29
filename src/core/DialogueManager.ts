import { 
  Dialogue, 
  DialogueStep, 
  DialogueChoice, 
  DialogueState, 
  DialogueCondition, 
  DialogueEffect,
  DialogueBubblePosition,
  GameState 
} from '../types/GameState';
import { DialogueRegistry } from '../data/DialogueRegistry';

export class DialogueManager {
  private dialogueRegistry: DialogueRegistry;
  private currentDialogueState: DialogueState | null = null;
  private dialogueHistory: any[] = [];

  // 添加对话结束回调
  private onDialogueEndCallback: (() => void) | null = null;

  constructor() {
    // this.dialogueRegistry = new DialogueRegistry();
  }

  // 设置对话结束回调
  public setOnDialogueEndCallback(callback: () => void): void {
    this.onDialogueEndCallback = callback;
  }

  public registerDialogue(dialogue: Dialogue): void {
    this.dialogueRegistry.registerDialogue(dialogue);
  }

  public getDialogue(dialogueId: string): Dialogue | null {
    return this.dialogueRegistry.getDialogue(dialogueId);
  }

  public startDialogue(dialogueId: string, objectId: string, objectName: string, objectPosition: { x: number; y: number }): boolean {
    const dialogue = this.getDialogue(dialogueId);
    if (!dialogue) return false;

    this.currentDialogueState = {
      objectId,
      objectName,
      objectPosition,
      currentDialogue: dialogue,
      currentStep: 0,
      isActive: true
    };

    return true;
  }

  public getCurrentDialogueState(): DialogueState | null {
    return this.currentDialogueState;
  }

  public getCurrentStep(): DialogueStep | null {
    if (!this.currentDialogueState) return null;
    return this.currentDialogueState.currentDialogue.steps[this.currentDialogueState.currentStep];
  }

  public nextStep(choiceId?: string): boolean {
    if (!this.currentDialogueState) return false;

    const currentStep = this.getCurrentStep();
    if (!currentStep) return false;

    // 处理选择
    if (choiceId && currentStep.choices) {
      const choice = currentStep.choices.find(c => c.id === choiceId);
      if (choice) {
        // 应用选择的效果
        this.applyDialogueEffects(choice.effects || []);
        
        // 跳转到选择的下一步
        const nextStepIndex = this.currentDialogueState.currentDialogue.steps.findIndex(s => s.id === choice.nextStep);
        if (nextStepIndex !== -1) {
          this.currentDialogueState.currentStep = nextStepIndex;
        }
      }
    } else if (currentStep.autoNext && currentStep.nextStep) {
      // 自动跳转到下一步
      const nextStepIndex = this.currentDialogueState.currentDialogue.steps.findIndex(s => s.id === currentStep.nextStep);
      console.log('nextStepIndex', nextStepIndex);
      if (nextStepIndex !== -1) {
        this.currentDialogueState.currentStep = nextStepIndex;
      }
    }

    // 获取新的当前步骤
    const newCurrentStep = this.getCurrentStep();
    console.log('newCurrentStep', newCurrentStep);
    if (!newCurrentStep) return false;

    // 处理特殊动作（在步骤更新后）
    if (newCurrentStep.specialAction) {
      console.log('处理特殊动作:', newCurrentStep.specialAction);
      this.handleSpecialAction(newCurrentStep.specialAction);
    }

    // 检查是否结束对话
    if (newCurrentStep.nextStep === 'end') {
      // 检查当前步骤是否有选项需要显示
      if (newCurrentStep.choices && newCurrentStep.choices.length > 0) {
        // 如果有选项，不结束对话，让UI显示选项
        console.log('对话结束，但有选项需要显示');
        return true;
      } else {
        // 没有选项，正常结束对话
        this.endDialogue();
        return false;
      }
    }

    return true;
  }

  public endDialogue(): void {
    if (this.currentDialogueState) {
      // 应用对话结束时的效果
      this.applyDialogueEffects(this.currentDialogueState.currentDialogue.effects || []);
      this.currentDialogueState = null;
      
      // 通知GameManager对话结束
      if (this.onDialogueEndCallback) {
        this.onDialogueEndCallback();
      }
    }
  }

  // 设置效果应用回调
  private effectCallback: ((effects: DialogueEffect[]) => void) | null = null;

  public setEffectCallback(callback: (effects: DialogueEffect[]) => void): void {
    this.effectCallback = callback;
  }

  private applyDialogueEffects(effects: DialogueEffect[]): void {
    if (this.effectCallback) {
      this.effectCallback(effects);
    } else {
      effects.forEach(effect => {
        console.log('应用对话效果:', effect);
      });
    }
  }

  // 计算对话气泡位置
  public calculateBubblePosition(
    objectPosition: { x: number; y: number },
    text: string,
    speaker: 'object' | 'cat',
    screenWidth: number = 1280,
    screenHeight: number = 720
  ): DialogueBubblePosition {
    const textWidth = text.length * 8; // 估算文本宽度
    const bubbleWidth = Math.min(textWidth + 40, 300);
    const bubbleHeight = 80;

    let x = objectPosition.x;
    let y = objectPosition.y;
    let anchor: 'left' | 'right' | 'center' = 'center';
    let direction: 'up' | 'down' | 'left' | 'right' = 'up';

    // 根据物体位置决定气泡方向
    if (objectPosition.x < screenWidth / 3) {
      // 物体在左侧，气泡向右
      x = objectPosition.x + 50;
      anchor = 'left';
      direction = 'right';
    } else if (objectPosition.x > screenWidth * 2 / 3) {
      // 物体在右侧，气泡向左
      x = objectPosition.x - 50;
      anchor = 'right';
      direction = 'left';
    } else {
      // 物体在中间，气泡向上或向下
      if (objectPosition.y > screenHeight / 2) {
        y = objectPosition.y - 50;
        direction = 'up';
      } else {
        y = objectPosition.y + 50;
        direction = 'down';
      }
    }

    // 确保气泡不超出屏幕边界
    if (x - bubbleWidth / 2 < 10) {
      x = bubbleWidth / 2 + 10;
      anchor = 'left';
    } else if (x + bubbleWidth / 2 > screenWidth - 10) {
      x = screenWidth - bubbleWidth / 2 - 10;
      anchor = 'right';
    }

    if (y - bubbleHeight / 2 < 10) {
      y = bubbleHeight / 2 + 10;
    } else if (y + bubbleHeight / 2 > screenHeight - 10) {
      y = screenHeight - bubbleHeight / 2 - 10;
    }

    return { x, y, anchor, direction };
  }

  // 检查对话条件
  public checkDialogueConditions(conditions: DialogueCondition[], gameState: GameState): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'energy':
          return this.checkCondition(gameState.energy, condition.operator, condition.value);
        case 'inventory':
          return this.checkCondition(gameState.inventory.includes(condition.value), condition.operator, true);
        case 'story_flag':
          return this.checkCondition(gameState.storyFlags.get(condition.value), condition.operator, condition.value);
        case 'room_visited':
          return this.checkCondition(gameState.visitedRooms.has(condition.value), condition.operator, true);
        case 'action_completed':
          return this.checkCondition(gameState.completedActions.has(condition.value), condition.operator, true);
        default:
          return true;
      }
    });
  }

  private checkCondition(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'gte':
        return actual >= expected;
      case 'lte':
        return actual <= expected;
      case 'eq':
        return actual === expected;
      case 'ne':
        return actual !== expected;
      case 'has':
        return actual === true || actual === expected;
      case 'not_has':
        return actual !== true && actual !== expected;
      default:
        return true;
    }
  }

  // 处理特殊动作
  private handleSpecialAction(action: string): void {
    switch (action) {
      case 'start_battle':
        this.startBattle();
        break;
      default:
        console.log('未知的特殊动作:', action);
    }
  }

  // 开始战斗
  private startBattle(): void {
    // 触发战斗开始事件
    const event = new CustomEvent('start_battle', {
      detail: {
        enemyId: this.currentDialogueState?.objectId || 'sofa_north',
        enemyName: this.currentDialogueState?.objectName || '沙发',
        enemyImage: 'room_b_bed',
        playerImage: 'balcony_robot_cleaner',
        returnScene: 'LivingRoomNorthScene',
        returnObjectId: this.currentDialogueState?.objectId || 'sofa_north'
      }
    });
    window.dispatchEvent(event);
  }
} 