/**
 * 历史记录页面
 * 显示和管理排盘历史
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { GuochaoCard } from '../components/GuochaoCard';
import { GuochaoButton } from '../components/GuochaoButton';
import { colors } from '../styles/theme';
import type { HistoryItem } from '../utils/storage';
import { getHistory, deleteHistory, clearHistory } from '../utils/storage';

interface HistoryScreenProps {
  onBack: () => void;
  onViewItem: (item: HistoryItem) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack, onViewItem }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载历史记录
  const loadHistory = async () => {
    setLoading(true);
    const items = await getHistory();
    setHistory(items);
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // 删除单条记录
  const handleDelete = (id: string) => {
    Alert.alert('确认删除', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteHistory(id);
          loadHistory();
        },
      },
    ]);
  };

  // 清空所有记录
  const handleClearAll = () => {
    Alert.alert('确认清空', '确定要清空所有历史记录吗？此操作不可恢复。', [
      { text: '取消', style: 'cancel' },
      {
        text: '清空',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          loadHistory();
        },
      },
    ]);
  };

  // 渲染单条记录
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <GuochaoCard variant="elevated" style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View>
          <Text style={styles.historyDate}>{item.solarDate}</Text>
          <Text style={styles.historyLunar}>{item.lunarDate}</Text>
        </View>
        <Text style={styles.historyHour}>{item.hour}</Text>
      </View>
      
      <View style={styles.fiveElementsRow}>
        <Text style={styles.elementText}>木：{item.fiveElements.wood}%</Text>
        <Text style={styles.elementText}>火：{item.fiveElements.fire}%</Text>
        <Text style={styles.elementText}>土：{item.fiveElements.earth}%</Text>
        <Text style={styles.elementText}>金：{item.fiveElements.metal}%</Text>
        <Text style={styles.elementText}>水：{item.fiveElements.water}%</Text>
      </View>

      <View style={styles.historyActions}>
        <GuochaoButton
          title="查看"
          size="small"
          variant="primary"
          onPress={() => onViewItem(item)}
        />
        <GuochaoButton
          title="删除"
          size="small"
          variant="outline"
          onPress={() => handleDelete(item.id)}
        />
      </View>
    </GuochaoCard>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: 20 }]}>
          <GuochaoButton title="← 返回" size="small" onPress={onBack} />
          <Text style={styles.headerTitle}>历史记录</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 20 }]}>
        <GuochaoButton title="← 返回" size="small" onPress={onBack} />
        <Text style={styles.headerTitle}>历史记录</Text>
        <GuochaoButton
          title="清空"
          size="small"
          variant="outline"
          onPress={handleClearAll}
        />
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无历史记录</Text>
          <Text style={styles.emptySubtext}>开始排盘后，记录会显示在这里</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
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
    borderBottomColor: colors.golden + '40',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.inkBlack,
  },
  headerPlaceholder: {
    width: 60,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.inkBlack,
    fontSize: 16,
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
    color: colors.inkBlack + '80',
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
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.inkBlack,
  },
  historyLunar: {
    fontSize: 12,
    color: colors.inkBlack + '80',
    marginTop: 4,
  },
  historyHour: {
    fontSize: 14,
    color: colors.cinnabarRed,
    fontWeight: '600',
  },
  fiveElementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  elementText: {
    fontSize: 12,
    color: colors.inkBlack,
  },
  historyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
