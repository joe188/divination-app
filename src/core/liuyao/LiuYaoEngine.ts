/**
 * 六爻引擎 - 核心算法实现
 * 功能：起卦、装卦、断卦
 */

import { LiuYaoResult, YaoLineInfo, GuaInfo } from '../../types';
import { sixtyFourGua } from '../../data/liuyao/64gua';

/**
 * 六爻引擎类
 */
export class LiuYaoEngine {
  /**
   * 铜钱起卦（模拟抛掷）
   * @param yangCount 正面数量（0-3）
   * @returns 6-老阴，7-少阳，8-少阴，9-老阳
   */
  generateYaoType(yangCount: number): number {
    if (yangCount < 0 || yangCount > 3) {
      throw new Error('铜钱正面数量必须是 0-3');
    }
    
    // 三个正面：老阳（9）
    if (yangCount === 3) return 9;
    // 两个正面：少阳（7）
    if (yangCount === 2) return 7;
    // 一个正面：少阴（8）
    if (yangCount === 1) return 8;
    // 没有正面：老阴（6）
    return 6;
  }

  /**
   * 生成完整卦象
   * @param yaoTypes 六爻类型数组 [初爻，二爻，三爻，四爻，五爻，上爻]
   */
  generateGua(yaoTypes: number[]): LiuYaoResult {
    if (yaoTypes.length !== 6) {
      throw new Error('必须提供 6 个爻');
    }

    // 计算本卦
    const benGuaIndex = this.calculateGuaIndex(yaoTypes);
    const benGua = sixtyFourGua[benGuaIndex - 1];

    // 计算变卦（如果有动爻）
    const dongYao = yaoTypes
      .map((type, index) => (type === 6 || type === 9 ? index : -1))
      .filter((i) => i !== -1);

    let bianGua: GuaInfo | undefined;
    if (dongYao.length > 0) {
      const bianYaoTypes = yaoTypes.map((type) => {
        if (type === 6) return 7; // 老阴变阳
        if (type === 9) return 8; // 老阳变阴
        return type;
      });
      const bianGuaIndex = this.calculateGuaIndex(bianYaoTypes);
      bianGua = sixtyFourGua[bianGuaIndex - 1];
    }

    // 计算互卦
    const huGuaIndex = this.calculateHuGuaIndex(yaoTypes);
    const huGua = sixtyFourGua[huGuaIndex - 1];

    // 生成六爻详情
    const yaoLines: YaoLineInfo[] = yaoTypes.map((type, index) => ({
      position: index,
      yaoType: type,
      isDong: type === 6 || type === 9,
      yaoCi: this.getYaoCi(benGua, index),
    }));

    // 装卦（配置六亲、世应等）
    this.zhuangGua(yaoLines, benGua);

    return {
      benGua,
      bianGua,
      huGua,
      yaoLines,
      dongYao,
      interpretation: {
        overall: this.generateInterpretation(benGua, dongYao),
        advice: this.generateAdvice(benGua, dongYao),
      },
    };
  }

  /**
   * 计算卦的索引
   * 下卦为内，上卦为外
   */
  private calculateGuaIndex(yaoTypes: number[]): number {
    let lower = 0; // 下卦
    let upper = 0; // 上卦

    // 计算下卦（初爻到三爻）
    for (let i = 0; i < 3; i++) {
      const type = yaoTypes[i];
      // 阳爻（7 或 9）为 1，阴爻（6 或 8）为 0
      lower |= (type === 7 || type === 9) ? (1 << i) : 0;
    }

    // 计算上卦（四爻到上爻）
    for (let i = 3; i < 6; i++) {
      const type = yaoTypes[i];
      upper |= (type === 7 || type === 9) ? (1 << (i - 3)) : 0;
    }

    // 上卦左移 3 位，加上下卦
    return (upper << 3) | lower;
  }

  /**
   * 计算互卦索引
   */
  private calculateHuGuaIndex(yaoTypes: number[]): number {
    // 互卦：去掉初爻和上爻，中间四爻重组
    // 下卦：原二三四爻
    // 上卦：原三四五爻
    const newLower = yaoTypes.slice(1, 4);
    const newUpper = yaoTypes.slice(2, 5);

    const lowerIndex = this.calculateGuaIndex([...newLower, 7, 7, 7, 7, 7]) & 0x07;
    const upperIndex = (this.calculateGuaIndex([7, 7, 7, ...newUpper, 7, 7]) >> 3) & 0x07;

    return (upperIndex << 3) | lowerIndex;
  }

  /**
   * 获取爻辞
   */
  private getYaoCi(gua: GuaInfo, position: number): string {
    // 实际项目中会从完整数据集中获取
    // 这里简化处理
    const yaoCiMap: Record<number, string> = {
      0: '初爻辞',
      1: '二爻辞',
      2: '三爻辞',
      3: '四爻辞',
      4: '五爻辞',
      5: '上爻辞',
    };
    return yaoCiMap[position] || '';
  }

  /**
   * 装卦：配置六亲、世应、五行等
   */
  private zhuangGua(yaoLines: YaoLineInfo[], gua: GuaInfo): void {
    // 定世应（简化版，实际需按宫位推算）
    const shiPosition = this.determineShiPosition(gua.index);
    const yingPosition = (shiPosition + 3) % 6;

    yaoLines.forEach((line, index) => {
      // 配置世应
      line.shiYing = {
        isShi: index === shiPosition,
        isYing: index === yingPosition,
      };

      // 配置六亲（简化版，需根据宫位五行推算）
      line.liuQin = this.determineLiuQin(index, gua);

      // 配置五行
      line.wuXing = this.determineWuXing(index, gua);
    });
  }

  /**
   * 定世爻位置（简化版）
   */
  private determineShiPosition(guaIndex: number): number {
    // 实际算法需按八宫推算
    // 这里简化为随机或固定规则
    return (guaIndex - 1) % 6;
  }

  /**
   * 定六亲（简化版）
   */
  private determineLiuQin(position: number, gua: GuaInfo): string {
    const liuQin = ['父母', '官鬼', '兄弟', '子孙', '妻财', '父母'];
    return liuQin[position % 6];
  }

  /**
   * 定五行（简化版）
   */
  private determineWuXing(position: number, gua: GuaInfo): string {
    const wuXing = ['金', '木', '水', '火', '土', '金'];
    return wuXing[position % 5];
  }

  /**
   * 生成总体解析
   */
  private generateInterpretation(gua: GuaInfo, dongYao: number[]): string {
    return `${gua.name}卦：${gua.ci}。${gua.xiang}。${
      dongYao.length > 0 ? '有动爻，事有变化。' : '静卦，事稳。'
    }`;
  }

  /**
   * 生成建议
   */
  private generateAdvice(gua: GuaInfo, dongYao: number[]): string {
    const baseAdvice = '宜守正待时，修身养性。';
    
    if (dongYao.length === 0) {
      return baseAdvice + '目前宜静不宜动。';
    }

    if (dongYao.length > 2) {
      return baseAdvice + '多动则乱，宜谨慎行事。';
    }

    return baseAdvice + '有变动之象，宜随机应变。';
  }
}

// 导出单例
export const liuyaoEngine = new LiuYaoEngine();
