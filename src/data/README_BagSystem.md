# 背包系统设计文档

## 概述

背包系统是一个完整的物品管理系统，包含物品注册、UI显示、条件检查和效果应用等功能。系统设计参考了 `LogPage` 的架构，提供了类似的用户体验。

## 核心组件

### 1. BagRegistry.ts - 物品注册表

负责管理所有物品的信息，包括：
- 物品基本信息（名称、描述、类型、稀有度）
- 物品效果（使用后产生的效果）
- 使用条件（满足什么条件才能使用）
- 获取方式（从哪些动作可以获得）
- 使用场景（在哪些房间可以使用）

#### 主要功能：
- `registerItem()` - 注册新物品
- `getItem()` - 获取物品信息
- `getAllItems()` - 获取所有物品
- `canUseItem()` - 检查物品使用条件
- `getItemCount()` - 获取物品数量
- `getInventoryStats()` - 获取背包统计信息

#### 物品类型：
- `consumable` - 消耗品（使用后消失）
- `tool` - 工具（可重复使用）
- `material` - 材料（用于制作或特殊用途）
- `toy` - 玩具（用于娱乐）
- `special` - 特殊物品（剧情相关）

#### 稀有度等级：
- `common` - 普通（白色）
- `uncommon` - 优秀（绿色）
- `rare` - 稀有（蓝色）
- `epic` - 史诗（紫色）
- `legendary` - 传说（橙色）

### 2. BagPage.ts - 背包界面

仿照 `LogPage` 设计的背包浮窗界面，提供：
- 物品列表显示（分页）
- 物品详细信息（名称、类型、稀有度、描述、数量）
- 使用条件显示
- 物品选择和操作（使用、丢弃）
- 稀有度颜色区分

#### 界面特性：
- 响应式设计，支持分页浏览
- 物品选择高亮显示
- 条件不满足时按钮禁用
- 稀有度背景色区分
- 堆叠数量显示

## 数据设计

### 物品数据结构

```typescript
interface Item {
  id: string;                    // 物品唯一标识
  name: string;                  // 物品名称
  description: string;           // 物品描述
  type: 'consumable' | 'tool' | 'material' | 'toy' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  effects: ItemEffect[];         // 使用效果
  conditions: ItemCondition[];   // 使用条件
  maxStack: number;              // 最大堆叠数量
  icon?: string;                 // 图标路径（可选）
  obtainableFrom: string[];      // 获取来源动作
  usableIn: string[];           // 可使用场景
}
```

### 效果系统

```typescript
interface ItemEffect {
  type: 'hunger' | 'energy' | 'story_flag' | 'inventory' | 'room_access' | 'achievement';
  value: any;                    // 效果值
  operation: 'add' | 'remove' | 'set' | 'modify';
  duration?: number;             // 持续时间（可选）
}
```

### 条件系统

```typescript
interface ItemCondition {
  type: 'hunger' | 'energy' | 'inventory' | 'story_flag' | 'room_visited' | 'action_completed';
  operator: 'gte' | 'lte' | 'eq' | 'ne' | 'has' | 'not_has';
  value: any;                    // 条件值
}
```

## 与 ActionRegistry 的集成

### 物品来源设计

物品通过 `ActionRegistry` 中的 `effects` 字段获得：

```typescript
// 在 ActionRegistry.ts 中
this.registerAction({
  id: 'rummage',
  name: '翻找',
  effects: [
    { type: 'inventory', value: 'cat_food', operation: 'add' },
    { type: 'inventory', value: 'toy_mouse', operation: 'add' }
  ],
  conditions: []
});
```

### 条件影响设计

物品的 `conditions` 会影响 `ActionRegistry` 中的动作执行：

```typescript
// 在 ActionRegistry.ts 中
this.registerAction({
  id: 'unlock_door',
  name: '解锁门',
  effects: [],
  conditions: [
    { type: 'inventory', operator: 'has', value: 'key' }
  ]
});
```

## 使用示例

### 1. 基本初始化

```typescript
import { BagRegistry } from './data/BagRegistry';
import { ActionRegistry } from './data/ActionRegistry';
import { BagPage } from './core/ui/BagPage';

// 创建注册表
const actionRegistry = new ActionRegistry();
const bagRegistry = new BagRegistry(actionRegistry);

// 初始化UI
const bagPage = new BagPage();
bagPage.initialize(scene);
bagPage.setBagRegistry(bagRegistry);
bagPage.setGameState(gameState);
```

### 2. 显示背包

```typescript
// 显示背包界面
bagPage.show();

// 隐藏背包界面
bagPage.hide();
```

### 3. 物品管理

```typescript
// 添加物品
gameState.inventory.push('cat_food');

// 移除物品
const index = gameState.inventory.indexOf('cat_food');
if (index > -1) {
  gameState.inventory.splice(index, 1);
}

// 检查物品使用条件
const canUse = bagRegistry.canUseItem('key', gameState);

// 获取物品信息
const itemInfo = bagRegistry.getItem('key');
```

### 4. 在 UIManager 中集成

```typescript
// 在 UIManager 中设置背包
uiManager.setupBagPage(bagRegistry, gameState);

// 显示背包
uiManager.showBagPage();
```

## 扩展建议

### 1. 物品图标系统
- 为每个物品添加图标资源
- 在 `BagPage` 中显示物品图标
- 支持不同稀有度的图标边框

### 2. 物品分类系统
- 按类型、稀有度等分类显示
- 添加筛选和排序功能
- 支持搜索功能

### 3. 物品使用动画
- 为物品使用添加动画效果
- 支持物品使用音效
- 添加使用反馈提示

### 4. 物品合成系统
- 支持多个物品合成新物品
- 添加合成配方管理
- 实现合成界面

### 5. 物品交易系统
- 支持物品丢弃和拾取
- 添加物品交易功能
- 实现物品分享机制

## 注意事项

1. **性能优化**：大量物品时考虑虚拟滚动
2. **数据一致性**：确保 `GameState` 中的 `inventory` 与 `BagRegistry` 同步
3. **错误处理**：添加物品不存在、条件不满足等错误处理
4. **本地化**：支持多语言物品名称和描述
5. **存档兼容**：确保物品数据在游戏存档中正确保存和加载 