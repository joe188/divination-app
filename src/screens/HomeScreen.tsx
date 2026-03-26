/**
 * 首页 - 灵枢智能排盘
 * 功能：展示今日运势、功能入口
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { colors, fonts, spacing, radii } from '../styles/theme';
import { GuochaoCard } from '../components/GuochaoCard';
import { GuochaoButton } from '../components/GuochaoButton';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onStartLiuYao?: () => void;
  onStartQiMen?: () => void;
  onViewHistory?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartLiuYao,
  onStartQiMen,
  onViewHistory,
}) => {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const lunarDate = '农历二月初四';
  const wuXing = '乙巳年 己卯月 壬午日';
  const fortune = '小吉';
  const yi = '学习、沉淀、静思';
  const ji = '远行、投资、争吵';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 头部标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>灵枢智能排盘</Text>
          <Text style={styles.subtitle}>灵枢智能排盘 · 传承千年智慧</Text>
        </View>

        {/* 今日运势卡片 */}
        <GuochaoCard style={styles.fortuneCard}>
          <View style={styles.dateSection}>
            <Text style={styles.dateText}>{today}</Text>
            <Text style={styles.lunarText}>{lunarDate}</Text>
            <Text style={styles.wuXingText}>{wuXing}</Text>
          </View>

          <View style={styles.fortuneSection}>
            <View style={styles.fortuneBadge}>
              <Text style={styles.fortuneText}>{fortune}</Text>
            </View>
          </View>

          <View style={styles.yiJiSection}>
            <View style={styles.yiJiRow}>
              <Text style={styles.yiLabel}>宜</Text>
              <Text style={styles.yiText}>{yi}</Text>
            </View>
            <View style={styles.yiJiRow}>
              <Text style={styles.jiLabel}>忌</Text>
              <Text style={styles.jiText}>{ji}</Text>
            </View>
          </View>
        </GuochaoCard>

        {/* 功能入口 */}
        <View style={styles.functionSection}>
          <Text style={styles.functionTitle}>功能选择</Text>

          <View style={styles.functionGrid}>
            {/* 六爻排盘 */}
            <TouchableOpacity
              style={[styles.functionCard, styles.liuYaoCard]}
              onPress={onStartLiuYao}
              activeOpacity={0.7}
            >
              <View style={styles.functionIcon}>
                <Text style={styles.iconText}>☰</Text>
              </View>
              <Text style={styles.functionName}>六爻排盘</Text>
              <Text style={styles.functionDesc}>文王卦 · 占卜吉凶</Text>
            </TouchableOpacity>

            {/* 奇门遁甲 */}
            <TouchableOpacity
              style={[styles.functionCard, styles.qiMenCard]}
              onPress={onStartQiMen}
              activeOpacity={0.7}
            >
              <View style={[styles.functionIcon, styles.qiMenIcon]}>
                <Text style={[styles.iconText, styles.qiMenIconText]}>☯</Text>
              </View>
              <Text style={styles.functionName}>奇门遁甲</Text>
              <Text style={styles.functionDesc}>择吉时 · 辨方位</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 历史记录入口 */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={onViewHistory}
          activeOpacity={0.7}
        >
          <Text style={styles.historyText}>📜 查看历史记录</Text>
        </TouchableOpacity>

        {/* 底部留白 */}
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: fonts.sizes['3xl'],
    fontFamily: fonts.kaiTi,
    color: colors.cinnabarRed,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.songTi,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  fortuneCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  dateSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateText: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.songTi,
    color: colors.inkBlack,
  },
  lunarText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.gray[700],
    marginTop: spacing.xs,
  },
  wuXingText: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  fortuneSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  fortuneBadge: {
    backgroundColor: colors.cinnabarRed,
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
  },
  fortuneText: {
    color: colors.riceWhite,
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    fontWeight: 'bold',
  },
  yiJiSection: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  yiJiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  yiLabel: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.cinnabarRed,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  yiText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.inkBlack,
  },
  jiLabel: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.gray[500],
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  jiText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.gray[700],
  },
  functionSection: {
    paddingHorizontal: spacing.lg,
  },
  functionTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    marginBottom: spacing.md,
  },
  functionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  functionCard: {
    flex: 1,
    marginHorizontal: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  liuYaoCard: {
    backgroundColor: 'rgba(196, 60, 60, 0.05)',
    borderColor: colors.cinnabarRed,
  },
  qiMenCard: {
    backgroundColor: 'rgba(212, 167, 106, 0.05)',
    borderColor: colors.gold,
  },
  functionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.cinnabarRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  qiMenIcon: {
    backgroundColor: colors.gold,
  },
  iconText: {
    fontSize: 32,
    color: colors.riceWhite,
  },
  qiMenIconText: {
    color: colors.inkBlack,
  },
  functionName: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  functionDesc: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.songTi,
    color: colors.gray[600],
  },
  historyButton: {
    margin: spacing.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: radii.md,
  },
  historyText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.gray[700],
  },
  spacer: {
    height: spacing['6xl'],
  },
});

export default HomeScreen;
