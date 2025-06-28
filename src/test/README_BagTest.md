# 背包系统测试说明

## 概述

这个测试文件用于验证背包系统的基本功能是否正常工作。

## 测试内容

### 1. 物品注册测试
- 验证所有物品是否正确注册到 `BagRegistry` 中
- 显示注册的物品数量和基本信息

### 2. 物品获取测试
- 测试通过物品ID获取物品信息
- 验证不存在的物品返回null

### 3. 背包统计测试
- 测试背包中物品的统计功能
- 显示物品数量和最大堆叠信息

### 4. 物品条件测试
- 测试物品使用条件的检查
- 验证条件系统是否正常工作

### 5. 物品效果测试
- 测试物品效果的定义和获取
- 显示物品的效果信息

### 6. 稀有度颜色测试
- 测试不同稀有度的颜色显示
- 验证颜色系统是否正常

## 使用方法

### 在浏览器中运行测试

1. 打开游戏页面
2. 打开浏览器开发者工具（F12）
3. 在控制台中运行：
   ```javascript
   window.runBagSystemTest()
   ```

### 在代码中运行测试

```typescript
import { BagSystemTest } from './test/BagSystemTest';

const test = new BagSystemTest();
test.runAllTests();
```

## 预期输出

测试运行后，控制台应该显示类似以下的输出：

```
=== 背包系统测试开始 ===

--- 测试物品注册 ---
注册的物品数量: 10
- 猫粮 (consumable, common)
- 鱼干 (consumable, uncommon)
- 牛奶 (consumable, common)
- 玩具老鼠 (toy, common)
- 咬绳 (toy, common)
- 小球 (toy, common)
- 钥匙 (tool, rare)
- 防御材料 (material, epic)
- 邻居猫的毛 (special, legendary)
- 主人的气味 (special, rare)

--- 测试物品获取 ---
猫粮: 猫粮
钥匙: 钥匙
不存在的物品: 未找到

--- 测试背包统计 ---
背包中的物品种类: 3
- 猫粮 x2 (最大堆叠: 10)
- 玩具老鼠 x1 (最大堆叠: 3)
- 钥匙 x1 (最大堆叠: 1)

--- 测试物品条件 ---
可以使用猫粮: true
可以使用钥匙: true

--- 测试物品效果 ---
猫粮效果: 1 个
  - hunger: add 2

--- 测试稀有度颜色 ---
common: #FFFFFF
uncommon: #1EFF00
rare: #0070DD
epic: #A335EE
legendary: #FF8000

=== 背包系统测试完成 ===
```

## 故障排除

### 如果测试失败

1. **检查控制台错误**：查看是否有JavaScript错误
2. **验证导入**：确保所有必要的模块都正确导入
3. **检查游戏状态**：确保游戏状态包含必要的属性（如 `hunger`）
4. **验证注册表**：确保 `BagRegistry` 和 `ActionRegistry` 正确初始化

### 常见问题

1. **物品未找到**：检查物品ID是否正确
2. **条件检查失败**：验证游戏状态是否包含必要的属性
3. **颜色显示异常**：检查稀有度值是否正确

## 扩展测试

如果需要测试更多功能，可以在 `BagSystemTest` 类中添加新的测试方法：

```typescript
private testCustomFunction(): void {
  console.log('\n--- 自定义测试 ---');
  // 添加自定义测试逻辑
}
```

然后在 `runAllTests()` 方法中调用它。 