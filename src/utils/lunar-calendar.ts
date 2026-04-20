/**
 * 万年历工具
 * 支持公历农历转换、干支纪年
 */

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
 * 公历转农历（简化版）
 * 注：完整版需要复杂的农历算法，这里使用简化版本
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
} => {
  // 简化算法：以春节为界（约在公历 1 月 21 日 -2 月 20 日之间）
  // 实际生产环境应使用完整的农历算法库
  
  const springFestival = getSpringFestivalDate(year);
  let lunarYear = year;
  let lunarMonth = month;
  let lunarDay = day;
  let isLeap = false;
  
  // 如果在春节前，则农历年减 1
  if (month < springFestival.month || (month === springFestival.month && day < springFestival.day)) {
    lunarYear = year - 1;
    // 简化：农历月日也相应调整（实际应使用精确算法）
    const prevSpringFestival = getSpringFestivalDate(year - 1);
    const daysInPrevYear = getDaysInLunarYear(year - 1);
    
    // 计算从春节到当前日期的天数
    const daysFromSpring = getDaysFromSpringFestival(year, month, day, prevSpringFestival);
    
    // 简化处理：直接返回估算值
    lunarMonth = 12;
    lunarDay = Math.max(1, Math.min(30, 30 - daysFromSpring));
  }
  
  // 计算干支
  const ganZhiYear = getGanZhiYear(lunarYear);
  const ganZhiMonth = getGanZhiMonth(lunarYear, lunarMonth);
  const ganZhiDay = getGanZhiDay(year, month, day);
  const zodiac = getZodiac(lunarYear);
  
  return {
    lunarYear,
    lunarMonth,
    lunarDay,
    isLeap,
    ganZhiYear,
    ganZhiMonth,
    ganZhiDay,
    zodiac,
    lunarMonthName: (isLeap ? '闰' : '') + LUNAR_MONTHS[lunarMonth - 1] + '月',
    lunarDayName: LUNAR_DAYS[(lunarDay - 1) % 30],
  };
};

/**
 * 获取当年春节日期（简化版）
 */
const getSpringFestivalDate = (year: number): { month: number; day: number } => {
  // 实际应使用精确算法，这里使用近似值
  const dates: Record<number, { month: number; day: number }> = {
    2020: { month: 1, day: 25 },
    2021: { month: 2, day: 12 },
    2022: { month: 2, day: 1 },
    2023: { month: 1, day: 22 },
    2024: { month: 2, day: 10 },
    2025: { month: 1, day: 29 },
    2026: { month: 2, day: 17 },
    2027: { month: 2, day: 6 },
    2028: { month: 1, day: 26 },
    2029: { month: 2, day: 13 },
    2030: { month: 2, day: 3 },
  };
  
  // 使用 19 年周期近似计算
  const baseYear = 2020;
  const offset = year - baseYear;
  const cycleOffset = offset % 19;
  
  if (dates[year]) {
    return dates[year];
  }
  
  // 近似计算：春节在 1 月 21 日 -2 月 20 日之间波动
  const approxDay = 21 + (cycleOffset * 11) % 30;
  if (approxDay <= 31) {
    return { month: 1, day: approxDay };
  } else {
    return { month: 2, day: approxDay - 31 };
  }
};

/**
 * 获取农历年天数（简化）
 */
const getDaysInLunarYear = (year: number): number => {
  // 农历年约 354 天（平年）或 384 天（闰年）
  return 354 + (year % 3 === 0 ? 30 : 0);
};

/**
 * 计算从春节到当前日期的天数
 */
const getDaysFromSpringFestival = (
  year: number,
  month: number,
  day: number,
  springFestival: { month: number; day: number }
): number => {
  const daysInMonth = [31, 28 + (year % 4 === 0 ? 1 : 0), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  let totalDays = 0;
  
  // 计算从春节到当前日期的天数
  for (let m = springFestival.month; m <= month; m++) {
    if (m === month) {
      totalDays += day;
    } else if (m === springFestival.month) {
      totalDays += daysInMonth[m - 1] - springFestival.day + 1;
    } else {
      totalDays += daysInMonth[m - 1];
    }
  }
  
  return totalDays;
};

/**
 * 获取干支纪月
 */
const getGanZhiMonth = (year: number, month: number): string => {
  // 以立春为界（约 2 月 4 日）
  const liChun = new Date(year, 1, 4);
  const currentDate = new Date(year, month - 1, 1);
  
  let adjustedYear = year;
  if (currentDate < liChun) {
    adjustedYear = year - 1;
  }
  
  // 月干支计算公式
  const ganIndex = ((adjustedYear % 10) * 2 + month) % 10;
  const zhiIndex = (month + 2) % 12;
  
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
};

/**
 * 获取干支纪日（简化版）
 */
const getGanZhiDay = (year: number, month: number, day: number): string => {
  // 简化算法：以 1900 年 1 月 31 日（甲子日）为基准
  const baseDate = new Date(1900, 0, 31);
  const currentDate = new Date(year, month - 1, day);
  
  const diffDays = Math.floor((currentDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const ganIndex = diffDays % 10;
  const zhiIndex = diffDays % 12;
  
  return TIAN_GAN[(ganIndex + 10) % 10] + DI_ZHI[(zhiIndex + 12) % 12];
};

/**
 * 获取时辰干支
 */
export const getHourGanZhi = (dayGan: string, hour: number): string => {
  // 时支（固定）
  const hourIndex = Math.floor(((hour % 24) + 1) / 2) % 12;
  const zhi = DI_ZHI[hourIndex];
  
  // 时干（根据日干推算）
  const ganIndex = TIAN_GAN.indexOf(dayGan[0]);
  const hourGanIndex = (ganIndex * 2 + hourIndex) % 10;
  const gan = TIAN_GAN[hourGanIndex];
  
  return gan + zhi;
};

/**
 * 获取时辰名称
 */
const HOUR_NAMES = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];
const HOUR_TIME = ['23-01', '01-03', '03-05', '05-07', '07-09', '09-11', '11-13', '13-15', '15-17', '17-19', '19-21', '21-23'];

export const getHourName = (hour: number): { name: string; time: string } => {
  const index = Math.floor(((hour % 24) + 1) / 2) % 12;
  return {
    name: HOUR_NAMES[index],
    time: HOUR_TIME[index],
  };
};
