// 战斗系统测试脚本
export function testBattleSystem() {
  console.log('=== 战斗系统测试开始 ===');
  
  // 测试1: 检查对话步骤是否正确
  console.log('测试1: 检查沙发对话中的战斗选项');
  const sofaDialogue = {
    id: 'sofa_conversation',
    steps: [
      {
        id: 'cat_response',
        choices: [
          { id: 'battle_choice', text: '战斗', nextStep: 'sofa_battle_start' }
        ]
      },
      {
        id: 'sofa_battle_start',
        speaker: 'object',
        text: '什么？你要和我战斗？好吧，那就来吧！',
        autoNext: true,
        nextStep: 'cat_battle_response'
      },
      {
        id: 'cat_battle_response',
        speaker: 'cat',
        text: '喵！我要打败你！',
        autoNext: true,
        nextStep: 'battle_trigger'
      },
      {
        id: 'battle_trigger',
        speaker: 'system',
        text: '战斗开始！',
        autoNext: true,
        nextStep: 'end',
        specialAction: 'start_battle'
      }
    ]
  };
  
  console.log('沙发对话结构:', sofaDialogue);
  console.log('战斗选项存在:', sofaDialogue.steps[0].choices?.some(c => c.id === 'battle_choice'));
  console.log('特殊动作存在:', sofaDialogue.steps[3].specialAction === 'start_battle');
  
  // 测试2: 模拟战斗事件触发
  console.log('\n测试2: 模拟战斗事件触发');
  const mockBattleEvent = new CustomEvent('start_battle', {
    detail: {
      enemyId: 'sofa_north',
      enemyName: '沙发',
      enemyImage: 'room_b_bed',
      playerImage: 'balcony_robot_cleaner',
      returnScene: 'LivingRoomNorthScene',
      returnObjectId: 'sofa_north'
    }
  });
  
  console.log('战斗事件详情:', mockBattleEvent.detail);
  
  // 测试3: 检查战斗动作配置
  console.log('\n测试3: 检查战斗动作配置');
  const battleActions = [
    { id: 'claw_swipe', name: '爪子横扫', successRate: 0.6 },
    { id: 'claw_tear', name: '爪子撕扯', successRate: 0.7 },
    { id: 'bite_hard', name: '用力啃咬', successRate: 0.8 },
    { id: 'sit_squash', name: '屁股坐压', successRate: 0.5 }
  ];
  
  console.log('战斗动作数量:', battleActions.length);
  battleActions.forEach(action => {
    console.log(`- ${action.name}: ${action.successRate * 100}% 成功率`);
  });
  
  // 测试4: 模拟战斗结果
  console.log('\n测试4: 模拟战斗结果');
  const testAction = battleActions[0]; // 爪子横扫
  const random = Math.random();
  const isSuccess = random <= testAction.successRate;
  
  console.log(`选择动作: ${testAction.name}`);
  console.log(`随机数: ${random.toFixed(3)}`);
  console.log(`成功率: ${testAction.successRate}`);
  console.log(`战斗结果: ${isSuccess ? '成功' : '失败'}`);
  
  console.log('\n=== 战斗系统测试完成 ===');
}

// 导出测试函数
export default testBattleSystem; 