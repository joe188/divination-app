/**
 * HistoryDetailScreen - 历史记录详情页
 * 展示单条排盘记录的完整信息
 */
import React, { useState } from 'react';
import { BOSHI_ZHENGZONG } from '../references/boshi_zhengzong_text';
import { 
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal } from 'react-native';
import { GuochaoCard } from '../components/GuochaoCard';
import { GuochaoButton } from '../components/GuochaoButton';
import theme from '../styles/theme';
const { colors, fonts, spacing, radii } = theme;

interface HistoryDetailScreenProps {
  route: {
    params: {
      item: {
        id: string;
        date: string;
        time: string;
        title: string;
        type: 'bazi' | 'liuyao' | 'qimen';
        data?: any;
      };
    };
  };
  onBack?: () => void;
  onDelete?: (id: string) => void;
}

export const HistoryDetailScreen: React.FC<HistoryDetailScreenProps> = ({route, onBack, onDelete,}) => {
  const [showRef, setShowRef] = useState(false);
  const { item } = route.params;

  const handleDelete = () => {
    Alert.alert('删除记录', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => onDelete?.(item.id),
      },
    ]);
  };

  const renderBaziDetail = (data: any) => (
    <GuochaoCard title="四柱八字" variant="pattern">
      <View style={styles.detailRow}>
        <Text style={styles.label}>年柱</Text>
        <Text style={styles.value}>{data?.year || '--'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>月柱</Text>
        <Text style={styles.value}>{data?.month || '--'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>日柱</Text>
        <Text style={styles.value}>{data?.day || '--'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>时柱</Text>
        <Text style={styles.value}>{data?.hour || '--'}</Text>
      </View>
      {data?.wuxing && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>五行</Text>
          <Text style={styles.value}>{data.wuxing}</Text>
        </View>
      )}
    </GuochaoCard>
  );

  const renderLiuYaoDetail = (data: any) => (
    <GuochaoCard title="六爻卦象" variant="pattern">
      <View style={styles.detailRow}>
        <Text style={styles.label}>本卦</Text>
        <Text style={styles.value}>{data?.guaName || '--'}</Text>
      </View>
      {data?.bianguaName && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>变卦</Text>
          <Text style={styles.value}>{data.bianguaName}</Text>
        </View>
      )}
      {data?.yaoTexts && data.yaoTexts.length > 0 && (
        <View style={styles.yaoList}>
          {data.yaoTexts.map((text: string, idx: number) => (
            <Text key={idx} style={styles.yaoText}>{text}</Text>
          ))}
        </View>
      )}
      {data?.summary && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>综合解读</Text>
          <Text style={styles.summaryText}>{data.summary}</Text>
        </View>
      )}
    </GuochaoCard>
  );

  const renderQiMenDetail = (data: any) => (
    <GuochaoCard title="奇门遁甲" variant="pattern">
      <View style={styles.detailRow}>
        <Text style={styles.label}>节气</Text>
        <Text style={styles.value}>{data?.jieQi || '--'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>时辰</Text>
        <Text style={styles.value}>{data?.diZhi || '--'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>值符</Text>
        <Text style={styles.value}>{data?.fuShen || '--'}</Text>
      </View>
      {data?.tianPan && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>天盘</Text>
          <Text style={styles.value}>{data.tianPan.join(' ')}</Text>
        </View>
      )}
      {data?.diPan && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>地盘</Text>
          <Text style={styles.value}>{data.diPan.join(' ')}</Text>
        </View>
      )}
    </GuochaoCard>
  );

  const renderDetail = () => {
    switch (item.type) {
      case 'bazi':
        return renderBaziDetail(item.data);
      case 'liuyao':
        return renderLiuYaoDetail(item.data);
      case 'qimen':
        return renderQiMenDetail(item.data);
      default:
        return <Text style={styles.unknown}>未知类型</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 头部 */}
        <View style={[styles.header, { paddingTop: spacing.xl }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>记录详情</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* 基本信息 */}
        <GuochaoCard title="基本信息" variant="elevated">
          <View style={styles.detailRow}>
            <Text style={styles.label}>求测事项</Text>
            <Text style={styles.value}>{item.title}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>日期</Text>
            <Text style={styles.value}>{item.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>时间</Text>
            <Text style={styles.value}>{item.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>类型</Text>
            <Text style={styles.value}>
              {item.type === 'bazi' ? '八字排盘' : item.type === 'liuyao' ? '六爻占卜' : '奇门遁甲'}
            </Text>
          </View>
        </GuochaoCard>

        {/* 详细数据 */}
        {renderDetail()}

        {/* 典籍学习入口（六爻专用） */}
        {(item.type === 'liuyao' || item.type === 'bazi' || item.type === 'qimen') && (
          <View style={styles.refSection}>
            <GuochaoCard variant="pattern">
              <View style={styles.refContent}>
                <Text style={styles.refIcon}>📚</Text>
                <View style={styles.refText}>
                  <Text style={styles.refTitle}>《卜筮正宗》学习材料</Text>
                  <Text style={styles.refDesc}>阅读清代王洪绪经典六爻典籍</Text>
                </View>
              </View>
              <GuochaoButton title="查看原文" onPress={() => setShowRef(true)} />
            </GuochaoCard>
          </View>
        )}

        {showRef && (
          <Modal
            visible={showRef}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowRef(false)}
          >
            <View style={{ flex: 1, backgroundColor: colors.riceWhite }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray[200] }}>
                <TouchableOpacity onPress={() => setShowRef(false)}>
                  <Text style={{ fontSize: fonts.sizes.xl, color: colors.gray[600], width: 30, textAlign: 'center' }}>✕</Text>
                </TouchableOpacity>
                <Text style={{ fontFamily: fonts.kaiTi, fontSize: fonts.sizes.xl, color: colors.inkBlack }}>《卜筮正宗》原文</Text>
                <View style={{ width: 30 }} />
              </View>
              <ScrollView style={{ flex: 1, padding: spacing.lg }}>
                <Text style={{ fontFamily: fonts.sourceHan, fontSize: fonts.sizes.md, lineHeight: 24, color: colors.inkBlack }}>{BOSHI_ZHENGZONG}</Text>
              </ScrollView>
            </View>
          </Modal>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* 删除按钮 */}
      <View style={styles.footer}>
        <GuochaoButton
          title="🗑️ 删除记录"
          variant="outline"
          size="large"
          onPress={handleDelete}
          style={styles.deleteButton}
        />
      </View>
    </View>
  );
};

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
  headerPlaceholder: {
    width: 40,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  label: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[600],
  },
  value: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.md,
    color: colors.inkBlack,
    fontWeight: '600',
  },
  yaoList: {
    marginTop: spacing.md,
  },
  yaoText: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.sm,
    color: colors.gray[700],
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  summary: {
    marginTop: spacing.lg,
  },
  summaryTitle: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.inkBlack,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[600],
    lineHeight: 22,
  },
  unknown: {
    textAlign: 'center',
    color: colors.gray[500],
    marginTop: spacing.xl,
  },
  spacer: {
    height: spacing['6xl'],
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  deleteButton: {
    borderColor: colors.cinnabarRed,
  },
  // 典籍学习样式
  refSection: {
    marginBottom: spacing.lg,
  },
  refContent: {
    flexDirection: 'row',
  },
  refIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  refText: {
    flex: 1,
  },
  refTitle: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.lg,
    color: colors.inkBlack,
    marginBottom: spacing.xs,
  },
  refDesc: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[600],
  },
});

export default HistoryDetailScreen;