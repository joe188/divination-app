/**
 * LiuYaoScreen - 六爻占卜（传统摇卦法）
 * 功能：三枚铜钱摇卦、自动记录、变爻显示
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import theme from '../styles/theme';
import { calculateHexagramNumber, GUA64_NAME, getHexagramMeaning } from '../utils/liuyao-data';
import { responsiveFontSize, responsiveWidth, responsiveHeight, responsiveBorderRadius } from '../styles/responsive';

const { colors, fonts, spacing, radii } = theme;
const { width, height } = Dimensions.get('window');

// 爻位名称（从下往上）
const YAO_POSITIONS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

// 单次摇卦结果类型
interface CoinResult {
  heads: number; // 正面数量（1-3）
  value: number; // 爻值：6(老阴), 7(少阳), 8(少阴), 9(老阳)
  isMoving: boolean; // 是否动爻
  isYang: boolean; // 是否阳爻
}

export const LiuYaoScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [coinResults, setCoinResults] = useState<CoinResult[]>([]);
  const [isShaking, setIsShaking] = useState(false);

  /**
   * 摇卦 - 三枚铜钱
   * 传统规则：
   * - 3 个正面（字）= 老阴（6）⚋ 变爻
   * - 2 正 1 背 = 少阳（7）⚊ 不变
   * - 1 正 2 背 = 少阴（8）⚋ 不变
   * - 3 个背面（花）= 老阳（9）⚊ 变爻
   */
  const handleShake = () => {
    if (coinResults.length >= 6) {
      Alert.alert('提示', '六爻已摇完，请查看结果');
      return;
    }

    setIsShaking(true);
    
    // 模拟摇卦延迟
    setTimeout(() => {
      // 随机生成 3 枚铜钱的结果（0=背面，1=正面）
      const coins = [0, 1, 2].map(() => Math.random() > 0.5 ? 1 : 0);
      const headsCount = coins.filter(c => c === 1).length;
      
      let value: number;
      let isMoving: boolean;
      let isYang: boolean;
      
      // 根据传统规则计算
      if (headsCount === 3) {
        // 3 正 = 老阴（6）
        value = 6;
        isMoving = true;
        isYang = false;
      } else if (headsCount === 2) {
        // 2 正 1 背 = 少阳（7）
        value = 7;
        isMoving = false;
        isYang = true;
      } else if (headsCount === 1) {
        // 1 正 2 背 = 少阴（8）
        value = 8;
        isMoving = false;
        isYang = false;
      } else {
        // 0 正（3 背）= 老阳（9）
        value = 9;
        isMoving = true;
        isYang = true;
      }
      
      const result: CoinResult = { heads: headsCount, value, isMoving, isYang };
      const newResults = [...coinResults, result];
      setCoinResults(newResults);
      setIsShaking(false);
      
      // 摇完 6 次自动跳转到结果页
      if (newResults.length === 6) {
        setTimeout(() => {
          handleViewResult(newResults);
        }, 500);
      }
    }, 300);
  };

  /**
   * 清除重置
   */
  const handleClear = () => {
    setCoinResults([]);
    setIsShaking(false);
  };

  /**
   * 撤销上一次
   */
  const handleUndo = () => {
    if (coinResults.length > 0) {
      setCoinResults(coinResults.slice(0, -1));
    }
  };

  /**
   * 查看结果
   */
  const handleViewResult = (results: CoinResult[] = coinResults) => {
    if (results.length < 6) {
      Alert.alert('提示', '请摇满 6 次');
      return;
    }

    // 从下往上构建爻（第一次摇的是初爻）
    const lines = results.map(r => r.isYang ? 1 : 0);
    const movingLineIndices = results.map((r, i) => r.isMoving ? i : -1).filter(i => i !== -1);
    
    // 计算卦名
    const result_lower = calculateHexagramNumber(results.map(r => ({ isYang: r.isYang })));
    const hexagramNum = result_lower.hexagram;
    const guaName = GUA64_NAME[hexagramNum] || '未知卦';
    
    // 获取变卦（如果有动爻）
    let transformedGuaName = '';
    if (movingLineIndices.length > 0) {
      const transformedLines = lines.map((line, i) => 
        movingLineIndices.includes(i) ? (line === 1 ? 0 : 1) : line
      );
      const transformedResult = calculateHexagramNumber(transformedLines.map(l => ({ isYang: l === 1 })));
      transformedGuaName = GUA64_NAME[transformedResult.hexagram] || '';
    }
    
    // 生成本地解析
    const localAnalysis = generateLocalAnalysis(results, guaName, transformedGuaName);
    
    navigation.navigate('LiuYaoResult', {
      result: {
        lines: lines.join(''),
        guaName,
        movingLines: movingLineIndices,
        coinResults: results.map(r => r.value), // [6,7,8,9,7,8]
        transformedGuaName,
        localAnalysis,
      },
    } as any);
  };

  /**
   * 生成本地解析（简化版，详细解析在结果页）
   */
  const generateLocalAnalysis = (results: CoinResult[], guaName: string, transformedGuaName: string): string => {
    const movingCount = results.filter(r => r.isMoving).length;
    
    let analysis = `【本卦】${guaName}\n`;
    
    if (movingCount > 0) {
      analysis += `【变卦】${transformedGuaName}\n`;
      analysis += `【动爻】${movingCount}个\n`;
      
      // 列出动爻位置
      const movingPositions = results
        .map((r, i) => r.isMoving ? YAO_POSITIONS[i] : null)
        .filter(p => p !== null)
        .join('、');
      analysis += `【位置】${movingPositions}\n`;
    }
    
    // 卦象含义
    const meaning = getHexagramMeaning(guaName);
    if (meaning) {
      analysis += `【卦义】${meaning.summary}\n`;
    }
    
    return analysis;
  };

  /**
   * 渲染单个爻
   */
  const renderYao = (index: number, result?: CoinResult) => {
    if (!result) {
      return (
        <View key={index} style={[styles.yaoCell, styles.yaoEmpty]}>
          <Text style={styles.yaoPosition}>{YAO_POSITIONS[index]}</Text>
          <View style={styles.yaoPlaceholder} />
        </View>
      );
    }

    const isBottom = index === 0 || index === 2 || index === 4;
    
    return (
      <View key={index} style={[styles.yaoCell, result.isMoving && styles.yaoMoving]}>
        <Text style={styles.yaoPosition}>{YAO_POSITIONS[index]}</Text>
        <View style={styles.yaoContent}>
          {result.isYang ? (
            // 阳爻 ———
            <View style={[styles.yaoLine, styles.yangLine]} />
          ) : (
            // 阴爻 - -
            <View style={styles.yinLine}>
              <View style={styles.yinSegment} />
              <View style={styles.yinGap} />
              <View style={styles.yinSegment} />
            </View>
          )}
          {result.isMoving && (
            <View style={styles.movingIndicator}>
              <Text style={styles.movingText}>●</Text>
            </View>
          )}
        </View>
        <Text style={styles.yaoValue}>{result.value}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 标题 */}
      <View style={styles.header}>
        <Text style={styles.title}>六爻占卜</Text>
        <Text style={styles.subtitle}>心诚则灵 · 三枚铜钱</Text>
      </View>

      {/* 卦象显示区（三行两列） */}
      <View style={styles.guaContainer}>
        <Text style={styles.guaLabel}>卦象</Text>
        <View style={styles.guaGrid}>
          {/* 上爻 & 五爻 */}
          <View style={styles.guaRow}>
            {renderYao(5, coinResults[5])}
            {renderYao(4, coinResults[4])}
          </View>
          {/* 四爻 & 三爻 */}
          <View style={styles.guaRow}>
            {renderYao(3, coinResults[3])}
            {renderYao(2, coinResults[2])}
          </View>
          {/* 二爻 & 初爻 */}
          <View style={styles.guaRow}>
            {renderYao(1, coinResults[1])}
            {renderYao(0, coinResults[0])}
          </View>
        </View>
      </View>

      {/* 摇卦进度 */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          已摇 {coinResults.length} / 6 次
        </Text>
        <View style={styles.progressDots}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i < coinResults.length && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.shakeButton, isShaking && styles.shaking]}
          onPress={handleShake}
          disabled={coinResults.length >= 6 || isShaking}
        >
          <Text style={styles.buttonText}>
            {isShaking ? '摇卦中...' : coinResults.length >= 6 ? '已完成' : '摇卦'}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.undoButton]}
            onPress={handleUndo}
            disabled={coinResults.length === 0}
          >
            <Text style={styles.actionButtonText}>撤销</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClear}
            disabled={coinResults.length === 0}
          >
            <Text style={styles.actionButtonText}>重置</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 摇卦说明 */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionTitle}>【摇卦规则】</Text>
        <Text style={styles.instructionText}>
          • 3 正（字）= 老阴 ⚋ 变爻{'\n'}
          • 2 正 1 背 = 少阳 ⚊{'\n'}
          • 1 正 2 背 = 少阴 ⚋{'\n'}
          • 0 正（3 背）= 老阳 ⚊ 变爻
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: responsiveFontSize(24), // 响应式字体
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    fontSize: responsiveFontSize(14), // 响应式字体
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  guaContainer: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  guaLabel: {
    fontSize: responsiveFontSize(16), // 响应式字体
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  guaGrid: {
    gap: spacing.md,
  },
  guaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yaoCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    marginHorizontal: spacing.xs,
  },
  yaoEmpty: {
    opacity: 0.5,
  },
  yaoMoving: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  yaoPosition: {
    fontSize: responsiveFontSize(14), // 响应式字体
    color: colors.textSecondary,
    width: responsiveWidth(8), // 响应式宽度
  },
  yaoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yaoLine: {
    width: responsiveWidth(12), // 响应式宽度
    height: responsiveHeight(1.5), // 响应式高度
    borderRadius: responsiveBorderRadius(3), // 响应式圆角
  },
  yangLine: {
    backgroundColor: colors.primary,
  },
  yinLine: {
    flexDirection: 'row',
    width: responsiveWidth(12), // 响应式宽度
    justifyContent: 'space-between',
  },
  yinSegment: {
    width: responsiveWidth(5), // 响应式宽度
    height: responsiveHeight(1.5), // 响应式高度
    backgroundColor: colors.primary,
    borderRadius: responsiveBorderRadius(3), // 响应式圆角
  },
  yinGap: {
    width: responsiveWidth(2), // 响应式宽度
  },
  movingIndicator: {
    marginLeft: spacing.sm,
  },
  movingText: {
    fontSize: responsiveFontSize(16), // 响应式字体
    color: colors.accent,
  },
  yaoValue: {
    fontSize: responsiveFontSize(12), // 响应式字体
    color: colors.textSecondary,
    width: responsiveWidth(4), // 响应式宽度
    textAlign: 'right',
  },
  yaoPlaceholder: {
    width: responsiveWidth(12), // 响应式宽度
    height: responsiveHeight(1.5), // 响应式高度
    backgroundColor: colors.border,
    borderRadius: 3,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  progressText: {
    fontSize: 16,
    color: colors.text,
  },
  progressDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  shakeButton: {
    backgroundColor: colors.primary,
  },
  shaking: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  undoButton: {
    borderColor: colors.secondary,
  },
  clearButton: {
    borderColor: colors.error,
  },
  actionButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  instructionContainer: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: 'auto',
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  instructionText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
