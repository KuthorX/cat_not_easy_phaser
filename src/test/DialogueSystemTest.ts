import { DialogueManager } from '../core/DialogueManager';
import { DialogueBubblePosition } from '../types/GameState';

export class DialogueSystemTest {
  private dialogueManager: DialogueManager;

  constructor() {
    this.dialogueManager = new DialogueManager();
  }

  public testDialogueSystem(): void {
    console.log('=== 对话系统测试开始 ===');

    // 测试1: 获取对话
    this.testGetDialogue();

    // 测试2: 开始对话
    this.testStartDialogue();

    // 测试3: 对话流程
    this.testDialogueFlow();

    // 测试4: 气泡位置计算
    this.testBubblePositionCalculation();

    console.log('=== 对话系统测试完成 ===');
  }

  private testGetDialogue(): void {
    console.log('测试1: 获取对话');
    
    const sofaDialogue = this.dialogueManager.getDialogue('sofa_conversation');
    if (sofaDialogue) {
      console.log('✓ 成功获取沙发对话');
      console.log(`  对话ID: ${sofaDialogue.id}`);
      console.log(`  物体ID: ${sofaDialogue.objectId}`);
      console.log(`  步骤数量: ${sofaDialogue.steps.length}`);
    } else {
      console.log('✗ 获取沙发对话失败');
    }

    const cageDialogue = this.dialogueManager.getDialogue('cage_conversation');
    if (cageDialogue) {
      console.log('✓ 成功获取笼子对话');
    } else {
      console.log('✗ 获取笼子对话失败');
    }
  }

  private testStartDialogue(): void {
    console.log('测试2: 开始对话');
    
    const success = this.dialogueManager.startDialogue(
      'sofa_conversation',
      'sofa',
      '沙发',
      { x: 400, y: 300 }
    );

    if (success) {
      console.log('✓ 成功开始沙发对话');
      
      const currentState = this.dialogueManager.getCurrentDialogueState();
      if (currentState) {
        console.log(`  当前状态: ${currentState.isActive ? '活跃' : '非活跃'}`);
        console.log(`  当前步骤: ${currentState.currentStep}`);
      }
    } else {
      console.log('✗ 开始沙发对话失败');
    }
  }

  private testDialogueFlow(): void {
    console.log('测试3: 对话流程');
    
    // 开始对话
    this.dialogueManager.startDialogue('sofa_conversation', 'sofa', '沙发', { x: 400, y: 300 });
    
    // 获取第一步
    let currentStep = this.dialogueManager.getCurrentStep();
    if (currentStep) {
      console.log(`✓ 第一步: ${currentStep.speaker} - ${currentStep.text}`);
    }

    // 自动进入下一步
    this.dialogueManager.nextStep();
    currentStep = this.dialogueManager.getCurrentStep();
    if (currentStep) {
      console.log(`✓ 第二步: ${currentStep.speaker} - ${currentStep.text}`);
      console.log(`  选择数量: ${currentStep.choices?.length || 0}`);
    }

    // 选择第一个选项
    if (currentStep?.choices && currentStep.choices.length > 0) {
      const choice = currentStep.choices[0];
      console.log(`✓ 选择: ${choice.text}`);
      
      this.dialogueManager.nextStep(choice.id);
      currentStep = this.dialogueManager.getCurrentStep();
      if (currentStep) {
        console.log(`✓ 选择后: ${currentStep.speaker} - ${currentStep.text}`);
      }
    }

    // 结束对话
    this.dialogueManager.endDialogue();
    const finalState = this.dialogueManager.getCurrentDialogueState();
    if (!finalState) {
      console.log('✓ 对话已正确结束');
    } else {
      console.log('✗ 对话未正确结束');
    }
  }

  private testBubblePositionCalculation(): void {
    console.log('测试4: 气泡位置计算');
    
    // 测试左侧物体
    const leftPosition = this.dialogueManager.calculateBubblePosition(
      { x: 200, y: 300 },
      '这是左侧物体的对话',
      'object'
    );
    console.log(`✓ 左侧物体气泡位置: x=${leftPosition.x}, y=${leftPosition.y}, anchor=${leftPosition.anchor}, direction=${leftPosition.direction}`);

    // 测试右侧物体
    const rightPosition = this.dialogueManager.calculateBubblePosition(
      { x: 1000, y: 300 },
      '这是右侧物体的对话',
      'object'
    );
    console.log(`✓ 右侧物体气泡位置: x=${rightPosition.x}, y=${rightPosition.y}, anchor=${rightPosition.anchor}, direction=${rightPosition.direction}`);

    // 测试中间物体
    const centerPosition = this.dialogueManager.calculateBubblePosition(
      { x: 640, y: 300 },
      '这是中间物体的对话',
      'object'
    );
    console.log(`✓ 中间物体气泡位置: x=${centerPosition.x}, y=${centerPosition.y}, anchor=${centerPosition.anchor}, direction=${centerPosition.direction}`);

    // 测试猫的气泡位置
    const catPosition = this.dialogueManager.calculateCatBubblePosition(
      leftPosition,
      { x: 640, y: 600 },
      '这是猫的回复',
      1280,
      720
    );
    console.log(`✓ 猫气泡位置: x=${catPosition.x}, y=${catPosition.y}, anchor=${catPosition.anchor}, direction=${catPosition.direction}`);
  }

  public runAllTests(): void {
    console.log('=== 对话系统测试开始 ===');
    
    this.testGetDialogue();
    this.testStartDialogue();
    this.testDialogueFlow();
    this.testBubblePositionCalculation();
    this.testCompleteDialogueFlow();
    
    console.log('=== 对话系统测试结束 ===');
  }

  private testCompleteDialogueFlow(): void {
    console.log('测试4: 完整对话流程（包括UI更新）');
    
    // 开始对话
    const success = this.dialogueManager.startDialogue('sofa_conversation', 'sofa', '沙发', { x: 400, y: 300 });
    if (!success) {
      console.log('✗ 开始对话失败');
      return;
    }
    
    console.log('✓ 成功开始对话');
    
    // 获取第一步
    let currentStep = this.dialogueManager.getCurrentStep();
    if (currentStep) {
      console.log(`✓ 第一步: ${currentStep.speaker} - ${currentStep.text}`);
      console.log(`  自动下一步: ${currentStep.autoNext ? '是' : '否'}`);
    }

    // 自动进入下一步
    this.dialogueManager.nextStep();
    currentStep = this.dialogueManager.getCurrentStep();
    if (currentStep) {
      console.log(`✓ 第二步: ${currentStep.speaker} - ${currentStep.text}`);
      console.log(`  选择数量: ${currentStep.choices?.length || 0}`);
      
      if (currentStep.choices && currentStep.choices.length > 0) {
        currentStep.choices.forEach((choice, index) => {
          console.log(`  选择${index + 1}: ${choice.text} (ID: ${choice.id})`);
        });
      }
    }

    // 选择第一个选项
    if (currentStep?.choices && currentStep.choices.length > 0) {
      const choice = currentStep.choices[0];
      console.log(`✓ 选择: ${choice.text}`);
      
      this.dialogueManager.nextStep(choice.id);
      currentStep = this.dialogueManager.getCurrentStep();
      if (currentStep) {
        console.log(`✓ 选择后: ${currentStep.speaker} - ${currentStep.text}`);
        console.log(`  自动下一步: ${currentStep.autoNext ? '是' : '否'}`);
      }
    }

    // 继续自动流程
    while (currentStep && currentStep.autoNext) {
      this.dialogueManager.nextStep();
      currentStep = this.dialogueManager.getCurrentStep();
      if (currentStep) {
        console.log(`✓ 自动下一步: ${currentStep.speaker} - ${currentStep.text}`);
      }
    }

    // 结束对话
    this.dialogueManager.endDialogue();
    const finalState = this.dialogueManager.getCurrentDialogueState();
    if (!finalState) {
      console.log('✓ 对话已正确结束');
    } else {
      console.log('✗ 对话未正确结束');
    }
  }
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  const test = new DialogueSystemTest();
  test.testDialogueSystem();
} 