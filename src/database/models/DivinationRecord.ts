// 排盘记录数据模型

export type BaziType = 'bazi' | 'liuyao' | 'qimen';

export interface DivinationRecord {
  id?: number;
  createdAt: number;          // 时间戳（毫秒）
  baziType: BaziType;
  solarDate?: string;         // 公历日期（ISO格式）
  lunarDate?: string;         // 农历日期（如：庚子年三月初五）
  timePeriod?: string;        // 时辰（如：子时、丑时）
  yearGanzhi?: string;        // 年柱（如：庚子）
  monthGanzhi?: string;       // 月柱（如：甲辰）
  dayGanzhi?: string;         // 日柱（如：丙申）
  hourGanzhi?: string;        // 时柱（如：戊子）
  wuxingData?: string;        // 五行数据 JSON 字符串
  shishenData?: string;       // 十神数据 JSON 字符串
  location?: string;          // 出生地（如：北京市）
  timeCorrection?: number;    // 真太阳时校正（分钟）
  aiInterpretation?: string;  // AI 解读内容
  userNotes?: string;         // 用户笔记
  isFavorite?: number;        // 是否收藏：0=否，1=是
}

// 简化的记录（列表显示用）
export interface DivinationRecordSummary {
  id: number;
  createdAt: number;
  baziType: BaziType;
  lunarDate?: string;
  yearGanzhi?: string;
  location?: string;
  isFavorite: number;
}
