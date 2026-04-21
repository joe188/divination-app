/**
 * 万年历工具（基于 lunar-typescript）
 * 支持公历农历转换、干支纪年、节气、节日
 */

console.log('lunar-calendar module loaded');
const lunar = require('lunar-typescript');
const { Solar, Lunar } = lunar || {};

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
 * 公历转农历（使用 lunar-typescript 库）
 */
export const solarToLunar = (year: number, month: number, day: number) => {
  try {
    if (!Solar) throw new Error('Solar not loaded');
    const solar = Solar.fromYmd(year, month, day);
    const l = solar.getLunar();

    // 安全调用（某些方法可能不存在）
    const getter = (obj: any, name: string, fallback: any) => {
      try {
        const val = obj[name];
        return typeof val === 'function' ? val.call(obj) : val;
      } catch (e) {
        return fallback;
      }
    };

    const ganZhiYear = getter(l, 'getYearInGanZhi', getGanZhiYear(year));
    const ganZhiMonth = getter(l, 'getMonthInGanZhi', getGanZhiMonth(year, month));
    const ganZhiDay = getter(l, 'getDayInGanZhi', getGanZhiDay(year, month, day));
    const zodiac = getter(l, 'getZodiac', getZodiac(year));
    const lunarMonthName = getter(l, 'getMonthInChinese', '') || LUNAR_MONTHS[month - 1] + '月';
    const lunarDayName = getter(l, 'getDayInChinese', '') || LUNAR_DAYS[(day - 1) % 30];
    
    // isLeap 可能是属性或方法
    let isLeap = false;
    try {
      if (typeof l.isLeap === 'function') isLeap = l.isLeap();
      else if (typeof l.isLeap === 'boolean') isLeap = l.isLeap;
      // 检查 _leap 等私有字段
      else if (typeof l._leap !== 'undefined') isLeap = l._leap;
    } catch (e) {
      isLeap = false;
    }

    const jieQi = (() => {
      try { return solar.getJieQi() || ''; } catch (e) { return ''; }
    })();

    const festivals = (() => {
      try { return l.getFestivals() || []; } catch (e) { return []; }
    })();

    return {
      lunarYear: getter(l, 'getYear', year),
      lunarMonth: getter(l, 'getMonth', month),
      lunarDay: getter(l, 'getDay', day),
      isLeap,
      ganZhiYear,
      ganZhiMonth,
      ganZhiDay,
      zodiac,
      lunarMonthName: isLeap ? '闰' + lunarMonthName : lunarMonthName,
      lunarDayName,
      jieQi,
      festivals: festivals.length > 0 ? festivals : undefined,
    };
  } catch (e) {
    console.error('solarToLunar error', e, e.stack);
    // 返回简化 fallback
    return {
      lunarYear: year,
      lunarMonth: month,
      lunarDay: day,
      isLeap: false,
      ganZhiYear: getGanZhiYear(year),
      ganZhiMonth: getGanZhiMonth(year, month),
      ganZhiDay: getGanZhiDay(year, month, day),
      zodiac: getZodiac(year),
      lunarMonthName: LUNAR_MONTHS[month - 1] + '月',
      lunarDayName: LUNAR_DAYS[(day - 1) % 30],
      jieQi: '',
      festivals: [],
    };
  }
};

/**
 * 获取干支月（简化算法，fallback用）
 */
export const getGanZhiMonth = (year: number, month: number): string => {
  const ganIndex = (year * 12 + month + 13) % 10;
  const zhiIndex = (month + 1) % 12;
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
};

/**
 * 获取干支日（简化算法，fallback用）
 */
export const getGanZhiDay = (year: number, month: number, day: number): string => {
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const ganIndex = (daysDiff + 4) % 10;
  const zhiIndex = (daysDiff + 4) % 12;
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
};

/**
 * 获取今日吉凶（宜忌、吉神、凶煞）
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

// 以下为简化算法备用函数（fallback用）

const getSpringFestivalDate = (year: number): { month: number; day: number } => {
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

const getDaysInLunarYear = (year: number): number => {
  return 354;
};

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
