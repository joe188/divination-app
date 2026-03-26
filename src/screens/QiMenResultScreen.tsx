/**
 * 奇门遁甲排盘结果页
 * 展示九宫格、八门、九星、八神、格局解析
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
import { QiMenPan } from '../types';

interface QiMenResultScreenProps {
  result?: QiMenPan;
  onBack?: () => void;
  onRebook?: () => void;
}

export const QiMenResultScreen: React.FC<QiMenResultScreenProps> = ({
  result,
  onBack,
  onRebook,
}) => {
  // 模拟数据
  const mockResult: QiMenPan =
    result ||
    ({
      yinYang: 'yang',
      juShu: 3,
      date: {
        year: 2026,
        month: 3,
        day: 26,
        hour: 11,
        yearGanZhi: '乙巳',
        monthGanZhi: '己卯',
        dayGanZhi: '壬午',
        hourGanZhi: '丙午',
        shiChen: '午时',
        jieQi: '春分',
        yuan: '上',
      },
      location: { latitude: 39.9, longitude: 116.4 },
      jiuGong: [
        { position: 1, baMen: '休门', jiuXing: '天蓬', baShen: '值符', tianPan: '戊', diPan: '戊', host: false },
        { position: 2, baMen: '死门', jiuXing: '天芮', baShen: '螣蛇', tianPan: '己', diPan: '己', host: false },
        { position: 3, baMen: '伤门', jiuXing: '天冲', baShen: '太阴', tianPan: '庚', diPan: '庚', host: false },
        { position: 4, baMen: '杜门', jiuXing: '天辅', baShen: '六合', tianPan: '辛', diPan: '辛', host: false },
        { position: 5, baMen: '中五', jiuXing: '天禽', baShen: '白虎', tianPan: '壬', diPan: '壬', host: true },
        { position: 6, baMen: '开门', jiuXing: '天心', baShen: '玄武', tianPan: '癸', diPan: '癸', host: false },
        { position: 7, baMen: '惊门', jiuXing: '天柱', baShen: '九地', tianPan: '丁', diPan: '丁', host: false },
        { position: 8, baMen: '生门', jiuXing: '天任', baShen: '九天', tianPan: '丙', diPan: '丙', host: false },
        { position: 9, baMen: '景门', jiuXing: '天英', baShen: '值符', tianPan: '乙', diPan: '乙', host: false },
      ],
      zhiFu: '天蓬',
      zhiShi: '休门',
      geJu: [{ name: '开门见喜', type: 'ji', description: '大吉之象', advice: '宜积极行动' }],
      interpretation: {
        overall: '阳遁三局，值符天蓬，值使休门。整体吉利，宜把握机会。',
        baMen: '八门主人事，休门最吉，开门次之。',
        jiuXing: '九星主天时，天蓬为值符，主大吉。',
        baShen: '八神主神助，值符最吉，九天次之。',
        advice: ['宜主动出击', '利东方和南方', '避开西北方'],
      },
    } as any);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `灵枢智能排盘 - ${mockResult.yinYang === 'yang' ? '阳遁' : '阴遁'}${mockResult.juShu}局：${mockResult.interpretation.overall}`,
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
        <Text style={styles.title}>奇门盘面</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareText}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 基础信息 */}
        <GuochaoCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>时间</Text>
            <Text style={styles.infoValue}>
              {mockResult.date.year}年{mockResult.date.month}月{mockResult.date.day}日 {mockResult.date.shiChen}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>干支</Text>
            <Text style={styles.infoValue}>
              {mockResult.date.yearGanZhi}年 {mockResult.date.monthGanZhi}月 {mockResult.date.dayGanZhi}日 {mockResult.date.hourGanZhi}时
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>局数</Text>
            <Text style={styles.infoValue}>
              {mockResult.yinYang === 'yang' ? '阳遁' : '阴遁'}{mockResult.juShu}局
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>值符</Text>
            <Text style={styles.infoValue}>{mockResult.zhiFu}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>值使</Text>
            <Text style={styles.infoValue}>{mockResult.zhiShi}</Text>
          </View>
        </GuochaoCard>

        {/* 九宫格 */}
        <GuochaoCard style={styles.gridCard}>
          <Text style={styles.cardTitle}>九宫排盘</Text>
          <View style={styles.gridContainer}>
            {/* 第一行：4 巽 9 离 2 坤 */}
            <View style={styles.gridRow}>
              {mockResult.jiuGong.slice(3, 6).reverse().map((gong, i) => (
                <View key={gong.position} style={[styles.gridCell, gong.host && styles.gridCellHost]}>
                  <Text style={styles.cellPosition}>{gong.position}宫</Text>
                  <Text style={styles.cellBaMen}>{gong.baMen}</Text>
                  <Text style={styles.cellJiuXing}>{gong.jiuXing}</Text>
                  <Text style={styles.cellBaShen}>{gong.baShen}</Text>
                  <Text style={styles.cellGan}>{gong.tianPan}/{gong.diPan}</Text>
                </View>
              ))}
            </View>
            {/* 第二行：3 震 5 中 7 兑 */}
            <View style={styles.gridRow}>
              {[mockResult.jiuGong[2], mockResult.jiuGong[4], mockResult.jiuGong[6]].map((gong) => (
                <View key={gong.position} style={[styles.gridCell, gong.host && styles.gridCellHost]}>
                  <Text style={styles.cellPosition}>{gong.position}宫</Text>
                  <Text style={styles.cellBaMen}>{gong.baMen}</Text>
                  <Text style={styles.cellJiuXing}>{gong.jiuXing}</Text>
                  <Text style={styles.cellBaShen}>{gong.baShen}</Text>
                  <Text style={styles.cellGan}>{gong.tianPan}/{gong.diPan}</Text>
                </View>
              ))}
            </View>
            {/* 第三行：8 艮 1 坎 6 乾 */}
            <View style={styles.gridRow}>
              {mockResult.jiuGong.slice(0, 3).reverse().map((gong, i) => (
                <View key={gong.position} style={[styles.gridCell, gong.host && styles.gridCellHost]}>
                  <Text style={styles.cellPosition}>{gong.position}宫</Text>
                  <Text style={styles.cellBaMen}>{gong.baMen}</Text>
                  <Text style={styles.cellJiuXing}>{gong.jiuXing}</Text>
                  <Text style={styles.cellBaShen}>{gong.baShen}</Text>
                  <Text style={styles.cellGan}>{gong.tianPan}/{gong.diPan}</Text>
                </View>
              ))}
            </View>
          </View>
        </GuochaoCard>

        {/* 格局分析 */}
        {mockResult.geJu.length > 0 && (
          <GuochaoCard style={styles.geJuCard}>
            <Text style={styles.cardTitle}>格局判断</Text>
            {mockResult.geJu.map((geJu, index) => (
              <View key={index} style={styles.geJuItem}>
                <Text style={styles.geJuName}>{geJu.name}</Text>
                <Text style={styles.geJuDesc}>{geJu.description}</Text>
                <Text style={styles.geJuAdvice}>{geJu.advice}</Text>
              </View>
            ))}
          </GuochaoCard>
        )}

        {/* 综合解析 */}
        <GuochaoCard style={styles.analysisCard}>
          <Text style={styles.cardTitle}>综合解析</Text>
          <Text style={styles.analysisText}>{mockResult.interpretation.overall}</Text>
        </GuochaoCard>

        {/* 建议 */}
        <GuochaoCard style={styles.adviceCard}>
          <Text style={styles.cardTitle}>行动建议</Text>
          {mockResult.interpretation.advice.map((item, index) => (
            <Text key={index} style={styles.adviceItem}>
              • {item}
            </Text>
          ))}
        </GuochaoCard>

        {/* 操作按钮 */}
        <View style={styles.actionButtons}>
          <GuochaoButton title="重新起局" onPress={onRebook} style={styles.actionButton} />
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
  infoCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.gray[600],
  },
  infoValue: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.inkBlack,
  },
  gridCard: {
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
  gridContainer: {
    marginTop: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  gridCell: {
    flex: 1,
    margin: 2,
    padding: spacing.sm,
    backgroundColor: 'rgba(212, 167, 106, 0.05)',
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  gridCellHost: {
    backgroundColor: 'rgba(212, 167, 106, 0.15)',
    borderWidth: 2,
    borderColor: colors.cinnabarRed,
  },
  cellPosition: {
    fontSize: fonts.sizes.xs,
    fontFamily: fonts.kaiTi,
    color: colors.gray[600],
  },
  cellBaMen: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.cinnabarRed,
    fontWeight: 'bold',
  },
  cellJiuXing: {
    fontSize: fonts.sizes.xs,
    fontFamily: fonts.songTi,
    color: colors.inkBlack,
  },
  cellBaShen: {
    fontSize: fonts.sizes.xs,
    fontFamily: fonts.songTi,
    color: colors.gray[700],
  },
  cellGan: {
    fontSize: fonts.sizes.xs,
    fontFamily: fonts.kaiTi,
    color: colors.gray[600],
  },
  geJuCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: 'rgba(196, 60, 60, 0.05)',
    borderColor: colors.cinnabarRed,
  },
  geJuItem: {
    marginBottom: spacing.md,
  },
  geJuName: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.cinnabarRed,
    fontWeight: 'bold',
  },
  geJuDesc: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.songTi,
    color: colors.inkBlack,
    marginTop: spacing.xs,
  },
  geJuAdvice: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.gray[700],
    marginTop: spacing.xs,
  },
  analysisCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  analysisText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.inkBlack,
    lineHeight: 24,
  },
  adviceCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  adviceItem: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.inkBlack,
    marginBottom: spacing.sm,
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

export default QiMenResultScreen;
