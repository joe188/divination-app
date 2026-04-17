/**
 * 排盘结果类型定义
 */
export type DivinationType = 'bazi' | 'liuyao' | 'qimen';

export interface BaziResult {
  type: 'bazi';
  fourPillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  solarDate: string;
  lunarDate: string;
  hourLabel: string;
}

export interface LiuYaoResult {
  type: 'liuyao';
  lines: Array<{ isYang: boolean }>; // 6爻
  hexagram: {
    number: number;
    name: string;
    judgement: string;
    image: string;
  };
  dynamicLines: number[]; // 动爻位置（1-6）
  changedHexagram?: {
    number: number;
    name: string;
    judgement: string;
    image: string;
  };
}

export interface QiMenResult {
  type: 'qimen';
  // 简化：返回节气、时辰、值符、值使等
  solarTerm: string;
  hour: string;
  // 更多字段待完善
}

export type DivinationResult = BaziResult | LiuYaoResult | QiMenResult;