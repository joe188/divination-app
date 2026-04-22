/**
 * 历史记录页面
 * 显示和管理排盘历史，支持分类筛选、收藏、分享
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Share, Alert, Clipboard } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { GuochaoCard } from '../components/GuochaoCard';
import { GuochaoButton } from '../components/GuochaoButton';
import theme from '../styles/theme';
import {
  getRecentRecords,
  getRecordsByType,
  getFavoriteRecords,
  deleteRecord,
  toggleFavorite,
  getStatistics,
} from '../database/queries/history';
import { DivinationRecord } from '../database/models/DivinationRecord';

const { colors, fonts, spacing, radii } = theme;

type TabType = 'all' | 'liuyao' | 'bazi' | 'qimen';

interface HistoryItem extends DivinationRecord {}

type RootStackParamList = {
  HistoryDetail: { record: HistoryItem };
  // ... other routes
};

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, byType: {} as Record<string, number> });

  // 标签定义
  const tabs = [
    { key: 'all', label: '全部', count: stats.byType['liuyao'] + stats.byType['bazi'] + stats.byType['qimen'] || 0 },
    { key: 'liuyao', label: '六爻', count: stats.byType['liuyao'] || 0 },
    { key: 'bazi', label: '八字', count: stats.byType['bazi'] || 0 },
    { key: 'qimen', label: '奇门', count: stats.byType['qimen'] || 0 },
  ];

  // 加载统计数据
  const loadStats = async () => {
    try {
      const statistics = await getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  // 加载历史记录
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      let records: DivinationRecord[];
      if (activeTab === 'all') {
        records = await getRecentRecords(100);
      } else if (activeTab === 'favorite') {
        records = await getFavoriteRecords(100);
      } else {
        records = await getRecordsByType(activeTab, 100);
      }
      setHistory(records as HistoryItem[]);
    } catch (error) {
      console.error('加载历史记录失败:', error);
      Alert.alert('❌ 错误', '加载历史记录失败');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // 切换收藏状态
  const handleToggleFavorite = async (id: number, currentFavorite: boolean) => {
    try {
      await toggleFavorite(id);
      loadHistory(); // 刷新列表
    } catch (error) {
      Alert.alert('❌ 错误', '操作失败，请重试');
    }
  };

  // 删除记录
  const handleDelete = (id: number) => {
    Alert.alert('确认删除', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteRecord(id);
          loadHistory();
        },
      },
    ]);
  };

  // 分享记录
  const handleShare = async (item: HistoryItem) => {
    try {
      const shareText = formatRecordForShare(item);
      await Share.open({
        message: shareText,
        title: `灵枢排盘 - ${getTypeLabel(item.baziType)}`,
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  // 格式化分享内容
  const formatRecordForShare = (item: HistoryItem): string => {
    const typeLabel = getTypeLabel(item.baziType);
    const date = item.solarDate || '';
    const lunar = item.lunarDate || '';
    const time = item.timePeriod || '';
    const ganZhi = [item.yearGanzhi, item.monthGanzhi, item.dayGanzhi, item.hourGanzhi]
      .filter(Boolean)
      .join(' ');
    const location = item.location || '未记录';
    const aiInterpretation = item.aiInterpretation ? `\n\nAI 解析：\n${item.aiInterpretation}` : '';

    return `【${typeLabel}排盘 record】\n日期：${date}\n农历：${lunar}\n时辰：${time}\n干支：${ganZhi}\n地点：${location}${aiInterpretation}`;
  };

  // 获取类型标签文本
  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      liuyao: '六爻占卜',
      bazi: '八字排盘',
      qimen: '奇门遁甲',
    };
    return labels[type] || type;
  };

  // 查看详情 - 转换数据格式
  const handleViewItem = (item: HistoryItem) => {
    // 格式化日期：将 ISO 字符串转换为易读格式
    let formattedDate = item.solarDate || '';
    if (formattedDate) {
      try {
        const dateObj = new Date(formattedDate);
        formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
      } catch (e) {
        // 如果解析失败，保持原样
      }
    }
    
    const detailItem = {
      id: item.id?.toString() || Date.now().toString(),
      date: formattedDate,
      time: item.timePeriod || '',
      title: getTypeLabel(item.baziType),
      type: item.baziType as 'bazi' | 'liuyao' | 'qimen',
      data: {
        // 八字数据
        year: item.yearGanzhi,
        month: item.monthGanzhi,
        day: item.dayGanzhi,
        hour: item.hourGanzhi,
        wuxing: item.fiveElements ? Object.entries(item.fiveElements).map(([k, v]) => `${k}${v}%`).join(' ') : undefined,
        // 六爻数据
        guaName: item.hexagram,
        movingLines: item.movingLines ? item.movingLines.split(',').map(Number) : [],
        summary: item.aiInterpretation,
        // 奇门数据
        jieQi: item.jieqi,
        diZhi: item.timePeriod,
      }
    };
    navigation.navigate('HistoryDetail', { item: detailItem });
  };

  // 渲染分类标签
  const renderTab = (tab: { key: TabType; label: string; count: number }) => (
    <TouchableOpacity
      key={tab.key}
      style={[styles.tab, activeTab === tab.key && styles.tabActive]}
      onPress={() => setActiveTab(tab.key)}
    >
      <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
        {tab.label}
      </Text>
      <Text style={[styles.tabCount, activeTab === tab.key && styles.tabCountActive]}>
        {tab.count}
      </Text>
    </TouchableOpacity>
  );

  // 渲染历史卡片
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <GuochaoCard variant="elevated" style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.historyHeaderLeft}>
          <View style={[styles.typeTag, getTypeTagColor(item.baziType)]}>
            <Text style={styles.typeTagText}>{getTypeLabel(item.baziType)}</Text>
          </View>
          <Text style={styles.historyDate}>{item.solarDate}</Text>
          <Text style={styles.historyLunar}>{item.lunarDate}</Text>
        </View>
        <View style={styles.historyHeaderRight}>
          <Text style={styles.historyTime}>{item.timePeriod}</Text>
          {item.isFavorite && <Text style={styles.favoriteStar}>★</Text>}
        </View>
      </View>

      {item.yearGanzhi && (
        <View style={styles.ganZhiRow}>
          <Text style={styles.ganZhiText}>
            {item.yearGanzhi} {item.monthGanzhi} {item.dayGanzhi} {item.hourGanzhi}
          </Text>
        </View>
      )}

      {item.location && (
        <Text style={styles.locationText}>地点：{item.location}</Text>
      )}

      {item.aiInterpretation && (
        <Text style={styles.aiPreview} numberOfLines={2}>
          AI：{item.aiInterpretation.substring(0, 80)}...
        </Text>
      )}

      <View style={styles.historyActions}>
        <GuochaoButton
          title="查看"
          size="small"
          variant="primary"
          onPress={() => handleViewItem(item)}
        />
        <GuochaoButton
          title={item.isFavorite ? '已收藏' : '收藏'}
          size="small"
          variant="secondary"
          onPress={() => handleToggleFavorite(item.id!, item.isFavorite)}
        />
        <GuochaoButton
          title="分享"
          size="small"
          variant="outline"
          onPress={() => handleShare(item)}
        />
        <GuochaoButton
          title="删除"
          size="small"
          variant="danger"
          onPress={() => handleDelete(item.id!)}
        />
      </View>
    </GuochaoCard>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: 20 }]}>
          <GuochaoButton title="← 返回" size="small" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>历史记录</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <ActivityIndicator size="large" color={colors.cinnabarRed} style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 20 }]}>
        <GuochaoButton title="← 返回" size="small" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>历史记录</Text>
        <GuochaoButton title="统计" size="small" variant="outline" onPress={() => {
          Alert.alert('统计数据', `总记录：${stats.total}\n六爻：${stats.byType['liuyao'] || 0}\n八字：${stats.byType['bazi'] || 0}\n奇门：${stats.byType['qimen'] || 0}\n收藏：${stats.favoriteCount || 0}`);
        }} />
      </View>

      {/* 分类标签 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {tabs.map(renderTab)}
      </ScrollView>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无历史记录</Text>
          <Text style={styles.emptySubtext}>开始排盘后，记录会显示在这里</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id!.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

// 根据类型获取标签颜色
const getTypeTagColor = (type: string) => {
  switch (type) {
    case 'liuyao':
      return { backgroundColor: '#ffe0b2' }; // 橙色
    case 'bazi':
      return { backgroundColor: '#c8e6c9' }; // 绿色
    case 'qimen':
      return { backgroundColor: '#bbdefb' }; // 蓝色
    default:
      return { backgroundColor: '#e0e0e0' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold + '40',
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.inkBlack,
  },
  headerPlaceholder: {
    width: 60,
  },
  tabsContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.riceWhite,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
    minWidth: 60,
  },
  tabActive: {
    backgroundColor: colors.cinnabarRed,
    borderColor: colors.cinnabarRed,
  },
  tabText: {
    fontSize: 14,
    color: colors.inkBlack,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.white,
  },
  tabCount: {
    fontSize: 12,
    color: colors.inkBlack + '60',
    marginTop: 2,
  },
  tabCountActive: {
    color: colors.white + '80',
  },
  listContainer: {
    padding: 16,
  },
  historyCard: {
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyHeaderRight: {
    alignItems: 'flex-end',
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkBlack,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.inkBlack,
  },
  historyLunar: {
    fontSize: 12,
    color: colors.inkBlack + '80',
  },
  historyTime: {
    fontSize: 14,
    color: colors.cinnabarRed,
    fontWeight: '600',
  },
  favoriteStar: {
    fontSize: 18,
    color: colors.gold,
    marginTop: 2,
  },
  ganZhiRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ganZhiText: {
    fontSize: 14,
    color: colors.inkBlack,
    fontFamily: fonts.kaiTi,
  },
  locationText: {
    fontSize: 12,
    color: colors.inkBlack + '60',
    marginBottom: 8,
  },
  aiPreview: {
    fontSize: 13,
    color: colors.inkBlack + '80',
    lineHeight: 18,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  historyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: colors.inkBlack,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.inkBlack + '60',
  },
});

export default HistoryScreen;
