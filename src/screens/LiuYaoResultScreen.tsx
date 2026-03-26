/**
 * 六爻排盘结果页
 * 展示卦象、解析、建议
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
} from 'react-native';
import { colors, fonts, spacing, radii } from '../styles/theme';
import { GuochaoCard } from '../components/GuochaoCard';
import { GuochaoButton } from '../components/GuochaoButton';
import { LiuYaoResult } from '../types';

interface LiuYaoResultScreenProps {
  result?: LiuYaoResult;
  onBack?: () => void;
  onRebook?: () => void;
}

export const LiuYaoResultScreen: React.FC<LiuYaoResultScreenProps> = ({
  result,
  onBack,
  onRebook,
}) => {
  // 模拟数据（实际从引擎获取）
  const mockResult: LiuYaoResult = result || {
    benGua: {
      index: 1,
      name: '乾',
      pinYin: 'qián',
      guaXiang: '䷀',
      ci: '元亨利贞',
      xiang: '天行健，君子以自强不息',
      tuan: '大哉乾元，万物资始，乃统天',
      upperGua: '乾',
      lowerGua: '乾',
    },
    bianGua: undefined,
    huGua: undefined,
    yaoLines: [
      { position: 0, yaoType: 7, isDong: false, yaoCi: '潜龙勿用' },
      { position: 1, yaoType: 7, isDong: false, yaoCi: '见龙在田' },
      { position: 2, yaoType: 7, isDong: false, yaoCi: '终日乾乾' },
      { position: 3, yaoType: 7, isDong: false, yaoCi: '或跃在渊' },
      { position: 4, yaoType: 9, isDong: true, yaoCi: '飞龙在天' },
      { position: 5, yaoType: 7, isDong: false, yaoCi: '亢龙有悔' },
    ],
    dongYao: [4],
    interpretation: {
      overall: '乾卦象征天，刚健中正，大吉大利。',
      advice: '宜积极进取，但需注意时机。',
    },
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `灵虾排盘 - ${mockResult.benGua.name}卦：${mockResult.interpretation.overall}`,
      });
    } catch (error) {
      console.error('分享失败', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>排盘结果</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareText}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 本卦展示 */}
        <GuochaoCard style={styles.guaCard}>
          <View style={styles.guaHeader}>
            <Text style={styles.guaSymbol}>{mockResult.benGua.guaXiang}</Text>
            <View style={styles.guaInfo}>
              <Text style={styles.guaName}>{mockResult.benGua.name}卦</Text>
              <Text style={styles.guaPinYin}>{mockResult.benGua.pinYin}</Text>
              <Text style={styles.guaCi}>{mockResult.benGua.ci}</Text>
            </View>
          </View>

          {/* 六爻展示 */}
          <View style={styles.yaoLinesContainer}>
            {mockResult.yaoLines
              .slice()
              .reverse()
              .map((line, index) => (
                <View key={index} style={styles.yaoLineRow}>
                  <Text style={styles.yaoLinePosition}>
                    {['上', '五', '四', '三', '二', '初'][index]}
                  </Text>
                  <Text style={styles.yaoLineSymbol}>
                    {line.yaoType === 7 || line.yaoType === 9 ? '⚊' : '⚋'}
                  </Text>
                  <Text style={styles.yaoLineCi}>
                    {line.yaoCi}
                    {line.isDong && ' ⭐'}
                  </Text>
                </View>
              ))}
          </View>

          {/* 变卦提示 */}
          {mockResult.bianGua && (
            <View style={styles.bianGuaSection}>
              <Text style={styles.bianGuaLabel}>变卦</Text>
              <Text style={styles.bianGuaName}>{mockResult.bianGua.name}卦</Text>
            </View>
          )}
        </GuochaoCard>

        {/* 卦辞解析 */}
        <GuochaoCard style={styles.interpretCard}>
          <Text style={styles.cardTitle}>💡 卦象解析</Text>
          <Text style={styles.guaXiangText}>{mockResult.benGua.xiang}</Text>
          <Text style={styles.guaTuanText}>{mockResult.benGua.tuan}</Text>
        </GuochaoCard>

        {/* 动爻提示 */}
        {mockResult.dongYao.length > 0 && (
          <GuochaoCard style={styles.dongYaoCard}>
            <Text style={styles.cardTitle}>⭐ 动爻提示</Text>
            <Text style={styles.dongYaoText}>
              此卦有 {mockResult.dongYao.length} 个动爻，事有变化之象。
            </Text>
            {mockResult.dongYao.map((yaoIndex) => (
              <Text key={yaoIndex} style={styles.dongYaoItem}>
                {mockResult.yaoLines[yaoIndex].yaoCi}
              </Text>
            ))}
          </GuochaoCard>
        )}

        {/* 总体解析 */}
        <GuochaoCard style={styles.adviceCard}>
          <Text style={styles.cardTitle}>📜 综合解析</Text>
          <Text style={styles.adviceText}>{mockResult.interpretation.overall}</Text>
        </GuochaoCard>

        {/* 建议 */}
        <GuochaoCard style={styles.adviceCard}>
          <Text style={styles.cardTitle}>💭 行动建议</Text>
          <Text style={styles.adviceText}>{mockResult.interpretation.advice}</Text>
        </GuochaoCard>

        {/* 操作按钮 */}
        <View style={styles.actionButtons}>
          <GuochaoButton
            title="再测一卦"
            onPress={onRebook}
            style={styles.actionButton}
          />
        </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  backText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.gray[700],
  },
  title: {
    fontSize: fonts.sizes.xl,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: 'bold',
  },
  shareButton: {
    padding: spacing.sm,
  },
  shareText: {
    fontSize: fonts.sizes.lg,
  },
  scrollView: {
    flex: 1,
  },
  guaCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  guaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  guaSymbol: {
    fontSize: 64,
    marginRight: spacing.md,
  },
  guaInfo: {
    flex: 1,
  },
  guaName: {
    fontSize: fonts.sizes['2xl'],
    fontFamily: fonts.kaiTi,
    color: colors.cinnabarRed,
    fontWeight: 'bold',
  },
  guaPinYin: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.songTi,
    color: colors.gray[600],
  },
  guaCi: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.inkBlack,
    marginTop: spacing.xs,
  },
  yaoLinesContainer: {
    marginTop: spacing.md,
  },
  yaoLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  yaoLinePosition: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.gray[700],
    width: 40,
  },
  yaoLineSymbol: {
    fontSize: fonts.sizes['2xl'],
    color: colors.cinnabarRed,
    marginRight: spacing.md,
  },
  yaoLineCi: {
    flex: 1,
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.inkBlack,
  },
  bianGuaSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    flexDirection: 'row',
    alignItems: 'center',
  },
  bianGuaLabel: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.gray[600],
    marginRight: spacing.sm,
  },
  bianGuaName: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
  },
  interpretCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  guaXiangText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.inkBlack,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  guaTuanText: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.songTi,
    color: colors.gray[700],
    fontStyle: 'italic',
  },
  dongYaoCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: 'rgba(212, 167, 106, 0.1)',
    borderColor: colors.gold,
  },
  dongYaoText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.inkBlack,
    marginBottom: spacing.sm,
  },
  dongYaoItem: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.cinnabarRed,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  adviceCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  adviceText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.inkBlack,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  actionButton: {
    flex: 1,
    maxWidth: 200,
  },
  spacer: {
    height: spacing['4xl'],
  },
});

export default LiuYaoResultScreen;
