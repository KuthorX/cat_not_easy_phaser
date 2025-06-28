# 战斗系统说明

## 概述
战斗系统是一个小游戏模块，允许玩家与游戏中的物体进行战斗交互。

## 功能特性

### 1. 战斗场景 (BattleScene)
- 玩家角色在左侧，敌人角色在右侧
- 底部有四个战斗动作选项：
  - 爪子横扫 (成功率: 60%)
  - 爪子撕扯 (成功率: 70%)
  - 用力啃咬 (成功率: 80%)
  - 屁股坐压 (成功率: 50%)

### 2. 战斗流程
1. 玩家在对话中选择"战斗"选项
2. 进入战斗场景
3. 玩家选择战斗动作
4. 系统随机判定成功或失败
5. 显示战斗结果
6. 返回原场景，根据结果更新物体状态

### 3. 战斗结果
- **成功**: 物体变为损坏状态，显示"破坏成功！"
- **失败**: 物体无变化，显示"破坏失败！"

## 使用方法

### 在对话中添加战斗选项
在 `DialogueRegistry.ts` 中的对话步骤中添加战斗选项：

```typescript
{
  id: 'battle_choice',
  text: '战斗',
  nextStep: 'sofa_battle_start',
  effects: []
}
```

### 添加战斗触发步骤
```typescript
{
  id: 'battle_trigger',
  speaker: 'system',
  text: '战斗开始！',
  autoNext: true,
  nextStep: 'end',
  specialAction: 'start_battle'
}
```

### 在场景中处理战斗事件
在场景类中添加事件监听：

```typescript
protected setupEventListeners(): void {
  super.setupEventListeners();
  
  // 监听战斗开始事件
  window.addEventListener('start_battle', this.onStartBattle.bind(this) as EventListener);
  
  // 监听战斗结束事件
  this.events.on(GameEvents.BATTLE_END, this.onBattleEnd.bind(this));
}
```

## 文件结构
```
src/scenes/mini_game/
├── BattleScene.ts          # 战斗场景主类
└── README.md              # 本说明文档
```

## 注意事项
1. 战斗系统使用现有的图片资源
2. 损坏状态暂时用颜色变化表示
3. 所有玩家输入都是鼠标点击
4. 战斗结果会影响物体的状态和外观 