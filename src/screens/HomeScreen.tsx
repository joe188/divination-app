/**
 * HomeScreen - 首页
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

// Mock 今日运势数据（未来可从数据库统计）
const mockTodayFortune = {
  date: '2026 年 4 月 14 日 星期一',
  lunar: '农历三月初七',
  fortune: '大吉',
  advice: '宜出行、签约、求财',
  wuxing: {
    wood: 25,
    fire: 20,
    earth: 30,
    metal: 15,
    water: 10,
  },
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [history, setHistory] = useState<DivinationRecord[]>([]);
  const [stats, setStats] = useState<{ total: number; favoriteCount: number }>({ total: 0, favoriteCount: 0 });
  const [loading, setLoading] = useState(true);

  // 加载历史记录和统计
  useEffect(() => {
    loadData();
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.cinnabarRed} />
          <Text style={styles.loadingText}>正在加载...</Text>
        </View>
      </View>
    );
  }

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
            onPress={() => navigation.navigate('BaZiInput')}
            style={styles.mainButton}
          />
          
          <View style={styles.secondaryButtons}>
            <GuochaoButton
              title="🪙 六爻占卜"
              variant="outline"
              size="small"
              onPress={() => navigation.navigate('LiuYao')}
              style={styles.halfButton}
            />
            <GuochaoButton
              title="🗺️ 奇门遁甲"
              variant="outline"
              size="small"
              onPress={() => navigation.navigate('QiMen')}
              style={styles.halfButton}
            />
          </View>
          
          <GuochaoButton
            title="📚 查看历史"
            variant="outline"
            size="medium"
            onPress={() => navigation.navigate('History')}
            style={styles.secondaryButton}
          />

          <GuochaoButton
            title="📖 易经测试"
            variant="ghost"
            size="small"
            onPress={() => navigation.navigate('YijingTest')}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        {/* 最近记录 */}
        <GuochaoCard 
          title={`最近记录 (${stats.total})`} 
          variant="elevated"
          style={styles.historyCard}
        >
          {history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyText}>暂无记录，快开始第一次排盘吧！</Text>
            </View>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDate}>
                    {new Date(item.createdAt).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.historyTime}>
                    {new Date(item.createdAt).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={styles.historyTitle}>{getHistoryTitle(item)}</Text>
                <Text style={styles.historyIcon}>{getHistoryIcon(item.baziType)}</Text>
              </View>
            ))
          )}
        </GuochaoCard>

        {/* 底部 spacer */}
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.riceWhite,
  },
  
  loadingText: {
    marginTop: spacing.md,
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[600],
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
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  
  halfButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  
  secondaryButton: {
    marginBottom: spacing.md,
  },
  
  historyCard: {
    marginBottom: spacing.xl,
  },
  
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  
  historyInfo: {
    width: 70,
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
    marginLeft: spacing.sm,
  },
  
  historyIcon: {
    fontSize: fonts.sizes.lg,
  },
  
  emptyHistory: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  
  emptyText: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.md,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
  
  spacer: {
    height: spacing['6xl'],
  },
});

export default HomeScreen;
