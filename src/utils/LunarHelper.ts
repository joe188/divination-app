console.log('LunarHelper module loaded');
const lunar = require('lunar-typescript');
const { Solar, Lunar } = lunar || {};

function safeAccess(obj, prop, fallback) {
  try {
    const val = obj[prop];
    if (typeof val === 'function') {
      return val.call(obj);
    }
    if (typeof val !== 'undefined') {
      return val;
    }
    return fallback;
  } catch (e) {
    return fallback;
  }
}

export const getLunarInfo = (date) => {
  try {
    console.log('🛠️ getLunarInfo called:', date);
    if (!Solar || !Lunar) throw new Error('Solar/Lunar not loaded');

    let year, month, day;
    if (typeof date === 'string') {
      [year, month, day] = date.split('-').map(Number);
    } else {
      year = date.getFullYear();
      month = date.getMonth() + 1;
      day = date.getDate();
    }

    console.log('🛠️ calling Solar.fromYmd');
    const solar = Solar.fromYmd(year, month, day);
    console.log('🛠️ Solar.fromYmd succeeded');
    console.log('🛠️ calling solar.getLunar');
    const l = solar.getLunar();
    console.log('🛠️ solar.getLunar succeeded');

    return {
      lunarText: safeAccess(l, 'toString', ''),
      lunarDayChinese: safeAccess(l, 'getDayInChinese', ''),
      festivals: safeAccess(l, 'getFestivals', []) || [],
      jieQi: safeAccess(solar, 'getJieQi', '') || '',
      ganZhi: safeAccess(l, 'getYearInGanZhi', ''),
      isLeap: safeAccess(l, 'isLeap', false),
      lunarMonth: safeAccess(l, 'getMonth', month),
      lunarMonthChinese: safeAccess(l, 'getMonthInChinese', ''),
      lunarDay: safeAccess(l, 'getDay', day),
      yearGanZhi: safeAccess(l, 'getYearInGanZhi', ''),
      monthGanZhi: safeAccess(l, 'getMonthInGanZhi', ''),
      dayGanZhi: safeAccess(l, 'getDayInGanZhi', ''),
      zodiac: safeAccess(l, 'getZodiac', ''),
    };
  } catch (e) {
    console.error('农历转换错误', e);
    if (e && e.stack) console.error('Stack:', e.stack);
    return null;
  }
};
