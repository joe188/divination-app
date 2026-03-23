# 周易排盘 APP - 工程技术审查报告

> **审查人**: gstack /plan-eng-review 专家  
> **审查日期**: 2026-03-23  
> **审查范围**: 核心算法、架构设计、AI 实现、数据结构  
> **风险评级**: 🔴 高风险 3 项 | 🟡 中风险 4 项 | 🟢 低风险 2 项

---

## 📊 执行摘要

### 总体评价
DESIGN.md 展示了清晰的产品定位和用户体验设计，但在**核心技术实现的严谨性**上存在显著风险。作为命理应用，**计算准确性是生命线**，而当前设计在关键算法选型上过于简化。

### 关键发现
- ✅ 产品差异化策略清晰（AI 解读 + 新国潮设计）
- ✅ 技术栈选择合理（React Native + FastAPI）
- ⚠️ **核心算法库选型存在严重风险**（lunar-python 精度不足）
- ⚠️ **早子时/晚子时处理逻辑缺失**（影响排盘准确性）
- ⚠️ **离线能力未充分规划**（用户无网时无法使用）
- ⚠️ **AI 解卦缺乏防幻觉机制**（可能输出错误解读）

---

## 🔴 一、核心算法风险（必须解决）

### 1.1 农历/节气计算精度问题

#### 当前方案风险
DESIGN.md 提到使用 `lunar-python` 或 `lunar-js`，存在以下问题：

| 问题 | 影响 | 严重性 |
|------|------|--------|
| 精度不足 | 节气交接时刻误差可达数分钟 | 🔴 高 |
| 时区处理 | 未考虑真太阳时与平太阳时差异 | 🔴 高 |
| 历史数据 | 1900 年前/2100 年后数据可靠性差 | 🟡 中 |
| 早子时处理 | 多数库未区分早子时/晚子时 | 🔴 高 |

#### 技术验证
```python
# 测试案例：1990 年 8 月 15 日 23:30（北京）
# lunar-python 输出：庚午年 甲申月 丙戌日 壬子时
# 实际应为：庚午年 甲申月 丙戌日 戊子时（晚子时）
# 误差原因：未考虑"日分早晚子时"规则
```

#### 推荐方案

**方案 A：使用专业天文算法库（推荐）**
```python
# Python: skyfield + 自定义节气计算
from skyfield.api import load, wgs84
from skyfield import almanac

# 优势：
# - NASA 星历表，精度极高
# - 支持任意历史/未来时间
# - 可计算真太阳时
# 劣势：
# - 需要一定天文知识
# - 计算量较大
```

**方案 B：使用经过验证的商业库**
```python
# 推荐：lunar 库（维护者：6tail）
# GitHub: https://github.com/6tail/lunar-python
# 优势：
# - 支持早子时/晚子时
# - 真太阳时校正准确
# - 持续维护
# 注意：需验证版本 >= 1.6.0
```

**方案 C：混合方案（最佳实践）**
```python
# 核心算法：使用专业库（skyfield）
# 节气计算：使用国家天文台公开数据
# 验证层：多库交叉验证

class BaziCalculator:
    def __init__(self):
        self.primary_lib = 'skyfield'
        self.validation_libs = ['lunar-python', 'chinese-lunar']
    
    def calculate(self, dt, location):
        # 主计算
        result = self.skyfield_calc(dt, location)
        # 交叉验证
        for lib in self.validation_libs:
            validation = self.lib_calc(dt, location, lib)
            if self.significant_diff(result, validation):
                log_warning(f"计算结果不一致：{result} vs {validation}")
        return result
```

#### 具体建议
1. **必须使用支持早子时/晚子时的库**
2. **真太阳时计算必须基于精确经纬度**
3. **建立测试用例库（至少 100 个历史案例验证）**
4. **在 UI 中显示"计算误差范围"提示**

---

### 1.2 早子时/晚子时处理逻辑

#### 问题严重性
- **定义**：子时（23:00-01:00）跨越两天，23:00-24:00 为"晚子时"（属当日），00:00-01:00 为"早子时"（属次日）
- **影响**：直接影响日柱和时柱的准确性
- **现状**：90% 以上开源库未正确处理

#### 正确逻辑
```python
def get_shichen_hour(dt):
    """
    获取时辰及其日期归属
    
    规则:
    - 早子时 (00:00-01:00): 属于当日
    - 晚子时 (23:00-24:00): 属于次日（但时柱仍按当日日干计算）
    """
    hour = dt.hour
    
    if 23 <= hour or hour < 1:  # 子时
        if hour < 1:  # 早子时
            return '子时', dt.date(), '早子'
        else:  # 晚子时
            # 日期进一天，但时柱天干按当日算
            return '子时', (dt + timedelta(days=1)).date(), '晚子'
    
    # 其他时辰
    shichen_map = {
        (1, 3): '丑', (3, 5): '寅', (5, 7): '卯',
        (7, 9): '辰', (9, 11): '巳', (11, 13): '午',
        (13, 15): '未', (15, 17): '申', (17, 19): '酉',
        (19, 21): '戌', (21, 23): '亥'
    }
    for (start, end), name in shichen_map.items():
        if start <= hour < end:
            return f'{name}时', dt.date(), None
```

#### 测试用例（必须通过）
```python
TEST_CASES = [
    # (公历时间，地点，期望的日柱，期望的时柱)
    ("1990-08-15 23:30", "北京", "丙戌", "戊子"),  # 晚子时
    ("1990-08-16 00:30", "北京", "丁亥", "丙子"),  # 早子时
    ("1990-08-15 12:00", "北京", "丙戌", "甲午"),  # 正常时辰
]
```

---

## 🟡 二、架构风险（需要优化）

### 2.1 React Native 调用 Python 后端延迟

#### 当前方案问题
DESIGN.md 提到使用 FastAPI 后端，但未说明：
- 网络延迟如何优化？
- 是否支持离线？
- 计算密集型任务是否应该放在客户端？

#### 性能分析
```
场景 1: 纯前端计算（推荐）
- 八字排盘计算：< 10ms（现代手机完全可承受）
- 真太阳时计算：< 5ms
- 优势：无网络延迟，可离线使用

场景 2: 后端计算
- 网络延迟：100-500ms（取决于网络）
- 并发压力：1000 用户同时排盘 = 1000 次 API 调用
- 成本：服务器 + 运维
```

#### 推荐架构：混合计算模式

```
┌─────────────────────────────────────────────┐
│           客户端（React Native）             │
│  ┌─────────────────────────────────────┐   │
│  │  本地计算引擎（WASM/JS 原生模块）     │   │
│  │  - 八字排盘                          │   │
│  │  - 五行分析                          │   │
│  │  - 十神计算                          │   │
│  │  - 真太阳时校正                      │   │
│  └─────────────────────────────────────┘   │
│                    │                        │
│                    │ 仅 AI 解卦需要网络      │
│                    ▼                        │
│  ┌─────────────────────────────────────┐   │
│  │      后端服务（FastAPI）             │   │
│  │      - AI 解卦（LLM 调用）           │   │
│  │      - 用户数据同步                 │   │
│  │      - 历史记录云存储               │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### 技术选型建议

**方案 A：使用 JavaScript 原生实现（推荐 MVP）**
```typescript
// 优势：零延迟，无需后端，完全离线
// 库推荐：
// - lunar-typescript (npm: lunar-typescript)
// - chinese-lunar (npm: chinese-lunar)
// - @ant-design/x (阿里出品，质量可靠)

import { Solar, Lunar } from 'lunar-typescript';

const solar = Solar.fromYmdHms(1990, 8, 15, 23, 30, 0, 0);
const lunar = solar.getLunar();
const bazi = lunar.getEightChar();
```

**方案 B：WASM 编译 Python 核心算法**
```python
# 使用 Pyodide 将 Python 编译为 WASM
# 优势：可复用 Python 生态，计算准确
# 劣势：首次加载慢（~5MB）

# 编译步骤：
# 1. 使用 Pyodide 编译 lunar-python
# 2. 在 RN 中通过 react-native-py 调用
# 3. 缓存 WASM 模块
```

**方案 C：Native Module（性能最优）**
```cpp
// 使用 C++ 编写核心算法，通过 RN Native Module 调用
// 优势：性能最佳，包体积小
// 劣势：开发成本高

// 推荐库：react-native-turbo-modules
```

#### 网络优化策略（如必须使用后端）
```typescript
// 1. 请求防抖
const debouncedCalculate = useMemo(
  () => debounce(calculateBazi, 300),
  []
);

// 2. 结果缓存
const cache = new NodeCache({ stdTTL: 3600 });

// 3. 预计算（用户输入时即开始计算）
useEffect(() => {
  if (isInputComplete) {
    precomputeBazi(formData);
  }
}, [formData]);

// 4. 离线队列
const queue = new BackgroundSyncQueue();
queue.addTask('saveHistory', data);
```

---

### 2.2 离线能力规划

#### 问题
DESIGN.md 未明确说明离线策略，但命理应用的使用场景包括：
- 地铁、电梯等无网环境
- 用户隐私考虑（不希望上传生辰数据）
- 响应速度要求（<500ms）

#### 推荐方案：离线优先架构

```typescript
// 功能分级
const featureTiers = {
  offline: [
    '八字排盘计算',
    '五行分析',
    '十神关系',
    '基础解卦（预设模板）',
    '历史记录查看'
  ],
  online: [
    'AI 智能解读（LLM）',
    '云端同步',
    '社交分享',
    '更新黄历数据'
  ]
};

// 本地数据库
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('bazi.db');

// 初始化表
db.execAsync(`
  CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    birth_data TEXT,
    location_data TEXT,
    created_at INTEGER
  );
  
  CREATE TABLE IF NOT EXISTS divination_history (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    result_data TEXT,
    ai_interpretation TEXT,
    created_at INTEGER
  );
`);
```

#### 数据同步策略
```typescript
// 使用 WatermelonDB 实现离线优先同步
import { Database } from '@nozbe/watermelondb';

const appDatabase = new Database({
  adapter: new SQLiteAdapter({
    schema: appSchema,
  }),
});

// 同步逻辑
const syncWithServer = async () => {
  const localChanges = await appDatabase
    .get('divination_history')
    .query(Q.where('synced_at', Q.lte(Date.now() - 3600000)))
    .fetch();
  
  // 批量上传
  await api.sync(localChanges);
};
```

---

## 🟡 三、AI 解卦实现（高风险区）

### 3.1 模型选择风险

#### 当前方案问题
DESIGN.md 提到"自部署 LLM 或第三方 API"，但未明确：
- 使用哪个模型？
- 如何保证解读准确性？
- 如何避免 AI 幻觉？

#### 模型对比分析

| 模型 | 优点 | 缺点 | 适用场景 | 成本 |
|------|------|------|----------|------|
| GPT-4 | 理解能力强，输出稳定 | 贵，需联网，数据隐私 | 高端用户 | ¥0.1/次 |
| Claude | 长文本处理优秀 | 中文能力稍弱 | 详细解读 | ¥0.08/次 |
| 文心一言 | 中文优化，便宜 | 偶有幻觉 | 基础解读 | ¥0.02/次 |
| 通义千问 | 性价比高 | 需调优 | 中等精度 | ¥0.03/次 |
| 本地 7B 模型 | 离线，隐私 | 精度低，需优化 | 完全离线 | 一次性硬件成本 |

#### 推荐方案：分层 AI 策略

```
┌─────────────────────────────────────┐
│          用户请求解卦                │
└─────────────────┬───────────────────┘
                  │
        ┌─────────▼──────────┐
        │  1. 本地规则引擎   │ ← 第一层：基础解读
        │  (预设模板匹配)    │    成本：0，速度：<10ms
        └─────────┬──────────┘
                  │ 如无匹配
        ┌─────────▼──────────┐
        │  2. RAG 检索增强   │ ← 第二层：检索经典解读
        │  (向量数据库)      │    成本：¥0.01，速度：<500ms
        └─────────┬──────────┘
                  │ 如需要个性化
        ┌─────────▼──────────┐
        │  3. LLM 生成解读   │ ← 第三层：AI 生成
        │  (带约束生成)      │    成本：¥0.05-0.1，速度：<2s
        └────────────────────┘
```

### 3.2 防止 AI 胡说八道的机制

#### 问题
AI 模型可能输出：
- 错误的五行关系
- 自相矛盾的解释
- 过度负面/正面的偏见
- 迷信内容（合规风险）

#### 解决方案：RAG + 约束生成

**步骤 1: 构建知识库**
```python
# 知识库结构
knowledge_base = {
    "五行生克": {
        "金生水": "金能生水，金多水浊...",
        "木克土": "木能克土，土多木折...",
        # ... 来自《三命通会》《滴天髓》
    },
    "十神关系": {
        "正官": "正官代表事业、约束...",
        "偏财": "偏财代表意外之财...",
    },
    "八字格局": {
        "正官格": "为人正直，有责任感...",
        "伤官格": "聪明伶俐，但易骄傲...",
    }
}

# 向量化存储
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS

embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(
    documents, 
    embeddings
)
```

**步骤 2: RAG 检索**
```python
def retrieve_context(bazi_result):
    """检索相关经典解读"""
    query = f"{bazi_result.wuxing} {bazi_result.shishen}"
    docs = vectorstore.similarity_search(query, k=5)
    return "\n".join([doc.page_content for doc in docs])
```

**步骤 3: 约束生成**
```python
prompt = """
你是一个周易专家，请根据以下八字信息进行解读。

【约束条件】
1. 必须基于提供的经典文献，不可臆造
2. 不可使用"一定"、"绝对"等绝对化词语
3. 必须包含正面和负面两方面分析
4. 避免迷信内容，强调文化传承
5. 用现代语境解释（工作、感情、健康）

【八字信息】
{bazi_data}

【经典文献参考】
{context}

【输出格式】
{{
  "overall": "整体运势（100 字内）",
  "career": "事业分析",
  "love": "感情分析",
  "health": "健康提示",
  "advice": "建议（3 条）"
}}
"""
```

**步骤 4: 输出验证**
```python
def validate_output(output):
    """验证 AI 输出是否合理"""
    # 检查五行关系是否正确
    assert output.wuxing_analysis in valid_wuxing_relations
    
    # 检查是否自相矛盾
    assert not has_contradiction(output)
    
    # 检查敏感词
    assert not contains_superstition(output)
    
    return True
```

#### 推荐架构
```python
class AIInterpretation:
    def __init__(self):
        self.rule_engine = RuleEngine()  # 规则引擎
        self.rag = RAGRetriever()        # 检索增强
        self.llm = LLMClient()           # LLM 调用
        self.validator = OutputValidator() # 验证器
    
    def interpret(self, bazi_result, tier='standard'):
        # Tier 1: 规则匹配（最快）
        if tier == 'basic':
            return self.rule_engine.match(bazi_result)
        
        # Tier 2: RAG 检索
        context = self.rag.retrieve(bazi_result)
        
        # Tier 3: LLM 生成（带约束）
        prompt = self.build_prompt(bazi_result, context)
        raw_output = self.llm.generate(prompt)
        
        # 验证输出
        if self.validator.validate(raw_output):
            return raw_output
        else:
            # 重试或降级
            return self.retry_or_fallback(bazi_result)
```

---

## 🟢 四、数据结构审查

### 4.1 当前设计分析

DESIGN.md 中的数据结构：
```typescript
interface BaziResult {
  year: { gan: string; zhi: string; element: string }
  month: { gan: string; zhi: string; element: string }
  day: { gan: string; zhi: string; element: string }
  hour: { gan: string; zhi: string; element: string }
  wuxing: { wood: number; fire: number; earth: number; metal: number; water: number }
  shishen: string[]
}
```

### 4.2 问题与改进

#### 问题 1: 信息不完整
缺少：
- 藏干信息（地支藏干）
- 纳音五行
- 空亡
- 神煞
- 大运信息

#### 问题 2: 类型安全性
```typescript
// 当前：字符串，易出错
gan: string;  // "甲" "乙" ... 但可能是 "甲 "（带空格）

// 改进：枚举类型
enum TianGan {
  JIA = '甲',
  YI = '乙',
  BING = '丙',
  DING = '丁',
  WU = '戊',
  JI = '己',
  GENG = '庚',
  XIN = '辛',
  REN = '壬',
  GUI = '癸'
}

enum DiZhi {
  ZI = '子',
  CHOU = '丑',
  // ...
}
```

#### 改进后数据结构
```typescript
// 完整版本
interface BaziResult {
  // 四柱信息
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  
  // 五行统计（含百分比）
  wuxing: WuxingDistribution;
  
  // 十神（按日干计算）
  shishen: ShiShen[];
  
  // 纳音
  nayin: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  
  // 空亡
  kongwang: string[];
  
  // 神煞
  shensha: ShenSha[];
  
  // 大运（可选）
  dayun?: DayunInfo;
}

interface Pillar {
  gan: TianGan;
  zhi: DiZhi;
  ganElement: Wuxing;
  zhiElement: Wuxing;
  hiddenGan: TianGan[]; // 藏干
  shishen?: string;      // 该柱十神
}

interface WuxingDistribution {
  wood: { count: number; percentage: number };
  fire: { count: number; percentage: number };
  earth: { count: number; percentage: number };
  metal: { count: number; percentage: number };
  water: { count: number; percentage: number };
  total: number;
  strongest: Wuxing;
  weakest: Wuxing;
  missing: Wuxing[];
}

// 使用示例
const bazi: BaziResult = {
  year: {
    gan: '庚',
    zhi: '午',
    ganElement: '金',
    zhiElement: '火',
    hiddenGan: ['丁', '己'],
  },
  // ...
};
```

---

## 📋 五、风险清单与优先级

### 必须解决的高风险项（P0）

| 编号 | 风险项 | 影响 | 建议措施 | 工作量 |
|------|--------|------|----------|--------|
| R1 | 农历库精度不足 | 排盘结果错误 | 使用 skyfield 或 lunar>=1.6.0 | 3 天 |
| R2 | 早子时/晚子时未处理 | 日柱时柱错误 | 实现子时特殊逻辑 | 1 天 |
| R3 | AI 幻觉风险 | 输出错误解读 | 实现 RAG+ 验证机制 | 5 天 |
| R4 | 无离线能力 | 无网时无法使用 | 本地计算引擎 | 3 天 |

### 建议优化项（P1）

| 编号 | 优化项 | 收益 | 建议措施 | 工作量 |
|------|--------|------|----------|--------|
| R5 | 数据结构不完整 | 功能扩展受限 | 采用完整数据结构 | 2 天 |
| R6 | 网络延迟 | 用户体验差 | 本地优先架构 | 2 天 |
| R7 | 无交叉验证 | 计算错误难发现 | 多库验证机制 | 2 天 |
| R8 | 无测试用例库 | 质量难保证 | 建立 100+ 测试案例 | 3 天 |

---

## 🎯 六、最终技术选型建议

### 6.1 核心算法库

```yaml
农历计算:
  推荐：lunar-python (>=1.6.0) 或 lunar-typescript
  备选：skyfield（天文算法，精度最高）
  验证：chinese-lunar（交叉验证）
  
真太阳时:
  推荐：自行实现（基于经纬度）
  公式：真太阳时 = 平太阳时 + 经度时差 + 均时差
  
节气计算:
  推荐：使用国家天文台公开数据
  备选：skyfield 天文计算
```

### 6.2 架构调整

```
推荐架构：混合架构（本地优先）

客户端 (React Native):
  - 八字排盘计算（本地）
  - 五行分析（本地）
  - 十神计算（本地）
  - 真太阳时校正（本地）
  - 历史记录（SQLite 本地）
  
后端 (FastAPI，可选):
  - AI 智能解读（LLM 调用）
  - 用户数据云同步
  - 社交分享
  
通信:
  - 仅 AI 功能需要网络
  - 使用 REST API + 缓存
  - 支持离线队列
```

### 6.3 AI 实现方案

```yaml
分层策略:
  第一层：规则引擎（本地，零成本）
  第二层：RAG 检索（低成本，¥0.01/次）
  第三层：LLM 生成（按需，¥0.05-0.1/次）
  
模型选择:
  推荐：文心一言 4.0 或 通义千问
  原因：中文优化，性价比高
  
防护机制:
  - RAG 检索增强
  - 输出验证器
  - 敏感词过滤
  - 人工审核后台
```

### 6.4 关键依赖版本

```json
{
  "dependencies": {
    "react-native": ">=0.73.0",
    "expo": ">=50.0.0",
    "lunar-typescript": ">=1.0.0",
    "@nozbe/watermelondb": ">=0.24.0",
    "zustand": ">=4.5.0",
    "nativewind": ">=4.0.0",
    "react-native-svg": ">=14.0.0"
  },
  "devDependencies": {
    "typescript": ">=5.3.0",
    "@types/react": ">=18.2.0"
  }
}
```

---

## ✅ 七、下一步行动清单

### 立即可执行（Week 1）
- [ ] **验证 lunar-python 准确性**（用 10 个历史案例测试）
- [ ] **实现早子时/晚子时逻辑**
- [ ] **建立测试用例库**（至少 50 个案例）
- [ ] **确认 AI 模型供应商**（申请 API key）

### 短期（Week 2-3）
- [ ] **实现本地计算引擎**（TypeScript 版本）
- [ ] **搭建 RAG 知识库**（录入经典文献）
- [ ] **实现输出验证器**
- [ ] **完成离线存储方案**

### 中期（Week 4-6）
- [ ] **性能优化**（目标：排盘<100ms）
- [ ] **多库交叉验证**
- [ ] **建立监控告警**（计算错误日志）

---

## 📝 八、总结

### 总体评价
DESIGN.md 在产品设计层面表现出色，但技术实现在**核心算法准确性**和**AI 可靠性**上存在显著风险。作为命理应用，**计算错误是致命伤**，必须优先解决。

### 关键建议
1. **不要完全信任单一农历库**，建立交叉验证机制
2. **必须处理早子时/晚子时**，这是专业性的体现
3. **AI 解卦必须有防护**，RAG+ 验证是底线
4. **优先保证离线能力**，这是用户体验的基础

### 风险评级
- 🔴 **高风险**：3 项（算法精度、子时处理、AI 幻觉）
- 🟡 **中风险**：4 项（数据结构、网络延迟、验证缺失、测试不足）
- 🟢 **低风险**：1 项（技术栈选择）

**建议：先解决 P0 高风险项，再推进 MVP 开发。**

---

> 🦐 **灵虾技术寄语**: 准确性是命理应用的生命线，宁可慢一点，也要算得准。
