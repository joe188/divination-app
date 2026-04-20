import { Solar, Lunar } from 'lunar-typescript';

/**
 * 获取指定公历日期的农历信息
 * @param date - Date 对象或 'YYYY-MM-DD' 字符串
 */
export const getLunarInfo = (
  date: Date | string
) => {
  try {
    let solar: any;
    if (typeof date === 'string') {
      const [year, month, day] = date.split('-').map(Number);
      solar = Solar.fromYmd(year, month, day);
    } else {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      solar = Solar.fromYmd(year, month, day);
    }

    const lunar = solar.getLunar();

    // 获取公历节日
    const solarTerm = solar.getJieQi() || '';

    return {
      lunarText: lunar.toString(),
      lunarDayChinese: lunar.getDayInChinese(),
      festivals: lunar.getFestivals() || [],
      jieQi: solarTerm,
      ganZhi: lunar.getYearInGanZhi(),
      isLeap: lunar.isLeap(),
      lunarMonth: lunar.getMonth(),
      lunarMonthChinese: lunar.getMonthInChinese(),
      lunarDay: lunar.getDay(),
      yearGanZhi: lunar.getYearInGanZhi(),
      monthGanZhi: lunar.getMonthInGanZhi(),
      dayGanZhi: lunar.getDayInGanZhi(),
      zodiac: lunar.getZodiac(),
    };
  } catch (e) {
    console.error('农历转换错误', e);
    return null;
  }
};
