# 数据库集成完整指南

## 概述

本指南面向开发人员，说明如何在 `divination-app` 项目中正确使用 SQLite 数据库模块，包括初始化、增删改查、易经知识库查询以及数据迁移。

---

## 1. 模块结构

```
src/database/
├── Database.ts            # 单例类，管理连接、事务、种子注入
├── schema.ts              # 历史记录、设置表结构
├── schema-yijing.ts       # 易经知识库表结构
├── seeds/                 # 种子数据
│   ├── eight-ga.ts
│   ├── hexagram-seeds.ts
│   └── liuyao-interpretation-seeds.ts
├── queries/               # 查询 API
│   ├── history.ts
│   ├── settings.ts
│   ├── yijing.ts
│   └── liuyao.ts
├── models/
│   ├── DivinationRecord.ts
│   └── Setting.ts
├── index.ts               # 统一导出
└── README.md              # API 速查

```

---

## 2. 初始化

**必须在 App 启动最早阶段调用 `db.init()`**，推荐在 `App.tsx` 的 `useEffect` 中：

```tsx
import { db } from './src/database';

export default function App() {
  useEffect(() => {
    const initDB = async () => {
      try {
        await db.init();
        console.log('✅ Database ready');
      } catch (err) {
        console.error('❌ Database init failed:', err);
      }
    };
    initDB();
  }, []);
```

`db.init()` 行为：
- 首次运行：创建所有表 + 插入种子数据（八卦、64 卦、爻辞、458 条解读）
- 再次运行：直接返回（幂等）
- 返回值：`Promise<void>`

---

## 3. 使用查询模块

所有查询 API 都是单例，直接导入使用：

```ts
import {
  yijingQueries,    // 易经卦爻查询
  liuyaoQueries,    // 六爻解读查询
  getRecentRecords, // 历史记录
  getStatistics,    // 统计
  // ...
} from './src/database';
```

---

## 4. 历史记录 (History)

### 4.1 保存记录

```ts
import { insertRecord } from './src/database/queries/history';
import { DivinationRecord } from './src/database/models/DivinationRecord';

const record: DivinationRecord = {
  createdAt: Date.now(),
  baziType: 'bazi', // 'bazi' | 'liuyao' | 'qimen'
  solarDate: '2026-04-14',
  lunarDate: '庚子年三月初六',
  timePeriod: '子时',
  yearGanzhi: '庚子',
  monthGanzhi: '甲辰',
  dayGanzhi: '丙申',
  hourGanzhi: '戊子',
  wuxingData: JSON.stringify({ wood: 25, fire: 20, earth: 30, metal: 15, water: 10 }),
  shishenData: JSON.stringify(['比肩', '劫财', '食神']),
  location: '北京市',
  timeCorrection: -12,
  aiInterpretation: 'AI 生成的解读文本...',
  userNotes: '',
  isFavorite: 0,
};

const id = await insertRecord(record);
```

### 4.2 查询

```ts
import { getRecentRecords, searchHistory } from './src/database/queries/history';

// 最近 10 条
const recent = await getRecentRecords(10);

// 搜索
const results = await searchHistory('庚子', 20);

// 统计
import { getStatistics } from './src/database/queries/history';
const { total, favoriteCount } = await getStatistics();
```

### 4.3 更新与删除

```ts
import { updateRecord, deleteRecord, toggleFavorite } from './src/database/queries/history';

await updateRecord(recordId, { userNotes: '重要记录' });
await toggleFavorite(recordId); // 切换收藏
await deleteRecord(recordId);
```

---

## 5. 易经知识库 (Yijing)

### 5.1 查询卦象

```ts
import { yijingQueries } from './src/database';

// 获取所有 64 卦
const all = await yijingQueries.getAllHexagrams();

// 按卦名查询
const hexagram = await yijingQueries.getHexagramByName('乾为天');

// 按卦序查询（1-64）
const hexagram = await yijingQueries.getHexagramByNumber(1);

// 查询爻辞
const yaoLines = await yijingQueries.getYaoByHexagram(hexagramId);
```

### 5.2 全文检索

```ts
// 搜索卦名、卦辞、彖辞、象辞
const results = await yijingQueries.searchYijing('乾卦');
```

---

## 6. 六爻解读库 (LiuYao)

数据源自 [`lunarPHP/gua.json`](https://github.com/jyiL/lunarPHP)，共 **458** 条结构化解读。

### 6.1 查询方法

```ts
import { liuyaoQueries } from './src/database';

// 全文搜索（卦名 + 场景 + 目标）
const results = await liuyaoQueries.search('男命');

// 按卦名查询所有解读
const readings = await liuyaoQueries.findByHexagram('天风姤');

// 按场景筛选（婚姻、事业、健康、考试、出行、诉讼、合作、购房、经营、子女、择业、男命、女命）
const marriage = await liuyaoQueries.findByScenario('婚姻');

// 查询特定组合（卦 + 爻动条件）
const specific = await liuyaoQueries.findByCondition('坎卦', '3'); // 第三爻动

// 列出所有可用场景
const scenarios = await liuyaoQueries.listScenarios();
```

### 6.2 结果字段

```ts
type LiuyaoInterpretation = {
  id: string;           // 原始 ID
  hexagram_name: string;
  scenario: string;     // 场景
  target: 'hexagram' | `yao_${1-6}` | 'general';
  yao_condition: string | null; // "1" ~ "6" 或 null
  content: string;      // HTML 内容
  search_text: string;  // 检索拼接文本
  created_at: number;
};
```

---

## 7. 渲染 HTML 内容

`liuyao_interpretation.content` 存储的是 HTML 片段（包含 `<p>`、`<div>`、`<br>` 等）。在 React Native 中渲染：

### 方案 A：`react-native-render-html`（推荐）

```tsx
import RenderHtml from 'react-native-render-html';

<RenderHtml
  contentWidth={320}
  source={{ html: item.content }}
/>
```

### 方案 B：`WebView`

```tsx
import { WebView } from 'react-native-webview';

<WebView
  originWhitelist={['*']}
  source={{ html: item.content }}
  style={{ height: 200 }}
/>
```

---

## 8. 数据迁移与更新

### 8.1 更新种子数据

如需从 `lunarPHP` 获取最新 `gua.json`：

```bash
# 1. 下载新数据到 ~/Downloads/lunarPHP-master/database/gua.json
# 2. 运行转换脚本
node tools/convert-gua-json.js \
  ~/Downloads/lunarPHP-master/database/gua.json \
  src/database/seeds/liuyao-interpretation-seeds.ts
```

脚本会保留原有的 `id` 字段，避免重复。

### 8.2 数据库升级

当表结构变更时，在 `Database.ts` 的 `createTables()` 中补充新 `CREATE` 语句即可。SQLite 的 `IF NOT EXISTS` 可确保旧版本不报错。

种子数据已设计为幂等插入：`seedIfNeeded()` 会先 `SELECT COUNT(*)`，仅当表为空时才批量插入。

---

## 9. 性能建议

- **分页**：历史记录查询务必使用 `limit` + `offset`
- **索引**：`liuyao_interpretation` 已为 `hexagram_name`、`scenario`、`target`、`search_text` 创建索引
- **搜索**：当前使用 `LIKE '%keyword%'`，数据量大时考虑 FTS5（虚拟表）
- **事务**：批量插入请使用 `executeTransaction`（已有封装）

---

## 10. 测试

运行内置测试页面：

1. 首页 → 滚动底部 → 点击 **📖 易经测试**
2. 默认加载“天风姤”卦解读
3. 使用按钮筛选场景，搜索关键词
4. 查看控制台日志，确认 seed 计数

---

## 11. 故障排查

| 问题 | 可能原因 | 解决 |
|------|----------|------|
| `Database not initialized` | 未调用 `db.init()` | 在 App.tsx 初始化 |
| 种子数据未插入 | `seedIfNeeded()` 捕获到表不存在错误 | 检查 `schema-yijing.ts` 是否导出 `CREATE_XXX` 常量 |
| 查询无结果 | 表为空或条件不匹配 | 确认 `liuyao-interpretation-seeds.ts` 存在且包含数据 |
| 性能慢 | 大表未加索引 | 确认 `CREATE_INDEXES` 已执行 |

---

## 12. 示例完整代码

```tsx
// ResultScreen.tsx - 保存排盘结果并显示相关解读
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { db } from './src/database';
import { insertRecord } from './src/database/queries/history';
import { liuyaoQueries } from './src/database';

export default function ResultScreen() {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    (async () => {
      await db.init();
      // 保存记录
      await insertRecord({
        createdAt: Date.now(),
        baziType: 'bazi',
        // ...
      });
      // 加载解读
      const data = await liuyaoQueries.findByHexagram('乾为天');
      setReadings(data);
    })();
  }, []);

  return (
    <View>
      <Text>解读列表 {readings.length}</Text>
    </View>
  );
}
```

---

**文档版本**: 2026-04-14  
**维护**: 🦐 虾仔
