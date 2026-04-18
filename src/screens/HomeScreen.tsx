/**
 * HomeScreen - 首页（国潮美化版）
 * 功能：展示今日运势、开始排盘入口、历史记录
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  Animated,
} from 'react-native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import { getRecentRecords, getStatistics } from '../database/queries/history';
import { DivinationRecord } from '../database/models/DivinationRecord';
import theme from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { colors, fonts, spacing, radii } = theme;
const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  LiuYao: undefined;
  BaZiInput: undefined;
  QiMen: undefined;
  History: undefined;
  HistoryDetail: { recordId: string };
  Result: undefined;
  YijingTest: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Mock 今日运势数据
const mockTodayFortune = {
  date: '2026 年 4 月 19 日 星期日',
  lunar: '农历三月廿二',
  fortune: '上吉',
  advice: '宜祭祀、祈福、求嗣、开光',
  wuxing: {
    wood: 25,
    fire: 30,
    earth: 20,
    metal: 15,
    water: 10,
  },
};

// 八卦符号
const BAGUA_SYMBOLS = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [history, setHistory] = useState<DivinationRecord[]>([]);
  const [stats, setStats] = useState<{ total: number; favoriteCount: number }>({ total: 0, favoriteCount: 0 });
  const [loading, setLoading] = useState(true);
  const fadeAnim = new Animated.Value(0);

  // 加载历史记录和统计
  useEffect(() => {
    loadData();
    // 淡入动画
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    try {
      const [records, statistics] = await Promise.all([
        getRecentRecords(3),
        getStatistics(),
      ]);
      setHistory(records);
      setStats({ total: statistics.total, favoriteCount: statistics.favoriteCount });
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 生成历史记录标题
  const getHistoryTitle = (record: DivinationRecord) => {
    const typeMap = {
      bazi: '八字排盘',
      liuyao: '六爻占卜',
      qimen: '奇门遁甲',
    };
    const type = typeMap[record.baziType] || '排盘';
    const date = record.lunarDate || '';
    return `${type} · ${date}`;
  };

  // 生成三类图标
  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'bazi': return '🔮';
      case 'liuyao': return '🪙';
      case 'qimen': return '🗺️';
      default: return '📋';
    }
  };

  // 五行进度条
  const renderWuxingBar = (element: string, value: number, color: string) => (
    <View key={element} style={styles.wuxingItem}>
      <Text style={styles.wuxingLabel}>{element}</Text>
      <View style={styles.wuxingBarBg}>
        <Animated.View 
          style={[
            styles.wuxingBarFill, 
            { 
              width: `${value}%`,
              backgroundColor: color,
            }
          ]}
        />
      </View>
      <Text style={styles.wuxingValue}>{value}%</Text>
    </View>
  );

  // 功能卡片配置
  const featureCards = [
    {
      title: '六爻占卜',
      icon: '🪙',
      gradient: ['#667eea', '#764ba2'],
      onPress: () => navigation.navigate('LiuYao'),
      desc: '摇卦问事，洞察天机',
    },
    {
      title: '八字排盘',
      icon: '🔮',
      gradient: ['#f093fb', '#f5576c'],
      onPress: () => navigation.navigate('BaZiInput'),
      desc: '四柱命理，推算人生',
    },
    {
      title: '奇门遁甲',
      icon: '🗺️',
      gradient: ['#4facfe', '#00f2fe'],
      onPress: () => navigation.navigate('QiMen'),
      desc: '排局布阵，趋吉避凶',
    },
  ];

  // 次要功能卡片
  const secondaryCards = [
    {
      title: '全局设置',
      icon: '⚙️',
      backgroundColor: colors.gold,
      onPress: () => navigation.navigate('Settings'),
      desc: 'AI 配置\n主题切换',
    },
    {
      title: '使用手册',
      icon: '📖',
      backgroundColor: colors.white,
      borderColor: colors.gold,
      onPress: () => Alert.alert('📖 使用手册', '功能开发中...\n\n包含：\n- 新手指南\n- 常见问题\n- 功能说明'),
      desc: '新手指南\n常见问题',
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.cinnabarRed} />
        <Text style={styles.loadingText}>灵枢排盘加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 顶部装饰 - 八卦图案 */}
      <View style={styles.baguaHeader}>
        <View style={styles.baguaCircle}>
          {BAGUA_SYMBOLS.map((symbol, index) => {
            const angle = (index * 45 * Math.PI) / 180;
            const x = Math.cos(angle) * 60;
            const y = Math.sin(angle) * 60;
            return (
              <Text
                key={index}
                style={[
                  styles.baguaSymbol,
                  {
                    left: x + 70,
                    top: y + 70,
                  }
                ]}
              >
                {symbol}
              </Text>
            );
          })}
          <Text style={styles.taiji}>☯</Text>
        </View>
      </View>

      {/* 今日运势卡片 */}
      <Animated.View style={[styles.fortuneCard, { opacity: fadeAnim }]}>
        <View style={styles.fortuneHeader}>
          <Text style={styles.fortuneDate}>{mockTodayFortune.date}</Text>
          <Text style={styles.fortuneLunar}>{mockTodayFortune.lunar}</Text>
        </View>
        
        <View style={styles.fortuneMain}>
          <View style={styles.fortuneBadge}>
            <Text style={styles.fortuneText}>{mockTodayFortune.fortune}</Text>
          </View>
          <Text style={styles.fortuneAdvice}>{mockTodayFortune.advice}</Text>
        </View>

        {/* 五行能量 */}
        <View style={styles.wuxingSection}>
          <Text style={styles.wuxingTitle}>五行能量</Text>
          {renderWuxingBar('木', mockTodayFortune.wuxing.wood, colors.wood)}
          {renderWuxingBar('火', mockTodayFortune.wuxing.fire, colors.fire)}
          {renderWuxingBar('土', mockTodayFortune.wuxing.earth, colors.earth)}
          {renderWuxingBar('金', mockTodayFortune.wuxing.metal, colors.gold)}
          {renderWuxingBar('水', mockTodayFortune.wuxing.water, colors.water)}
        </View>
      </Animated.View>

      {/* 功能入口 */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>排盘功能</Text>
        <View style={styles.featuresGrid}>
          {featureCards.map((feature, index) => (
            <TouchableOpacity
              key={feature.title}
              style={[
                styles.featureCard,
                {
                  backgroundColor: feature.gradient[0],
                }
              ]}
              onPress={feature.onPress}
              activeOpacity={0.8}
            >
              <Text style={[styles.featureIcon, { fontSize: 40, textAlign: 'center' }]}>{feature.icon}</Text>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 次要功能卡片 */}
        <View style={styles.secondaryGrid}>
          {secondaryCards.map((card) => (
            <TouchableOpacity
              key={card.title}
              style={[
                styles.secondaryCard,
                {
                  backgroundColor: card.backgroundColor,
                  borderColor: card.borderColor || 'transparent',
                }
              ]}
              onPress={card.onPress}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryIcon, { fontSize: 32, textAlign: 'center' }]}>{card.icon}</Text>
              <Text style={styles.secondaryTitle}>{card.title}</Text>
              <Text style={[styles.secondaryDesc, { whiteSpace: 'pre-line' }]}>{card.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 历史记录 */}
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>最近记录</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.historyMore}>查看全部 ›</Text>
          </TouchableOpacity>
        </View>

        {history.length > 0 ? (
          history.map((record, index) => (
            <TouchableOpacity
              key={record.id}
              style={styles.historyItem}
              onPress={() => navigation.navigate('HistoryDetail', { recordId: String(record.id) })}
            >
              <View style={styles.historyIconBox}>
                <Text style={styles.historyIcon}>{getHistoryIcon(record.baziType)}</Text>
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>{getHistoryTitle(record)}</Text>
                <Text style={styles.historyLocation} numberOfLines={1}>
                  {record.location || '未设置地点'}
                </Text>
              </View>
              {record.isFavorite && <Text style={styles.favoriteStar}>⭐</Text>}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyText}>暂无历史记录</Text>
            <Text style={styles.emptyHint}>开始第一次排盘吧</Text>
          </View>
        )}
      </View>

      {/* 底部装饰 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>灵枢排盘 · 传承千年智慧</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.riceWhite,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: fonts.sizes.md,
    color: colors.inkBlack,
    fontFamily: fonts.kaiTi,
  },
  
  // 八卦头部
  baguaHeader: {
    height: 180,
    backgroundColor: colors.cinnabarRed,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: radii['3xl'],
    borderBottomRightRadius: radii['3xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  baguaCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.riceWhite,
  },
  baguaSymbol: {
    position: 'absolute',
    fontSize: 24,
    color: colors.inkBlack,
    fontWeight: 'bold',
  },
  taiji: {
    fontSize: 48,
    color: colors.inkBlack,
  },
  
  // 运势卡片
  fortuneCard: {
    margin: spacing.xl,
    marginTop: -40,
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  fortuneHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  fortuneDate: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
  },
  fortuneLunar: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.songTi,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  fortuneMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  fortuneBadge: {
    backgroundColor: colors.cinnabarRed,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    marginRight: spacing.lg,
  },
  fortuneText: {
    fontSize: fonts.sizes['2xl'],
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  fortuneAdvice: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.sourceHan,
    color: colors.gray[700],
    flex: 1,
  },
  
  // 五行
  wuxingSection: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.lg,
  },
  wuxingTitle: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
    marginBottom: spacing.md,
  },
  wuxingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  wuxingLabel: {
    width: 24,
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
  },
  wuxingBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: radii.full,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  wuxingBarFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  wuxingValue: {
    width: 36,
    fontSize: fonts.sizes.sm,
    color: colors.gray[600],
    textAlign: 'right',
  },
  
  // 功能区域
  featuresSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: fonts.sizes.xl,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.lg,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - spacing['2xl'] * 2 - spacing.lg) / 2,
    aspectRatio: 1,
    borderRadius: radii.xl,
    padding: spacing.lg,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  featureIcon: {
    fontSize: 40,
    textAlign: 'center',
  },
  featureTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.bold,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  // 历史记录
  historySection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  historyMore: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.cinnabarRed,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  historyIconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.riceWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  historyIcon: {
    fontSize: 24,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
    marginBottom: spacing.xs,
  },
  historyLocation: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
  },
  favoriteStar: {
    fontSize: 20,
  },
  
  // 空状态
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[500],
  },
  
  // 次要功能卡片
  secondaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  secondaryCard: {
    width: (width - spacing['2xl'] * 2 - spacing.md) / 2,
    aspectRatio: 1.3,
    borderRadius: radii.xl,
    padding: spacing.lg,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
  },
  secondaryIcon: {
    textAlign: 'center',
  },
  secondaryTitle: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
    textAlign: 'center',
  },
  secondaryDesc: {
    fontSize: fonts.sizes.xs,
    fontFamily: fonts.sourceHan,
    color: colors.gray[700],
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 16,
  },
  
  // 底部
  footer: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  footerText: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.songTi,
    color: colors.gray[500],
  },
});

export default HomeScreen;
