/**
 * 灵枢智能排盘 - 类型定义
 */

// ==================== 六爻相关类型 ====================

/**
 * 六爻卦象
 */
export interface LiuYaoResult {
  // 本卦
  benGua: GuaInfo;
  // 变卦
  bianGua?: GuaInfo;
  // 互卦
  huGua?: GuaInfo;
  // 六爻详情
  yaoLines: YaoLineInfo[];
  // 动爻位置
  dongYao: number[];
  // 五行分析
  wuXing?: WuXingAnalysis;
  // 解析
  interpretation: {
    overall: string;
    advice: string;
  };
}

/**
 * 卦象信息
 */
export interface GuaInfo {
  index: number;       // 卦序号（1-64）
  name: string;        // 卦名
  pinYin: string;      // 拼音
  guaXiang: string;    // 卦象符号
  ci: string;          // 卦辞
  xiang: string;       // 象曰
  tuan: string;        // 彖曰
  upperGua: string;    // 上卦名
  lowerGua: string;    // 下卦名
}

/**
 * 爻信息
 */
export interface YaoLineInfo {
  position: number;    // 爻位（0-5，从下往上）
  yaoType: number;     // 6-老阴，7-少阳，8-少阴，9-老阳
  isDong: boolean;     // 是否动爻
  liuQin?: string;     // 六亲
  wuXing?: string;     // 五行
  shiYing?: {
    isShi: boolean;    // 是否世爻
    isYing: boolean;   // 是否应爻
  };
  yaoCi: string;       // 爻辞
  xiangCi?: string;    // 象辞
}

/**
 * 五行分析
 */
export interface WuXingAnalysis {
  shiYao: number;      // 世爻位置
  yingYao: number;     // 应爻位置
  yongShen: string;    // 用神
  wangShuai: string;   // 旺衰
  shengKe: string;     // 生克关系
}

// ==================== 奇门遁甲相关类型 ====================

/**
 * 奇门盘面
 */
export interface QiMenPan {
  // 基础信息
  yinYang: 'yin' | 'yang';
  juShu: number;
  date: LunarDateInfo;
  location: LocationInfo;
  
  // 九宫格
  jiuGong: GongWeiInfo[];
  
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
export interface GongWeiInfo {
  position: number;    // 宫位（1-9）
  baMen: string;       // 八门
  jiuXing: string;     // 九星
  baShen: string;      // 八神
  tianPan: string;     // 天盘干
  diPan: string;       // 地盘干
  host: boolean;       // 是否为主
}

/**
 * 格局信息
 */
export interface GeJuInfo {
  name: string;
  type: 'ji' | 'xiong';  // 吉/凶
  description: string;
  advice: string;
}

// ==================== 基础类型 ====================

/**
 * 农历日期
 */
export interface LunarDateInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  hourGanZhi: string;
  shiChen: string;     // 时辰
  jieQi: string;       // 节气
  yuan: '上' | '中' | '下'; // 上中下元
}

/**
 * 地理位置
 */
export interface LocationInfo {
  latitude: number;
  longitude: number;
  city?: string;
}

// ==================== 公共工具类型 ====================

/**
 * 起卦方式
 */
export type LiuYaoMethod = 'tongqian' | 'shuzi' | 'shijian';

/**
 * 奇门起盘方式
 */
export type QiMenMethod = 'chaiBu' | 'MaoTou' | 'ZhuanYin';
