import { IUIComponent } from './IUIComponent';
import { DialogueBubble } from './DialogueBubble';
import { DialogueChoices } from './DialogueChoices';
import { DialogueBubblePosition } from '../../types/GameState';
import { DialogueManager as CoreDialogueManager } from '../DialogueManager';
import { BaseScene } from '../../scenes/BaseScene';

export class DialogueUIManager implements IUIComponent {
  private scene: BaseScene | null = null;
  private dialogueBubble: DialogueBubble;
  private dialogueChoices: DialogueChoices;
  private coreDialogueManager: CoreDialogueManager | null = null;

  constructor() {
    this.dialogueBubble = new DialogueBubble();
    this.dialogueChoices = new DialogueChoices();
  }

  initialize(scene: BaseScene): void {
    this.scene = scene;
    this.dialogueBubble.initialize(scene);
    this.dialogueChoices.initialize(scene);
    
    // 设置选择回调
    this.dialogueChoices.setChoiceCallback((choiceId: string) => {
      this.onChoiceSelected(choiceId);
    });
  }

  setCoreDialogueManager(dialogueManager: CoreDialogueManager): void {
    this.coreDialogueManager = dialogueManager;
  }

  private onChoiceSelected(choiceId: string): void {
    console.log('选择对话选项:', choiceId);
    if (this.coreDialogueManager) {
      this.coreDialogueManager.nextStep(choiceId);
      this.dialogueChoices.hideChoices();
      this.dialogueBubble.hideAllBubbles(); // 隐藏当前的气泡
      this.updateDialogueDisplay();
    }
  }

  updateDialogueDisplay(): void {
    console.log('DialogueUIManager.updateDialogueDisplay 被调用');
    if (!this.coreDialogueManager) {
      console.error('coreDialogueManager 不存在！');
      return;
    }

    const currentState = this.coreDialogueManager.getCurrentDialogueState();
    console.log('当前对话状态:', currentState);
    if (!currentState) {
      console.log('没有当前对话状态，隐藏所有对话元素');
      this.dialogueBubble.hideAllBubbles();
      this.dialogueChoices.hideChoices();
      return;
    }

    const currentStep = this.coreDialogueManager.getCurrentStep();
    console.log('当前对话步骤:', currentStep);
    if (!currentStep) {
      console.error('没有当前对话步骤！');
      return;
    }

    console.log(`显示对话: ${currentStep.speaker} - ${currentStep.text}`);

    // 显示当前对话步骤的气泡
    if (currentStep.speaker === 'object') {
      const objectPosition = this.coreDialogueManager.calculateBubblePosition(
        currentState.objectPosition,
        currentStep.text,
        'object'
      );
      console.log('物体气泡位置:', objectPosition);
      this.dialogueBubble.showBubble('object', currentStep.text, objectPosition, 'object', 0); // 不自动消失
      
      // 更新对话状态中的最后一个气泡位置
      currentState.lastBubblePosition = objectPosition;
      
    } else if (currentStep.speaker === 'system') {
      // 系统消息，显示在屏幕中央
      const systemPosition = { x: 640, y: 360 };
      const systemBubblePosition = this.coreDialogueManager.calculateBubblePosition(
        systemPosition,
        currentStep.text,
        'object'
      );
      console.log('系统气泡位置:', systemBubblePosition);
      this.dialogueBubble.showBubble('system', currentStep.text, systemBubblePosition, 'object', 0);
      
      // 更新对话状态中的最后一个气泡位置
      currentState.lastBubblePosition = systemBubblePosition;
      
    } else if (currentStep.speaker === 'cat') {
      // 猫的对话气泡
      const catPosition = { x: 640, y: 600 }; // 猫的默认位置
      const catBubblePosition = this.coreDialogueManager.calculateBubblePosition(
        catPosition,
        currentStep.text,
        'cat'
      );
      console.log('猫气泡位置:', catBubblePosition);
      this.dialogueBubble.showBubble('cat', currentStep.text, catBubblePosition, 'cat', 0); // 不自动消失
      
      // 更新对话状态中的最后一个气泡位置
      currentState.lastBubblePosition = catBubblePosition;
    } else if (currentStep.speaker === 'thought') {
      // 猫的想法气泡
      const thoughtId = `thought_${currentState.objectId || 'unknown'}`;
      const x = 1280 - 200; // 右下角位置
      const y = 720 - 100;
      const uiManager = (this.scene as any)?.uiManager;
      console.log('uiManager', uiManager);
      uiManager.showThought(thoughtId, currentStep.text, x, y, 3000);
    }

    // 检查当前步骤是否有选项需要显示
    if (currentStep.choices && currentStep.choices.length > 0) {
      console.log('当前步骤有选项，显示选项框');
      // 使用最后一个气泡位置来显示选项框
      if (currentState.lastBubblePosition) {
        this.dialogueChoices.showChoices(currentStep.choices, currentState.lastBubblePosition);
      }
    }

    // 处理自动进入下一步的情况
    if (currentStep.autoNext && !currentStep.choices) {
      console.log('自动进入下一步，2秒后执行');
      // 自动进入下一步
      this.scene!.time.delayedCall(2000, () => {
        console.log('自动进入下一步');
        // 检查对话是否还在进行
        if (this.coreDialogueManager?.getCurrentDialogueState()) {
          this.coreDialogueManager!.nextStep();
          this.updateDialogueDisplay();
        }
      });
    }
  }

  show(): void {
    // 对话管理器不需要统一的显示方法
  }

  hide(): void {
    this.dialogueBubble.hideAllBubbles();
    this.dialogueChoices.hideChoices();
  }

  destroy(): void {
    this.dialogueBubble.destroy();
    this.dialogueChoices.destroy();
  }
} 