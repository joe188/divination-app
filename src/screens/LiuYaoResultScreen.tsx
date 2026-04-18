/**
 * LiuYaoResultScreen - 六爻排盘结果页
 * 功能：显示卦象、爻辞、本地/AI 解析、历史记录更新
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
import { liuyaoInterpret } from '../utils/liuyao-interpret';
import { updateRecord } from '../database/queries/history';

const { colors, fonts, spacing, radii } = theme;

// 爻位名称
const YAO_POSITIONS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

interface LiuYaoResult {
  hexagram: string;
  hexagramName: string;
  lines: string[];
  movingLines: number[];
  guaNumber: number;
}

export const LiuYaoResultScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { result, recordId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState<string>('');

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
      
      // 使用本地解析
      const yaoList = result.lines.map((line: string) => line === '阳爻' ? 1 : 0);
      const interpretResult = liuyaoInterpret(yaoList);
      
      let text = `【卦名】${result.hexagramName}\\n\\n`;
      text += `【卦象】\\n${result.hexagram}\\n\\n`;
      
      if (result.movingLines.length > 0) {
        text += `【动爻】\\n`;
        result.movingLines.forEach((index: number) => {
          text += `${YAO_POSITIONS[index]}：${yaoList[index] === 1 ? '阳爻发动' : '阴爻发动'}\\n`;
        });
        text += '\\n';
      }
      
      text += `【断语】\\n${interpretResult.duanyan}\\n\\n`;
      text += `【建议】\\n${interpretResult.summary}`;
      
      setInterpretation(text);
      
      // 更新历史记录
      if (recordId) {
        await updateRecord(recordId, {
          aiInterpretation: text,
        });
      }
      
      Alert.alert('✅ 解析完成', text);
    } catch (error) {
      Alert.alert('❌ 错误', '本地解析失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * AI 解析
   */
  const handleAiAnalysis = async () => {
    if (!result) {
      Alert.alert('⚠️ 提示', '卦象数据缺失');
      return;
    }

    try {
      setLoading(true);
      
      const aiText = `AI 解析中...（需要配置 AI API Key）\\n\\n卦名：${result.hexagramName}\\n动爻：${result.movingLines.length > 0 ? result.movingLines.map((i: number) => YAO_POSITIONS[i]).join('、') : '无'}`;
      
      setInterpretation(aiText);
      
      // 更新历史记录
      if (recordId) {
        await updateRecord(recordId, {
          aiInterpretation: aiText,
        });
      }
      
      Alert.alert('ℹ️ 提示', 'AI 解析功能需要配置 API Key。\\n\\n请在设置中配置：\\n- OpenAI\\n- 文心一言\\n- 通义千问\\n- 讯飞星火');
    } catch (error) {
      Alert.alert('❌ 错误', 'AI 解析失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ 卦象数据缺失</Text>
        <GuochaoButton title="返回主页" onPress={() => navigation.navigate('Home')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 卦名 */}
      <GuochaoCard title="卦象">
        <Text style={styles.guaName}>{result.hexagramName}</Text>
        <Text style={styles.guaSymbol}>{result.hexagram}</Text>
      </GuochaoCard>

      {/* 爻象 */}
      <GuochaoCard title="爻象">
        {result.lines.map((line: string, index: number) => {
          const isMoving = result.movingLines.includes(index);
          return (
            <View 
              key={index} 
              style={[
                styles.yaoRow,
                isMoving && styles.movingYaoRow,
              ]}
            >
              <Text style={styles.yaoPosition}>{YAO_POSITIONS[5 - index]}</Text>
              <Text style={styles.yaoLine}>{line}</Text>
              {isMoving && (
                <Text style={styles.movingLabel}>⚪ 动爻</Text>
              )}
            </View>
          );
        })}
      </GuochaoCard>

      {/* 解析按钮 */}
      <View style={styles.buttonContainer}>
        <GuochaoButton title="🔮 本地解析" onPress={handleLocalAnalysis} disabled={loading} />
        <GuochaoButton title="🤖 AI 解析" onPress={handleAiAnalysis} disabled={loading} />
      </View>

      {/* 解析结果 */}
      {interpretation ? (
        <GuochaoCard title="解析结果">
          <Text style={styles.interpretationText}>{interpretation}</Text>
        </GuochaoCard>
      ) : null}

      {/* 加载遮罩 */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>正在解析...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E6',
    padding: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0E6',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: 18,
    color: '#DC3545',
    marginBottom: spacing.lg,
  },
  guaName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  guaSymbol: {
    fontSize: 48,
    textAlign: 'center',
    lineHeight: 60,
    color: '#8B4513',
  },
  yaoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DCC4',
  },
  movingYaoRow: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  yaoPosition: {
    width: 60,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  yaoLine: {
    flex: 1,
    fontSize: 18,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  movingLabel: {
    fontSize: 12,
    color: '#DC3545',
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  interpretationText: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: '#FFF8F0',
    fontSize: 16,
  },
});

export default LiuYaoResultScreen;
