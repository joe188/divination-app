/**
 * 农历转换工具
 * 功能：公历转农历、干支计算、节气计算
 */

import { LunarDateInfo } from '../../types';

/**
 * 农历工具类
 */
export class LunarCalendar {
  /**
   * 公历转农历
   */
  static toLunar(date: Date): LunarDateInfo {
    // 简化版实现
    // 实际项目需使用完整的农历转换算法
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    
    // 计算干支
    const yearGanZhi = this.getYearGanZhi(year);
    const monthGanZhi = this.getMonthGanZhi(year, month);
    const dayGanZhi = this.getDayGanZhi(date);
    const hourGanZhi = this.getHourGanZhi(dayGanZhi, hour);
    
    // 计算时辰
    const shiChen = this.getShiChen(hour);
    
    // 获取节气
    const jieQi = this.getJieQiName(date);
    
    // 计算上中下元
    const yuan = this.calculateYuan(date);
    
    return {
      year,
      month,
      day,
      hour,
      yearGanZhi,
      monthGanZhi,
      dayGanZhi,
      hourGanZhi,
      shiChen,
      jieQi,
      yuan,
    };
  }

  /**
   * 获取年干支
   */
  private static getYearGanZhi(year: number): string {
    const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    const ganIndex = (year - 4) % 10;
    const zhiIndex = (year - 4) % 12;
    
    return tianGan[ganIndex] + diZhi[zhiIndex];
  }

  /**
   * 获取月干支
   */
  private static getMonthGanZhi(year: number, month: number): string {
    // 简化版，实际需考虑节气
    const tianGan = ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'];
    const diZhi = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
    
    const yearGanIndex = (year - 4) % 10;
    const monthGanIndex = (yearGanIndex * 2 + month) % 10;
    const monthZhiIndex = (month + 2) % 12;
    
    return tianGan[monthGanIndex] + diZhi[monthZhiIndex];
  }

  /**
   * 获取日干支
   */
  private static getDayGanZhi(date: Date): string {
    // 简化版，实际需查表计算
    const baseDate = new Date(1900, 0, 1);
    const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    const ganIndex = (diffDays + 9) % 10;
    const zhiIndex = (diffDays + 1) % 12;
    
    return tianGan[ganIndex] + diZhi[zhiIndex];
  }

  /**
   * 获取时干支
   */
  private static getHourGanZhi(dayGanZhi: string, hour: number): string {
    const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    const dayGan = dayGanZhi.charAt(0);
    const dayGanIndex = tianGan.indexOf(dayGan);
    
    const hourZhiIndex = Math.floor(hour / 2);
    const hourGanIndex = (dayGanIndex * 2 + hourZhiIndex) % 10;
    
    return tianGan[hourGanIndex] + diZhi[hourZhiIndex];
  }

  /**
   * 获取时辰
   */
  private static getShiChen(hour: number): string {
    const shiChen = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    return shiChen[Math.floor(hour / 2)];
  }

  /**
   * 获取节气
   */
  private static getJieQiName(date: Date): string {
    // 简化版，实际需精确计算
    const month = date.getMonth();
    const day = date.getDate();
    
    if (month === 0 || (month === 11 && day >= 22)) return '冬至';
    if (month === 0 && day < 20) return '小寒';
    if (month === 0 && day >= 20) return '大寒';
    if (month === 1 && day < 19) return '立春';
    if (month === 1 && day >= 19) return '雨水';
    if (month === 2 && day < 21) return '惊蛰';
    if (month === 2 && day >= 21) return '春分';
    if (month === 3 && day < 20) return '清明';
    if (month === 3 && day >= 20) return '谷雨';
    if (month === 4 && day < 21) return '立夏';
    if (month === 4 && day >= 21) return '小满';
    if (month === 5 && day < 21) return '芒种';
    if (month === 5 && day >= 21) return '夏至';
    if (month === 6 && day < 23) return '小暑';
    if (month === 6 && day >= 23) return '大暑';
    if (month === 7 && day < 23) return '立秋';
    if (month === 7 && day >= 23) return '处暑';
    if (month === 8 && day < 23) return '白露';
    if (month === 8 && day >= 23) return '秋分';
    if (month === 9 && day < 24) return '寒露';
    if (month === 9 && day >= 24) return '霜降';
    if (month === 10 && day < 22) return '立冬';
    if (month === 10 && day >= 22) return '小雪';
    if (month === 11 && day < 22) return '大雪';
    
    return '冬至';
  }

  /**
   * 计算上中下元
   */
  private static calculateYuan(date: Date): '上' | '中' | '下' {
    const day = date.getDate();
    if (day <= 10) return '上';
    if (day <= 20) return '中';
    return '下';
  }
}
