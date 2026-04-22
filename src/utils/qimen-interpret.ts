/**
 * 奇门遁甲解析模块（参照沐玄阁 API 2.0 规范）
 * 提供详细的奇门遁甲分析和断语
 */

export interface QiMenAnalysis {
  summary: string; // 总体断语
  analysis: {
    ju: string; // 局分析
    zhiFu: string; // 值符分析
    zhiShi: string; // 值使分析
    baMen: string; // 八门分析
    jiuXing: string; // 九星分析
    baShen: string; // 八神分析
    siPan: string; // 四盘分析（地盘、天盘、人盘、神盘）
    keYing: string; // 克应分析
    wangShuai: string; // 旺衰分析
    fuYinFanYin: string; // 伏吟反吟分析
  };
  advice: string; // 建议
}

/**
 * 生成完整奇门遁甲解析
 */
export const generateFullQiMenAnalysis = (result: any): QiMenAnalysis => {
  const { solarTerm, zhiFu, zhiShi, baMen, jiuXing, baShen } = result;
  
  // 总体断语
  const summary = generateQiMenSummary(result);
  
  // 详细分析
  const analysis = {
    ju: analyzeJu(solarTerm),
    zhiFu: analyzeZhiFu(zhiFu),
    zhiShi: analyzeZhiShi(zhiShi),
    baMen: analyzeBaMen(baMen),
    jiuXing: analyzeJiuXing(jiuXing),
    baShen: analyzeBaShen(baShen),
    siPan: analyzeSiPan(result),
    keYing: analyzeKeYing(result),
    wangShuai: analyzeWangShuai(result),
    fuYinFanYin: analyzeFuYinFanYin(result),
  };
  
  // 建议
  const advice = generateQiMenAdvice(result);
  
  return {
    summary,
    analysis,
    advice,
  };
};

/**
 * 生成总体断语
 */
const generateQiMenSummary = (result: any): string => {
  const { solarTerm, zhiFu, zhiShi } = result;
  
  let summary = '【奇门遁甲总体分析】\n';
  summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  summary += `【节气】${solarTerm}\n`;
  summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 局的性质
  if (solarTerm.includes('立') || solarTerm.includes('分') || solarTerm.includes('至')) {
    summary += '• 性质：阳遁，主动、进取、向外\n';
    summary += '• 宜：出行、求财、进取、开拓\n';
  } else {
    summary += '• 性质：阴遁，主静、守成、向内\n';
    summary += '• 宜：守成、修养、谋划、等待\n';
  }
  
  summary += `\n【值符值使】\n`;
  summary += `• 值符：${zhiFu}（天盘之首）\n`;
  summary += `• 值使：${zhiShi}（地盘之首）\n`;
  
  return summary;
};

/**
 * 局分析
 */
const analyzeJu = (solarTerm: string): string => {
  let analysis = '【局分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  analysis += `• 节气：${solarTerm}\n`;
  
  // 判断阴阳遁
  const yangList = ['立春', '立夏', '立秋', '立冬', '春分', '秋分', '夏至', '冬至'];
  const isYang = yangList.includes(solarTerm);
  
  if (isYang) {
    analysis += `• 局性质：阳遁\n`;
    analysis += `• 含义：主动、进取、向外\n`;
  } else {
    analysis += `• 局性质：阴遁\n`;
    analysis += `• 含义：主静、守成、向内\n`;
  }
  
  analysis += `\n【局含义】\n`;
  analysis += `• 阳遁：宜出行、求财、进取、开拓\n`;
  analysis += `• 阴遁：宜守成、修养、谋划、等待\n`;
  
  return analysis;
};

/**
 * 值符分析
 */
const analyzeZhiFu = (zhiFu: string): string => {
  let analysis = '【值符分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  analysis += `• 值符：${zhiFu}\n`;
  
  const zhiFuMeaning: { [key: string]: string } = {
    '天蓬': '水星，主智慧、谋略、暗事',
    '天任': '土星，主厚重、诚实、稳重',
    '天冲': '木星，主进取、冲动、变动',
    '天辅': '木星，主温和、文雅、辅助',
    '天英': '火星，主光明、热情、礼仪',
    '天芮': '土星，主疾病、阻滞、困难',
    '天柱': '金星，主刚毅、果断、破坏',
    '天心': '金星，主智慧、谋略、策划',
    '天禽': '土星，主中正、平衡、协调',
  };
  
  if (zhiFuMeaning[zhiFu]) {
    analysis += `• 含义：${zhiFuMeaning[zhiFu]}\n`;
  }
  
  analysis += `\n【值符作用】\n`;
  analysis += `• 值符为天盘之首，代表天时\n`;
  analysis += `• 值符所在宫位，代表天时所在\n`;
  analysis += `• 值符吉凶，影响整体局势\n`;
  
  return analysis;
};

/**
 * 值使分析
 */
const analyzeZhiShi = (zhiShi: string): string => {
  let analysis = '【值使分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  analysis += `• 值使：${zhiShi}\n`;
  
  const zhiShiMeaning: { [key: string]: string } = {
    '休门': '水门，主休息、养生、等待',
    '生门': '土门，主生发、求财、进取',
    '伤门': '木门，主伤害、破坏、变动',
    '杜门': '木门，主阻塞、隐藏、避难',
    '景门': '火门，主光明、文书、计划',
    '死门': '土门，主死亡、闭塞、困难',
    '惊门': '金门，主惊恐、口舌、是非',
    '开门': '金门，主开放、进取、开拓',
  };
  
  if (zhiShiMeaning[zhiShi]) {
    analysis += `• 含义：${zhiShiMeaning[zhiShi]}\n`;
  }
  
  analysis += `\n【值使作用】\n`;
  analysis += `• 值使为地盘之首，代表地利\n`;
  analysis += `• 值使所在宫位，代表地利所在\n`;
  analysis += `• 值使吉凶，影响行动成败\n`;
  
  return analysis;
};

/**
 * 八门分析
 */
const analyzeBaMen = (baMen: any): string => {
  let analysis = '【八门分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  const menInfo: { [key: string]: { nature: string; meaning: string; suitable: string } } = {
    '休门': { nature: '吉', meaning: '休息、养生、等待', suitable: '宜修养、等待、养生' },
    '生门': { nature: '吉', meaning: '生发、求财、进取', suitable: '宜求财、进取、开业' },
    '伤门': { nature: '凶', meaning: '伤害、破坏、变动', suitable: '宜破坏、变革、竞争' },
    '杜门': { nature: '中', meaning: '阻塞、隐藏、避难', suitable: '宜隐藏、避难、修炼' },
    '景门': { nature: '中', meaning: '光明、文书、计划', suitable: '宜文书、计划、考试' },
    '死门': { nature: '凶', meaning: '死亡、闭塞、困难', suitable: '宜守成、修养、等待' },
    '惊门': { nature: '凶', meaning: '惊恐、口舌、是非', suitable: '宜谨慎、防备、避祸' },
    '开门': { nature: '吉', meaning: '开放、进取、开拓', suitable: '宜开业、出行、进取' },
  };
  
  if (typeof baMen === 'string') {
    const info = menInfo[baMen];
    if (info) {
      analysis += `• 八门：${baMen}（${info.nature}）\n`;
      analysis += `• 含义：${info.meaning}\n`;
      analysis += `• 宜忌：${info.suitable}\n`;
    }
  }
  
  analysis += `\n【八门含义】\n`;
  analysis += `• 吉门：休、生、开\n`;
  analysis += `• 凶门：伤、死、惊\n`;
  analysis += `• 中门：杜、景\n`;
  
  return analysis;
};

/**
 * 九星分析
 */
const analyzeJiuXing = (jiuXing: any): string => {
  let analysis = '【九星分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  const xingInfo: { [key: string]: { nature: string; meaning: string } } = {
    '天蓬': { nature: '凶', meaning: '水星，主智慧、谋略、暗事' },
    '天任': { nature: '吉', meaning: '土星，主厚重、诚实、稳重' },
    '天冲': { nature: '中', meaning: '木星，主进取、冲动、变动' },
    '天辅': { nature: '吉', meaning: '木星，主温和、文雅、辅助' },
    '天英': { nature: '中', meaning: '火星，主光明、热情、礼仪' },
    '天芮': { nature: '凶', meaning: '土星，主疾病、阻滞、困难' },
    '天柱': { nature: '凶', meaning: '金星，主刚毅、果断、破坏' },
    '天心': { nature: '吉', meaning: '金星，主智慧、谋略、策划' },
    '天禽': { nature: '吉', meaning: '土星，主中正、平衡、协调' },
  };
  
  if (typeof jiuXing === 'string') {
    const info = xingInfo[jiuXing];
    if (info) {
      analysis += `• 九星：${jiuXing}（${info.nature}）\n`;
      analysis += `• 含义：${info.meaning}\n`;
    }
  }
  
  analysis += `\n【九星含义】\n`;
  analysis += `• 吉星：天任、天辅、天心、天禽\n`;
  analysis += `• 凶星：天蓬、天芮、天柱\n`;
  analysis += `• 中星：天冲、天英\n`;
  
  return analysis;
};

/**
 * 八神分析
 */
const analyzeBaShen = (baShen: any): string => {
  let analysis = '【八神分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  const shenInfo: { [key: string]: { nature: string; meaning: string } } = {
    '值符': { nature: '吉', meaning: '天乙贵人，主吉庆、贵人' },
    '螣蛇': { nature: '凶', meaning: '虚惊、怪异、变化' },
    '太阴': { nature: '吉', meaning: '阴私、隐蔽、谋略' },
    '六合': { nature: '吉', meaning: '和合、婚姻、合作' },
    '白虎': { nature: '凶', meaning: '凶猛、血光、争斗' },
    '玄武': { nature: '凶', meaning: '盗贼、欺诈、暗事' },
    '九地': { nature: '吉', meaning: '柔顺、隐藏、坚守' },
    '九天': { nature: '吉', meaning: '刚健、进取、远行' },
  };
  
  if (typeof baShen === 'string') {
    const info = shenInfo[baShen];
    if (info) {
      analysis += `• 八神：${baShen}（${info.nature}）\n`;
      analysis += `• 含义：${info.meaning}\n`;
    }
  }
  
  analysis += `\n【八神含义】\n`;
  analysis += `• 吉神：值符、太阴、六合、九地、九天\n`;
  analysis += `• 凶神：螣蛇、白虎、玄武\n`;
  
  return analysis;
};

/**
 * 四盘分析
 */
const analyzeSiPan = (result: any): string => {
  let analysis = '【四盘分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 地盘
  if (result.diPan && Array.isArray(result.diPan)) {
    analysis += `【地盘】\n`;
    analysis += `• 地盘：${result.diPan.join('、')}\n`;
    analysis += `• 含义：地盘为地利，代表地理环境\n`;
  } else {
    analysis += `【地盘】暂无数据\n`;
  }
  
  // 天盘
  if (result.tianPan && Array.isArray(result.tianPan)) {
    analysis += `\n【天盘】\n`;
    analysis += `• 天盘：${result.tianPan.join('、')}\n`;
    analysis += `• 含义：天盘为天时，代表天时变化\n`;
  } else {
    analysis += `\n【天盘】暂无数据\n`;
  }
  
  // 人盘
  if (result.renPan && Array.isArray(result.renPan)) {
    analysis += `\n【人盘】\n`;
    analysis += `• 人盘：${result.renPan.join('、')}\n`;
    analysis += `• 含义：人盘为人和，代表人事关系\n`;
  } else {
    analysis += `\n【人盘】暂无数据\n`;
  }
  
  // 神盘
  if (result.shenPan && Array.isArray(result.shenPan)) {
    analysis += `\n【神盘】\n`;
    analysis += `• 神盘：${result.shenPan.join('、')}\n`;
    analysis += `• 含义：神盘为神助，代表神灵庇佑\n`;
  } else {
    analysis += `\n【神盘】暂无数据\n`;
  }
  
  return analysis;
};

/**
 * 克应分析
 */
const analyzeKeYing = (result: any): string => {
  let analysis = '【克应分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 十干克应
  if (result.shiGanKeYing && Array.isArray(result.shiGanKeYing)) {
    analysis += `【十干克应】\n`;
    result.shiGanKeYing.forEach((item: any, index: number) => {
      if (item && item.length > 0) {
        analysis += `• ${index + 1}宫：${item.join('、')}\n`;
      }
    });
  } else {
    analysis += `【十干克应】暂无数据\n`;
  }
  
  // 八门克应
  if (result.baMenKeYing && Array.isArray(result.baMenKeYing)) {
    analysis += `\n【八门克应】\n`;
    result.baMenKeYing.forEach((item: any, index: number) => {
      if (item && item.length > 0) {
        analysis += `• ${index + 1}宫：${item.join('、')}\n`;
      }
    });
  } else {
    analysis += `\n【八门克应】暂无数据\n`;
  }
  
  analysis += `\n【克应含义】\n`;
  analysis += `• 克应：天干地支、八门九星之间的生克关系\n`;
  analysis += `• 用于判断吉凶成败\n`;
  
  return analysis;
};

/**
 * 旺衰分析
 */
const analyzeWangShuai = (result: any): string => {
  let analysis = '【旺衰分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 八卦旺衰
  if (result.baGuaWangShuai && Array.isArray(result.baGuaWangShuai)) {
    analysis += `【八卦旺衰】\n`;
    result.baGuaWangShuai.forEach((item: any) => {
      if (item && item.length >= 2) {
        analysis += `• ${item[0]}：${item[1]}\n`;
      }
    });
  } else {
    analysis += `【八卦旺衰】暂无数据\n`;
  }
  
  // 八门旺衰
  if (result.baMenWangShuai && Array.isArray(result.baMenWangShuai)) {
    analysis += `\n【八门旺衰】\n`;
    result.baMenWangShuai.forEach((item: any) => {
      if (item && item.length >= 2) {
        analysis += `• ${item[0]}：${item[1]}\n`;
      }
    });
  } else {
    analysis += `\n【八门旺衰】暂无数据\n`;
  }
  
  // 九星旺衰
  if (result.jiuXingWangShuai && Array.isArray(result.jiuXingWangShuai)) {
    analysis += `\n【九星旺衰】\n`;
    result.jiuXingWangShuai.forEach((item: any) => {
      if (item && item.length >= 2) {
        analysis += `• ${item[0]}：${item[1]}\n`;
      }
    });
  } else {
    analysis += `\n【九星旺衰】暂无数据\n`;
  }
  
  analysis += `\n【旺衰含义】\n`;
  analysis += `• 旺：力量最强，吉凶皆大\n`;
  analysis += `• 相：力量较强，吉凶皆中\n`;
  analysis += `• 休：力量一般，吉凶皆小\n`;
  analysis += `• 囚：力量较弱，吉凶皆微\n`;
  analysis += `• 死：力量最弱，吉凶皆无\n`;
  
  return analysis;
};

/**
 * 伏吟反吟分析
 */
const analyzeFuYinFanYin = (result: any): string => {
  let analysis = '【伏吟反吟分析】\n';
  analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 伏吟
  if (result.fuYin && Array.isArray(result.fuYin) && result.fuYin.length > 0) {
    analysis += `【伏吟】\n`;
    result.fuYin.forEach((item: any) => {
      analysis += `• ${item}\n`;
    });
    analysis += `• 含义：伏吟主慢、主静、主守\n`;
    analysis += `• 宜静不宜动，宜守不宜攻\n`;
  } else {
    analysis += `【伏吟】无\n`;
  }
  
  // 反吟
  if (result.fanYin && Array.isArray(result.fanYin) && result.fanYin.length > 0) {
    analysis += `\n【反吟】\n`;
    result.fanYin.forEach((item: any) => {
      analysis += `• ${item}\n`;
    });
    analysis += `• 含义：反吟主快、主动、主变\n`;
    analysis += `• 宜动不宜静，宜攻不宜守\n`;
  } else {
    analysis += `\n【反吟】无\n`;
  }
  
  analysis += `\n【伏吟反吟含义】\n`;
  analysis += `• 伏吟：星门不动，主慢、主静\n`;
  analysis += `• 反吟：星门对冲，主快、主动\n`;
  analysis += `• 伏吟宜守，反吟宜动\n`;
  
  return analysis;
};

/**
 * 生成建议
 */
const generateQiMenAdvice = (result: any): string => {
  const { solarTerm, zhiFu, zhiShi, baMen } = result;
  
  let advice = '【综合建议】\n';
  advice += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // 局的建议
  advice += `【局象建议】\n`;
  const yangList = ['立春', '立夏', '立秋', '立冬', '春分', '秋分', '夏至', '冬至'];
  if (yangList.includes(solarTerm)) {
    advice += '• 阳遁主进，宜主动出击\n';
    advice += '• 把握时机，积极进取\n';
  } else {
    advice += '• 阴遁主守，宜静观其变\n';
    advice += '• 等待时机，不宜冒进\n';
  }
  
  // 值符值使的建议
  advice += `\n【值符值使】\n`;
  advice += `• 值符${zhiFu}：代表天时，宜顺应天时\n`;
  advice += `• 值使${zhiShi}：代表地利，宜选择有利方位\n`;
  
  // 八门的建议
  advice += `\n【八门建议】\n`;
  if (typeof baMen === 'string') {
    if (['休门', '生门', '开门'].includes(baMen)) {
      advice += `• ${baMen}为吉门，宜积极行动\n`;
    } else if (['伤门', '死门', '惊门'].includes(baMen)) {
      advice += `• ${baMen}为凶门，宜谨慎行事\n`;
    } else {
      advice += `• ${baMen}为中门，宜权衡利弊\n`;
    }
  }
  
  advice += `\n【注意事项】\n`;
  advice += `• 以上分析仅供参考\n`;
  advice += `• 实际情况需结合具体问事\n`;
  advice += `• 建议咨询专业奇门遁甲师\n`;
  
  return advice;
};
