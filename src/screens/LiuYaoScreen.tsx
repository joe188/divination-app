/**
 * LiuYaoScreen - 六爻排盘输入页
 * 功能：设置爻的阴阳、动爻标记、卦象计算、导航到结果页、历史记录保存
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import theme from '../styles/theme';
import { calculateHexagramNumber, getHexagramByNumber } from '../utils/liuyao-data';
import { insertRecord } from '../database/queries/history';
import type { DivinationRecord } from '../database/models/DivinationRecord';

const { colors, fonts, spacing, radii } = theme;

// 爻位名称（从下往上）
const YAO_POSITIONS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

export const LiuYaoScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [yaoList, setYaoList] = useState<number[]>([0, 0, 0, 0, 0, 0]); // 0=阴，1=阳
  const [movingLines, setMovingLines] = useState<number[]>([]); // 动爻索引

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
   * 计算卦名
   */
  const calculateGuaName = () => {
    // 将 number[] 转换为 { isYang: boolean }[]
    const linesObj = yaoList.map(y => ({ isYang: y === 1 }));
    const result = calculateHexagramNumber(linesObj);
    const hexagram = getHexagramByNumber(result.hexagram);
    return hexagram ? hexagram.name : '未知卦';
  };

  /**
   * 提交排盘
   */
  const handleSubmit = async () => {
    // 检查是否所有爻都是 0
    const allZero = yaoList.every(y => y === 0);
    if (allZero) {
      Alert.alert('⚠️ 提示', '请先设置每一爻的阴阳状态');
      return;
    }

    try {
      // 计算卦象
      const linesObj = yaoList.map(y => ({ isYang: y === 1 }));
      const result = calculateHexagramNumber(linesObj);
      const hexagram = getHexagramByNumber(result.hexagram);
      
      if (!hexagram) {
        Alert.alert('❌ 错误', '无法计算卦象');
        return;
      }

      // 生成卦象符号
      const hexagramSymbols = yaoList.map(y => y === 1 ? '⚊' : '⚋').join('\\n');
      
      // 保存历史记录
      const record: Partial<DivinationRecord> = {
        baziType: 'liuyao',
        solarDate: new Date().toISOString(),
        lunarDate: '',
        timePeriod: '',
        location: '',
        aiInterpretation: `卦名：${hexagram.name}\\n卦象：${hexagramSymbols}\\n\\n动爻：${movingLines.length > 0 ? movingLines.map(i => YAO_POSITIONS[i]).join('、') : '无'}`,
        isFavorite: 0,
      };

      const recordId = await insertRecord(record as DivinationRecord);

      // 导航到结果页
      navigation.navigate('LiuYaoResultScreen', {
        result: {
          hexagram: hexagramSymbols,
          hexagramName: hexagram.name,
          lines: yaoList.map(y => y === 1 ? '阳爻' : '阴爻'),
          movingLines,
          guaNumber: result.hexagram,
        },
        recordId,
      });
    } catch (error) {
      Alert.alert('❌ 错误', '排盘失败：' + (error as Error).message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <GuochaoCard title="六爻排盘">
        <Text style={styles.instruction}>从下往上设置每一爻（点击切换阴阳）</Text>
        
        {/* 从下往上显示：初爻在最下方 */}
        {[5, 4, 3, 2, 1, 0].map((index) => (
          <View key={index} style={styles.yaoRow}>
            <Text style={styles.yaoLabel}>{YAO_POSITIONS[index]}</Text>
            
            <TouchableOpacity
              style={[styles.yaoButton, yaoList[index] === 1 && styles.yaoYang]}
              onPress={() => toggleYao(index)}
            >
              <Text style={styles.yaoButtonText}>
                {yaoList[index] === 1 ? '⚊ 阳' : '⚋ 阴'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.movingButton, movingLines.includes(index) && styles.movingActive]}
              onPress={() => toggleMovingLine(index)}
            >
              <Text style={styles.movingButtonText}>
                {movingLines.includes(index) ? '⚪ 动' : '○ 静'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </GuochaoCard>

      <View style={styles.buttonContainer}>
        <GuochaoButton title="🔮 开始排盘" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E6',
    padding: spacing.lg,
  },
  instruction: {
    textAlign: 'center',
    color: '#6B5B4F',
    marginBottom: spacing.md,
    fontSize: 14,
  },
  yaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
    paddingVertical: spacing.sm,
  },
  yaoLabel: {
    width: 60,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  yaoButton: {
    flex: 1,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    backgroundColor: '#FFF8F0',
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  yaoYang: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  yaoButtonText: {
    fontSize: 18,
    color: '#1A1A1A',
  },
  movingButton: {
    width: 70,
    padding: spacing.sm,
    backgroundColor: '#FFF8F0',
    borderRadius: radii.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  movingActive: {
    backgroundColor: '#DC3545',
    borderColor: '#DC3545',
  },
  movingButtonText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
});

export default LiuYaoScreen;
