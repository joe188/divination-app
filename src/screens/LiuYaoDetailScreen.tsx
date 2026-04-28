/**
 * 六爻排盘详情页 - 显示详细解卦
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import theme from '../styles/theme';
import { responsiveFontSize, responsivePadding } from '../styles/responsive';

interface LiuYaoDetailScreenProps {
  route: {
    params: {
      hexagram: string;
      guaName: string;
      lines: number[];
      movingLines?: number[];
      interpretation?: string;
    };
  };
  navigation: any;
}

const LiuYaoDetailScreen: React.FC<LiuYaoDetailScreenProps> = ({ route, navigation }) => {
  const { hexagram, guaName, lines = [], movingLines = [], interpretation } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState('');

  const handleAIInterpret = async () => {
    setLoading(true);
    try {
      const aiService = require('../services/ai-service').default;
      
      const request = {
        question: `请详细解读这个六爻卦象：${guaName}卦，卦象为${hexagram}，动爻：${movingLines?.join(',') || '无'}`,
        provider: 'openai', // 会从配置读取
      };

      const result = await aiService.analyzeLiuYao(request);
      setAiInterpretation(result);
      Alert.alert('成功', 'AI 解卦完成');
    } catch (error: any) {
      Alert.alert('错误', `AI 解卦失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHistory = async () => {
    try {
      const db = require('../database/Database').default;
      
      const record = {
        baziType: 'liuyao' as const,
        solarDate: new Date().toISOString(),
        lunarDate: '',
        timePeriod: '',
        location: '',
        aiInterpretation: aiInterpretation || interpretation || '',
        isFavorite: false,
        hexagram,
        guaName,
        movingLines: movingLines || [],
      };

      await db.saveHistory(record);
      Alert.alert('成功', '已保存到历史记录');
    } catch (error: any) {
      Alert.alert('错误', `保存失败：${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.guaName}>{guaName}</Text>
        <Text style={styles.hexagram}>{hexagram}</Text>
      </View>

      {/* 卦象显示 */}
      <View style={styles.guaImage}>
        {lines.map((line, index) => (
          <View key={index} style={styles.lineRow}>
            {line === 1 ? (
              <View style={styles.yangLine} />
            ) : (
              <View style={styles.yinLine}>
                <View style={styles.yinGap} />
              </View>
            )}
            {movingLines?.includes(5 - index) && (
              <Text style={styles.movingLabel}>动</Text>
            )}
          </View>
        ))}
      </View>

      {/* 动爻信息 */}
      {movingLines && movingLines.length > 0 && (
        <View style={styles.movingSection}>
          <Text style={styles.sectionTitle}>动爻</Text>
          <Text style={styles.movingText}>
            {movingLines.map(num => `${num}爻`).join('、')}
          </Text>
        </View>
      )}

      {/* 本地解析 */}
      {interpretation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>本地解析</Text>
          <Text style={styles.interpretation}>{interpretation}</Text>
        </View>
      )}

      {/* AI 解卦 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI 解卦</Text>
        
        {!aiInterpretation ? (
          <TouchableOpacity
            style={[styles.aiButton, loading && styles.buttonDisabled]}
            onPress={handleAIInterpret}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.aiButtonText}>🔮 开始 AI 解卦</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.aiResult}>
            <Text style={styles.aiText}>{aiInterpretation}</Text>
          </View>
        )}
      </View>

      {/* 保存按钮 */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveHistory}>
        <Text style={styles.saveButtonText}>💾 保存到历史记录</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 24,
    alignItems: 'center',
  },
  guaName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  hexagram: {
    fontSize: 36,
    color: '#fff',
    letterSpacing: 8,
  },
  guaImage: {
    backgroundColor: '#fff',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    height: 20,
  },
  yangLine: {
    width: 200,
    height: 12,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  yinLine: {
    width: 200,
    height: 12,
    backgroundColor: '#333',
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yinGap: {
    width: 40,
  },
  movingLabel: {
    color: '#f00',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 12,
  },
  movingSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  movingText: {
    fontSize: 14,
    color: '#f00',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  interpretation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  aiButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  aiResult: {
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  aiText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 32,
  },
});

export default LiuYaoDetailScreen;
