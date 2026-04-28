/**
 * LiuYaoResultScreen - 六爻排盘结果页
 * 功能：显示卦象、爻辞、本地/AI 解析、历史记录保存
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import theme from '../styles/theme';
import { responsiveFontSize, responsivePadding } from '../styles/responsive';
import { generateFullAnalysis, LiuYaoAnalysis } from '../utils/liuyao-interpret';
import { insertRecord } from '../database/queries/history';

const { colors, fonts, spacing, radii } = theme;

// 爻位名称
const YAO_POSITIONS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

interface LiuYaoResult {
  lines: string; // "101010"
  guaName: string;
  movingLines: number[];
  coinResults?: number[]; // [6,7,8,9,7,8]
  transformedGuaName?: string;
  localAnalysis?: string;
}

export const LiuYaoResultScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { result } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<LiuYaoAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  /**
   * 渲染卦象线条
   */
  const renderGuaLines = (linesStr: string, movingLines: number[]) => {
    const lines = linesStr.split('').map(c => parseInt(c));
    
    // 从上往下显示（上爻在最上面）
    return Array(6).fill(0).map((_, index) => {
      const i = 5 - index;
      const isYang = lines[i] === 1;
      const isMoving = movingLines.includes(i);
      
      return (
        <View key={i} style={styles.yaoRow}>
          <Text style={styles.yaoPosition}>{YAO_POSITIONS[i]}</Text>
          {isYang ? (
            <View style={[styles.yangLine, isMoving && styles.movingLine]} />
          ) : (
            <View style={styles.yinRow}>
              <View style={styles.yinSegment} />
              <View style={styles.yinGap} />
              <View style={styles.yinSegment} />
            </View>
          )}
          {isMoving && <Text style={styles.movingDot}>●</Text>}
        </View>
      );
    });
  };

  /**
   * 本地解析
   */
  const handleLocalAnalysis = async () => {
    if (!result) {
      Alert.alert('⚠️ 提示', '卦象数据缺失');
      return;
    }

    try {
      setLoading(true);
      const lines = result.lines.split('').map(c => parseInt(c));
      
      const fullAnalysis = generateFullAnalysis(
        lines,
        result.movingLines,
        result.coinResults
      );
      
      setAnalysis(fullAnalysis);
      setShowAnalysis(true);
      
      // 保存到历史记录
      await saveToHistory(fullAnalysis);
    } catch (error) {
      console.error('本地解析失败:', error);
      Alert.alert('❌ 错误', '解析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * AI 解析
   */
  const handleAIAnalysis = async () => {
    // 立即导航到 AIResultScreen
    navigation.navigate('AIResult', {
      baziInfo: {
        type: 'liuyao', // 标记为六爻
        guaName: result.guaName,
        transformedGuaName: result.transformedGuaName,
        lines: result.lines,
        movingLines: result.movingLines,
      },
      aiResult: null, // 初始为 null，在 AIResultScreen 中调用 AI 服务
    });
  };

  /**
   * 保存历史记录
   */
  const saveToHistory = async (fullAnalysis: LiuYaoAnalysis) => {
    try {
      const record: any = {
        createdAt: Date.now(),
        baziType: 'liuyao',
        solarDate: new Date().toISOString(),
        lunarDate: '',
        timePeriod: '',
        location: '',
        aiInterpretation: formatAnalysis(fullAnalysis),
        isFavorite: false,
        hexagram: fullAnalysis.guaName,
        moving_lines: result.movingLines.join(','),
      };
      
      await insertRecord(record as any);
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  };

  /**
   * 格式化解析结果
   */
  const formatAnalysis = (fullAnalysis: LiuYaoAnalysis): string => {
    let text = `${fullAnalysis.summary}\n\n`;
    text += `${fullAnalysis.analysis.method}\n`;
    text += `${fullAnalysis.analysis.sixRelations}\n`;
    text += `${fullAnalysis.analysis.fiveElements}\n`;
    text += `${fullAnalysis.analysis.movingLines}\n`;
    text += `${fullAnalysis.analysis.shiYing}\n`;
    text += `${fullAnalysis.advice}`;
    return text;
  };

  if (!result) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ 卦象数据缺失</Text>
        <GuochaoButton
          title="返回重摇"
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* 卦名 */}
      <View style={styles.header}>
        <Text style={styles.guaName}>{result.guaName}</Text>
        {result.transformedGuaName && (
          <Text style={styles.transformedGua}>
            变：{result.transformedGuaName}
          </Text>
        )}
      </View>

      {/* 卦象显示 */}
      <GuochaoCard style={styles.guaCard}>
        <Text style={styles.cardTitle}>【卦象】</Text>
        <View style={styles.guaLines}>
          {renderGuaLines(result.lines, result.movingLines)}
        </View>
      </GuochaoCard>

      {/* 动爻信息 */}
      {result.movingLines.length > 0 && (
        <GuochaoCard style={styles.movingCard}>
          <Text style={styles.cardTitle}>【动爻】</Text>
          {result.movingLines.map((index) => (
            <Text key={index} style={styles.movingText}>
              • {YAO_POSITIONS[index]} 动
            </Text>
          ))}
        </GuochaoCard>
      )}

      {/* 操作按钮 */}
      <View style={styles.buttonContainer}>
        <GuochaoButton
          title={analysis ? '重新解析' : '本地解析'}
          onPress={handleLocalAnalysis}
          loading={loading}
          style={styles.button}
        />
        
        {analysis && (
          <GuochaoButton
            title="查看详细"
            onPress={() => setShowAnalysis(!showAnalysis)}
            variant="secondary"
            style={styles.button}
          />
        )}
        
        <GuochaoButton
          title="AI 详解"
          onPress={handleAIAnalysis}
          variant="secondary"
          style={styles.button}
        />
      </View>

      {/* 解析结果 */}
      {showAnalysis && analysis && (
        <GuochaoCard style={styles.analysisCard}>
          <Text style={styles.cardTitle}>【解析结果】</Text>
          <Text style={styles.analysisText}>{formatAnalysis(analysis)}</Text>
        </GuochaoCard>
      )}

      {/* 底部留白 */}
      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    alignItems: 'center',
  },
  guaName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  transformedGua: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: spacing.sm,
    opacity: 0.9,
  },
  guaCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  guaLines: {
    gap: spacing.sm,
  },
  yaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  yaoPosition: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 50,
  },
  yangLine: {
    flex: 1,
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  movingLine: {
    backgroundColor: colors.accent,
  },
  yinRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yinSegment: {
    width: '40%',
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  yinGap: {
    width: '20%',
  },
  movingDot: {
    fontSize: 20,
    color: colors.accent,
    marginLeft: spacing.sm,
    width: 30,
  },
  movingCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  movingText: {
    fontSize: 14,
    color: colors.accent,
    marginLeft: spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    minWidth: 100,
    marginBottom: spacing.xs,
  },
  analysisCard: {
    margin: spacing.lg,
  },
  analysisText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 24,
  },
  footer: {
    height: spacing.xl,
  },
});
