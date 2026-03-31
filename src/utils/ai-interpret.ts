/**
 * AI 解卦工具模块
 * 基于八字排盘结果生成智能解读
 */

/**
 * 五行属性对应的性格特征
 */
const FIVE_ELEMENTS_TRAITS: Record<string, string[]> = {
  wood: ['仁慈', '正直', '生长', '创造力', '灵活性'],
  fire: ['热情', '活力', '礼貌', '冲动', '表现欲'],
  earth: ['诚信', '稳重', '包容', '实际', '耐心'],
  metal: ['义气', '果断', '坚毅', '原则', '效率'],
  water: ['智慧', '灵活', '适应', '深思', '变通'],
};

/**
 * 十神关系解读
 */
const TEN_GODS_MEANINGS: Record<string, string> = {
  zhengguan: '正官 - 代表事业、名誉、责任感',
  pian guan: '偏官 - 代表权力、野心、冒险精神',
  zhengyin: '正印 - 代表学业、母亲、贵人相助',
  pianyin: '偏印 - 代表特殊才能、独立思考',
  cai: '财星 - 代表财富、物质、现实',
  shi: '食神 - 代表才华、享受、表达能力',
  shang: '伤官 - 代表创新、叛逆、艺术天赋',
  bi: '比肩 - 代表兄弟、朋友、竞争',
  jie: '劫财 - 代表破财、竞争、冲动',
};

/**
 * 根据五行分布生成解读
 */
const generateFiveElementsAnalysis = (
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  }
): string => {
  // 找出最强和最弱的五行
  const elements = [
    { name: '木', value: fiveElements.wood, trait: FIVE_ELEMENTS_TRAITS.wood },
    { name: '火', value: fiveElements.fire, trait: FIVE_ELEMENTS_TRAITS.fire },
    { name: '土', value: fiveElements.earth, trait: FIVE_ELEMENTS_TRAITS.earth },
    { name: '金', value: fiveElements.metal, trait: FIVE_ELEMENTS_TRAITS.metal },
    { name: '水', value: fiveElements.water, trait: FIVE_ELEMENTS_TRAITS.water },
  ];

  // 排序
  const sorted = [...elements].sort((a, b) => b.value - a.value);
  const strongest = sorted[0];
  const weakest = sorted[4];

  let analysis = `🔮 **五行分析**\n\n`;
  analysis += `你的五行中，**${strongest.name}** 最旺，**${weakest.name}** 最弱。\n\n`;
  analysis += `**${strongest.name}** 旺的特征：\n`;
  analysis += strongest.trait.join('、') + '\n\n';
  
  if (weakest.value < 10) {
    analysis += `**${weakest.name}** 较弱，建议：\n`;
    analysis += `• 多接触与${weakest.name}相关的事物\n`;
    analysis += `• 培养${weakest.trait[0]}的品质\n`;
    analysis += `• 注意平衡发展\n\n`;
  }

  // 五行平衡建议
  analysis += `**平衡建议**：\n`;
  if (strongest.name === '木' && weakest.name === '金') {
    analysis += `木旺金弱，性格仁慈但缺乏果断，建议培养决断力。`;
  } else if (strongest.name === '火' && weakest.name === '水') {
    analysis += `火旺水弱，热情但缺乏智慧沉淀，建议多思考再行动。`;
  } else if (strongest.name === '土' && weakest.name === '木') {
    analysis += `土旺木弱，稳重但缺乏创造力，建议多尝试新事物。`;
  } else if (strongest.name === '金' && weakest.name === '火') {
    analysis += `金旺火弱，果断但缺乏热情，建议多与人交流。`;
  } else if (strongest.name === '水' && weakest.name === '土') {
    analysis += `水旺土弱，灵活但缺乏稳重，建议脚踏实地。`;
  } else {
    analysis += `保持当前平衡，发挥优势，补足短板。`;
  }

  return analysis;
};

/**
 * 根据四柱生成运势解读
 */
const generateFortuneAnalysis = (
  fourPillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  }
): string => {
  const dayStem = fourPillars.day.charAt(0); // 日干
  const dayBranch = fourPillars.day.charAt(1); // 日支

  // 十天干性格
  const stemMeanings: Record<string, string> = {
    '甲': '甲木之人，正直仁慈，有领导才能',
    '乙': '乙木之人，温柔善良，善于协调',
    '丙': '丙火之人，热情开朗，有表现欲',
    '丁': '丁火之人，内敛热情，思维敏捷',
    '戊': '戊土之人，厚重诚实，讲信用',
    '己': '己土之人，细腻包容，善于分析',
    '庚': '庚金之人，刚毅果断，重义气',
    '辛': '辛金之人，精致优雅，追求完美',
    '壬': '壬水之人，聪明灵活，适应力强',
    '癸': '癸水之人，温柔内敛，善于思考',
  };

  let analysis = `📅 **日主分析**\n\n`;
  analysis += `你的日干为**${dayStem}**，${stemMeanings[dayStem] || ''}。\n\n`;
  
  return analysis;
};

/**
 * 生成综合运势建议
 */
const generateAdvice = (
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  }
): string => {
  const advice: string[] = [];

  // 根据五行强弱给建议
  if (fiveElements.wood > 30) {
    advice.push('• 事业心强，但要注意劳逸结合');
  }
  if (fiveElements.fire > 30) {
    advice.push('• 热情积极，但要避免冲动行事');
  }
  if (fiveElements.earth > 30) {
    advice.push('• 稳重踏实，但也要适时变通');
  }
  if (fiveElements.metal > 30) {
    advice.push('• 果断坚毅，但要注意人际关系');
  }
  if (fiveElements.water > 30) {
    advice.push('• 聪明灵活，但要避免思虑过多');
  }

  // 默认建议
  if (advice.length === 0) {
    advice.push('• 五行相对平衡，保持当前状态');
    advice.push('• 顺势而为，把握机遇');
  }

  return '💡 **运势建议**\n\n' + advice.join('\n');
};

/**
 * AI 智能解读主函数
 * @param fourPillars 四柱八字
 * @param fiveElements 五行分布
 * @returns 完整解读文本
 */
export const generateAIInterpretation = (
  fourPillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  },
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  }
): string => {
  let interpretation = '🦐 **灵枢智能排盘 - AI 解卦**\n';
  interpretation += '━━━━━━━━━━━━━━\n\n';

  // 1. 日主分析
  interpretation += generateFortuneAnalysis(fourPillars);
  interpretation += '\n';

  // 2. 五行分析
  interpretation += generateFiveElementsAnalysis(fiveElements);
  interpretation += '\n';

  // 3. 运势建议
  interpretation += generateAdvice(fiveElements);
  interpretation += '\n';

  interpretation += '━━━━━━━━━━━━━━\n';
  interpretation += '✨ 以上解读仅供参考，命运掌握在自己手中';

  return interpretation;
};

/**
 * 简版解读（用于快速预览）
 */
export const getQuickInterpretation = (
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  }
): string => {
  const strongest = Object.entries(fiveElements)
    .sort(([, a], [, b]) => b - a)[0][0];
  
  const meanings: Record<string, string> = {
    wood: '木旺 - 仁慈正直，有创造力',
    fire: '火旺 - 热情开朗，活力四射',
    earth: '土旺 - 稳重诚信，包容万物',
    metal: '金旺 - 果断坚毅，重情重义',
    water: '水旺 - 聪明灵活，善于思考',
  };

  return meanings[strongest] || '五行平衡，运势平稳';
};
