# 数据库模块 (Database Module)

灵枢排盘 - SQLite 数据层，支持离线易经知识库。

---

## 目录

- [快速开始](#快速开始)
- [表结构](#表结构)
- [API 参考](#api-参考)
- [查询示例](#查询示例)
- [测试](#测试)

---

## 快速开始

### 初始化

```ts
import { db } from './index';

await db.init(); // 自动创建表并注入种子数据
```

`db.init()` 在首次调用时：
- 创建所有表（历史记录、设置、易经知识库）
- 插入种子数据（八卦、六十四卦、爻辞、六爻解读）
- 后续调用直接返回（幂等）

### 查询模块

```ts
import { yijingQueries, liuyaoQueries } from './index';
```

---

## 表结构

### 核心表

| 表名 | 描述 |
|------|------|
| `history` | 排盘历史记录 |
| `settings` | 用户设置 |
| `eight_ga` | 八卦（8 条） |
| `hexagrams` | 六十四卦（64 条） |
| `yao_shi` | 爻辞（384 条） |
| `liuyao_interpretation` | 六爻解读库（458 条） |

### `liuyao_interpretation` 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | TEXT | 原始数据 ID（来自 lunarPHP） |
| `hexagram_name` | TEXT | 卦名（如：天风姤） |
| `scenario` | TEXT | 场景（婚姻、事业、健康、考试…） |
| `target` | TEXT | 目标类型：`hexagram` 或 `yao_1`–`yao_6` |
| `yao_condition` | TEXT \| null | 动爻数字（1-6）或 null |
| `content` | TEXT | HTML 格式的详细解读 |
| `search_text` | TEXT | 组合全文检索字段 |
| `created_at` | INTEGER | 记录创建时间戳 |

**索引**：
- `idx_liuyao_hexagram`（hexagram_name）
- `idx_liuyao_scenario`（scenario）
- `idx_liuyao_target`（target）
- `idx_liuyao_search`（search_text）

---

## API 参考

### History Queries

```ts
import { getRecentRecords, getStatistics, searchHistory } from './queries/history';
```

- `getRecentRecords(limit: number)` → 最近排盘记录
- `getStatistics()` → 总数、收藏数统计
- `searchHistory(query: string, limit?)` → 关键词搜索

### Yijing Queries

```ts
import { YijingQueries } from './queries/yijing';
```

- `getAllHexagrams()` → 64 卦列表
- `getHexagramByName(name)` → 按卦名查询
- `getHexagramByNumber(num)` → 按卦序查询
- `getYaoByHexagram(hexagramId)` → 查询爻辞
- `searchYijing(query)` → 全文检索（卦名、爻辞）

### LiuYao Queries

```ts
import { LiuyaoQueries } from './queries/liuyao';
```

- `search(query: string, limit?)` → 全文搜索（卦名+场景+目标）
- `findByHexagram(hexagramName)` → 某卦的所有解读
- `findByScenario(scenario)` → 按场景筛选
- `findByCondition(hexagramName, yaoCondition)` → 特定卦+爻动组合
- `listScenarios()` → 所有可用场景列表

---

## 查询示例

### 示例 1：搜索包含“男命”的解读

```ts
const results = await liuyaoQueries.search('男命');
console.log(results.length); // 输出匹配条数
```

### 示例 2：查看“天风姤”卦在所有场景下的解读

```ts
const readings = await liuyaoQueries.findByHexagram('天风姤');
readings.forEach(r => {
  console.log(`${r.scenario} · ${r.target}`);
});
```

### 示例 3：筛选“婚姻”相关解读

```ts
const marriage = await liuyaoQueries.findByScenario('婚姻');
```

### 示例 4：查询特定爻动条件

```ts
// 查询“坎卦 第 3 爻动”的解读
const specific = await liuyaoQueries.findByCondition('坎卦', '3');
```

---

## 测试

内置测试页面：`YijingTestScreen`

1. **注册路由**（已默认在 App.tsx 中注册）
   ```tsx
   <Stack.Screen name="YijingTest" component={YijingTestScreen} />
   ```

2. **运行 App** → 首页点击 **📖 易经测试**

3. **测试功能**
   - 默认加载示例数据
   - 按场景按钮筛选
   - 搜索框全文检索
   - 列表显示卦名、场景、目标、内容预览

---

## 数据说明

- 六爻解读库源自 [lunarPHP](https://github.com/jyiL/lunarPHP) 项目 `gua.json`
- 共 **458** 条记录，涵盖：
  - 六十四卦各场景（婚姻、事业、健康、出行、考试、诉讼、合作、购房、经营、子女、择业、男命、女命）
  - 部分包含爻动解读（`1爻动` ~ `6爻动`）
- 内容为 HTML 格式，在 UI 中建议使用 `WebView` 或 Markdown 渲染器展示

---

## 注意事项

1. **首次启动**会自动注入种子数据，耗时约 100–300ms（取决于设备）
2. `liuyao_interpretation` 表数据量大（约 1MB TS + 运行时 SQLite ~5MB），确保 APK 体积预算充足
3. 查询 `search()` 使用 `LIKE` 模糊匹配，数据量大时建议限制 `limit` 或使用 FTS（未来可升级）

---

## 文件结构

```
src/database/
├── Database.ts          # 单例类，表创建与种子注入
├── schema-yijing.ts     # 易经表结构
├── seeds/
│   ├── eight-ga.ts
│   ├── hexagram-seeds.ts
│   └── liuyao-interpretation-seeds.ts  (458 条)
├── queries/
│   ├── yijing.ts
│   ├── liuyao.ts
│   └── history.ts
└── index.ts             # 统一导出
```

---

## License

MIT
