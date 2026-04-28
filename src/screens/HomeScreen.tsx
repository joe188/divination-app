/**
 * HomeScreen - 首页（国潮美化版）
 * 功能：展示今日运势、开始排盘入口、历史记录
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import { getRecentRecords, getStatistics } from '../database/queries/history';
import { DivinationRecord } from '../database/models/DivinationRecord';
import theme from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { solarToLunar, getGanZhiYear, getZodiac, getTodayFortune } from '../utils/lunar-calendar';
import { getLunarInfo } from '../utils/LunarHelper';
import { responsiveHeight, responsiveFontSize, responsiveWidth } from '../styles/responsive';

const { colors, fonts, spacing, radii } = theme;
const { width, height } = Dimensions.get('window');

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

// 获取今日日期信息
const getTodayInfo = () => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][today.getDay()];
    
    // 使用万年历获取农历信息
    const lunarInfo = solarToLunar(year, month, day);
    
    // 获取今日吉凶
    const fortune = getTodayFortune(year, month, day);
    console.log('getTodayInfo: fortune returned:', fortune);
    console.log('getTodayInfo: lunarInfo zodiac:', lunarInfo?.zodiac);
    console.log('getTodayInfo: fortune.yi length:', fortune.yi?.length);
    console.log('getTodayInfo: fortune.ji length:', fortune.ji?.length);
    console.log('getTodayInfo: fortune.jishen length:', fortune.jishen?.length);
    
    return {
      date: `${year} 年 ${month} 月 ${day} 日 ${weekDay}`,
      lunar: `农历${lunarInfo.lunarMonthName}${lunarInfo.lunarDayName}`,
      ganZhiYear: lunarInfo.ganZhiYear,
      ganZhiMonth: lunarInfo.ganZhiMonth,
      ganZhiDay: lunarInfo.ganZhiDay,
      zodiac: lunarInfo.zodiac,
      fortune, // 添加今日吉凶
      wuxing: {
        wood: 25,
        fire: 30,
        earth: 20,
        metal: 15,
        water: 10,
      },
    };
  } catch (error) {
    console.error('获取今日信息失败:', error);
    // 返回默认值
    return {
      date: '2026 年 4 月 20 日 星期一',
      lunar: '农历三月初三',
      ganZhiYear: '丙午',
      ganZhiMonth: '壬辰',
      ganZhiDay: '甲寅',
      zodiac: '马',
      fortune: {
        yi: ['祭祀', '祈福'],
        ji: ['动土', '破土'],
        jishen: ['天德', '月德'],
        xiongsha: ['月破', '大耗'],
        chong: '冲鼠',
        sha: '煞北',
      },
      wuxing: {
        wood: 25,
        fire: 30,
        earth: 20,
        metal: 15,
        water: 10,
      },
    };
  }
};

const todayInfo = getTodayInfo();

// 八卦符号
const BAGUA_SYMBOLS = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<DivinationRecord[]>([]);
  const [stats, setStats] = useState<{ total: number; favoriteCount: number }>({ total: 0, favoriteCount: 0 });
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      gradient: ['#43e97b', '#38f9d7'], // 绿色背景
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
      title: '历史记录',
      icon: '📜',
      gradient: ['#f6d365', '#fda085'],
      onPress: () => navigation.navigate('History'),
      desc: '查阅过往排盘记录',
    },
    {
      title: '全局设置',
      icon: '⚙️',
      backgroundColor: colors.gold,
      onPress: () => navigation.navigate('Settings'),
      desc: '系统设置',
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
    <View style={styles.container}>
      {/* 顶部装饰 - 道法自然 + AI赋能 */}
      <View style={styles.baguaHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.headerLeftText}>道法自然</Text>
          <Text style={styles.headerCenterText}>☯</Text>
          <Text style={styles.headerRightText}>AI赋能</Text>
        </View>
      </View>

      {/* 今日运势卡片 */}
      <Animated.View style={[styles.fortuneCard, { opacity: fadeAnim }]}>
        <View style={styles.fortuneHeader}>
          <Text style={styles.fortuneDate}>{todayInfo.date}</Text>
          <Text style={styles.fortuneLunar}>{todayInfo.lunar}</Text>
          <Text style={styles.fortuneGanZhi}>
            {todayInfo.ganZhiYear}年 {todayInfo.ganZhiMonth}月 {todayInfo.ganZhiDay}日
          </Text>
          <Text style={styles.fortuneZodiac}>生肖：{todayInfo.zodiac}</Text>
        </View>
        
        {/* 今日吉凶 */}
        <View style={styles.fortuneDetail}>
          <View style={styles.fortuneRow}>
            <Text style={styles.fortuneLabel}>宜：</Text>
            <Text style={styles.fortuneValueYi}>{todayInfo.fortune.yi.join('、')}</Text>
          </View>
          <View style={styles.fortuneRow}>
            <Text style={styles.fortuneLabel}>忌：</Text>
            <Text style={styles.fortuneValueJi}>{todayInfo.fortune.ji.join('、')}</Text>
          </View>
          <View style={styles.fortuneRow}>
            <Text style={styles.fortuneLabel}>吉神：</Text>
            <Text style={styles.fortuneValue}>{todayInfo.fortune.jishen.join('、')}</Text>
          </View>
          <View style={styles.fortuneRow}>
            <Text style={styles.fortuneLabel}>冲煞：</Text>
            <Text style={styles.fortuneValue}>{todayInfo.fortune.chong} {todayInfo.fortune.sha}</Text>
          </View>
        </View>
        
        {/* 查看万年历按钮 */}
        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Text style={styles.calendarButtonText}>📅 查看万年历</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 功能入口 */}
      <View style={styles.featuresSection}>
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
              <Text style={[styles.featureIcon, { fontSize: width < 360 ? 24 : 32, textAlign: 'center' }]}>{feature.icon}</Text>
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 底部功能 */}
      <View style={styles.bottomSection}>
        <View style={styles.bottomGrid}>
          {secondaryCards.map((card) => (
            <TouchableOpacity
              key={card.title}
              style={[
                styles.bottomCard,
                {
                  backgroundColor: card.backgroundColor || colors.gold,
                  borderColor: 'transparent',
                }
              ]}
              onPress={card.onPress}
              activeOpacity={0.8}
            >
              <Text style={[styles.bottomIcon, { fontSize: width < 360 ? 18 : 24, textAlign: 'center' }]}>{card.icon}</Text>
              <Text style={styles.bottomTitle}>{card.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
    paddingBottom: spacing['3xl'], // 避免底部内容被遮挡
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
    height: responsiveHeight(10), // 响应式高度
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  headerLeftText: {
    fontSize: responsiveFontSize(24), // 响应式字体
    fontFamily: fonts.kaiTi,
    color: colors.gold,
    fontWeight: fonts.weights.bold,
    marginRight: spacing.lg,
  },
  headerCenterText: {
    fontSize: responsiveFontSize(50), // 响应式字体
    color: colors.gold,
  },
  headerRightText: {
    fontSize: responsiveFontSize(24), // 响应式字体
    fontFamily: fonts.kaiTi,
    color: colors.gold,
    fontWeight: fonts.weights.bold,
    marginLeft: spacing.lg,
  },
  
  // 运势卡片
  fortuneCard: {
    margin: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  fortuneHeader: {
    alignItems: 'center',
  },
  fortuneDate: {
    fontSize: fonts.sizes.md,
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
  fortuneGanZhi: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.cinnabarRed,
    marginTop: spacing.sm,
    fontWeight: fonts.weights.semibold,
  },
  fortuneZodiac: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.songTi,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  
  // 今日吉凶详情
  fortuneDetail: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  fortuneRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  fortuneLabel: {
    fontSize: responsiveFontSize(14), // 响应式字体
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
    width: responsiveWidth(12), // 响应式宽度
  },
  fortuneValue: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.songTi,
    color: colors.gray[700],
    flex: 1,
  },
  fortuneValueYi: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.songTi,
    color: colors.success,
    flex: 1,
  },
  fortuneValueJi: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.songTi,
    color: colors.cinnabarRed,
    flex: 1,
  },
  
  // 万年历按钮
  calendarButton: {
    marginTop: spacing.md,
    backgroundColor: colors.cinnabarRed,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  calendarButtonText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.semibold,
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
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.md,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  featureCard: {
    width: '30%', // 自适应宽度，留出间距
    aspectRatio: 1, // 保持正方形
    minWidth: 90, // 最小宽度
    maxWidth: 120, // 最大宽度
    borderRadius: radii.xl,
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: width < 360 ? 24 : 32, // 小屏幕缩小图标
    textAlign: 'center',
  },
  featureTitle: {
    fontSize: width < 360 ? fonts.sizes.sm : fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.bold,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  featureDesc: {
    fontSize: fonts.sizes.xs,
    fontFamily: fonts.sourceHan,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  // 底部功能
  bottomSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  bottomGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  bottomCard: {
    width: '48%', // 自适应宽度
    minHeight: 70, // 最小高度
    borderRadius: radii.lg,
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
  },
  bottomIcon: {
    fontSize: width < 360 ? 18 : 20,
    textAlign: 'center',
  },
  bottomTitle: {
    fontSize: width < 360 ? 10 : fonts.sizes.xs,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default HomeScreen;
