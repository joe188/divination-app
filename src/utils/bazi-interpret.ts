/**
 * 八字解析模块（参照沐玄阁 API 2.0 规范）
 * 提供详细的八字分析和断语
 */

import { BaZiResult } from './bazi-calculator';

export interface BaZiAnalysis {
  summary: string; // 总体断语
  analysis: {
    ganZhi: string; // 天干地支分析
    fiveElements: string; // 五行分析
    shishen: string; // 十神分析
    dayMaster: string; // 日主分析
    yongShen: string; // 用神分析
    cangGan: string; // 藏干分析
    shenSha: string; // 神煞分析
    naYin: string; // 纳音分析
    kongWang: string; // 空亡分析
    geJu: string; // 格局分析
  };
  advice: string; // 建议
}

/**
 * 生成完整八字解析
 */
export const generateFullBaZiAnalysis = (result: BaZiResult): BaZiAnalysis => {
  const { ganZhi, fiveElements, shishen } = result;
  
  // 总体断语
  const summary = generateBaZiSummary(ganZhi, fiveElements);
  
  // 详细分析
  const analysis = {
    ganZhi: analyzeGanZhi(ganZhi),
    fiveElements: analyzeFiveElements(fiveElements),
    shishen: analyzeShishen(shishen),
    dayMaster: analyzeDayMaster(ganZhi.day.gan),
    yongShen: analyzeYongShen(ganZhi, fiveElements),
    cangGan: analyzeCangGan(ganZhi),
    shenSha: analyzeShenSha(ganZhi),
    naYin: analyzeNaYin(ganZhi),
    kongWang: analyzeKongWang(ganZhi),
    geJu: analyzeGeJu(ganZhi, fiveElements),
  };
  
  // 建议
  const advice = generateBaZiAdvice(ganZhi, fiveElements);
  
  return {
    summary,
    analysis,
    advice,
  };
};

/**
 * 生成总体断语
 */
const generateBaZiSummary = (ganZhi: any, fiveElements: any): string => {
  const dayGan = ganZhi.day.gan;
  const dayZhi = ganZhi.day.zhi;
  
  let summary = '【八字总体分析】\n';
  summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  summary += `【日主】${dayGan}${dayZhi}\n`;
  summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 五行旺衰
  const elements = Object.entries(fiveElements) as [string, number][];
  const sorted = elements.sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  
  summary += `• 五行最旺：${strongest[0]}（${strongest[1]}个）\n`;
  summary += `• 五行最弱：${weakest[0]}（${weakest[1]}个）\n`;
  
  // 五行平衡度
  const total = elements.reduce((sum, [, count]) => sum + count, 0);
  const avg = total / 5;
  const variance = elements.reduce((sum, [, count]) => sum + Math.pow(count - avg, 2), 0) / 5;
  
  if (variance < 0.5) {
    summary += '• 五行平衡：较为均衡\n';
  } else if (variance < 1.5) {
    summary += '• 五行平衡：略有偏颇\n';
  } else {
    summary += '• 五行平衡：偏颇较大\n';
  }
  
  return summary;
};

/**
 * 天干地支分析
 */
const analyzeGanZhi = (ganZhi: any): string => {
  let analysis = '【天干地支分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 年柱
  analysis += `【年柱】${ganZhi.year.gan}${ganZhi.year.zhi}\n`;
  analysis += `• 含义：代表祖上、父母、少年运\n`;
  analysis += `• 天干${ganZhi.year.gan}：${getGanMeaning(ganZhi.year.gan)}\n`;
  analysis += `• 地支${ganZhi.year.zhi}：${getZhiMeaning(ganZhi.year.zhi)}\n`;
  
  // 月柱
  analysis += `\n【月柱】${ganZhi.month.gan}${ganZhi.month.zhi}\n`;
  analysis += `• 含义：代表父母、兄弟、青年运\n`;
  analysis += `• 天干${ganZhi.month.gan}：${getGanMeaning(ganZhi.month.gan)}\n`;
  analysis += `• 地支${ganZhi.month.zhi}：${getZhiMeaning(ganZhi.month.zhi)}\n`;
  
  // 日柱
  analysis += `\n【日柱】${ganZhi.day.gan}${ganZhi.day.zhi}\n`;
  analysis += `• 含义：代表自己、配偶、中年运\n`;
  analysis += `• 天干${ganZhi.day.gan}（日主）：${getGanMeaning(ganZhi.day.gan)}\n`;
  analysis += `• 地支${ganZhi.day.zhi}（配偶宫）：${getZhiMeaning(ganZhi.day.zhi)}\n`;
  
  // 时柱
  analysis += `\n【时柱】${ganZhi.hour.gan}${ganZhi.hour.zhi}\n`;
  analysis += `• 含义：代表子女、晚辈、晚年运\n`;
  analysis += `• 天干${ganZhi.hour.gan}：${getGanMeaning(ganZhi.hour.gan)}\n`;
  analysis += `• 地支${ganZhi.hour.zhi}：${getZhiMeaning(ganZhi.hour.zhi)}\n`;
  
  return analysis;
};

/**
 * 五行分析
 */
const analyzeFiveElements = (fiveElements: any): string => {
  let analysis = '【五行分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  const elements = [
    { name: '木', count: fiveElements.wood, meaning: '生发、条达、曲直' },
    { name: '火', count: fiveElements.fire, meaning: '炎上、光明、礼仪' },
    { name: '土', count: fiveElements.earth, meaning: '厚重、承载、信义' },
    { name: '金', count: fiveElements.metal, meaning: '刚强、肃杀、收敛' },
    { name: '水', count: fiveElements.water, meaning: '润下、寒冷、智慧' },
  ];
  
  elements.forEach(el => {
    const status = el.count === 0 ? '缺' : el.count === 1 ? '弱' : el.count === 2 ? '平' : el.count >= 3 ? '旺' : '平';
    analysis += `• ${el.name}：${el.count}个（${status}）- ${el.meaning}\n`;
  });
  
  analysis += `\n【五行含义】\n`;
  analysis += `• 木旺：仁慈、温和、有爱心\n`;
  analysis += `• 火旺：热情、积极、有礼貌\n`;
  analysis += `• 土旺：稳重、诚实、有信义\n`;
  analysis += `• 金旺：刚毅、果断、有义气\n`;
  analysis += `• 水旺：智慧、灵活、有谋略\n`;
  
  return analysis;
};

/**
 * 十神分析
 */
const analyzeShishen = (shishen: string[]): string => {
  let analysis = '【十神分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  const shishenMeaning: { [key: string]: string } = {
    '比肩': '代表兄弟姐妹、朋友、同辈',
    '劫财': '代表竞争、破财、是非',
    '食神': '代表才华、福气、子女',
    '伤官': '代表聪明、叛逆、口才',
    '偏财': '代表意外之财、偏业',
    '正财': '代表正当之财、工资',
    '七杀': '代表压力、权威、魄力',
    '正官': '代表官职、地位、名誉',
    '偏印': '代表偏门学问、孤独',
    '正印': '代表学业、母亲、贵人',
  };
  
  shishen.forEach((ss, index) => {
    const position = ['年干', '月干', '时干'][index];
    analysis += `• ${position}：${ss} - ${shishenMeaning[ss] || '含义待查'}\n`;
  });
  
  analysis += `\n【十神含义】\n`;
  analysis += `• 比劫：代表自我、同辈、竞争\n`;
  analysis += `• 食伤：代表才华、表达、子女\n`;
  analysis += `• 财星：代表财富、妻室、父亲\n`;
  analysis += `• 官杀：代表事业、权威、子女\n`;
  analysis += `• 印星：代表学业、母亲、贵人\n`;
  
  return analysis;
};

/**
 * 日主分析
 */
const analyzeDayMaster = (dayGan: string): string => {
  let analysis = '【日主分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  const ganInfo: { [key: string]: { element: string; nature: string; traits: string } } = {
    '甲': { element: '木', nature: '阳', traits: '刚直、仁慈、有领导力' },
    '乙': { element: '木', nature: '阴', traits: '柔顺、灵活、有谋略' },
    '丙': { element: '火', nature: '阳', traits: '热情、光明、有魄力' },
    '丁': { element: '火', nature: '阴', traits: '温和、细腻、有文采' },
    '戊': { element: '土', nature: '阳', traits: '稳重、诚实、有信义' },
    '己': { element: '土', nature: '阴', traits: '厚道、包容、有耐心' },
    '庚': { element: '金', nature: '阳', traits: '刚毅、果断、有义气' },
    '辛': { element: '金', nature: '阴', traits: '精致、敏锐、有才华' },
    '壬': { element: '水', nature: '阳', traits: '智慧、灵活、有谋略' },
    '癸': { element: '水', nature: '阴', traits: '聪慧、细腻、有洞察力' },
  };
  
  const info = ganInfo[dayGan];
  if (info) {
    analysis += `• 日主：${dayGan}（${info.nature}${info.element}）\n`;
    analysis += `• 五行：${info.element}\n`;
    analysis += `• 性质：${info.nature}\n`;
    analysis += `• 特点：${info.traits}\n`;
  }
  
  return analysis;
};

/**
 * 用神分析
 */
const analyzeYongShen = (ganZhi: any, fiveElements: any): string => {
  let analysis = '【用神分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 简化版：根据五行旺衰判断用神
  const elements = Object.entries(fiveElements) as [string, number][];
  const sorted = elements.sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0][0];
  const weakest = sorted[sorted.length - 1][0];
  
  analysis += `• 五行最旺：${strongest}\n`;
  analysis += `• 五行最弱：${weakest}\n`;
  
  // 用神建议
  const yongShenMap: { [key: string]: string } = {
    '木': '水、木',
    '火': '木、火',
    '土': '火、土',
    '金': '土、金',
    '水': '金、水',
  };
  
  analysis += `• 建议用神：${yongShenMap[weakest] || '待定'}\n`;
  analysis += `• 喜神：生助用神的五行\n`;
  analysis += `• 忌神：克制用神的五行\n`;
  
  analysis += `\n【用神含义】\n`;
  analysis += `• 用神：对日主有利的五行\n`;
  analysis += `• 喜神：生助用神的五行\n`;
  analysis += `• 忌神：对日主不利的五行\n`;
  analysis += `• 仇神：克制用神的五行\n`;
  
  return analysis;
};

/**
 * 藏干分析
 */
const analyzeCangGan = (ganZhi: any): string => {
  let analysis = '【藏干分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  const cangGanMap: { [key: string]: string[] } = {
    '子': ['癸'],
    '丑': ['己', '癸', '辛'],
    '寅': ['甲', '丙', '戊'],
    '卯': ['乙'],
    '辰': ['戊', '乙', '癸'],
    '巳': ['丙', '戊', '庚'],
    '午': ['丁', '己'],
    '未': ['己', '丁', '乙'],
    '申': ['庚', '壬', '戊'],
    '酉': ['辛'],
    '戌': ['戊', '辛', '丁'],
    '亥': ['壬', '甲'],
  };
  
  const positions = ['年支', '月支', '日支', '时支'];
  const zhis = [ganZhi.year.zhi, ganZhi.month.zhi, ganZhi.day.zhi, ganZhi.hour.zhi];
  
  zhis.forEach((zhi, index) => {
    const cangGan = cangGanMap[zhi] || [];
    analysis += `• ${positions[index]}${zhi}藏干：${cangGan.join('、')}\n`;
  });
  
  analysis += `\n【藏干含义】\n`;
  analysis += `• 藏干：地支中隐藏的天干\n`;
  analysis += `• 主气：地支本气\n`;
  analysis += `• 中气：地支中气\n`;
  analysis += `• 余气：地支余气\n`;
  
  return analysis;
};

/**
 * 神煞分析
 */
const analyzeShenSha = (ganZhi: any): string => {
  let analysis = '【神煞分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 简化版：只计算一些常见的神煞
  const dayGan = ganZhi.day.gan;
  
  // 天乙贵人
  const tianYiMap: { [key: string]: string } = {
    '甲': '丑、未', '戊': '丑、未', '庚': '丑、未',
    '乙': '子、申', '己': '子、申',
    '丙': '亥、酉', '丁': '亥、酉',
    '壬': '卯、巳', '癸': '卯、巳',
    '辛': '午、寅',
  };
  
  analysis += `• 天乙贵人：${tianYiMap[dayGan] || '无'}\n`;
  
  // 文昌贵人
  const wenChangMap: { [key: string]: string } = {
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申',
    '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯',
  };
  
  analysis += `• 文昌贵人：${wenChangMap[dayGan] || '无'}\n`;
  
  analysis += `\n【神煞含义】\n`;
  analysis += `• 天乙贵人：最吉之神，逢凶化吉\n`;
  analysis += `• 文昌贵人：主聪明、学业、考试\n`;
  analysis += `• 桃花：主异性缘、感情\n`;
  analysis += `• 驿马：主变动、出行\n`;
  
  return analysis;
};

/**
 * 纳音分析
 */
const analyzeNaYin = (ganZhi: any): string => {
  let analysis = '【纳音分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 简化版：只显示年柱纳音
  const naYinMap: { [key: string]: string } = {
    '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
    '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
    '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
    '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
    '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
    '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
    '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
    '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
    '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
    '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
    '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
    '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
    '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
    '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
    '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
  };
  
  const yearGanZhi = ganZhi.year.gan + ganZhi.year.zhi;
  const yearNaYin = naYinMap[yearGanZhi] || '待查';
  
  analysis += `• 年柱纳音：${yearNaYin}\n`;
  
  analysis += `\n【纳音含义】\n`;
  analysis += `• 纳音：干支组合的五行属性\n`;
  analysis += `• 用于判断命格、性格等\n`;
  
  return analysis;
};

/**
 * 空亡分析
 */
const analyzeKongWang = (ganZhi: any): string => {
  let analysis = '【空亡分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 简化版：根据日柱计算空亡
  const kongWangMap: { [key: string]: string } = {
    '甲子': '戌亥', '甲戌': '申酉', '甲申': '午未', '甲午': '辰巳', '甲辰': '寅卯', '甲寅': '子丑',
    '乙丑': '戌亥', '乙亥': '申酉', '乙酉': '午未', '乙未': '辰巳', '乙巳': '寅卯', '乙卯': '子丑',
    '丙寅': '戌亥', '丙子': '申酉', '丙戌': '午未', '丙申': '辰巳', '丙午': '寅卯', '丙辰': '子丑',
    '丁卯': '戌亥', '丁丑': '申酉', '丁亥': '午未', '丁酉': '辰巳', '丁未': '寅卯', '丁巳': '子丑',
    '戊辰': '戌亥', '戊寅': '申酉', '戊子': '午未', '戊戌': '辰巳', '戊申': '寅卯', '戊午': '子丑',
    '己巳': '戌亥', '己卯': '申酉', '己丑': '午未', '己亥': '辰巳', '己酉': '寅卯', '己未': '子丑',
    '庚午': '戌亥', '庚辰': '申酉', '庚寅': '午未', '庚子': '辰巳', '庚戌': '寅卯', '庚申': '子丑',
    '辛未': '戌亥', '辛巳': '申酉', '辛卯': '午未', '辛丑': '辰巳', '辛亥': '寅卯', '辛酉': '子丑',
    '壬申': '戌亥', '壬午': '申酉', '壬辰': '午未', '壬寅': '辰巳', '壬子': '寅卯', '壬戌': '子丑',
    '癸酉': '戌亥', '癸未': '申酉', '癸巳': '午未', '癸卯': '辰巳', '癸丑': '寅卯', '癸亥': '子丑',
  };
  
  const dayGanZhi = ganZhi.day.gan + ganZhi.day.zhi;
  const kongWang = kongWangMap[dayGanZhi] || '待查';
  
  analysis += `• 日柱空亡：${kongWang}\n`;
  
  analysis += `\n【空亡含义】\n`;
  analysis += `• 空亡：旬空，代表缺失、空虚\n`;
  analysis += `• 空亡之地，力量减弱\n`;
  analysis += `• 吉神空亡，吉力减弱\n`;
  analysis += `• 凶神空亡，凶力减弱\n`;
  
  return analysis;
};

/**
 * 格局分析
 */
const analyzeGeJu = (ganZhi: any, fiveElements: any): string => {
  let analysis = '【格局分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 简化版：根据五行旺衰判断格局
  const elements = Object.entries(fiveElements) as [string, number][];
  const sorted = elements.sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0][0];
  
  // 格局判断
  const geJuMap: { [key: string]: string } = {
    '木': '木旺格',
    '火': '火旺格',
    '土': '土旺格',
    '金': '金旺格',
    '水': '水旺格',
  };
  
  analysis += `• 格局：${geJuMap[strongest] || '待定'}\n`;
  
  analysis += `\n【格局含义】\n`;
  analysis += `• 格局：八字的总体结构\n`;
  analysis += `• 正格：正官格、七杀格、正印格等\n`;
  analysis += `• 特殊格：从格、化格等\n`;
  analysis += `• 格局决定命局层次\n`;
  
  return analysis;
};

/**
 * 生成建议
 */
const generateBaZiAdvice = (ganZhi: any, fiveElements: any): string => {
  let advice = '【综合建议】\n';
  advice += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 五行平衡建议
  const elements = Object.entries(fiveElements) as [string, number][];
  const sorted = elements.sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0][0];
  const weakest = sorted[sorted.length - 1][0];
  
  advice += `【五行平衡】\n`;
  advice += `• 最旺：${strongest}，宜适当克制\n`;
  advice += `• 最弱：${weakest}，宜适当补充\n`;
  
  advice += `\n【事业建议】\n`;
  advice += `• 宜从事与${weakest}相关的行业\n`;
  advice += `• 避免从事与${strongest}冲突的行业\n`;
  
  advice += `\n【健康建议】\n`;
  advice += `• 注意${weakest}对应器官的保养\n`;
  advice += `• 避免过度消耗${strongest}相关的能量\n`;
  
  advice += `\n【注意事项】\n`;
  advice += `• 以上分析仅供参考\n`;
  advice += `• 实际情况需结合大运流年\n`;
  advice += `• 建议咨询专业命理师\n`;
  
  return advice;
};

/**
 * 天干含义
 */
const getGanMeaning = (gan: string): string => {
  const meanings: { [key: string]: string } = {
    '甲': '参天大树，刚直不阿',
    '乙': '花草藤蔓，柔顺灵活',
    '丙': '太阳之火，光明磊落',
    '丁': '灯烛之火，温和细腻',
    '戊': '高山之土，厚重稳固',
    '己': '田园之土，厚道包容',
    '庚': '钢铁之金，刚毅果断',
    '辛': '珠玉之金，精致敏锐',
    '壬': '江河之水，智慧灵活',
    '癸': '雨露之水，聪慧细腻',
  };
  return meanings[gan] || '含义待查';
};

/**
 * 地支含义
 */
const getZhiMeaning = (zhi: string): string => {
  const meanings: { [key: string]: string } = {
    '子': '水，智慧、灵活',
    '丑': '土，稳重、踏实',
    '寅': '木，生发、进取',
    '卯': '木，温和、细腻',
    '辰': '土，厚重、包容',
    '巳': '火，热情、积极',
    '午': '火，光明、磊落',
    '未': '土，厚道、诚实',
    '申': '金，刚毅、果断',
    '酉': '金，精致、敏锐',
    '戌': '土，稳重、忠诚',
    '亥': '水，智慧、深沉',
  };
  return meanings[zhi] || '含义待查';
};
