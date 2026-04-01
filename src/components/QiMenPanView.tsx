/**
 * 奇门遁甲盘面可视化
 * 九宫格布局：显示八门、九星、值符、值使
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../styles/theme';
const { colors, fonts, spacing, radii } = theme;

interface QiMenPanViewProps {
  result: {
    baMen: string[];   // 八门数组 0-8 (对应九宫)
    jiuXing: string[]; // 九星数组 0-8
    zhiFu: string;     // 值符（星）
    zhiShi: string;    // 值使（门）
    dayGanZhi: string;
    hourGanZhi: string;
    solarTerm: string;
  };
}

/**
 * 九宫序号映射
 * 1 2 3
 * 4 5 6
 * 7 8 9
 * 数组索引: 0->1, 1->2, 2->3, 3->4, 4->5, 5->6, 6->7, 7->8, 8->9
 */
const palaceOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const QiMenPanView: React.FC<QiMenPanViewProps> = ({ result }) => {
  const { baMen, jiuXing, zhiFu, zhiShi, dayGanZhi, hourGanZhi, solarTerm } = result;

  // 渲染一个宫位
  const renderPalace = (index: number) => {
    const palaceNum = palaceOrder[index];
    const men = baMen[index] || '';
    const xing = jiuXing[index] || '';
    const isZhiFu = xing === zhiFu;
    const isZhiShi = men === zhiShi;

    return (
      <View key={palaceNum} style={[styles.palace, isZhiFu && styles.palaceZhiFu, isZhiShi && styles.palaceZhiShi]}>
        <Text style={styles.palaceNum}>{palaceNum}</Text>
        <Text style={[styles.xing, isZhiFu && styles.highlight]}>{xing}</Text>
        <Text style={[styles.men, isZhiShi && styles.highlight]}>{men}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>奇门盘</Text>
        <Text style={styles.subtitle}>{solarTerm} · {hourGanZhi}</Text>
      </View>

      <View style={styles.board}>
        {/* 第一行 */}
        <View style={styles.row}>
          {renderPalace(0)}
          {renderPalace(1)}
          {renderPalace(2)}
        </View>
        {/* 第二行 */}
        <View style={styles.row}>
          {renderPalace(3)}
          {renderPalace(4)}
          {renderPalace(5)}
        </View>
        {/* 第三行 */}
        <View style={styles.row}>
          {renderPalace(6)}
          {renderPalace(7)}
          {renderPalace(8)}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.cinnabarRed }]} />
          <Text style={styles.legendText}>值符</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.gold }]} />
          <Text style={styles.legendText}>值使</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>日干支: {dayGanZhi}</Text>
      </View>
    </View>
  );
};

const PALACE_SIZE = 90;
const GAP = 6;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.riceWhite,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.inkBlack,
    marginBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes['2xl'],
    color: colors.inkBlack,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  board: {
    alignSelf: 'center',
    backgroundColor: colors.inkBlack,
    padding: 4,
    borderRadius: radii.md,
  },
  row: {
    flexDirection: 'row',
  },
  palace: {
    width: PALACE_SIZE,
    height: PALACE_SIZE,
    backgroundColor: colors.white,
    margin: GAP / 2,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  palaceZhiFu: {
    backgroundColor: colors.riceWhite,
    borderWidth: 2,
    borderColor: colors.cinnabarRed,
  },
  palaceZhiShi: {
    backgroundColor: colors.riceWhite,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  palaceNum: {
    position: 'absolute',
    top: 4,
    left: 6,
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.sm,
    color: colors.gray[400],
  },
  xing: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.lg,
    color: colors.gray[700],
  },
  men: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.lg,
    color: colors.gray[700],
    marginTop: 4,
  },
  highlight: {
    color: colors.cinnabarRed,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[600],
  },
  info: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  infoText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[600],
  },
});

export default QiMenPanView;