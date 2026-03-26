# 灵枢智能排盘 - 架构设计

## 📐 技术架构

### 目录结构
```
src/
├── core/                    # 核心算法层
│   ├── liuyao/             # 六爻模块
│   │   ├── LiuYaoEngine.ts     # 六爻引擎
│   │   ├── GuaCalculator.ts    # 卦象计算
│   │   ├── WuXingAnalyzer.ts   # 五行分析
│   │   └── LiuQinConfig.ts     # 六亲配置
│   ├── qimen/              # 奇门模块
│   │   ├── QiMenEngine.ts      # 奇门引擎
│   │   ├── JuShuCalculator.ts  # 局数计算
│   │   ├── BaMenLayout.ts      # 八门排布
│   │   ├── JiuXingLayout.ts    # 九星排布
│   │   └── BaShenLayout.ts     # 八神排布
│   └── common/             # 公共算法
│       ├── GanZhi.ts           # 干支计算
│       ├── LunarCalendar.ts    # 农历转换
│       ├── WuXing.ts           # 五行生克
│       └── JieQi.ts            # 节气计算
├── data/                   # 数据层
│   ├── liuyao/             # 六爻数据
│   │   ├── 64gua.ts          # 六十四卦
│   │   ├── guaCi.ts          # 卦辞库
│   │   └── yaoCi.ts          # 爻辞库
│   ├── qimen/              # 奇门数据
│   │   ├── baMen.ts          # 八门属性
│   │   ├── jiuXing.ts        # 九星属性
│   │   ├── baShen.ts         # 八神属性
│   │   └── geJu.ts           # 格局库
│   └── foundation/         # 基础数据
│       ├── 60jiazi.ts        # 六十甲子
│       ├── 24jieqi.ts        # 二十四节气
│       └── 64gua_full.ts     # 易经全文
├── screens/                # 界面层
│   ├── HomeScreen.tsx      # 首页
│   ├── LiuYaoInputScreen.tsx   # 六爻输入
│   ├── LiuYaoResultScreen.tsx  # 六爻结果
│   ├── QiMenInputScreen.tsx    # 奇门输入
│   ├── QiMenResultScreen.tsx   # 奇门结果
│   └── HistoryScreen.tsx       # 历史记录
├── components/             # 组件层
│   ├── liuyao/             # 六爻组件
│   │   ├── YaoLine.tsx       # 爻线组件
│   │   ├── GuaXiang.tsx      # 卦象展示
│   │   └── TongQian.tsx      # 铜钱动画
│   ├── qimen/              # 奇门组件
│   │   ├── JiuGong.tsx       # 九宫格
│   │   ├── PanMian.tsx       # 盘面展示
│   │   └── GeJuCard.tsx      # 格局卡片
│   └── common/             # 公共组件
│       ├── GuochaoButton.tsx
│       ├── GuochaoCard.tsx
│       └── LunarDatePicker.tsx
├── hooks/                  # 自定义 Hooks
│   ├── useLiuYao.ts
│   ├── useQiMen.ts
│   └── useStorage.ts
└── utils/                  # 工具函数
    ├── storage.ts          # 本地存储
    ├── share.ts            # 分享功能
    └── export.ts           # 导出功能
```

## 🔧 核心算法实现

### 1. 六爻起卦算法

```typescript
// src/core/liuyao/LiuYaoEngine.ts

/**
 * 六爻引擎 - 核心算法
 */
export class LiuYaoEngine {
  /**
   * 铜钱起卦
   * @param coins 三次抛掷的铜钱结果（正/反）
   */
  generateYao(coins: boolean[]): number {
    // 三个正面：老阳（9）- 动爻
    // 两个正面：少阳（7）- 静爻
    // 一个正面：少阴（8）- 静爻
    // 没有正面：老阴（6）- 动爻
    const yangCount = coins.filter(c => c).length;
    
    if (yangCount === 3) return 9;  // 老阳
    if (yangCount === 2) return 7;  // 少阳
    if (yangCount === 1) return 8;  // 少阴
    return 6;  // 老阴
  }

  /**
   * 生成完整卦象
   */
  generateGua(yaoLines: number[]): Gua {
    const benGua = this.calculateGua(yaoLines);
    const bianGua = this.calculateBianGua(yaoLines);
    const huGua = this.calculateHuGua(yaoLines);
    
    return {
      benGua,
      bianGua,
      huGua,
      dongYao: yaoLines.map((line, i) => 
        line === 6 || line === 9 ? i : -1
      ).filter(i => i !== -1)
    };
  }

  /**
   * 计算本卦
   */
  private calculateGua(lines: number[]): number {
    // 从下往上计算
    let lower = 0;  // 下卦
    let upper = 0;  // 上卦
    
    for (let i = 0; i < 3; i++) {
      const yao = lines[i];
      lower |= (yao === 7 || yao === 9) ? (1 << i) : 0;
    }
    
    for (let i = 3; i < 6; i++) {
      const yao = lines[i];
      upper |= (yao === 7 || yao === 9) ? (1 << (i - 3)) : 0;
    }
    
    return (upper << 3) | lower;
  }
}
```

### 2. 奇门排盘算法

```typescript
// src/core/qimen/QiMenEngine.ts

/**
 * 奇门遁甲引擎
 */
export class QiMenEngine {
  /**
   * 起奇门局
   * @param date 公历时间
   * @param location 地理位置（经纬度）
   */
  startPan(date: Date, location: Location): QiMenPan {
    // 1. 转换为农历
    const lunar = LunarCalendar.toLunar(date);
    
    // 2. 定阴阳遁
    const jieQi = JieQi.getJieQi(date);
    const yinYang = this.determineYinYang(jieQi);
    
    // 3. 定局数
    const juShu = this.determineJuShu(lunar, jieQi);
    
    // 4. 找值符值使
    const { zhiFu, zhiShi } = this.findZhiFuZhiShi(juShu);
    
    // 5. 排天盘（值符）
    const tianPan = this.layoutTianPan(zhiFu, lunar.shiChen);
    
    // 6. 排人盘（八门）
    const renPan = this.layoutRenPan(zhiShi, lunar.shiChen);
    
    // 7. 排神盘（八神）
    const shenPan = this.layoutShenPan(zhiFu, yinYang);
    
    // 8. 判断格局
    const geJu = this.analyzeGeJu(tianPan, renPan, shenPan);
    
    return {
      yinYang,
      juShu,
      tianPan,
      renPan,
      shenPan,
      geJu,
      date: lunar,
      location
    };
  }

  /**
   * 定阴阳遁
   * 冬至后阳遁，夏至后阴遁
   */
  private determineYinYang(jieQi: JieQi): 'yin' | 'yang' {
    const yangQi = ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰'];
    const yinQi = ['夏至', '小暑', '大暑', '立秋', '处暑', '白露'];
    
    return yangQi.includes(jieQi.name) ? 'yang' : 'yin';
  }

  /**
   * 定局数
   * 阳遁：冬至后上元起一，中元四，下元七
   * 阴遁：夏至后上元起九，中元五，下元二
   */
  private determineJuShu(lunar: LunarDate, jieQi: JieQi): number {
    const { yuan } = lunar; // 上元、中元、下元
    const base = this.determineYinYang(jieQi) === 'yang' 
      ? 1  // 阳遁顺排
      : 9; // 阴遁逆排
    
    const offset = { '上': 0, '中': 3, '下': 6 }[yuan];
    return (base + offset - 1) % 9 + 1;
  }
}
```

### 3. 数据结构定义

```typescript
// src/types/liuyao.ts

/**
 * 六爻卦象
 */
export interface LiuYaoResult {
  // 本卦
  benGua: {
    name: string;      // 卦名
    guaXiang: string;  // 卦象（如"䷀"）
    ci: string;        // 卦辞
  };
  
  // 变卦
  bianGua?: {
    name: string;
    guaXiang: string;
    ci: string;
  };
  
  // 互卦
  huGua?: {
    name: string;
    guaXiang: string;
  };
  
  // 六爻详情
  yaoLines: YaoLine[];
  
  // 动爻
  dongYao: number[];
  
  // 五行分析
  wuXing: WuXingAnalysis;
  
  // 解析
  interpretation: {
    overall: string;    // 总体判断
    advice: string;     // 建议
  };
}

/**
 * 单爻信息
 */
export interface YaoLine {
  position: number;    // 爻位（0-5，从下往上）
  yaoType: number;     // 6-老阴，7-少阳，8-少阴，9-老阳
  isDong: boolean;     // 是否动爻
  liuQin: string;      // 六亲
  wuXing: string;      // 五行
  shiYing?: {
    isShi: boolean;    // 是否世爻
    isYing: boolean;   // 是否应爻
  };
  yaoCi: string;       // 爻辞
}
```

```typescript
// src/types/qimen.ts

/**
 * 奇门盘面
 */
export interface QiMenPan {
  // 基础信息
  yinYang: 'yin' | 'yang';
  juShu: number;
  date: LunarDate;
  location: Location;
  
  // 九宫格
  jiuGong: GongWei[];
  
  // 值符值使
  zhiFu: string;  // 值符星
  zhiShi: string; // 值使门
  
  // 格局
  geJu: GeJuInfo[];
  
  // 解析
  interpretation: {
    overall: string;
    baMen: string;
    jiuXing: string;
    baShen: string;
    advice: string[];
  };
}

/**
 * 单宫信息
 */
export interface GongWei {
  position: number;  // 宫位（1-9）
  baMen: string;     // 八门
  jiuXing: string;   // 九星
  baShen: string;    // 八神
  tianPan: string;   // 天盘干
  diPan: string;     // 地盘干
  host: boolean;     // 是否为主
}
```

## 📊 开发计划

### 第一阶段：六爻基础（2 周）
- [ ] 实现六爻起卦算法
- [ ] 六十四卦数据录入
- [ ] 基础 UI 界面
- [ ] 卦辞展示

### 第二阶段：六爻进阶（2 周）
- [ ] 五行分析
- [ ] 六亲配置
- [ ] 用神判断
- [ ] 详细解析

### 第三阶段：奇门基础（3 周）
- [ ] 农历转换算法
- [ ] 节气计算
- [ ] 定局数算法
- [ ] 八门排布
- [ ] 九星排布

### 第四阶段：奇门进阶（3 周）
- [ ] 八神排布
- [ ] 格局判断
- [ ] 详细解析
- [ ] 择吉建议

### 第五阶段：完善优化（2 周）
- [ ] 历史记录
- [ ] 分享功能
- [ ] 性能优化
- [ ] UI 美化
- [ ] 测试修复

---

**架构版本**: v1.0  
**最后更新**: 2026-03-26  
**技术栈**: React Native 0.73 + TypeScript
