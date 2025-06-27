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

export class DialogueManager {
  private dialogues: Map<string, Dialogue> = new Map();
  private currentDialogueState: DialogueState | null = null;
  private dialogueHistory: any[] = [];

  constructor() {
    this.initializeDialogues();
  }

  private initializeDialogues(): void {
    // 初始化所有对话
    this.registerDialogue({
      id: 'sofa_conversation',
      objectId: 'sofa_north',
      objectName: '沙发',
      steps: [
        {
          id: 'sofa_greeting',
          speaker: 'object',
          text: '嘿，小猫咪！我是沙发，你的老朋友。',
          autoNext: true,
          nextStep: 'cat_response'
        },
        {
          id: 'cat_response',
          speaker: 'cat',
          text: '喵~ 沙发，我想在你身上睡觉！',
          choices: [
            {
              id: 'sleep_choice',
              text: '睡觉',
              nextStep: 'sofa_sleep_offer',
              effects: [
                { type: 'energy', value: 2, operation: 'add' }
              ]
            },
            {
              id: 'scratch_choice',
              text: '抓沙发',
              nextStep: 'sofa_scratch_reaction',
              effects: [
                { type: 'story_flag', value: 'sofa_damaged', operation: 'set' }
              ]
            }
          ]
        },
        {
          id: 'sofa_sleep_offer',
          speaker: 'object',
          text: '当然可以！我的怀抱永远为你敞开。',
          autoNext: true,
          nextStep: 'cat_sleep_response'
        },
        {
          id: 'cat_sleep_response',
          speaker: 'cat',
          text: '谢谢沙发！我要好好睡一觉~',
          autoNext: true,
          nextStep: 'end'
        },
        {
          id: 'sofa_scratch_reaction',
          speaker: 'object',
          text: '哎呀！你这个小调皮，又抓我了！',
          autoNext: true,
          nextStep: 'cat_scratch_response'
        },
        {
          id: 'cat_scratch_response',
          speaker: 'cat',
          text: '嘿嘿，抓沙发的感觉太爽了！',
          autoNext: true,
          nextStep: 'end'
        }
      ]
    });

    this.registerDialogue({
      id: 'cage_conversation',
      objectId: 'cat_cage',
      objectName: '笼子',
      steps: [
        {
          id: 'cage_greeting',
          speaker: 'object',
          text: '哼！我是笼子，你休想破坏我！',
          autoNext: true,
          nextStep: 'cat_cage_response'
        },
        {
          id: 'cat_cage_response',
          speaker: 'cat',
          text: '我要自由！我要破坏你！',
          choices: [
            {
              id: 'attack_choice',
              text: '攻击笼子',
              nextStep: 'cage_damaged',
              effects: [
                { type: 'story_flag', value: 'cage_damaged', operation: 'set' },
                { type: 'energy', value: 1, operation: 'remove' }
              ]
            },
            {
              id: 'jump_choice',
              text: '跳到笼子上',
              nextStep: 'cage_jump',
              conditions: [
                { type: 'story_flag', operator: 'eq', value: 'cage_damaged' }
              ]
            }
          ]
        },
        {
          id: 'cage_damaged',
          speaker: 'object',
          text: '啊！你这个小恶魔！我受伤了！',
          autoNext: true,
          nextStep: 'cat_victory'
        },
        {
          id: 'cat_victory',
          speaker: 'cat',
          text: '哈哈！我成功了！',
          autoNext: true,
          nextStep: 'end'
        },
        {
          id: 'cage_jump',
          speaker: 'object',
          text: '哼！就算我受伤了，你也不能这样对我！',
          autoNext: true,
          nextStep: 'cat_jump_response'
        },
        {
          id: 'cat_jump_response',
          speaker: 'cat',
          text: '我就是要跳！',
          autoNext: true,
          nextStep: 'end'
        }
      ]
    });

    this.registerDialogue({
      id: 'litter_box_conversation',
      objectId: 'cat_litter_box',
      objectName: '猫厕所',
      steps: [
        {
          id: 'litter_greeting',
          speaker: 'object',
          text: '我是猫厕所，你的私人空间。',
          autoNext: true,
          nextStep: 'cat_litter_response'
        },
        {
          id: 'cat_litter_response',
          speaker: 'cat',
          text: '我需要方便一下...',
          choices: [
            {
              id: 'use_choice',
              text: '使用厕所',
              nextStep: 'litter_use',
              conditions: [
                { type: 'hunger', operator: 'gte', value: 4 }
              ],
              effects: [
                { type: 'energy', value: 1, operation: 'add' }
              ]
            },
            {
              id: 'refuse_choice',
              text: '拒绝',
              nextStep: 'litter_refuse'
            }
          ]
        },
        {
          id: 'litter_use',
          speaker: 'object',
          text: '好的，请便。我会保持清洁的。',
          autoNext: true,
          nextStep: 'cat_thanks'
        },
        {
          id: 'cat_thanks',
          speaker: 'cat',
          text: '谢谢！感觉好多了~',
          autoNext: true,
          nextStep: 'end'
        },
        {
          id: 'litter_refuse',
          speaker: 'object',
          text: '没关系，什么时候需要都可以。',
          autoNext: true,
          nextStep: 'end'
        }
      ]
    });
  }

  public registerDialogue(dialogue: Dialogue): void {
    this.dialogues.set(dialogue.id, dialogue);
  }

  public getDialogue(dialogueId: string): Dialogue | null {
    return this.dialogues.get(dialogueId) || null;
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
      if (nextStepIndex !== -1) {
        this.currentDialogueState.currentStep = nextStepIndex;
      }
    }

    // 检查是否结束对话
    const newCurrentStep = this.getCurrentStep();
    if (newCurrentStep && newCurrentStep.nextStep === 'end') {
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

  // 计算猫的对话气泡位置（相对于物体气泡）
  public calculateCatBubblePosition(
    objectBubblePosition: DialogueBubblePosition,
    catPosition: { x: number; y: number },
    text: string,
    screenWidth: number = 1280,
    screenHeight: number = 720
  ): DialogueBubblePosition {
    const textWidth = text.length * 8;
    const bubbleWidth = Math.min(textWidth + 40, 300);
    const bubbleHeight = 80;

    let x = catPosition.x;
    let y = catPosition.y;
    let anchor: 'left' | 'right' | 'center' = 'center';
    let direction: 'up' | 'down' | 'left' | 'right' = 'up';

    // 根据物体气泡位置决定猫气泡位置
    if (objectBubblePosition.direction === 'right') {
      // 物体气泡向右，猫气泡在下方
      x = objectBubblePosition.x;
      y = objectBubblePosition.y + 100;
      direction = 'up';
    } else if (objectBubblePosition.direction === 'left') {
      // 物体气泡向左，猫气泡在下方
      x = objectBubblePosition.x;
      y = objectBubblePosition.y + 100;
      direction = 'up';
    } else {
      // 物体气泡向上或向下，猫气泡在旁边
      if (objectBubblePosition.x < screenWidth / 2) {
        x = objectBubblePosition.x + 150;
        anchor = 'left';
        direction = 'left';
      } else {
        x = objectBubblePosition.x - 150;
        anchor = 'right';
        direction = 'right';
      }
      y = objectBubblePosition.y;
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
        case 'hunger':
          return this.checkCondition(gameState.hunger, condition.operator, condition.value);
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
} 