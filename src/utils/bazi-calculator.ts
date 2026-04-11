/**
 * 八字排盘计算核心模块
 * 使用 lunar-typescript 库进行农历和八字计算
 */

import { Solar, Lunar } from 'lunar-typescript';

export interface BaZiResult {
  solarDate: string;      // 公历日期
  lunarDate: string;      // 农历日期
  ganZhi: {
    year: { gan: string; zhi: string };
    month: { gan: string; zhi: string };
    day: { gan: string; zhi: string };
    hour: { gan: string; zhi: string };
  };
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  shishen: string[];      // 十神
  wuxingDistribution: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
}

// 时辰对应表（2小时为一个时辰，子时从23:00开始）
const HOUR_ZHI_MAP: { [key: number]: { zhi: string; range: [number, number] } } = {
  23: { zhi: '子', range: [23, 1] },   // 子时 23:00-01:00
  1: { zhi: '丑', range: [1, 3] },
  3: { zhi: '寅', range: [3, 5] },
  5: { zhi: '卯', range: [5, 7] },
  7: { zhi: '辰', range: [7, 9] },
  9: { zhi: '巳', range: [9, 11] },
  11: { zhi: '午', range: [11, 13] },
  13: { zhi: '未', range: [13, 15] },
  15: { zhi: '申', range: [15, 17] },
  17: { zhi: '酉', range: [17, 19] },
  19: { zhi: '戌', range: [19, 21] },
  21: { zhi: '亥', range: [21, 23] },
};

// 天干
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 计算八字
 * @param year 年 (公历)
 * @param month 月 (公历) 1-12
 * @param day 日 (公历) 1-31
 * @param hour 时辰 (小时数 0-23)
 * @param isLunar 是否为农历日期 (默认 false，公历)
 */
export function calculateBaZi(
  year: number,
  month: number,
  day: number,
  hour: number,
  isLunar: boolean = false
): BaZiResult {
  let lunar: Lunar;

  if (isLunar) {
    // 农历日期直接创建 Lunar 对象
    lunar = Lunar.fromYmd(year, month, day);
  } else {
    // 公历转农历
    const solar = Solar.fromYmd(year, month, day);
    lunar = solar.getLunar();
  }

  // 获取年月日柱（天干地支）
  const yearGanZhi = lunar.getYearInGanZhi();      // e.g., "丙寅"
  const monthGanZhi = lunar.getMonthInGanZhi();    // e.g., "甲申"
  const dayGanZhi = lunar.getDayInGanZhi();        // e.g., "丙戌"
  
  // 获取时柱（需要根据时辰计算）
  const timeGanZhi = lunar.getTimeInGanZhi();      // e.g., "戊子"

  // 解析天干地支
  const parseGanZhi = (gz: string) => {
    return { gan: gz[0], zhi: gz[1] };
  };

  // 五行统计
  const fiveElementsMap: { [key: string]: number } = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  // 根据天干统计五行
  const ganToElement: { [key: string]: string } = {
    甲: '木', 乙: '木',
    丙: '火', 丁: '火',
    戊: '土', 己: '土',
    庚: '金', 辛: '金',
    壬: '水', 癸: '水',
  };

  const countElement = (gan: string) => {
    const el = ganToElement[gan];
    if (el) fiveElementsMap[el]++;
  };

  countElement(yearGanZhi[0]);
  countElement(monthGanZhi[0]);
  countElement(dayGanZhi[0]);
  countElement(timeGanZhi[0]);

  // 计算十神（简化版：基于日干）
  // TODO: 完整十神计算需考虑五行生克关系
  const dayGan = dayGanZhi[0];
  const shishen = generateShishen(dayGan, [yearGanZhi[0], monthGanZhi[0], timeGanZhi[0]]);

  return {
    solarDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    lunarDate: lunar.toString(), // 如 "一九八六年四月廿一"
    ganZhi: {
      year: parseGanZhi(yearGanZhi),
      month: parseGanZhi(monthGanZhi),
      day: parseGanZhi(dayGanZhi),
      hour: parseGanZhi(timeGanZhi),
    },
    fiveElements: {
      wood: fiveElementsMap['木'],
      fire: fiveElementsMap['火'],
      earth: fiveElementsMap['土'],
      metal: fiveElementsMap['金'],
      water: fiveElementsMap['水'],
    },
    shishen,
    wuxingDistribution: {
      wood: Math.round((fiveElementsMap['木'] / 4) * 100),
      fire: Math.round((fiveElementsMap['火'] / 4) * 100),
      earth: Math.round((fiveElementsMap['土'] / 4) * 100),
      metal: Math.round((fiveElementsMap['金'] / 4) * 100),
      water: Math.round((fiveElementsMap['水'] / 4) * 100),
    },
  };
}

/**
 * 生成十神列表（简化版）
 * 根据日干与其他天干的关系
 */
function generateShishen(dayGan: string, otherGans: string[]): string[] {
  const shishenMap: { [key: string]: string } = {
    '甲': '比肩', '乙': '劫财',
    '丙': '食神', '丁': '伤官',
    '戊': '偏财', '己': '正财',
    '庚': '七杀', '辛': '正官',
    '壬': '偏印', '癸': '正印',
  };

  // 简化：直接映射每个天干的十神名称
  // 实际十神计算需考虑五行生克：同我者为比劫，生我者为印，我生者为食伤，我克者为财，克我者为官杀
  const relationMap: { [day: string]: { [other: string]: string } } = {
    '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
    '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
    '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
    '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
    '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
    '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
    '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
    '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
    '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩' },
    '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财' },
  };

  return otherGans.map(gan => relationMap[dayGan]?.[gan] || shishenMap[gan] || '');
}

/**
 * 真太阳时校正（简化版）
 * 根据出生地经度调整时辰
 * @param longitude 经度（东经为正，西经为负）
 * @param localTime 本地时间（小时，浮点数）
 */
export function adjustSolarTime(longitude: number, localTime: number): number {
  // 每1度经度相差4分钟
  const beijingOffset = 116.4; // 北京经度
  const diff = (longitude - beijingOffset) * 4; // 分钟差
  const adjustedMinutes = (localTime % 1) * 60 + diff;
  const adjustedHours = Math.floor(localTime) + Math.floor(adjustedMinutes / 60);
  const adjustedMins = adjustedMinutes % 60;
  // 返回调整后的小时（浮点数）
  return adjustedHours + adjustedMins / 60;
}