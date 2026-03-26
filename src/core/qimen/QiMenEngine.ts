/**
 * 奇门遁甲引擎 - 核心算法实现
 * 功能：起局、排盘、断局
 */

import { QiMenPan, GongWeiInfo, LunarDateInfo, LocationInfo } from '../../types';
import { LunarCalendar } from '../common/LunarCalendar';
import { JieQi } from '../common/JieQi';

/**
 * 奇门遁甲引擎类
 */
export class QiMenEngine {
  /**
   * 起奇门局
   * @param date 公历时间
   * @param location 地理位置
   */
  async startPan(date: Date, location: LocationInfo): Promise<QiMenPan> {
    // 1. 转换为农历
    const lunar = LunarCalendar.toLunar(date);
    
    // 2. 获取节气
    const jieQi = JieQi.getJieQi(date);
    
    // 3. 定阴阳遁
    const yinYang = this.determineYinYang(jieQi.name);
    
    // 4. 定局数
    const juShu = this.determineJuShu(lunar, jieQi.name);
    
    // 5. 找值符值使
    const { zhiFu, zhiShi } = this.findZhiFuZhiShi(juShu, lunar);
    
    // 6. 排天盘（值符）
    const tianPan = this.layoutTianPan(zhiFu, lunar.shiChen);
    
    // 7. 排人盘（八门）
    const renPan = this.layoutRenPan(zhiShi, lunar.shiChen);
    
    // 8. 排神盘（八神）
    const shenPan = this.layoutShenPan(zhiFu, yinYang);
    
    // 9. 组合九宫
    const jiuGong = this.combineJiuGong(tianPan, renPan, shenPan, lunar);
    
    // 10. 判断格局
    const geJu = this.analyzeGeJu(jiuGong);
    
    return {
      yinYang,
      juShu,
      date: lunar,
      location,
      jiuGong,
      zhiFu,
      zhiShi,
      geJu,
      interpretation: {
        overall: this.generateOverall(juShu, yinYang, geJu),
        baMen: this.interpretBaMen(renPan),
        jiuXing: this.interpretJiuXing(tianPan),
        baShen: this.interpretBaShen(shenPan),
        advice: this.generateAdvice(geJu),
      },
    };
  }

  /**
   * 定阴阳遁
   * 冬至后阳遁，夏至后阴遁
   */
  private determineYinYang(jieQiName: string): 'yin' | 'yang' {
    const yangQi = ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种'];
    return yangQi.includes(jieQiName) ? 'yang' : 'yin';
  }

  /**
   * 定局数
   * 阳遁顺排，阴遁逆排
   */
  private determineJuShu(lunar: LunarDateInfo, jieQiName: string): number {
    // 根据节气确定上中下元起始局数
    const qiBase: Record<string, number> = {
      '冬至': 1, '小寒': 2, '大寒': 3,
      '立春': 8, '雨水': 9, '惊蛰': 1,
      '春分': 3, '清明': 4, '谷雨': 5,
      '立夏': 4, '小满': 5, '芒种': 6,
      '夏至': 9, '小暑': 8, '大暑': 7,
      '立秋': 2, '处暑': 1, '白露': 9,
      '秋分': 7, '寒露': 6, '霜降': 5,
      '立冬': 6, '小雪': 5, '大雪': 4,
    };

    const base = qiBase[jieQiName] || 1;
    const yuanOffset = { '上': 0, '中': 3, '下': 6 }[lunar.yuan] || 0;
    
    return (base + yuanOffset - 1) % 9 + 1;
  }

  /**
   * 找值符值使
   */
  private findZhiFuZhiShi(juShu: number, lunar: LunarDateInfo): { zhiFu: string; zhiShi: string } {
    // 值符：旬首对应的星
    // 值使：旬首对应的门
    const xunShou = this.getXunShou(lunar.dayGanZhi);
    
    const starMap: Record<string, string> = {
      '戊': '天蓬', '己': '天任', '庚': '天冲',
      '辛': '天辅', '壬': '天禽', '癸': '天心',
      '丁': '天柱', '丙': '天芮', '乙': '天英',
    };

    const doorMap: Record<string, string> = {
      '戊': '休门', '己': '死门', '庚': '伤门',
      '辛': '杜门', '壬': '中五', '癸': '开门',
      '丁': '惊门', '丙': '生门', '乙': '景门',
    };

    const gan = xunShou.charAt(0);
    
    return {
      zhiFu: starMap[gan] || '天蓬',
      zhiShi: doorMap[gan] || '休门',
    };
  }

  /**
   * 获取旬首
   */
  private getXunShou(ganZhi: string): string {
    // 简化版，实际需计算
    return '戊辰';
  }

  /**
   * 排天盘（值符）
   */
  private layoutTianPan(zhiFu: string, shiChen: string): string[] {
    // 简化版天盘排布
    return Array(9).fill(zhiFu);
  }

  /**
   * 排人盘（八门）
   */
  private layoutRenPan(zhiShi: string, shiChen: string): string[] {
    // 简化版八门排布
    return Array(9).fill(zhiShi);
  }

  /**
   * 排神盘（八神）
   */
  private layoutShenPan(zhiFu: string, yinYang: 'yin' | 'yang'): string[] {
    const baShen = ['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];
    
    // 阳遁顺排，阴遁逆排
    if (yinYang === 'yin') {
      baShen.reverse();
    }
    
    return baShen.concat(baShen).slice(0, 9);
  }

  /**
   * 组合九宫
   */
  private combineJiuGong(tianPan: string[], renPan: string[], shenPan: string[], lunar: LunarDateInfo): GongWeiInfo[] {
    const jiuGong: GongWeiInfo[] = [];
    
    for (let i = 0; i < 9; i++) {
      jiuGong.push({
        position: i + 1,
        baMen: renPan[i],
        jiuXing: tianPan[i],
        baShen: shenPan[i],
        tianPan: this.getTianGan(i, lunar),
        diPan: this.getDiGan(i, lunar),
        host: i === 4, // 中宫为主
      });
    }
    
    return jiuGong;
  }

  /**
   * 获取天盘干
   */
  private getTianGan(index: number, lunar: LunarDateInfo): string {
    const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    return tianGan[index % 10];
  }

  /**
   * 获取地盘干
   */
  private getDiGan(index: number, lunar: LunarDateInfo): string {
    const diGan = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
    return diGan[index % 9];
  }

  /**
   * 分析格局
   */
  private analyzeGeJu(jiuGong: GongWeiInfo[]): any[] {
    const geJu: any[] = [];
    
    // 简化版格局判断
    jiuGong.forEach((gong) => {
      if (gong.baMen === '开门' && gong.jiuXing === '天心') {
        geJu.push({
          name: '开门见喜',
          type: 'ji',
          description: '大吉之象，事事顺利',
          advice: '宜积极行动',
        });
      }
    });
    
    return geJu;
  }

  /**
   * 总体解析
   */
  private generateOverall(juShu: number, yinYang: string, geJu: any[]): string {
    const yinyangStr = yinYang === 'yang' ? '阳遁' : '阴遁';
    return `${yinyangStr}${juShu}局。${geJu.length > 0 ? '有吉格，利行事。' : '平局，宜守。'}`;
  }

  /**
   * 八门解析
   */
  private interpretBaMen(renPan: string[]): string {
    return '八门主人事，需结合具体宫位判断。';
  }

  /**
   * 九星解析
   */
  private interpretJiuXing(tianPan: string[]): string {
    return '九星主天时，影响整体运势。';
  }

  /**
   * 八神解析
   */
  private interpretBaShen(shenPan: string[]): string {
    return '八神主神助，值符最吉。';
  }

  /**
   * 生成建议
   */
  private generateAdvice(geJu: any[]): string[] {
    if (geJu.length > 0) {
      return ['有吉神相助，宜把握机会', '行动顺利，可大胆作为'];
    }
    return ['宜静守，不宜冒进', '等待时机，蓄势待发'];
  }
}

// 导出单例
export const qiMenEngine = new QiMenEngine();
