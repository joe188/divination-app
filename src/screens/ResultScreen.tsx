/**
 * ResultScreen - 排盘结果页
 * 功能：展示四柱八字、五行分布、AI 解卦入口
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import theme from '../styles/theme';
const { colors, fonts, spacing, radii } = theme;

// 导入 BaziData 类型定义（与 BaZiInputScreen 一致）
// 为避免循环依赖，这里重新声明
interface BaziData {
  year: number;
  month: number;
  day: number;
  hour: number;
  hourLabel: string;
  location: string;
  calendarType: 'solar' | 'lunar';
  solarCorrection: boolean;
  baziResult?: {
    solarDate: string;
    lunarDate: string;
    ganZhi: {
      year: { gan: string; zhi: string };
      month: { gan: string; zhi: string };
      day: { gan: string; zhi: string };
      hour: { gan: string; zhi: string };
    };
    fiveElements: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
    shishen: string[];
    wuxingDistribution: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
  };
}

interface ResultScreenProps {
  onBack?: () => void;
  onShare?: () => void;
  onAIInterpret?: () => void;
  baziData?: BaziData;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  onBack,
  onShare,
  onAIInterpret,
  baziData,
}) => {
  const [activeTab, setActiveTab] = useState<'wuxing' | 'shishen'>('wuxing');

  // 获取天干对应五行颜色
  const getGanElementColor = (gan: string) => {
    const ganElement: Record<string, string> = {
      甲: colors.wood, 乙: colors.wood,
      丙: colors.fire, 丁: colors.fire,
      戊: colors.earth, 己: colors.earth,
      庚: colors.gold, 辛: colors.gold,
      壬: colors.water, 癸: colors.water,
    };
    return ganElement[gan] || colors.inkBlack;
  };

  // 使用传入的 baziData 或默认空数据
  const data = baziData?.baziResult;
  const hasData = !!data;

  if (!hasData) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.header, { paddingTop: spacing.xl }]}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>排盘结果</Text>
            <TouchableOpacity onPress={onShare} style={styles.shareButton}>
              <Text style={styles.shareButtonText}>分享</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无排盘数据</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // 构建日期显示
  const dateDisplay = baziData.calendarType === 'lunar'
    ? `${data.lunarDate} ${baziData.hourLabel}`
    : `${data.solarDate} ${baziData.hourLabel}`;

  const ganZhi = data.ganZhi;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 标题栏 */}
        <View style={[styles.header, { paddingTop: spacing.xl }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>排盘结果</Text>
          <TouchableOpacity onPress={onShare} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>分享</Text>
          </TouchableOpacity>
        </View>

        {/* 日期信息 */}
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>{dateDisplay}</Text>
          <Text style={styles.ganzhiText}>
            {ganZhi.year.gan}{ganZhi.year.zhi}年 
            {ganZhi.month.gan}{ganZhi.month.zhi}月 
            {ganZhi.day.gan}{ganZhi.day.zhi}日 
            {ganZhi.hour.gan}{ganZhi.hour.zhi}时
          </Text>
        </View>

        {/* 四柱展示 */}
        <GuochaoCard title="四柱八字" variant="pattern">
          <View style={styles.sizhuContainer}>
            {/* 年柱 */}
            <View style={styles.zhuItem}>
              <Text style={styles.zhuLabel}>年柱</Text>
              <Text style={[styles.zhuGan, { color: getGanElementColor(ganZhi.year.gan) }]}>
                {ganZhi.year.gan}
              </Text>
              <Text style={[styles.zhuZhi, { color: getGanElementColor(ganZhi.year.zhi) }]}>
                {ganZhi.year.zhi}
              </Text>
              <Text style={styles.zhuElement}>
                {getGanElementColor(ganZhi.year.gan).replace('#', '') === colors.wood ? '木' :
                 getGanElementColor(ganZhi.year.gan).replace('#', '') === colors.fire ? '火' :
                 getGanElementColor(ganZhi.year.gan).replace('#', '') === colors.earth ? '土' :
                 getGanElementColor(ganZhi.year.gan).replace('#', '') === colors.gold ? '金' : '水'}
              </Text>
            </View>
            
            {/* 月柱 */}
            <View style={styles.zhuItem}>
              <Text style={styles.zhuLabel}>月柱</Text>
              <Text style={[styles.zhuGan, { color: getGanElementColor(ganZhi.month.gan) }]}>
                {ganZhi.month.gan}
              </Text>
              <Text style={[styles.zhuZhi, { color: getGanElementColor(ganZhi.month.zhi) }]}>
                {ganZhi.month.zhi}
              </Text>
              <Text style={styles.zhuElement}>
                {getGanElementColor(ganZhi.month.gan).replace('#', '') === colors.wood ? '木' :
                 getGanElementColor(ganZhi.month.gan).replace('#', '') === colors.fire ? '火' :
                 getGanElementColor(ganZhi.month.gan).replace('#', '') === colors.earth ? '土' :
                 getGanElementColor(ganZhi.month.gan).replace('#', '') === colors.gold ? '金' : '水'}
              </Text>
            </View>
            
            {/* 日柱 */}
            <View style={styles.zhuItem}>
              <Text style={styles.zhuLabel}>日柱</Text>
              <Text style={[styles.zhuGan, { color: getGanElementColor(ganZhi.day.gan) }]}>
                {ganZhi.day.gan}
              </Text>
              <Text style={[styles.zhuZhi, { color: getGanElementColor(ganZhi.day.zhi) }]}>
                {ganZhi.day.zhi}
              </Text>
              <Text style={styles.zhuElement}>
                {getGanElementColor(ganZhi.day.gan).replace('#', '') === colors.wood ? '木' :
                 getGanElementColor(ganZhi.day.gan).replace('#', '') === colors.fire ? '火' :
                 getGanElementColor(ganZhi.day.gan).replace('#', '') === colors.earth ? '土' :
                 getGanElementColor(ganZhi.day.gan).replace('#', '') === colors.gold ? '金' : '水'}
              </Text>
            </View>
            
            {/* 时柱 */}
            <View style={styles.zhuItem}>
              <Text style={styles.zhuLabel}>时柱</Text>
              <Text style={[styles.zhuGan, { color: getGanElementColor(ganZhi.hour.gan) }]}>
                {ganZhi.hour.gan}
              </Text>
              <Text style={[styles.zhuZhi, { color: getGanElementColor(ganZhi.hour.zhi) }]}>
                {ganZhi.hour.zhi}
              </Text>
              <Text style={styles.zhuElement}>
                {getGanElementColor(ganZhi.hour.gan).replace('#', '') === colors.wood ? '木' :
                 getGanElementColor(ganZhi.hour.gan).replace('#', '') === colors.fire ? '火' :
                 getGanElementColor(ganZhi.hour.gan).replace('#', '') === colors.earth ? '土' :
                 getGanElementColor(ganZhi.hour.gan).replace('#', '') === colors.gold ? '金' : '水'}
              </Text>
            </View>
          </View>
        </GuochaoCard>

        {/* 五行分布图 */}
        <GuochaoCard 
          title="五行分布" 
          variant="elevated"
          headerRight={
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'wuxing' && styles.tabActive]}
                onPress={() => setActiveTab('wuxing')}
              >
                <Text style={[styles.tabText, activeTab === 'wuxing' && styles.tabTextActive]}>
                  五行
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'shishen' && styles.tabActive]}
                onPress={() => setActiveTab('shishen')}
              >
                <Text style={[styles.tabText, activeTab === 'shishen' && styles.tabTextActive]}>
                  十神
                </Text>
              </TouchableOpacity>
            </View>
          }
        >
          {activeTab === 'wuxing' ? (
            <View style={styles.wuxingContent}>
              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.wood }]}>●</Text>
                  <Text style={styles.wuxingName}>木</Text>
                  <Text style={styles.wuxingValue}>{data.wuxingDistribution.wood}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${data.wuxingDistribution.wood}%`, backgroundColor: colors.wood }]} />
                </View>
              </View>
              
              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.fire }]}>●</Text>
                  <Text style={styles.wuxingName}>火</Text>
                  <Text style={styles.wuxingValue}>{data.wuxingDistribution.fire}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${data.wuxingDistribution.fire}%`, backgroundColor: colors.fire }]} />
                </View>
              </View>
              
              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.earth }]}>●</Text>
                  <Text style={styles.wuxingName}>土</Text>
                  <Text style={styles.wuxingValue}>{data.wuxingDistribution.earth}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${data.wuxingDistribution.earth}%`, backgroundColor: colors.earth }]} />
                </View>
              </View>
              
              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.gold }]}>●</Text>
                  <Text style={styles.wuxingName}>金</Text>
                  <Text style={styles.wuxingValue}>{data.wuxingDistribution.metal}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${data.wuxingDistribution.metal}%`, backgroundColor: colors.gold }]} />
                </View>
              </View>
              
              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.water }]}>●</Text>
                  <Text style={styles.wuxingName}>水</Text>
                  <Text style={styles.wuxingValue}>{data.wuxingDistribution.water}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${data.wuxingDistribution.water}%`, backgroundColor: colors.water }]} />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.shishenContent}>
              {data.shishen.map((item, index) => (
                <View key={index} style={styles.shishenItem}>
                  <Text style={styles.shishenLabel}>{['年', '月', '日', '时'][index]}</Text>
                  <Text style={styles.shishenValue}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </GuochaoCard>

        {/* 五行分析（简化，后续可增强） */}
        <GuochaoCard title="五行分析" variant="elevated">
          <View style={styles.analysisContent}>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>五行强弱：</Text>
              <Text style={styles.analysisValue}>
                木、火、土、金、水分布如上
              </Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>建议：</Text>
              <Text style={styles.analysisValue}>
                根据五行缺失，可适当补益相应元素
              </Text>
            </View>
          </View>
        </GuochaoCard>

        {/* AI 解卦入口 */}
        <View style={styles.aiSection}>
          <GuochaoCard variant="pattern" style={styles.aiCard}>
            <View style={styles.aiContent}>
              <Text style={styles.aiIcon}>🤖</Text>
              <View style={styles.aiText}>
                <Text style={styles.aiTitle}>AI 智能解卦</Text>
                <Text style={styles.aiDesc}>
                  结合现代语境，为你解读八字奥秘
                </Text>
              </View>
            </View>
            <GuochaoButton
              title="立即解读"
              variant="primary"
              size="medium"
              onPress={onAIInterpret}
              style={styles.aiButton}
            />
          </GuochaoCard>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
  
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  
  backButton: {
    padding: spacing.sm,
  },
  
  backButtonText: {
    fontSize: fonts.sizes.xl,
    color: colors.inkBlack,
  },
  
  headerTitle: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes['2xl'],
    fontWeight: '600',
    color: colors.inkBlack,
  },
  
  shareButton: {
    padding: spacing.sm,
  },
  
  shareButtonText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.cinnabarRed,
  },
  
  dateInfo: {
    marginBottom: spacing.lg,
  },
  
  dateText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[700],
    fontWeight: '500',
  },
  
  ganzhiText: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.sm,
    color: colors.cinnabarRed,
    marginTop: spacing.xs,
  },
  
  sizhuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  zhuItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  
  zhuLabel: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.xs,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  
  zhuGan: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes['2xl'],
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  
  zhuZhi: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.xl,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  
  zhuElement: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.xs,
    color: colors.gray[600],
  },
  
  tabContainer: {
    flexDirection: 'row',
  },
  
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  
  tabActive: {
    borderBottomColor: colors.cinnabarRed,
  },
  
  tabText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[600],
  },
  
  tabTextActive: {
    color: colors.cinnabarRed,
    fontWeight: '600',
  },
  
  wuxingContent: {
    paddingTop: spacing.md,
  },
  
  wuxingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  wuxingLabel: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  wuxingDot: {
    fontSize: fonts.sizes.md,
  },
  
  wuxingName: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.inkBlack,
    marginLeft: spacing.xs,
    marginRight: spacing.sm,
  },
  
  wuxingValue: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[600],
    width: 35,
  },
  
  wuxingTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  
  wuxingFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  
  shishenContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
  },
  
  shishenItem: {
    alignItems: 'center',
  },
  
  shishenLabel: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.xs,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  
  shishenValue: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.lg,
    color: colors.inkBlack,
    fontWeight: '600',
  },
  
  analysisContent: {
    paddingTop: spacing.sm,
  },
  
  analysisItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  
  analysisLabel: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[700],
    fontWeight: '500',
    width: 80,
  },
  
  analysisValue: {
    flex: 1,
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[600],
  },
  
  aiSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  
  aiCard: {
    backgroundColor: colors.cinnabarRed,
    borderWidth: 0,
  },
  
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  aiIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  
  aiText: {
    flex: 1,
  },
  
  aiTitle: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.lg,
    color: colors.white,
    fontWeight: '600',
  },
  
  aiDesc: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  
  aiButton: {
    backgroundColor: colors.white,
  },
  
  spacer: {
    height: spacing['6xl'],
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing['3xl'],
  },

  emptyText: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.xl,
    color: colors.gray[500],
  },
});

export default ResultScreen;
