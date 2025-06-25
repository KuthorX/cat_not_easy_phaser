export interface HelpSection {
  id: string;
  title: string;
  content: string;
  category: 'controls' | 'gameplay' | 'story' | 'tips';
}

export class HelpManager {
  private helpSections: Map<string, HelpSection> = new Map();

  constructor() {
    this.initializeHelpSections();
  }

  private initializeHelpSections(): void {
    // 控制说明
    this.addHelpSection({
      id: 'controls',
      title: '游戏控制',
      category: 'controls',
      content: `
🎮 基本控制：
• 鼠标点击 - 与对象交互
• I键 - 打开/关闭物品栏
• ESC键 - 隐藏菜单
• 数字键1-4 - 快速执行动作

🖱️ 交互操作：
• 点击红色区域 - 切换房间
• 点击对象 - 查看可执行动作
• 点击动作 - 执行相应操作
      `.trim()
    });

    // 游戏玩法
    this.addHelpSection({
      id: 'gameplay',
      title: '游戏玩法',
      category: 'gameplay',
      content: `
🐱 游戏目标：
• 探索房子的各个房间
• 与各种对象交互
• 完成不同的动作
• 解锁成就
• 尝试逃跑获得自由

⏰ 时间系统：
• 游戏时间会随着动作推进
• 主人会在特定时间回来
• 合理分配时间和精力

💡 状态管理：
• 饥饿值 - 需要进食维持
• 精力值 - 需要休息恢复
• 物品栏 - 收集的物品
• 成就 - 完成特殊目标
      `.trim()
    });

    // 故事背景
    this.addHelpSection({
      id: 'story',
      title: '故事背景',
      category: 'story',
      content: `
📖 故事背景：
你是一只家猫，生活在一个房子里。
每天主人出门后，你就有机会探索整个房子，
与各种对象交互，体验猫咪的日常生活。

🏠 房间介绍：
• 客厅 - 主要的活动区域
• 主人房间 - 充满主人的气味
• 阳台 - 可以看到外面的世界
• 过道 - 连接各个房间

🎯 主要剧情：
• 探索房子的各个角落
• 与玩具和家具互动
• 尝试破坏一些物品
• 最终目标是获得自由
      `.trim()
    });

    // 游戏技巧
    this.addHelpSection({
      id: 'tips',
      title: '游戏技巧',
      category: 'tips',
      content: `
💡 游戏技巧：

1. 探索顺序：
   • 从客厅开始探索
   • 逐步解锁新房间
   • 注意房间间的连接

2. 动作策略：
   • 合理分配饥饿和精力
   • 优先完成重要动作
   • 尝试不同的动作组合

3. 成就解锁：
   • 完成所有房间的探索
   • 尝试破坏各种物品
   • 执行特殊动作组合

4. 逃跑路线：
   • 找到前门位置
   • 解锁门禁系统
   • 成功逃离房子

🎮 隐藏内容：
• 某些动作需要特定条件
• 探索所有房间发现秘密
• 尝试不同的动作顺序
      `.trim()
    });

    // 房间指南
    this.addHelpSection({
      id: 'rooms',
      title: '房间指南',
      category: 'gameplay',
      content: `
🏠 房间详细指南：

客厅北向：
• 北窗 - 晒太阳恢复精力
• 沙发 - 休息和抓挠

客厅西向低处：
• 笼子 - 攻击解锁高处
• 猫厕所 - 基本需求
• 猫别墅 - 玩耍消耗饥饿

客厅西向高处：
• 鱼干 - 重要的食物来源

客厅东向：
• 衣柜 - 探索发现秘密
• 猫吊床 - 舒适的休息处

主人房间：
• 玩具老鼠 - 玩耍和携带
• 显示屏 - 破坏目标
• 主人的床 - 最佳休息处

阳台：
• 户外探索 - 全屋跑酷

门口区域：
• 前门 - 通向自由的关键
• 门外 - 最终目标
      `.trim()
    });
  }

  public addHelpSection(section: HelpSection): void {
    this.helpSections.set(section.id, section);
  }

  public getHelpSection(id: string): HelpSection | null {
    return this.helpSections.get(id) || null;
  }

  public getAllHelpSections(): HelpSection[] {
    return Array.from(this.helpSections.values());
  }

  public getHelpSectionsByCategory(category: string): HelpSection[] {
    return Array.from(this.helpSections.values())
      .filter(section => section.category === category);
  }

  public getHelpContent(): string {
    const sections = this.getAllHelpSections();
    return sections.map(section => 
      `## ${section.title}\n\n${section.content}\n`
    ).join('\n');
  }
} 