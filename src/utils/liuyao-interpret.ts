/**
 * 六爻解卦服务
 * 基于 64 卦数据库进行完整解读
 */
import gua64Data from '../data/gua64.json';

// 六爻结果数据结构
export interface LiuYaoResult {
  guaId: number;            // 本卦 ID (1-64)
  guaName: string;          // 本卦名称
  bianguaId?: number;       // 变卦 ID
  bianguaName?: string;
  dianhuaIndex?: number;   // 动爻位置（0-5，从下往上）
  yaoTexts: string[];      // 六爻爻辞（含动爻标识）
  duanyan: string;         // 卦辞断言
  summary: string;         // 综合解读
}

/**
 * 根据六爻生成排盘结果
 * @param yaoList 六爻数组（0-5），每个元素 6 或 9（老阴/老阳）
 * @returns 解卦结果
 */
export function liuyaoInterpret(yaoList: number[]): LiuYaoResult {
  if (yaoList.length !== 6) {
    throw new Error('六爻数据必须为6位数组');
  }

  // 确定本卦：从下往上计算，少阳少阴为静爻，老阴老阳为动爻
  // 简单算法：直接将六爻转换为卦象
  const benGua = yaoToGua(yaoList);

  // 查找动爻（老阴 6、老阳 7）
  const dianhuaIndices = yaoList
    .map((val, idx) => (val === 6 || val === 7 ? idx : -1))
    .filter(idx => idx !== -1);

  // 计算变卦：动爻变化后得到
  const bianYaoList = [...yaoList];
  dianhuaIndices.forEach(idx => {
    if (yaoList[idx] === 6) bianYaoList[idx] = 9; // 阴变阳
    if (yaoList[idx] === 7) bianYaoList[idx] = 6; // 阳变阴
  });
  const bianGua = dianhuaIndices.length > 0 ? yaoToGua(bianYaoList) : undefined;

  // 查询卦象信息
  const benGuaInfo = gua64Data.guaList.find(g => g.id === benGua) || gua64Data.guaList[0];
  const bianGuaInfo = bianGua ? gua64Data.guaList.find(g => g.id === bianGua) : undefined;

  // 组装爻辞（标注动爻）
  const yaoTexts = benGuaInfo.yaoTexts.map((text, idx) => {
    if (dianhuaIndices.includes(idx)) {
      return `【动】${text}`;
    }
    return text;
  });

  // 综合解读
  const summary = buildSummary(benGuaInfo, bianGuaInfo, dianhuaIndices);

  return {
    guaId: benGua,
    guaName: benGuaInfo.name,
    bianguaId: bianGua,
    bianguaName: bianGuaInfo?.name,
    dianhuaIndex: dianhuaIndices.length === 1 ? dianhuaIndices[0] : undefined,
    yaoTexts,
    duanyan: benGuaInfo.duanyan,
    summary,
  };
}

/**
 * 六爻数组转为卦象 ID (1-64)
 * 算法：下爻为上爻，阳爻为9或7，阴爻为6或8
 * 八卦对应：乾1、兑2、离3、震4、巽5、坎6、艮7、坤8
 * 上下卦组合：上卦 * 8 + 下卦 编号（先天八卦数）
 */
function yaoToGua(yao: number[]): number {
  // 从下往上：yao[0]=初爻, yao[5]=上爻
  // 判断八卦
  const getBaguaFromYao = (start: number): number => {
    // 取三爻（start, start+1, start+2）
    const bits = [
      yao[start] % 2 === 0 ? 0 : 1,           // 初爻/下爻
      yao[start + 1] % 2 === 0 ? 0 : 1,
      yao[start + 2] % 2 === 0 ? 0 : 1,
    ];
    // 先天八卦数：坤1、艮2、坎3、巽4、中5、乾6、兑7、离8、震9。这里使用简化逆序
    // 常用先天八卦序号（从1开始）：
    // 乾(☰)=1, 兑(☱)=2, 离(☲)=3, 震(☳)=4, 巽(☴)=5, 坎(☵)=6, 艮(☶)=7, 坤(☷)=8
    // 但我们按二进制: 从下到上为 bit0-bit2, 组合为 0-7
    // bits: [下, 中, 上]，上为最高位，下为最低位
    const bin = (bits[2] << 2) | (bits[1] << 1) | bits[0];
    // 映射到先天八卦序号（1-index）
    // 0: 坤(8), 1: 震(4), 2: 坎(3), 3: 巽(5), 4: 中, 5: 兑(2), 6: 乾(1), 7: 艮(7)
    const baguaMap: Record<number, number> = {
      0b000: 8, // 坤 ☷
      0b001: 4, // 震 ☳
      0b010: 3, // 坎 ☵
      0b011: 5, // 巽 ☴
      0b100: 1, // 乾 ☰
      0b101: 2, // 兑 ☱
      0b110: 7, // 艮 ☶
      0b111: 6, // 离 ☲
    };
    return baguaMap[bin];
  };

  const shangGua = getBaguaFromYao(3); // 三、四、五爻
  const xiaGua = getBaguaFromYao(0);   // 初、二、三爻

  // 六十四卦编号：上卦×8 + 下卦（上卦从1-8，下卦从1-8）
  // 注意：先天八卦序：1乾、2兑、3离、4震、5巽、6坎、7艮、8坤
  // 我们上面返回的是序号，可以按序号组合
  // 六十四卦序号 = (上卦序号 - 1) * 8 + 下卦序号
  return (shangGua - 1) * 8 + xiaGua;
}

/**
 * 构建综合解读文本
 */
function buildSummary(
  benGua: any,
  bianGua: any | undefined,
  dianhuaIndices: number[]
): string {
  let summary = `本次占卜得到【${benGua.name}卦】`;

  if (bianGua) {
    summary += `，变卦为【${bianGua.name}卦】`;
  }

  if (dianhuaIndices.length === 0) {
    summary += '，六爻皆静，无动爻。';
  } else if (dianhuaIndices.length === 1) {
    const positions = ['初', '二', '三', '四', '五', '上'];
    summary += `，其中第${positions[dianhuaIndices[0]]}爻为动爻，变为此爻之位。`;
  } else {
    summary += `，共有${dianhuaIndices.length}个动爻。`;
  }

  summary += `\n\n卦辞：${benGua.duanyan}\n\n`;
  summary += `【解读】\n${benGua.duanyan || '暂无详细解读'}`;

  if (bianGua && dianhuaIndices.length === 1) {
    summary += `\n\n动爻所在位置提示变化，变卦【${bianGua.name}】显示事态发展趋势。`;
  }

  summary += `\n\n【整体建议】\n`;
  summary += getAdvice(benGua.id, bianGua?.id, dianhuaIndices.length);

  return summary;
}

/**
 * 根据卦象给出简单建议
 */
function getAdvice(benGuaId: number, bianGuaId: number | undefined, dianhuaCount: number): string {
  const gua = gua64Data.guaList.find(g => g.id === benGuaId);
  if (!gua) return '象征意义不明显，建议静心再求。';

  // 根据卦名和性质给出通用建议
  const adviceMap: Record<string, string> = {
    '乾': '天道刚健，宜积极进取，但切忌过刚。',
    '坤': '地道柔顺，宜包容忍耐，厚德载物。',
    '屯': '初生艰难，宜守正待时，不可冒进。',
    '蒙': '启蒙求知，当尊师重道，循序渐进。',
    '需': '等待时机，应耐心积蓄力量。',
    '讼': '争讼不利，宜和解，避免冲突。',
    '师': '统率众人，需纪律严明，正义为先。',
    '比': '亲和团结，以诚待人，吉祥亨通。',
    '小畜': '小有积蓄，宜继续蓄力，不可轻举妄动。',
    '履': '如履虎尾，小心谨慎，可化险为夷。',
    '泰': '天地交泰，万事亨通，但应居安思危。',
    '否': '闭塞不通，宜韬光养晦，等待转机。',
    '同人': '志同道合，和同于人，利于合作。',
    '大有': '大有所获，富有亨通，但需谦逊。',
    '谦': '谦逊美德，有终无咎，大吉。',
    '豫': '愉悦安乐，但应适可而止。',
    '随': '顺应时势，随从正道，吉祥。',
    '蛊': '腐败需整治，果断行动，革故鼎新。',
    '临': '监临天下，宽严并济，可得民望。',
    '观': '观察审视，知微见著，行正道。',
    '噬嗑': '刑罚咬合，法制必严，公正执法。',
    // 其他卦默认
  };

  return adviceMap[gua.name] || `此卦象征${gua.nature}，${gua.duanyan}。宜顺应卦象所示，把握时机，趋吉避凶。`;
}

/**
 * 获取动爻位置文字
 */
export function getDianhuaPosition(index: number): string {
  const positions = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
  return positions[index] || '未知爻';
}

export default liuyaoInterpret;