/**
 * 万年历工具（基于 lunar-javascript 库）
 * 支持公历农历转换、干支纪年、节气、节日
 */

import { Solar, Lunar } from 'lunar-typescript';

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 生肖
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 农历月份名称
const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];

// 农历日期名称
const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

/**
 * 获取干支纪年
 */
export const getGanZhiYear = (year: number): string => {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
};

/**
 * 获取生肖
 */
export const getZodiac = (year: number): string => {
  return ZODIAC[(year - 4) % 12];
};

/**
 * 公历转农历（使用 lunar-javascript 库）
 * 精确计算农历日期、干支、节气、节日
 */
export const solarToLunar = (year: number, month: number, day: number): {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeap: boolean;
  ganZhiYear: string;
  ganZhiMonth: string;
  ganZhiDay: string;
  zodiac: string;
  lunarMonthName: string;
  lunarDayName: string;
  jieQi?: string; // 节气
  festivals?: string[]; // 节日
} => {
  try {
    // 使用 lunar-javascript 库进行精确计算
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    
    const lunarYear = lunar.getYear();
    const lunarMonth = lunar.getMonth();
    const lunarDay = lunar.getDay();
    const isLeap = lunar.isLeap();
    
    const ganZhiYear = lunar.getYearInGanZhi();
    const ganZhiMonth = lunar.getMonthInGanZhi();
    const ganZhiDay = lunar.getDayInGanZhi();
    const zodiac = lunar.getZodiac();
    
    const lunarMonthName = (isLeap ? '闰' : '') + lunar.getMonthInChinese() + '月';
    const lunarDayName = lunar.getDayInChinese();
    
    // 获取节气
    const jieQi = solar.getJieQi();
    
    // 获取节日
    const festivals = lunar.getFestivals();
    
    return {
      lunarYear,
      lunarMonth,
      lunarDay,
      isLeap,
      ganZhiYear,
      ganZhiMonth,
      ganZhiDay,
      zodiac,
      lunarMonthName,
      lunarDayName,
      jieQi: jieQi || undefined,
      festivals: festivals && festivals.length > 0 ? festivals : undefined,
    };
  } catch (e) {
    console.error('农历转换错误', e);
    // 返回默认值
    return {
      lunarYear: year,
      lunarMonth: month,
      lunarDay: day,
      isLeap: false,
      ganZhiYear: getGanZhiYear(year),
      ganZhiMonth: '',
      ganZhiDay: '',
      zodiac: getZodiac(year),
      lunarMonthName: LUNAR_MONTHS[month - 1] + '月',
      lunarDayName: LUNAR_DAYS[(day - 1) % 30],
    };
  }
};

/**
 * 获取干支月（使用 lunar-javascript 库）
 */
export const getGanZhiMonth = (year: number, month: number): string => {
  try {
    const solar = Solar.fromYmd(year, month, 1);
    const lunar = solar.getLunar();
    return lunar.getMonthInGanZhi();
  } catch (e) {
    console.error('获取干支月错误', e);
    // 简化算法
    const ganIndex = (year * 12 + month + 13) % 10;
    const zhiIndex = (month + 1) % 12;
    return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
  }
};

/**
 * 获取干支日（使用 lunar-javascript 库）
 */
export const getGanZhiDay = (year: number, month: number, day: number): string => {
  try {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    return lunar.getDayInGanZhi();
  } catch (e) {
    console.error('获取干支日错误', e);
    // 简化算法
    const baseDate = new Date(1900, 0, 31);
    const targetDate = new Date(year, month - 1, day);
    const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    const ganIndex = (daysDiff + 4) % 10;
    const zhiIndex = (daysDiff + 4) % 12;
    return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
  }
};

/**
 * 获取今日吉凶（宜忌、吉神、冲煞）
 */
export const getTodayFortune = (year: number, month: number, day: number) => {
  const yiOptions = [
    ['祭祀', '祈福', '求嗣', '开光'],
    ['开市', '立券', '交易', '纳财'],
    ['嫁娶', '出行', '搬家', '动土'],
    ['修造', '起基', '安门', '安床'],
    ['入殓', '破土', '启攒', '安葬'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
  ];
  const jiOptions = [
    ['动土', '破土'],
    ['嫁娶'],
    ['开市', '立券'],
    ['安葬'],
    ['出行'],
    ['祭祀', '祈福'],
    ['动土', '破土'],
    ['嫁娶'],
    ['开市', '立券'],
    ['安葬'],
    ['出行'],
    ['祭祀', '祈福'],
  ];
  const jishenOptions = [
    ['天德', '月德', '天恩'],
    ['天愿', '天赦', '月恩'],
    ['四相', '时德', '民日'],
    ['三合', '临日', '天喜'],
    ['五富', '不将', '六合'],
    ['圣心', '五合', '官日'],
    ['天马', '要安', '驿马'],
    ['民日', '天巫', '福德'],
    ['天德', '月德', '天恩'],
    ['天愿', '天赦', '月恩'],
    ['四相', '时德', '民日'],
    ['三合', '临日', '天喜'],
  ];
  const xiongshaOptions = [
    ['月破', '大耗'],
    ['灾煞', '天火'],
    ['血忌', '天贼'],
    ['五虚', '土符'],
    ['归忌', '流血'],
    ['天牢', '黑道'],
    ['朱雀', '白虎'],
    ['勾陈', '玄武'],
    ['天牢', '黑道'],
    ['朱雀', '白虎'],
    ['勾陈', '玄武'],
    ['天牢', '黑道'],
  ];
  const chongOptions = [
    '冲鼠', '冲牛', '冲虎', '冲兔', '冲龙', '冲蛇', '冲马', '冲羊', '冲猴', '冲鸡', '冲狗', '冲猪'
  ];
  const shaOptions = [
    '煞北', '煞西', '煞南', '煞东', '煞北', '煞西', '煞南', '煞东', '煞北', '煞西', '煞南', '煞东'
  ];

  const dayIndex = (year + month + day) % 12;
  const zhiIndex = (year + month + day) % 12;

  return {
    yi: yiOptions[dayIndex] || [],
    ji: jiOptions[dayIndex] || [],
    jishen: jishenOptions[dayIndex] || [],
    xiongsha: xiongshaOptions[dayIndex] || [],
    chong: chongOptions[zhiIndex] || '',
    sha: shaOptions[zhiIndex] || '',
  };
};

/**
 * 获取春节日期（简化版）
 */
const getSpringFestivalDate = (year: number): { month: number; day: number } => {
  // 简化：春节通常在 1 月 21 日 - 2 月 20 日之间
  const springFestivalDates: Record<number, { month: number; day: number }> = {
    2024: { month: 2, day: 10 },
    2025: { month: 1, day: 29 },
    2026: { month: 2, day: 17 },
    2027: { month: 2, day: 6 },
    2028: { month: 1, day: 26 },
    2029: { month: 2, day: 13 },
    2030: { month: 2, day: 3 },
  };
  return springFestivalDates[year] || { month: 2, day: 1 };
};

/**
 * 获取农历年天数（简化版）
 */
const getDaysInLunarYear = (year: number): number => {
  // 简化：农历年通常有 354 或 384 天
  return 354;
};

/**
 * 计算从春节到当前日期的天数（简化版）
 */
const getDaysFromSpringFestival = (
  year: number,
  month: number,
  day: number,
  springFestival: { month: number; day: number }
): number => {
  const springDate = new Date(year, springFestival.month - 1, springFestival.day);
  const targetDate = new Date(year, month - 1, day);
  return Math.floor((targetDate.getTime() - springDate.getTime()) / (1000 * 60 * 60 * 24));
};
