/**
 * QiMenScreen - 奇门遁甲排盘
 * 功能：选择时间、节气、起局、九宫格显示、本地/AI 解析、历史记录保存
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import { QiMenPanView } from '../components/QiMenPanView';
import theme from '../styles/theme';
import { calculateQiMen, QiMenResult } from '../utils/qimen-calculator';
import { insertRecord, updateRecord } from '../database/queries/history';
import type { DivinationRecord } from '../database/models/DivinationRecord';

const { colors, fonts, spacing, radii } = theme;

// 24 节气列表
const JIEQI_LIST = [
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',
];

// 时辰列表
const SHI_CHEN = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

// 年份范围
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const MONTH_RANGE = Array.from({ length: 12 }, (_, i) => i + 1);
const DAY_RANGE = Array.from({ length: 31 }, (_, i) => i + 1);

export const QiMenScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hourIndex, setHourIndex] = useState(0);
  const [jieqi, setJieqi] = useState('冬至');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QiMenResult | null>(null);
  const [interpretation, setInterpretation] = useState('');
  const [recordId, setRecordId] = useState<number | null>(null);
  
  // 选择器状态
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [showJieqiPicker, setShowJieqiPicker] = useState(false);

  /**
   * 起局
   */
  const handleCalculate = async () => {
    try {
      setLoading(true);
      
      // 计算奇门遁甲
      const date = new Date(year, month - 1, day);
      const qiMenResult = calculateQiMen(jieqi, date);
      
      setResult(qiMenResult);
      setInterpretation('');
      setRecordId(null);
      
      Alert.alert('✅ 起局完成', `节气：${jieqi}\n时辰：${SHI_CHEN[hourIndex]}`);
    } catch (error) {
      Alert.alert('❌ 错误', '起局失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 本地解析
   */
  const handleLocalAnalysis = async () => {
    if (!result) {
      Alert.alert('⚠️ 提示', '请先起局');
      return;
    }

    try {
      setLoading(true);
      
      // 生成本地解析文本
      const text = `【奇门局象】\n\n` +
        `节气：${jieqi}\n` +
        `时间：${year}年${month}月${day}日 ${SHI_CHEN[hourIndex]}\n` +
        `日干支：${result.dayGanZhi}\n` +
        `时干支：${result.hourGanZhi}\n\n` +
        `【值符】${result.zhiFu}\n` +
        `【值使】${result.zhiShi}\n\n` +
        `【九宫格局】\n` +
        `这是一个简化的本地解析版本。\n\n` +
        `完整的解析需要结合：\n` +
        `- 八门（休生伤杜景死惊开）\n` +
        `- 九星（天蓬天任天冲天辅天英天芮天柱天心天禽）\n` +
        `- 八神（值符腾阴合虎武地天）\n` +
        `- 三奇六仪（戊己庚辛壬癸丁丙乙）\n\n` +
        `建议咨询专业奇门遁甲师进行详细解读。`;
      
      setInterpretation(text);
      
      // 保存或更新历史记录
      if (recordId) {
        await updateRecord(recordId, {
          aiInterpretation: text,
        });
      } else {
        const record: Partial<DivinationRecord> = {
          baziType: 'qimen',
          solarDate: new Date(year, month - 1, day).toISOString(),
          lunarDate: '',
          timePeriod: SHI_CHEN[hourIndex],
          location: '',
          aiInterpretation: text,
          isFavorite: 0,
        };
        
        const newRecordId = await insertRecord(record as DivinationRecord);
        setRecordId(newRecordId);
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
      Alert.alert('⚠️ 提示', '请先起局');
      return;
    }

    try {
      setLoading(true);
      
      const aiText = `AI 解析中...（需要配置 AI API Key）\n\n` +
        `节气：${jieqi}\n` +
        `时间：${year}年${month}月${day}日 ${SHI_CHEN[hourIndex]}\n` +
        `日干支：${result.dayGanZhi}\n` +
        `时干支：${result.hourGanZhi}\n` +
        `值符：${result.zhiFu}\n` +
        `值使：${result.zhiShi}\n\n` +
        `请在设置中配置 AI API Key 以获取详细解析。`;
      
      setInterpretation(aiText);
      
      // 保存或更新历史记录
      if (recordId) {
        await updateRecord(recordId, {
          aiInterpretation: aiText,
        });
      } else {
        const record: Partial<DivinationRecord> = {
          baziType: 'qimen',
          solarDate: new Date(year, month - 1, day).toISOString(),
          lunarDate: '',
          timePeriod: SHI_CHEN[hourIndex],
          location: '',
          aiInterpretation: aiText,
          isFavorite: 0,
        };
        
        const newRecordId = await insertRecord(record as DivinationRecord);
        setRecordId(newRecordId);
      }
      
      Alert.alert('ℹ️ 提示', 'AI 解析功能需要配置 API Key。\n\n请在设置中配置：\n- OpenAI\n- 文心一言\n- 通义千问\n- 讯飞星火');
    } catch (error) {
      Alert.alert('❌ 错误', 'AI 解析失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 渲染选择器
   */
  const renderPicker = (
    visible: boolean,
    onClose: () => void,
    data: any[],
    value: any,
    onSelect: (value: any) => void,
    renderLabel: (item: any) => string
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <FlatList
            data={data}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, item === value && styles.pickerItemSelected]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={[styles.pickerItemText, item === value && styles.pickerItemTextSelected]}>
                  {renderLabel(item)}
                </Text>
              </TouchableOpacity>
            )}
          />
          <GuochaoButton title="取消" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      {/* 时间选择 */}
      <GuochaoCard title="选择时间">
        <View style={styles.pickerRow}>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowYearPicker(true)}>
            <Text style={styles.pickerText}>{year}年</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowMonthPicker(true)}>
            <Text style={styles.pickerText}>{month}月</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.pickerRow}>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDayPicker(true)}>
            <Text style={styles.pickerText}>{day}日</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowHourPicker(true)}>
            <Text style={styles.pickerText}>{SHI_CHEN[hourIndex]}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.pickerButton, styles.jieqiButton]} 
          onPress={() => setShowJieqiPicker(true)}
        >
          <Text style={styles.pickerText}>节气：{jieqi}</Text>
        </TouchableOpacity>

        <GuochaoButton title="🔮 起局" onPress={handleCalculate} disabled={loading} />
      </GuochaoCard>

      {/* 九宫格显示 */}
      {result && (
        <GuochaoCard title="奇门局象">
          <Text style={styles.juName}>{jieqi}局</Text>
          <QiMenPanView result={result} />
        </GuochaoCard>
      )}

      {/* 解析按钮 */}
      {result && (
        <View style={styles.buttonContainer}>
          <GuochaoButton title="🔮 本地解析" onPress={handleLocalAnalysis} disabled={loading} />
          <GuochaoButton title="🤖 AI 解析" onPress={handleAiAnalysis} disabled={loading} />
        </View>
      )}

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
          <Text style={styles.loadingText}>正在处理...</Text>
        </View>
      )}

      {/* 选择器 */}
      {renderPicker(showYearPicker, () => setShowYearPicker(false), YEAR_RANGE, year, setYear, (y) => `${y}年`)}
      {renderPicker(showMonthPicker, () => setShowMonthPicker(false), MONTH_RANGE, month, setMonth, (m) => `${m}月`)}
      {renderPicker(showDayPicker, () => setShowDayPicker(false), DAY_RANGE, day, setDay, (d) => `${d}日`)}
      {renderPicker(showHourPicker, () => setShowHourPicker(false), SHI_CHEN, hourIndex, (i) => i, (h) => h)}
      {renderPicker(showJieqiPicker, () => setShowJieqiPicker(false), JIEQI_LIST, jieqi, setJieqi, (j) => j)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E6',
    padding: spacing.lg,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  pickerButton: {
    flex: 1,
    marginHorizontal: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#FFF8F0',
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  jieqiButton: {
    marginTop: spacing.md,
  },
  pickerText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  juName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: spacing.lg,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF8F0',
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    maxHeight: '60%',
  },
  pickerItem: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DCC4',
  },
  pickerItemSelected: {
    backgroundColor: '#8B4513',
  },
  pickerItemText: {
    fontSize: 18,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: '#FFF8F0',
    fontWeight: '600',
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

export default QiMenScreen;
