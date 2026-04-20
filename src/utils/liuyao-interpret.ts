/**
 * 六爻本地解析工具
 * 包含：断卦方法、六亲、五行、六神、世应爻等
 */

import { hexagramData, GUA64_NAME } from './liuyao-data';

// 六亲
const SIX_RELATIONS = ['父母', '兄弟', '子孙', '妻财', '官鬼', '父母'];

// 六神（按日干排列）
const SIX_GODS = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];

// 五行
const FIVE_ELEMENTS = ['金', '木', '水', '火', '土'];

// 八卦五行属性
const BAGUA_ELEMENT: Record<string, string> = {
  '乾': '金',
  '兑': '金',
  '离': '火',
  '震': '木',
  '巽': '木',
  '坎': '水',
  '艮': '土',
  '坤': '土',
};

// 八卦对应自然现象
const BAGUA_IMAGE: Record<string, string> = {
  '乾': '天',
  '兑': '泽',
  '离': '火',
  '震': '雷',
  '巽': '风',
  '坎': '水',
  '艮': '山',
  '坤': '地',
};

/**
 * 六爻完整解析
 */
export interface LiuYaoAnalysis {
  guaName: string; // 本卦名
  transformedGuaName: string; // 变卦名
  upperGua: string; // 上卦
  lowerGua: string; // 下卦
  summary: string; // 总体断语
  analysis: {
    method: string; // 断卦方法
    sixRelations: string; // 六亲分析
    fiveElements: string; // 五行旺衰
    sixGods: string; // 六神
    movingLines: string; // 动爻分析
    shiYing: string; // 世应爻
  };
  advice: string; // 建议
}

/**
 * 生成完整解析
 */
export const generateFullAnalysis = (
  lines: number[], // [1,0,1,0,1,0] 从初爻到上爻
  movingLines: number[], // 动爻索引 [0,2,5]
  coinResults?: number[] // [6,7,8,9,7,8] 爻值
): LiuYaoAnalysis => {
  const guaNum = calculateGuaNumber(lines);
  const guaName = GUA64_NAME[guaNum] || '未知卦';
  
  // 计算变卦
  const transformedLines = lines.map((line, i) => 
    movingLines.includes(i) ? (line === 1 ? 0 : 1) : line
  );
  const transformedGuaNum = calculateGuaNumber(transformedLines);
  const transformedGuaName = GUA64_NAME[transformedGuaNum] || '';
  
  // 上下卦
  const lowerGuaNum = guaNum % 8 || 8;
  const upperGuaNum = Math.floor((guaNum - 1) / 8) + 1;
  const lowerGua = getGuaNameByNumber(lowerGuaNum);
  const upperGua = getGuaNameByNumber(upperGuaNum);
  
  // 总体断语
  const summary = generateSummary(guaName, transformedGuaName, movingLines.length);
  
  // 详细分析
  const analysis = {
    method: analyzeMethod(guaName, lines, movingLines),
    sixRelations: analyzeSixRelations(lines),
    fiveElements: analyzeFiveElements(upperGua, lowerGua),
    sixGods: analyzeSixGods(lines),
    movingLines: analyzeMovingLines(lines, movingLines, coinResults),
    shiYing: analyzeShiYing(guaNum),
  };
  
  // 建议
  const advice = generateAdvice(guaName, transformedGuaName, movingLines.length);
  
  return {
    guaName,
    transformedGuaName,
    upperGua,
    lowerGua,
    summary,
    analysis,
    advice,
  };
};

/**
 * 计算卦数（1-64）
 */
const calculateGuaNumber = (lines: number[]): number => {
  // 从下往上：初爻、二爻、三爻为下卦；四爻、五爻、上爻为上卦
  const lower = lines[0] + lines[1] * 2 + lines[2] * 4;
  const upper = lines[3] + lines[4] * 2 + lines[5] * 4;
  
  // 下卦（1-8），上卦（1-8）
  const lowerNum = lower + 1;
  const upperNum = upper + 1;
  
  // 64 卦序号 = (上卦 -1) * 8 + 下卦
  return (upperNum - 1) * 8 + lowerNum;
};

/**
 * 根据数字获取卦名（八卦）
 */
const getGuaNameByNumber = (num: number): string => {
  const bagua = ['坤', '震', '坎', '兑', '艮', '离', '巽', '乾'];
  return bagua[num - 1] || '';
};

/**
 * 生成总体断语
 */
const generateSummary = (guaName: string, transformedGuaName: string, movingCount: number): string => {
  let summary = `【本卦】${guaName}，`;
  
  if (movingCount === 0) {
    summary += '静卦，以本卦卦辞断之。';
  } else if (movingCount === 1) {
    summary += `一爻动，以${transformedGuaName}为变卦，综合判断。`;
  } else if (movingCount <= 3) {
    summary += `多爻动，事多变化，以${transformedGuaName}为参考。`;
  } else {
    summary += '乱动，事体复杂，宜静观其变。';
  }
  
  return summary;
};

/**
 * 断卦方法分析
 */
const analyzeMethod = (guaName: string, lines: number[], movingLines: number[]): string => {
  // 获取卦辞
  const gua = hexagramData.find(g => g.name === guaName);
  const judgement = gua?.judgement || '';
  
  let method = '【断卦方法】\n';
  method += `• 卦辞：${judgement}\n`;
  
  if (movingLines.length > 0) {
    method += `• 动爻：${movingLines.length}个，需参看变卦\n`;
    method += `• 重点：观察动爻对卦象的影响\n`;
  }
  
  return method;
};

/**
 * 六亲分析
 */
const analyzeSixRelations = (lines: number[]): string => {
  let analysis = '【六亲分析】\n';
  
  // 简化版：根据爻的阴阳分布
  const yangCount = lines.filter(l => l === 1).length;
  const yinCount = 6 - yangCount;
  
  analysis += `• 阳爻：${yangCount}个，阴爻：${yinCount}个\n`;
  
  if (yangCount > yinCount) {
    analysis += '• 阳盛：主动、刚强、进取\n';
  } else if (yinCount > yangCount) {
    analysis += '• 阴盛：被动、柔顺、守成\n';
  } else {
    analysis += '• 阴阳平衡：刚柔并济\n';
  }
  
  return analysis;
};

/**
 * 五行旺衰分析
 */
const analyzeFiveElements = (upperGua: string, lowerGua: string): string => {
  const upperElement = BAGUA_ELEMENT[upperGua] || '';
  const lowerElement = BAGUA_ELEMENT[lowerGua] || '';
  
  let analysis = '【五行分析】\n';
  analysis += `• 上卦${upperGua}属${upperElement}\n`;
  analysis += `• 下卦${lowerGua}属${lowerElement}\n`;
  
  // 五行生克
  const shengKe = getWuXingShengKe(upperElement, lowerElement);
  if (shengKe) {
    analysis += `• 关系：${shengKe}\n`;
  }
  
  return analysis;
};

/**
 * 五行生克关系
 */
const getWuXingShengKe = (upper: string, lower: string): string => {
  const sheng = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
  const ke = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };
  
  if (sheng[lower] === upper) {
    return `下生上（${lower}生${upper}），吉利`;
  } else if (sheng[upper] === lower) {
    return `上生下（${upper}生${lower}），泄气`;
  } else if (ke[lower] === upper) {
    return `下克上（${lower}克${upper}），不利`;
  } else if (ke[upper] === lower) {
    return `上克下（${upper}克${lower}），有利`;
  } else if (upper === lower) {
    return '比和，吉利';
  }
  
  return '';
};

/**
 * 六神分析
 */
const analyzeSixGods = (lines: number[]): string => {
  return '【六神】\n• 需根据占卜日干确定六神位置\n';
};

/**
 * 动爻分析
 */
const analyzeMovingLines = (lines: number[], movingLines: number[], coinResults?: number[]): string => {
  if (movingLines.length === 0) {
    return '【动爻分析】\n• 静卦，无动爻\n';
  }
  
  let analysis = '【动爻分析】\n';
  analysis += `• 动爻数量：${movingLines.length}个\n`;
  
  movingLines.forEach((index) => {
    const position = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][index];
    const value = coinResults?.[index] || (lines[index] === 1 ? 9 : 6);
    const isOld = value === 6 || value === 9;
    
    analysis += `• ${position}：${value}（${isOld ? '老' : '少'}${lines[index] === 1 ? '阳' : '阴'}），`;
    
    if (value === 6) {
      analysis += '老阴变阳，阴极转阳\n';
    } else if (value === 9) {
      analysis += '老阳变阴，阳极转阴\n';
    }
  });
  
  return analysis;
};

/**
 * 世应爻分析
 */
const analyzeShiYing = (guaNum: number): string => {
  // 简化版：根据卦宫确定世爻位置
  const palace = Math.floor((guaNum - 1) / 8) + 1;
  const shiPosition = (palace - 1) % 6;
  
  const positions = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
  const shiYao = positions[shiPosition];
  const yingYao = positions[(shiPosition + 3) % 6];
  
  return `【世应爻】\n• 世爻：${shiYao}（代表自己）\n• 应爻：${yingYao}（代表他人/事）\n`;
};

/**
 * 生成建议
 */
const generateAdvice = (guaName: string, transformedGuaName: string, movingCount: number): string => {
  let advice = '【建议】\n';
  
  if (movingCount === 0) {
    advice += '• 现状稳定，宜守不宜攻\n';
  } else if (movingCount <= 2) {
    advice += '• 有变化迹象，宜灵活应对\n';
  } else {
    advice += '• 变化较多，宜谨慎行事\n';
  }
  
  if (transformedGuaName) {
    advice += `• 变卦${transformedGuaName}，提示未来发展方向\n`;
  }
  
  return advice;
};

/**
 * 获取卦象含义（简化版）
 */
export const getHexagramMeaning = (guaName: string): { summary: string; image: string } | null => {
  const gua = hexagramData.find(g => g.name === guaName);
  if (!gua) return null;
  
  return {
    summary: gua.judgement,
    image: gua.image,
  };
};
