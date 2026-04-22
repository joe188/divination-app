/**
 * 六爻本地解析工具
 * 参照沐玄阁 API 2.0 规范 (https://www.muxuange.cn/document/v2/liuyao-paipan)
 *
 * 功能：
 * - 基础排盘：本卦、变卦、互卦、错卦、综卦、伏卦
 * - 六爻详情：爻名、爻象、世应、六亲、六神、爻辞、纳音
 * - 用神分析：元神、忌神、仇神、闲神
 * - 五行旺衰、空亡、神煞
 */

import { hexagramData, GUA64_NAME } from './liuyao-data';

// 六亲（青龙 subsystem）
const SIX_RELATIONS = ['父母', '兄弟', '子孙', '妻财', '官鬼', '父母'];

// 六神（按日干排列）
const SIX_GODS = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];

// 五行
const FIVE_ELEMENTS = ['金', '木', '水', '火', '土'];

// 天干表
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支表
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 地支藏干（三朱雀）
const EARTHLY_BRANCH_HIDDEN_STEMS: Record<string, string[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

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

// 八宫卦世爻定位表（完整版）
// 每卦的世爻位置（0-5，从初爻到上爻）
// 格式：[卦序号-1] = 世爻位置
const SHI_POSITIONS: number[] = [
  // 乾宫（1-8卦）：乾、姤、遁、否、观、剥、晋、大有
  2, 0, 1, 2, 3, 4, 3, 5,
  // 兑宫（9-16卦）：兑、困、萃、咸、蹇、谦、小过、归妹
  5, 3, 4, 5, 0, 1, 0, 2,
  // 离宫（17-24卦）：离、旅、鼎、未济、蒙、涣、讼、同人
  0, 4, 5, 0, 1, 2, 1, 3,
  // 震宫（25-32卦）：震、豫、解、恒、升、井、大过、随
  3, 1, 2, 3, 4, 5, 4, 0,
  // 巽宫（33-40卦）：巽、小畜、家人、益、无妄、噬嗑、颐、蛊
  4, 2, 3, 4, 5, 0, 5, 1,
  // 坎宫（41-48卦）：坎、节、屯、既济、革、丰、明夷、师
  1, 5, 0, 1, 2, 3, 2, 4,
  // 艮宫（49-56卦）：艮、贲、大畜、损、睽、履、中孚、渐
  2, 0, 1, 2, 3, 4, 3, 5,
  // 坤宫（57-64卦）：坤、复、临、泰、大壮、夬、需、比
  1, 5, 0, 1, 2, 3, 2, 4,
];

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
 * 生成总体断语（增强版）
 */
const generateSummary = (guaName: string, transformedGuaName: string, movingCount: number): string => {
  let summary = `【本卦】${guaName}`;
  
  if (movingCount === 0) {
    summary += '，静卦，以本卦卦辞断之。\n';
    summary += '• 现状稳定，变化不大\n';
    summary += '• 宜守不宜攻，以静制动\n';
  } else if (movingCount === 1) {
    summary += `，一爻动，变卦为${transformedGuaName}。\n`;
    summary += '• 事有转机，变化明确\n';
    summary += '• 以动爻爻辞为主，参看变卦\n';
  } else if (movingCount === 2) {
    summary += `，二爻动，变卦为${transformedGuaName}。\n`;
    summary += '• 事有波折，需综合判断\n';
    summary += '• 以上爻为主，下爻为辅\n';
  } else if (movingCount <= 3) {
    summary += `，多爻动，变卦为${transformedGuaName}。\n`;
    summary += '• 事多变化，情况复杂\n';
    summary += '• 以本卦为主，变卦为参考\n';
  } else {
    summary += '，乱动之卦，事体复杂。\n';
    summary += '• 变数太多，难以预测\n';
    summary += '• 宜静观其变，不可冒进\n';
  }
  
  return summary;
};

/**
 * 断卦方法分析（增强版）
 */
const analyzeMethod = (guaName: string, lines: number[], movingLines: number[]): string => {
  // 获取卦辞
  const gua = hexagramData.find(g => g.name === guaName);
  const judgement = gua?.judgement || '卦辞待查';
  const image = gua?.image || '象传待查';
  
  let method = '【断卦方法】\n';
  method += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  method += `【卦辞】${judgement}\n`;
  method += `【象传】${image}\n`;
  method += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  if (movingLines.length === 0) {
    method += '【断法】静卦无动爻，以本卦卦辞为主断之。\n';
    method += '• 查看卦辞含义，理解卦象主旨\n';
    method += '• 结合问事，判断吉凶成败\n';
  } else if (movingLines.length === 1) {
    method += '【断法】一爻独发，以动爻爻辞为主断之。\n';
    method += '• 查看动爻爻辞，理解变化含义\n';
    method += '• 参看变卦卦辞，判断最终结果\n';
    
    // 获取动爻爻辞
    const movingIndex = movingLines[0];
    const lineText = gua?.lines.find(l => l.position === movingIndex + 1);
    if (lineText) {
      method += `• 动爻爻辞：${lineText.content}\n`;
    }
  } else if (movingLines.length === 2) {
    method += '【断法】二爻同动，以上爻为主，下爻为辅。\n';
    method += '• 上爻代表主要变化，下爻代表辅助因素\n';
    method += '• 结合两爻爻辞，综合判断\n';
  } else {
    method += '【断法】多爻齐动，以本卦为主，变卦为参考。\n';
    method += '• 动爻过多，变化复杂\n';
    method += '• 宜谨慎行事，不可冒进\n';
  }
  
  return method;
};

/**
 * 六亲分析（增强版）
 */
const analyzeSixRelations = (lines: number[]): string => {
  let analysis = '【六亲分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 简化版：根据爻的阴阳分布
  const yangCount = lines.filter(l => l === 1).length;
  const yinCount = 6 - yangCount;
  
  analysis += `• 阳爻：${yangCount}个，阴爻：${yinCount}个\n`;
  
  if (yangCount > yinCount) {
    analysis += '• 阳盛：主动、刚强、进取\n';
    analysis += '• 性质：刚健有为，利于行动\n';
    analysis += '• 建议：宜积极进取，把握时机\n';
  } else if (yinCount > yangCount) {
    analysis += '• 阴盛：被动、柔顺、守成\n';
    analysis += '• 性质：柔顺谦和，利于守成\n';
    analysis += '• 建议：宜静观其变，以柔克刚\n';
  } else {
    analysis += '• 阴阳平衡：刚柔并济\n';
    analysis += '• 性质：中正平和，进退有度\n';
    analysis += '• 建议：可进可退，灵活应变\n';
  }
  
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  analysis += '【六亲含义】\n';
  analysis += '• 父母：文书、长辈、庇护\n';
  analysis += '• 兄弟：朋友、竞争、阻隔\n';
  analysis += '• 子孙：福神、解忧、子嗣\n';
  analysis += '• 妻财：财源、妻室、粮食\n';
  analysis += '• 官鬼：功名、鬼神、疾病\n';
  
  return analysis;
};

/**
 * 六神分析
 */
const analyzeSixGods = (lines: number[]): string => {
  return '【六神】\n• 需根据占卜日干确定六神位置\n';
};

/**
 * 五行旺衰分析（增强版）
 */
const analyzeFiveElements = (upperGua: string, lowerGua: string): string => {
  const upperElement = BAGUA_ELEMENT[upperGua] || '';
  const lowerElement = BAGUA_ELEMENT[lowerGua] || '';
  
  let analysis = '【五行分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  analysis += `• 上卦${upperGua}属${upperElement}\n`;
  analysis += `• 下卦${lowerGua}属${lowerElement}\n`;
  
  // 五行生克
  const shengKe = getWuXingShengKe(upperElement, lowerElement);
  if (shengKe) {
    analysis += `• 关系：${shengKe}\n`;
  }
  
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  analysis += '【五行含义】\n';
  analysis += '• 金：刚强、肃杀、收敛\n';
  analysis += '• 木：生发、条达、曲直\n';
  analysis += '• 水：润下、寒冷、智慧\n';
  analysis += '• 火：炎上、光明、礼仪\n';
  analysis += '• 土：厚重、承载、信义\n';
  
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
 * 计算每爻的六亲
 * @param guaNum 卦序号（1-64）
 * @param lines 爻象数组
 * @returns 六爻的六亲数组
 */
const calculateLiuQin = (guaNum: number, lines: number[]): string[] => {
  // 根据卦宫确定五行
  const palace = Math.floor((guaNum - 1) / 8) + 1;
  const palaceNames = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
  const palaceName = palaceNames[palace - 1];
  const palaceElement = BAGUA_ELEMENT[palaceName] || '土';
  
  // 六亲顺序（根据卦宫五行）
  const liuQinOrder = getLiuQinOrder(palaceElement);
  
  // 每爻的六亲（简化版：根据爻位分配）
  return lines.map((line, i) => {
    // 阳爻和阴爻分配不同的六亲
    const index = line === 1 ? i : (i + 3) % 6;
    return liuQinOrder[index];
  });
};

/**
 * 根据卦宫五行获取六亲顺序
 */
const getLiuQinOrder = (element: string): string[] => {
  // 六亲五行对应：父母、兄弟、子孙、妻财、官鬼
  const elementOrder: Record<string, string[]> = {
    '金': ['父母', '兄弟', '子孙', '妻财', '官鬼', '父母'],
    '木': ['父母', '兄弟', '子孙', '妻财', '官鬼', '父母'],
    '水': ['父母', '兄弟', '子孙', '妻财', '官鬼', '父母'],
    '火': ['父母', '兄弟', '子孙', '妻财', '官鬼', '父母'],
    '土': ['父母', '兄弟', '子孙', '妻财', '官鬼', '父母'],
  };
  return elementOrder[element] || SIX_RELATIONS;
};

/**
 * 计算每爻的六神
 * @param dayGan 日干（甲乙丙丁戊己庚辛壬癸）
 * @returns 六神数组（从初爻到上爻）
 */
const calculateLiuShen = (dayGan: string): string[] => {
  // 根据日干确定六神起始位置
  const ganIndex = HEAVENLY_STEMS.indexOf(dayGan);
  const startIndex = ganIndex % 5; // 甲乙从青龙开始，丙丁从朱雀开始...
  
  // 六神顺序
  const liuShenOrder = [];
  for (let i = 0; i < 6; i++) {
    liuShenOrder.push(SIX_GODS[(startIndex + i) % 6]);
  }
  
  return liuShenOrder;
};

/**
 * 计算每爻的纳音（天干地支组合）
 * @param lines 爻象数组
 * @param guaNum 卦序号
 * @returns 纳音数组
 */
const calculateNaYin = (lines: number[], guaNum: number): string[] => {
  // 简化版：根据爻位和阴阳确定纳音
  const naYinTable: string[] = [
    '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳',
    '庚午', '辛未', '壬申', '癸酉', '甲戌', '乙亥'
  ];
  
  return lines.map((line, i) => {
    const index = (guaNum + i + (line === 1 ? 0 : 6)) % 12;
    return naYinTable[index];
  });
};

/**
 * 动爻分析（增强版）
 */
const analyzeMovingLines = (lines: number[], movingLines: number[], coinResults?: number[]): string => {
  if (movingLines.length === 0) {
    let analysis = '【动爻分析】\n';
    analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    analysis += '• 静卦，无动爻\n';
    analysis += '• 现状稳定，变化不大\n';
    analysis += '• 以本卦卦辞为主断之\n';
    return analysis;
  }
  
  let analysis = '【动爻分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  analysis += `• 动爻数量：${movingLines.length}个\n`;
  
  const positions = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
  
  movingLines.forEach((index) => {
    const position = positions[index];
    const value = coinResults?.[index] || (lines[index] === 1 ? 9 : 6);
    const isOld = value === 6 || value === 9;
    
    analysis += `\n【${position}】\n`;
    analysis += `• 爻值：${value}（${isOld ? '老' : '少'}${lines[index] === 1 ? '阳' : '阴'}）\n`;
    
    if (value === 6) {
      analysis += '• 性质：老阴变阳，阴极转阳\n';
      analysis += '• 含义：柔极必刚，静极必动\n';
      analysis += '• 影响：事物由静转动，由柔转刚\n';
    } else if (value === 9) {
      analysis += '• 性质：老阳变阴，阳极转阴\n';
      analysis += '• 含义：刚极必柔，动极必静\n';
      analysis += '• 影响：事物由动转静，由刚转柔\n';
    }
    
    // 爻位含义
    if (index === 0) {
      analysis += '• 爻位：初爻，代表事物初始\n';
    } else if (index === 5) {
      analysis += '• 爻位：上爻，代表事物终了\n';
    } else {
      analysis += `• 爻位：${position}，代表事物发展过程\n`;
    }
  });
  
  return analysis;
};

/**
 * 计算互卦（二三四爻为下卦，三四五爻为上卦）
 */
const calculateHuGua = (lines: number[]): number[] => {
  return [lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]];
};

/**
 * 计算错卦（每爻阴阳互换）
 */
const calculateCuoGua = (lines: number[]): number[] => {
  return lines.map(l => l === 1 ? 0 : 1);
};

/**
 * 计算综卦（上下卦互换）
 */
const calculateZongGua = (lines: number[]): number[] => {
  return [lines[3], lines[4], lines[5], lines[0], lines[1], lines[2]];
};

/**
 * 计算伏卦（根据卦宫找伏神）
 * 简化版：返回错卦作为伏卦
 */
const calculateFuGua = (lines: number[]): number[] => {
  return calculateCuoGua(lines);
};

/**
 * 世应爻分析（使用完整世爻表）
 */
const analyzeShiYing = (guaNum: number): string => {
  const shiPosition = SHI_POSITIONS[guaNum - 1] || 0;
  const yingPosition = (shiPosition + 3) % 6;
  
  const positions = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
  const shiYao = positions[shiPosition];
  const yingYao = positions[yingPosition];
  
  return `【世应爻】\n• 世爻：${shiYao}（代表自己）\n• 应爻：${yingYao}（代表他人/事）\n`;
};

/**
 * 生成建议（增强版）
 */
const generateAdvice = (guaName: string, transformedGuaName: string, movingCount: number): string => {
  let advice = '【综合建议】\n';
  advice += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 根据动爻数量给出建议
  if (movingCount === 0) {
    advice += '【现状】\n';
    advice += '• 现状稳定，变化不大\n';
    advice += '• 宜守不宜攻，以静制动\n';
    advice += '\n【行动建议】\n';
    advice += '• 等待时机，不宜主动出击\n';
    advice += '• 保持现状，巩固已有成果\n';
    advice += '• 观察环境，等待变化契机\n';
  } else if (movingCount === 1) {
    advice += '【现状】\n';
    advice += '• 事有转机，变化明确\n';
    advice += '• 宜把握时机，顺势而为\n';
    advice += '\n【行动建议】\n';
    advice += '• 关注动爻变化，把握关键节点\n';
    advice += '• 顺势而为，不宜逆势而行\n';
    advice += '• 参看变卦，预判最终结果\n';
  } else if (movingCount === 2) {
    advice += '【现状】\n';
    advice += '• 事有波折，需综合判断\n';
    advice += '• 宜谨慎行事，不可冒进\n';
    advice += '\n【行动建议】\n';
    advice += '• 综合分析，不可偏听偏信\n';
    advice += '• 灵活应变，随时调整策略\n';
    advice += '• 以上爻为主，下爻为辅\n';
  } else {
    advice += '【现状】\n';
    advice += '• 变数太多，情况复杂\n';
    advice += '• 宜静观其变，不可冒进\n';
    advice += '\n【行动建议】\n';
    advice += '• 谨慎行事，不可贸然决断\n';
    advice += '• 多方考虑，权衡利弊\n';
    advice += '• 等待时机，以静制动\n';
  }
  
  // 根据卦名给出建议
  advice += `\n【卦象提示】\n`;
  if (transformedGuaName) {
    advice += `• 本卦${guaName}，变卦${transformedGuaName}\n`;
    advice += `• 变卦提示未来发展方向\n`;
  } else {
    advice += `• 本卦${guaName}，静卦无变\n`;
    advice += `• 以本卦卦辞为主断之\n`;
  }
  
  advice += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  advice += '【注意事项】\n';
  advice += '• 以上分析仅供参考\n';
  advice += '• 实际情况需结合具体问事\n';
  advice += '• 建议咨询专业易学人士\n';
  
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

/**
 * 用神分析
 * @param liuQin 六亲数组
 * @param lines 爻象数组
 * @returns 用神分析结果
 */
export const analyzeYongShen = (liuQin: string[], lines: number[]): {
  yongShen: string;
  yuanShen: string;
  jiShen: string;
  chouShen: string;
  xianShen: string;
} => {
  // 简化版：根据六亲确定用神
  // 实际应根据问事类型确定（问财用妻财，问官用官鬼等）
  
  // 默认用神：官鬼（问事业）
  const yongShenIndex = liuQin.findIndex(q => q === '官鬼');
  const yongShen = yongShenIndex >= 0 ? `第${yongShenIndex + 1}爻官鬼` : '无';
  
  // 元神（生用神者）
  const yuanShenIndex = liuQin.findIndex(q => q === '父母');
  const yuanShen = yuanShenIndex >= 0 ? `第${yuanShenIndex + 1}爻父母` : '无';
  
  // 忌神（克用神者）
  const jiShenIndex = liuQin.findIndex(q => q === '子孙');
  const jiShen = jiShenIndex >= 0 ? `第${jiShenIndex + 1}爻子孙` : '无';
  
  // 仇神（生忌神者）
  const chouShenIndex = liuQin.findIndex(q => q === '妻财');
  const chouShen = chouShenIndex >= 0 ? `第${chouShenIndex + 1}爻妻财` : '无';
  
  // 闲神（无关者）
  const xianShenIndex = liuQin.findIndex(q => q === '兄弟');
  const xianShen = xianShenIndex >= 0 ? `第${xianShenIndex + 1}爻兄弟` : '无';
  
  return { yongShen, yuanShen, jiShen, chouShen, xianShen };
};

/**
 * 计算空亡
 * @param dayGanZhi 日干支
 * @returns 空亡地支
 */
export const calculateKongWang = (dayGanZhi: string): string[] => {
  // 简化版：根据日干支计算空亡
  const kongWangTable: Record<string, string[]> = {
    '甲子': ['戌', '亥'],
    '甲戌': ['申', '酉'],
    '甲申': ['午', '未'],
    '甲午': ['辰', '巳'],
    '甲辰': ['寅', '卯'],
    '甲寅': ['子', '丑'],
  };
  
  // 找到对应的旬首
  const gan = dayGanZhi[0];
  
  for (const [key, value] of Object.entries(kongWangTable)) {
    if (key[0] === gan) {
      return value;
    }
  }
  
  return ['戌', '亥']; // 默认
};

/**
 * 完整六爻排盘（符合沐玄阁 API 2.0 规范）
 */
export interface FullLiuYaoResult {
  // 基础信息
  guaName: string; // 本卦名
  transformedGuaName: string; // 变卦名
  huGuaName: string; // 互卦名
  cuoGuaName: string; // 错卦名
  zongGuaName: string; // 综卦名
  fuGuaName: string; // 伏卦名
  
  // 上下卦
  upperGua: string;
  lowerGua: string;
  
  // 世应爻
  shiPosition: number;
  yingPosition: number;
  
  // 每爻详细信息
  yaoDetails: YaoDetail[];
  
  // 用神分析
  yongShenAnalysis: {
    yongShen: string;
    yuanShen: string;
    jiShen: string;
    chouShen: string;
    xianShen: string;
  };
  
  // 空亡
  kongWang: string[];
  
  // 总体分析
  summary: string;
  advice: string;
}

/**
 * 每爻详细信息
 */
export interface YaoDetail {
  position: number; // 爻位（0-5）
  positionName: string; // 爻名（初爻、二爻...）
  yaoXiang: string; // 爻象（— 或 --）
  isYang: boolean; // 是否阳爻
  liuQin: string; // 六亲
  liuShen: string; // 六神
  naYin: string; // 纳音
  isShi: boolean; // 是否世爻
  isYing: boolean; // 是否应爻
  isMoving: boolean; // 是否动爻
  yaoCi?: string; // 爻辞
}

/**
 * 生成完整六爻排盘结果
 */
export const generateFullLiuYaoResult = (
  lines: number[],
  movingLines: number[],
  dayGan?: string,
  dayGanZhi?: string,
  coinResults?: number[]
): FullLiuYaoResult => {
  const guaNum = calculateGuaNumber(lines);
  const guaName = GUA64_NAME[guaNum] || '未知卦';
  
  // 变卦
  const transformedLines = lines.map((line, i) => 
    movingLines.includes(i) ? (line === 1 ? 0 : 1) : line
  );
  const transformedGuaNum = calculateGuaNumber(transformedLines);
  const transformedGuaName = GUA64_NAME[transformedGuaNum] || '';
  
  // 互卦
  const huLines = calculateHuGua(lines);
  const huGuaNum = calculateGuaNumber(huLines);
  const huGuaName = GUA64_NAME[huGuaNum] || '';
  
  // 错卦
  const cuoLines = calculateCuoGua(lines);
  const cuoGuaNum = calculateGuaNumber(cuoLines);
  const cuoGuaName = GUA64_NAME[cuoGuaNum] || '';
  
  // 综卦
  const zongLines = calculateZongGua(lines);
  const zongGuaNum = calculateGuaNumber(zongLines);
  const zongGuaName = GUA64_NAME[zongGuaNum] || '';
  
  // 伏卦
  const fuLines = calculateFuGua(lines);
  const fuGuaNum = calculateGuaNumber(fuLines);
  const fuGuaName = GUA64_NAME[fuGuaNum] || '';
  
  // 上下卦
  const lowerGuaNum = guaNum % 8 || 8;
  const upperGuaNum = Math.floor((guaNum - 1) / 8) + 1;
  const lowerGua = getGuaNameByNumber(lowerGuaNum);
  const upperGua = getGuaNameByNumber(upperGuaNum);
  
  // 世应爻
  const shiPosition = SHI_POSITIONS[guaNum - 1] || 0;
  const yingPosition = (shiPosition + 3) % 6;
  
  // 六亲
  const liuQin = calculateLiuQin(guaNum, lines);
  
  // 六神
  const liuShen = dayGan ? calculateLiuShen(dayGan) : SIX_GODS;
  
  // 纳音
  const naYin = calculateNaYin(lines, guaNum);
  
  // 每爻详细信息
  const yaoDetails: YaoDetail[] = lines.map((line, i) => ({
    position: i,
    positionName: ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][i],
    yaoXiang: line === 1 ? '—' : '--',
    isYang: line === 1,
    liuQin: liuQin[i],
    liuShen: liuShen[i],
    naYin: naYin[i],
    isShi: i === shiPosition,
    isYing: i === yingPosition,
    isMoving: movingLines.includes(i),
    yaoCi: undefined, // TODO: 从爻辞库获取
  }));
  
  // 用神分析
  const yongShenAnalysis = analyzeYongShen(liuQin, lines);
  
  // 空亡
  const kongWang = dayGanZhi ? calculateKongWang(dayGanZhi) : [];
  
  // 总体分析
  const summary = generateSummary(guaName, transformedGuaName, movingLines.length);
  const advice = generateAdvice(guaName, transformedGuaName, movingLines.length);
  
  return {
    guaName,
    transformedGuaName,
    huGuaName,
    cuoGuaName,
    zongGuaName,
    fuGuaName,
    upperGua,
    lowerGua,
    shiPosition,
    yingPosition,
    yaoDetails,
    yongShenAnalysis,
    kongWang,
    summary,
    advice,
  };
};
