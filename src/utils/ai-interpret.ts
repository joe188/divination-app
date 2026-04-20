/**
 * AI 解卦服务
 * 支持两种模式：
 * 1. 本地规则引擎（离线，简单解读）
 * 2. 免费大模型 API（需网络，StepFun/DeepSeek）
 */

// 本地规则引擎（简化版）
export function generateLocalInterpretation(
  fourPillars: { year: string; month: string; day: string; hour: string },
  fiveElements: { wood: number; fire: number; earth: number; metal: number; water: number }
): string {
  const { year, month, day, hour } = fourPillars;
  const elements = fiveElements;

  // 分析五行强弱
  const maxElement = Object.entries(elements).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const minElement = Object.entries(elements).reduce((a, b) => a[1] < b[1] ? a : b)[0];

  // 天干地支五行
  const ganElement: Record<string, string> = {
    甲: '木', 乙: '木',
    丙: '火', 丁: '火',
    戊: '土', 己: '土',
    庚: '金', 辛: '金',
    壬: '水', 癸: '水',
  };

  const zhiHidden: Record<string, string[]> = {
    子: ['水'], 丑: ['土', '水', '金'], 寅: ['木', '火', '土'],
    卯: ['木'], 辰: ['土', '水', '木'], 巳: ['火', '土', '金'],
    午: ['火', '土'], 未: ['土', '火', '木'], 申: ['金', '水', '土'],
    酉: ['金'], 戌: ['土', '金', '火'], 亥: ['水', '木', '土'],
  };

  // 统计藏干
  const hiddenCount: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  [year, month, day, hour].forEach(gz => {
    const zhi = gz[1];
    const hidden = zhiHidden[zhi] || [];
    hidden.forEach(h => hiddenCount[h]++);
  });

  // 构建解读
  let interpretation = `【八字排盘解析】\n\n`;
  interpretation += `四柱八字：${year} ${month} ${day} ${hour}\n`;
  interpretation += `五行分布：木 ${elements.wood}%，火 ${elements.fire}%，土 ${elements.earth}%，金 ${elements.metal}%，水 ${elements.water}%\n\n`;

  interpretation += `【五行强弱】\n`;
  interpretation += `• 强：${getElementName(maxElement)} ${elements[maxElement as keyof typeof elements]}%\n`;
  interpretation += `• 弱：${getElementName(minElement)} ${elements[minElement as keyof typeof elements]}%\n\n`;

  interpretation += `【藏干分析】\n`;
  Object.entries(hiddenCount).forEach(([el, count]) => {
    if (count > 0) {
      interpretation += `• ${el}藏干：${count}位\n`;
    }
  });

  interpretation += `\n【简析】\n`;
  if (elements.wood >= 30) interpretation += `木旺，性格仁慈，宜从事教育、文化、木制品行业。\n`;
  if (elements.fire >= 30) interpretation += `火旺，热情积极，适合科技、能源、表演领域。\n`;
  if (elements.earth >= 30) interpretation += `土旺，稳重诚信，适合房地产、农业、管理岗位。\n`;
  if (elements.metal >= 30) interpretation += `金旺，刚毅果断，适合金融、法律、金属行业。\n`;
  if (elements.water >= 30) interpretation += `水旺，智慧灵活，适合运输、旅游、水产领域。\n`;

  if (elements[minElement as keyof typeof elements] < 15) {
    interpretation += `\n⚠️ 注意：${getElementName(minElement)}偏弱，生活中建议多接触相应元素（颜色、方位、行业）以补益。`;
  }

  interpretation += `\n\n【提示】本解读为简化版，如需详细分析（含大运、流年、十神关系），请使用AI智能解卦。`;

  return interpretation;
}

function getElementName(key: string): string {
  const map: Record<string, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
  return map[key] || key;
}

// AI API 配置
const AI_PROVIDERS = {
  stepfun: {
    name: 'StepFun',
    apiKey: '', // 需用户配置
    baseUrl: 'https://api.stepfun.com/v1/chat/completions',
    model: 'step-1.5-flash',
  },
  deepseek: {
    name: 'DeepSeek',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
  },
} as const;

type Provider = keyof typeof AI_PROVIDERS;

/**
 * 调用大模型 API 进行解卦
 * @param fourPillars 四柱
 * @param fiveElements 五行
 * @param provider AI 提供商（默认 stepfun）
 * @param apiKey API 密钥（可选，未配置则走本地）
 */
export async function generateAIInterpretation(
  fourPillars: { year: string; month: string; day: string; hour: string },
  fiveElements: { wood: number; fire: number; earth: number; metal: number; water: number },
  provider: Provider = 'stepfun',
  apiKey?: string
): Promise<string> {
  const config = AI_PROVIDERS[provider];

  // 如果没有 API Key，回退到本地规则
  if (!apiKey) {
    return generateLocalInterpretation(fourPillars, fiveElements);
  }

  try {
    const prompt = `请以专业命理师身份，分析以下八字排盘，给出详细解读（性格、事业、感情、健康、大运、流年、建议等）：

四柱：${fourPillars.year} ${fourPillars.month} ${fourPillars.day} ${fourPillars.hour}
五行分布：木${fiveElements.wood}%，火${fiveElements.fire}%，土${fiveElements.earth}%，金${fiveElements.metal}%，水${fiveElements.water}%

要求：
1. 用中文回答，语气亲切专业
2. 分析十神关系、五行生克
3. 指出用神和忌神
4. 给出补救建议（颜色、方位、行业）
5. 简述未来一年运势提示`;

    const response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: '你是一位精通周易八字、奇门遁甲的传统文化专家，擅长用通俗易懂的语言解读命理。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API 错误:', error);
      throw new Error(`AI 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      return `【${config.name} 智能解卦】\n\n${content}`;
    } else {
      throw new Error('API 返回格式异常');
    }
  } catch (error) {
    console.error('AI 解卦失败:', error);
    return `⚠️ AI 解卦失败，已切换至本地规则引擎：\n\n` + generateLocalInterpretation(fourPillars, fiveElements);
  }
}

/**
 * 设置 API Key（持久化）
 */
export function setAIProviderConfig(provider: Provider, apiKey: string): void {
  // TODO: 保存到 AsyncStorage 或 SharedPreferences
  console.log(`设置 ${provider} API Key: ${apiKey ? '已设置' : '已清除'}`);
}
