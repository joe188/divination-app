/**
 * HomeScreen - 首页
 * 功能：展示今日运势、开始排盘入口、历史记录
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import theme from '../styles/theme';
const { colors, fonts, spacing, radii } = theme;

interface HomeScreenProps {
  onStartDivination?: () => void;
  onStartLiuYao?: () => void;
  onStartQiMen?: () => void;
  onViewHistory?: () => void;
}

// Mock 数据
const mockTodayFortune = {
  date: '2026 年 3 月 23 日 星期一',
  lunar: '农历二月初四',
  fortune: '小吉',
  advice: '宜静不宜动，适合沉淀学习',
  wuxing: {
    wood: 25,
    fire: 20,
    earth: 30,
    metal: 15,
    water: 10,
  },
};

const mockHistory = [
  { id: '1', date: '2026-03-23', time: '10:30', title: '事业运势' },
  { id: '2', date: '2026-03-22', time: '08:15', title: '感情运势' },
  { id: '3', date: '2026-03-20', time: '15:45', title: '财运分析' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartDivination,
  onStartLiuYao,
  onStartQiMen,
  onViewHistory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 顶部问候 */}
        <View style={styles.header}>
          <Text style={styles.greeting}>你好，有缘人 👋</Text>
          <Text style={styles.date}>{mockTodayFortune.date}</Text>
          <Text style={styles.lunarDate}>{mockTodayFortune.lunar}</Text>
        </View>

        {/* 今日运势卡片 */}
        <GuochaoCard 
          title="今日运势" 
          variant="pattern"
          style={styles.fortuneCard}
        >
          <View style={styles.fortuneContent}>
            <View style={styles.fortuneBadge}>
              <Text style={styles.fortuneText}>{mockTodayFortune.fortune}</Text>
            </View>
            <Text style={styles.advice}>{mockTodayFortune.advice}</Text>
            
            {/* 五行分布简图 */}
            <View style={styles.wuxingContainer}>
              <Text style={styles.wuxingLabel}>五行能量</Text>
              <View style={styles.wuxingBars}>
                <View style={[styles.wuxingBar, { width: `${mockTodayFortune.wuxing.wood}%`, backgroundColor: colors.wood }]} />
                <View style={[styles.wuxingBar, { width: `${mockTodayFortune.wuxing.fire}%`, backgroundColor: colors.fire }]} />
                <View style={[styles.wuxingBar, { width: `${mockTodayFortune.wuxing.earth}%`, backgroundColor: colors.earth }]} />
                <View style={[styles.wuxingBar, { width: `${mockTodayFortune.wuxing.metal}%`, backgroundColor: colors.metal }]} />
                <View style={[styles.wuxingBar, { width: `${mockTodayFortune.wuxing.water}%`, backgroundColor: colors.water }]} />
              </View>
            </View>
          </View>
        </GuochaoCard>

        {/* 主要操作区 */}
        <View style={styles.actions}>
          <GuochaoButton
            title="🔮 八字排盘"
            variant="primary"
            size="large"
            onPress={onStartDivination}
            style={styles.mainButton}
          />
          
          <View style={styles.secondaryButtons}>
            <GuochaoButton
              title="🪙 六爻占卜"
              variant="outline"
              size="small"
              onPress={onStartLiuYao}
              style={[styles.secondaryButton, styles.halfButton]}
            />
            <GuochaoButton
              title="🗺️ 奇门遁甲"
              variant="outline"
              size="small"
              onPress={onStartQiMen}
              style={[styles.secondaryButton, styles.halfButton]}
            />
          </View>
          
          <GuochaoButton
            title="📚 查看历史"
            variant="outline"
            size="medium"
            onPress={onViewHistory}
            style={styles.secondaryButton}
          />
        </View>

        {/* 最近记录 */}
        <GuochaoCard title="最近记录" variant="elevated">
          {mockHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={styles.historyTime}>{item.time}</Text>
              </View>
              <Text style={styles.historyTitle}>{item.title}</Text>
              <Text style={styles.historyIcon}>📋</Text>
            </View>
          ))}
        </GuochaoCard>

        {/* 底部 spacer */}
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  
  greeting: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes['2xl'],
    color: colors.inkBlack,
    fontWeight: '600',
  },
  
  date: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  
  lunarDate: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.sm,
    color: colors.cinnabarRed,
    marginTop: spacing.xs,
  },
  
  fortuneCard: {
    marginBottom: spacing.xl,
  },
  
  fortuneContent: {
    alignItems: 'center',
  },
  
  fortuneBadge: {
    backgroundColor: colors.cinnabarRed,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    marginBottom: spacing.md,
  },
  
  fortuneText: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.lg,
    color: colors.white,
    fontWeight: '600',
  },
  
  advice: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[700],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  
  wuxingContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  
  wuxingLabel: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  
  wuxingBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.gray[200],
    overflow: 'hidden',
  },
  
  wuxingBar: {
    height: '100%',
  },
  
  actions: {
    marginBottom: spacing.xl,
  },
  
  mainButton: {
    marginBottom: spacing.md,
  },
  
  secondaryButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  
  secondaryButton: {
    flex: 1,
  },
  
  halfButton: {
    flex: 1,
  },
  
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  
  historyInfo: {
    width: 80,
  },
  
  historyDate: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.inkBlack,
    fontWeight: '500',
  },
  
  historyTime: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.xs,
    color: colors.gray[500],
  },
  
  historyTitle: {
    flex: 1,
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[700],
  },
  
  historyIcon: {
    fontSize: fonts.sizes.lg,
  },
  
  spacer: {
    height: spacing['6xl'],
  },
});

export default HomeScreen;
