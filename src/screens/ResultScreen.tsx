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
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import { colors, fonts, spacing, radii } from '../styles/theme';

interface ResultScreenProps {
  onBack?: () => void;
  onShare?: () => void;
  onAIInterpret?: () => void;
}

// Mock 排盘结果数据
const mockBaziResult = {
  date: '1990 年 08 月 15 日 子时',
  year: { gan: '庚', zhi: '午', element: '金火' },
  month: { gan: '甲', zhi: '申', element: '木金' },
  day: { gan: '丙', zhi: '戌', element: '火土' },
  hour: { gan: '戊', zhi: '子', element: '土水' },
  wuxing: {
    wood: 20,
    fire: 25,
    earth: 30,
    metal: 15,
    water: 10,
  },
  shishen: ['偏财', '七杀', '日主', '食神'],
};

export const ResultScreen: React.FC<ResultScreenProps> = ({
  onBack,
  onShare,
  onAIInterpret,
}) => {
  const [activeTab, setActiveTab] = useState<'wuxing' | 'shishen'>('wuxing');

  const getElementColor = (element: string) => {
    const colors_map: Record<string, string> = {
      木: colors.wood,
      火: colors.fire,
      土: colors.earth,
      金: colors.gold,
      水: colors.water,
    };
    return colors_map[element] || colors.inkBlack;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 标题栏 */}
        <View style={styles.header}>
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
          <Text style={styles.dateText}>{mockBaziResult.date}</Text>
          <Text style={styles.ganzhiText}>
            {mockBaziResult.year.gan}{mockBaziResult.year.zhi}年 
            {mockBaziResult.month.gan}{mockBaziResult.month.zhi}月 
            {mockBaziResult.day.gan}{mockBaziResult.day.zhi}日 
            {mockBaziResult.hour.gan}{mockBaziResult.hour.zhi}时
          </Text>
        </View>

        {/* 四柱展示 */}
        <GuochaoCard title="四柱八字" variant="pattern">
          <View style={styles.sizhuContainer}>
            {/* 年柱 */}
            <View style={styles.zhuItem}>
              <Text style={styles.zhuLabel}>年柱</Text>
              <Text style={[styles.zhuGan, { color: getElementColor(mockBaziResult.year.gan) }]}>
                {mockBaziResult.year.gan}
              </Text>
              <Text style={[styles.zhuZhi, { color: getElementColor(mockBaziResult.year.zhi) }]}>
                {mockBaziResult.year.zhi}
              </Text>
              <Text style={styles.zhuElement}>{mockBaziResult.year.element}</Text>
            </View>
            
            {/* 月柱 */}
            <View style={styles.zhuItem}>
              <Text style={styles.zhuLabel}>月柱</Text>
              <Text style={[styles.zhuGan, { color: getElementColor(mockBaziResult.month.gan) }]}>
                {mockBaziResult.month.gan}
              </Text>
              <Text style={[styles.zhuZhi, { color: getElementColor(mockBaziResult.month.zhi) }]}>
                {mockBaziResult.month.zhi}
              </Text>
              <Text style={styles.zhuElement}>{mockBaziResult.month.element}</Text>
            </View>
            
            {/* 日柱 */}
            <View style={styles.zhuItem}>
              <Text style={styles.zhuLabel}>日柱</Text>
              <Text style={[styles.zhuGan, { color: getElementColor(mockBaziResult.day.gan) }]}>
                {mockBaziResult.day.gan}
              </Text>
              <Text style={[styles.zhuZhi, { color: getElementColor(mockBaziResult.day.zhi) }]}>
                {mockBaziResult.day.zhi}
              </Text>
              <Text style={styles.zhuElement}>{mockBaziResult.day.element}</Text>
            </View>
            
            {/* 时柱 */}
            <View style={styles.zhuItem}>
              <Text style={styles.zhuLabel}>时柱</Text>
              <Text style={[styles.zhuGan, { color: getElementColor(mockBaziResult.hour.gan) }]}>
                {mockBaziResult.hour.gan}
              </Text>
              <Text style={[styles.zhuZhi, { color: getElementColor(mockBaziResult.hour.zhi) }]}>
                {mockBaziResult.hour.zhi}
              </Text>
              <Text style={styles.zhuElement}>{mockBaziResult.hour.element}</Text>
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
                  <Text style={styles.wuxingValue}>{mockBaziResult.wuxing.wood}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${mockBaziResult.wuxing.wood}%`, backgroundColor: colors.wood }]} />
                </View>
              </View>
              
              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.fire }]}>●</Text>
                  <Text style={styles.wuxingName}>火</Text>
                  <Text style={styles.wuxingValue}>{mockBaziResult.wuxing.fire}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${mockBaziResult.wuxing.fire}%`, backgroundColor: colors.fire }]} />
                </View>
              </View>
              
              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.earth }]}>●</Text>
                  <Text style={styles.wuxingName}>土</Text>
                  <Text style={styles.wuxingValue}>{mockBaziResult.wuxing.earth}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${mockBaziResult.wuxing.earth}%`, backgroundColor: colors.earth }]} />
                </View>
              </View>
              
              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.gold }]}>●</Text>
                  <Text style={styles.wuxingName}>金</Text>
                  <Text style={styles.wuxingValue}>{mockBaziResult.wuxing.metal}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${mockBaziResult.wuxing.metal}%`, backgroundColor: colors.gold }]} />
                </View>
              </View>
              
              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.water }]}>●</Text>
                  <Text style={styles.wuxingName}>水</Text>
                  <Text style={styles.wuxingValue}>{mockBaziResult.wuxing.water}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${mockBaziResult.wuxing.water}%`, backgroundColor: colors.water }]} />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.shishenContent}>
              {mockBaziResult.shishen.map((item, index) => (
                <View key={index} style={styles.shishenItem}>
                  <Text style={styles.shishenLabel}>{['年', '月', '日', '时'][index]}</Text>
                  <Text style={styles.shishenValue}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </GuochaoCard>

        {/* 五行分析 */}
        <GuochaoCard title="五行分析" variant="elevated">
          <View style={styles.analysisContent}>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>五行强弱：</Text>
              <Text style={styles.analysisValue}>
                土最旺 (30%)，水最弱 (10%)
              </Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>五行缺失：</Text>
              <Text style={styles.analysisValue}>
                水较弱，需补水
              </Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>建议：</Text>
              <Text style={styles.analysisValue}>
                宜穿戴黑色、蓝色饰品，多接触水元素
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
    </SafeAreaView>
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
});

export default ResultScreen;
