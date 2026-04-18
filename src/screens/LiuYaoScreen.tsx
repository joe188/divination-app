/**
 * LiuYaoScreen - 六爻占卜（国潮美化版）
 * 功能：摇卦、设置爻的阴阳、动爻标记、卦象计算
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import theme from '../styles/theme';
import { calculateHexagramNumber, getHexagramByNumber, GUA64_NAME } from '../utils/meihua-yi';

const { colors, fonts, spacing, radii } = theme;

// 爻位名称（从下往上）
const YAO_POSITIONS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

export const LiuYaoScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [yaoList, setYaoList] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [movingLines, setMovingLines] = useState<number[]>([]);
  const [shakeAnim] = useState(new Animated.Value(0));

  /**
   * 切换爻的阴阳
   */
  const toggleYao = (index: number) => {
    const newYaoList = [...yaoList];
    newYaoList[index] = newYaoList[index] === 0 ? 1 : 0;
    setYaoList(newYaoList);
  };

  /**
   * 切换动爻
   */
  const toggleMovingLine = (index: number) => {
    if (movingLines.includes(index)) {
      setMovingLines(movingLines.filter(i => i !== index));
    } else {
      setMovingLines([...movingLines, index]);
    }
  };

  /**
   * 摇卦动画
   */
  const handleShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();

    // 随机生成卦象
    const newYaoList = Array(6).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
    setYaoList(newYaoList);
    
    // 随机动爻
    const newMovingLines = [];
    for (let i = 0; i < 6; i++) {
      if (Math.random() > 0.7) {
        newMovingLines.push(i);
      }
    }
    setMovingLines(newMovingLines);
  };

  /**
   * 清除重置
   */
  const handleClear = () => {
    setYaoList([0, 0, 0, 0, 0, 0]);
    setMovingLines([]);
  };

  /**
   * 查看结果
   */
  const handleViewResult = () => {
    const hexagramNum = calculateHexagramNumber(yaoList);
    const guaName = GUA64_NAME[hexagramNum] || '未知卦';
    
    navigation.navigate('LiuYaoResult', {
      hexagram: yaoList.join(''),
      guaName,
      lines: yaoList,
      movingLines,
    });
  };

  return (
    <View style={styles.container}>
      {/* 顶部装饰 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>六爻占卜</Text>
        <Text style={styles.headerSubtitle}>摇卦问事 · 洞察天机</Text>
        <View style={styles.baguaDecor}>
          <Text style={styles.baguaSymbol}>☰</Text>
          <Text style={styles.baguaSymbol}>☷</Text>
          <Text style={styles.baguaSymbol}>☵</Text>
          <Text style={styles.baguaSymbol}>☲</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 卦象显示区 */}
        <Animated.View style={[styles.guaDisplay, { transform: [{ translateY: shakeAnim }] }]}>
          <Text style={styles.guaTitle}>卦象</Text>
          <View style={styles.guaLines}>
            {yaoList.map((yao, index) => (
              <View key={index} style={styles.guaLineRow}>
                <Text style={styles.yaoPosition}>{YAO_POSITIONS[5 - index]}</Text>
                <TouchableOpacity
                  style={styles.yaoButton}
                  onPress={() => toggleYao(5 - index)}
                  activeOpacity={0.7}
                >
                  {yao === 1 ? (
                    <View style={styles.yangLine} />
                  ) : (
                    <View style={styles.yinLine}>
                      <View style={styles.yinSegment} />
                      <View style={styles.yinSegment} />
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.movingDot,
                    movingLines.includes(5 - index) && styles.movingDotActive,
                  ]}
                  onPress={() => toggleMovingLine(5 - index)}
                >
                  <Text style={styles.movingDotText}>动</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* 操作按钮 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.shakeButton} onPress={handleShake}>
            <Text style={styles.shakeButtonText}>🪙 摇卦</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>🔄 重置</Text>
          </TouchableOpacity>
        </View>

        {/* 查看结果按钮 */}
        <TouchableOpacity
          style={[
            styles.resultButton,
            yaoList.every(y => y === 0) && styles.resultButtonDisabled,
          ]}
          onPress={handleViewResult}
          disabled={yaoList.every(y => y === 0)}
        >
          <Text style={styles.resultButtonText}>📜 查看卦象</Text>
        </TouchableOpacity>

        {/* 使用说明 */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>💡 使用说明</Text>
          <Text style={styles.helpText}>
            1. 点击爻位切换阴阳（实线为阳，虚线为阴）{'\n'}
            2. 点击"动"标记动爻{'\n'}
            3. 点击"摇卦"随机生成卦象{'\n'}
            4. 点击"查看卦象"查看详细解读
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
  header: {
    backgroundColor: colors.cinnabarRed,
    padding: spacing['2xl'],
    alignItems: 'center',
    borderBottomLeftRadius: radii['3xl'],
    borderBottomRightRadius: radii['3xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: fonts.sizes['3xl'],
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  baguaDecor: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  baguaSymbol: {
    fontSize: 28,
    color: colors.gold,
    marginHorizontal: spacing.md,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  guaDisplay: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.xl,
    marginBottom: spacing['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  guaTitle: {
    fontSize: fonts.sizes.xl,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  guaLines: {
    alignItems: 'center',
  },
  guaLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  yaoPosition: {
    width: 50,
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
  },
  yaoButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  yangLine: {
    width: 200,
    height: 14,
    backgroundColor: colors.inkBlack,
    borderRadius: radii.md,
  },
  yinLine: {
    width: 200,
    height: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yinSegment: {
    width: 90,
    height: 14,
    backgroundColor: colors.inkBlack,
    borderRadius: radii.md,
  },
  movingDot: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  movingDotActive: {
    backgroundColor: colors.cinnabarRed,
  },
  movingDotText: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  shakeButton: {
    flex: 1,
    backgroundColor: colors.cinnabarRed,
    padding: spacing.xl,
    borderRadius: radii.xl,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shakeButtonText: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  clearButton: {
    flex: 1,
    backgroundColor: colors.gray[300],
    padding: spacing.xl,
    borderRadius: radii.xl,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  clearButtonText: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
  },
  resultButton: {
    backgroundColor: colors.gold,
    padding: spacing.xl,
    borderRadius: radii.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  resultButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  resultButtonText: {
    fontSize: fonts.sizes.xl,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
  },
  helpCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
  },
  helpTitle: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.md,
  },
  helpText: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[700],
    lineHeight: 22,
  },
});

export default LiuYaoScreen;
