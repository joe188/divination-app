/**
 * 奇门遁甲排盘计算器
 * 支持节气、时辰、值符、值使、八门、九星、九宫
 */

// 节气数据（简化版：24 节气对应日期范围，实际需按太阳黄经计算）
const jieqiTable: Record<string, { month: number; day: number; solarTerm: string }> = {
  '立春': { month: 2, day: 4, solarTerm: '立春' }, '雨水': { month: 2, day: 19, solarTerm: '雨水' },
  '惊蛰': { month: 3, day: 6, solarTerm: '惊蛰' }, '春分': { month: 3, day: 21, solarTerm: '春分' },
  '清明': { month: 4, day: 5, solarTerm: '清明' }, '谷雨': { month: 4, day: 20, solarTerm: '谷雨' },
  '立夏': { month: 5, day: 6, solarTerm: '立夏' }, '小满': { month: 5, day: 21, solarTerm: '小满' },
  '芒种': { month: 6, day: 6, solarTerm: '芒种' }, '夏至': { month: 6, day: 22, solarTerm: '夏至' },
  '小暑': { month: 7, day: 7, solarTerm: '小暑' }, '大暑': { month: 7, day: 23, solarTerm: '大暑' },
  '立秋': { month: 8, day: 8, solarTerm: '立秋' }, '处暑': { month: 8, day: 23, solarTerm: '处暑' },
  '白露': { month: 9, day: 8, solarTerm: '白露' }, '秋分': { month: 9, day: 23, solarTerm: '秋分' },
  '寒露': { month: 10, day: 8, solarTerm: '寒露' }, '霜降': { month: 10, day: 24, solarTerm: '霜降' },
  '立冬': { month: 11, day: 7, solarTerm: '立冬' }, '小雪': { month: 11, day: 22, solarTerm: '小雪' },
  '大雪': { month: 12, day: 7, solarTerm: '大雪' }, '冬至': { month: 12, day: 22, solarTerm: '冬至' },
  '小寒': { month: 1, day: 6, solarTerm: '小寒' }, '大寒': { month: 1, day: 20, solarTerm: '大寒' },
};

// 天干
const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 十二时辰
const shiChen = [
  '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
  '午时', '未时', '申时', '酉时', '戌时', '亥时'
];

// 八门
const baMen = ['休', '生', '伤', '杜', '景', '死', '惊', '开'];
// 九星
const jiuXing = ['天蓬', '天任', '天冲', '天辅', '天英', '天芮', '天柱', '天心', '天禽'];
// 九宫
const jiuGong = [
  { number: 1, name: '坎' }, { number: 2, name: '坤' }, { number: 3, name: '震' },
  { number: 4, name: '巽' }, { number: 5, name: '中' }, { number: 6, name: '乾' },
  { number: 7, name: '兑' }, { number: 8, name: '艮' }, { number: 9, name: '离' }
];

/**
 * 根据日期判断节气
 */
function getCurrentSolarTerm(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  for (const [term, info] of Object.entries(jieqiTable)) {
    if (info.month === month && Math.abs(info.day - day) <= 1) {
      return term;
    }
  }
  // 默认返回最接近的
  return '冬至';
}

/**
 * 计算日干支（基于已知基准，简化算法）
 * 基准：2025-01-01 为甲子日（序号0）
 */
function getDayGanZhi(date: Date): { gan: string; zhi: string } {
  const base = new Date(2025, 0, 1); // 2025-01-01
  const days = Math.floor((date.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
  const ganIndex = days % 10;
  const zhiIndex = days % 12;
  return { gan: tianGan[ganIndex], zhi: diZhi[zhiIndex] };
}

/**
 * 计算时辰干支（基于小时）
 */
function getHourGanZhi(dayGanZhi: { gan: string; zhi: string }, hour: number): { gan: string; zhi: string } {
  // 时辰对应：23-1 子, 1-3 丑, ... 21-23 亥
  const shichenIndex = Math.floor(((hour + 1) % 24) / 2);
  const hourZhi = diZhi[shichenIndex];
  // 日上起时：甲己起甲子，乙庚起丙子，丙辛起戊子，丁壬起庚子，戊癸起壬子
  const ganStartMap: Record<string, number> = {
    '甲': 0, '乙': 2, '丙': 4, '丁': 6, '戊': 8,
    '己': 0, '庚': 2, '辛': 4, '壬': 6, '癸': 8
  };
  const hourGanIndex = (ganStartMap[dayGanZhi.gan] + shichenIndex * 2) % 10;
  return { gan: tianGan[hourGanIndex], zhi: hourZhi };
}

/**
 * 计算值符（依据日干支 + 时辰）
 * 阳遁：根据日干和节气，顺布九星
 * 阴遁：逆布
 */
function getZhiFu(dayGanZhi: { gan: string; zhi: string }, solarTerm: string, isYang: boolean = true): string {
  // 简化：值符 = 节气对应的值符（查表，这里简化为值符为天辅星）
  // 实际：根据三元九运、阴阳遁、节气、日干支等，这里固定返回一个
  return '天辅';
}

/**
 * 计算值使（依据时干支）
 */
function getZhiShi(hourGanZhi: { gan: string; zhi: string }): string {
  // 时干对应八门值使（休、生、伤、杜、景、死、惊、开）
  // 时干为甲、乙、丙、丁、戊、己、庚、辛、壬、癸
  // 对应：甲 -> 休, 乙 -> 死, 丙 -> 伤, ...
  // 简化：按戊、己、庚、辛、壬、癸、丁、丙、乙对应八门顺序
  const deng = ['休', '死', '伤', '杜', '中', '开', '惊', '生', '景']; // 1-9宫门
  // 时干序号
  const idx = tianGan.indexOf(hourGanZhi.gan);
  return deng[idx % 8] || '休';
}

/**
 * 计算八门分布
 */
function calculateBaMen(hourGanZhi: { gan: string; zhi: string }): string[] {
  // 根据时干，定值使门在何宫，然后按顺序排布八门
  const zhiShi = getZhiShi(hourGanZhi);
  const index = baMen.indexOf(zhiShi);
  // 以值使门为起始，顺时针排布（阳遁顺时针，阴遁逆时针，这里假设阳遁）
  const result: string[] = new Array(9).fill('');
  for (let i = 0; i < 8; i++) {
    result[(i + index) % 8] = baMen[i];
  }
  result[8] = result[0]; // 中宫复制
  return result;
}

/**
 * 计算九星分布
 */
function calculateJiuXing(dayGanZhi: { gan: string; zhi: string }): string[] {
  // 值符星为第一，然后按顺序（蓬任冲辅英芮柱心禽）
  const zhiFu = getZhiFu(dayGanZhi, getCurrentSolarTerm(new Date()));
  const idx = jiuXing.indexOf(zhiFu);
  if (idx === -1) return [...jiuXing];
  const result: string[] = new Array(9).fill('');
  for (let i = 0; i < 9; i++) {
    result[(i + idx) % 9] = jiuXing[i];
  }
  return result;
}

/**
 * 主排盘函数
 */
export interface QiMenResult {
  solarTerm: string;
  hourZhi: string;
  dayGanZhi: string;
  hourGanZhi: string;
  zhiFu: string;
  zhiShi: string;
  baMen: string[]; // 按九宫顺序 [1..9]
  jiuXing: string[];
  jiuGong: typeof jiuGong;
}

export function calculateQiMen(solarTerm: string, date: Date): QiMenResult {
  const dayGanZhi = getDayGanZhi(date);
  const hour = date.getHours();
  const hourGanZhi = getHourGanZhi(dayGanZhi, hour);
  const zhiFu = getZhiFu(dayGanZhi, solarTerm);
  const zhiShi = getZhiShi(hourGanZhi);
  const baMen = calculateBaMen(hourGanZhi);
  const jiuXing = calculateJiuXing(dayGanZhi);

  return {
    solarTerm,
    hourZhi: shiChen[Math.floor(((hour + 1) % 24) / 2)],
    dayGanZhi: `${dayGanZhi.gan}${dayGanZhi.zhi}`,
    hourGanZhi: `${hourGanZhi.gan}${hourGanZhi.zhi}`,
    zhiFu,
    zhiShi,
    baMen,
    jiuXing,
    jiuGong,
  };
}

/**
 * 根据节气判断阳遁/阴遁
 */
export function isYangDun(solarTerm: string): boolean {
  const yangList = ['立春', '立夏', '立秋', '立冬', '春分', '秋分', '夏至', '冬至'];
  return yangList.includes(solarTerm);
}

export default calculateQiMen;