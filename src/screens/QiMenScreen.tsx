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
  Dimensions,
} from 'react-native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import { QiMenPanView } from '../components/QiMenPanView';
import theme from '../styles/theme';
import { calculateQiMen, QiMenResult } from '../utils/qimen-calculator';
import { generateFullQiMenAnalysis } from '../utils/qimen-interpret';
import { insertRecord, updateRecord } from '../database/queries/history';
import type { DivinationRecord } from '../database/models/DivinationRecord';
import { responsiveFontSize, responsiveWidth, responsiveHeight } from '../styles/responsive';

const { colors, fonts, spacing, radii } = theme;
const { width, height } = Dimensions.get('window');

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
  const [localInterpretation, setLocalInterpretation] = useState('');
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
      
      // 使用新的解析模块生成详细解析
      const analysis = generateFullQiMenAnalysis(result);
      const text = `${analysis.summary}\n\n${analysis.analysis.ju}\n\n${analysis.analysis.zhiFu}\n\n${analysis.analysis.zhiShi}\n\n${analysis.analysis.baMen}\n\n${analysis.analysis.jiuXing}\n\n${analysis.analysis.baShen}\n\n${analysis.analysis.siPan}\n\n${analysis.analysis.keYing}\n\n${analysis.analysis.wangShuai}\n\n${analysis.analysis.fuYinFanYin}\n\n${analysis.advice}`;
      
      setLocalInterpretation(text);
      
      // 保存或更新历史记录
      if (recordId) {
        await updateRecord(recordId, {
          aiInterpretation: text,
        });
      } else {
        const record: Partial<DivinationRecord> = {
          createdAt: Date.now(),
          baziType: 'qimen',
          solarDate: new Date(year, month - 1, day).toISOString(),
          lunarDate: '',
          timePeriod: SHI_CHEN[hourIndex],
          location: '',
          aiInterpretation: text,
          isFavorite: 0,
          jieqi,
          juName: result.solarTerm,
        };
        
        const newRecordId = await insertRecord(record as DivinationRecord);
        setRecordId(newRecordId);
      }
      
      Alert.alert('✅ 解析完成', '已生成详细的奇门遁甲解析');
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

    // 立即导航到 AIResultScreen
    navigation.navigate('AIResult', {
      baziInfo: {
        ganZhi: {
          year: { gan: result.dayGanZhi?.[0] || '', zhi: result.dayGanZhi?.[1] || '' },
          month: { gan: '', zhi: '' },
          day: { gan: '', zhi: '' },
          hour: { gan: result.hourGanZhi?.[0] || '', zhi: result.hourGanZhi?.[1] || '' },
        },
        solarDate: `${year}-${month}-${day}`,
        lunarDate: '',
        hourLabel: SHI_CHEN[hourIndex],
        location: '',
        jieqi,
        zhiFu: result.zhiFu,
        zhiShi: result.zhiShi,
        type: 'qimen', // 标记为奇门遁甲
      },
      aiResult: null, // 初始为 null，在 AIResultScreen 中调用 AI 服务
    });
  };

  const handleSave = async () => {
    if (!result) {
      Alert.alert('⚠️ 提示', '请先起局');
      return;
    }
    if (!localInterpretation || localInterpretation.trim() === '') {
      Alert.alert('⚠️ 提示', '请先进行本地解析');
      return;
    }
    try {
      const record: Partial<DivinationRecord> = {
        createdAt: Date.now(),
        baziType: 'qimen',
        solarDate: new Date(year, month - 1, day).toISOString(),
        lunarDate: '',
        timePeriod: SHI_CHEN[hourIndex],
        location: '',
        aiInterpretation: localInterpretation,
        isFavorite: 0,
        jieqi,
        juName: result.solarTerm,
      };
      await insertRecord(record as DivinationRecord);
      Alert.alert('✅ 成功', '已保存到历史记录');
    } catch (error) {
      Alert.alert('❌ 错误', '保存失败：' + (error as Error).message);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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

        <View style={styles.separator} />

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
          <GuochaoButton title="💾 保存到历史" onPress={handleSave} disabled={loading} />
        </View>
      )}

      {/* 解析结果 */}
      {localInterpretation ? (
        <GuochaoCard title="解析结果">
          <Text style={styles.interpretationText}>{localInterpretation}</Text>
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
      {renderPicker(showHourPicker, () => setShowHourPicker(false), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], hourIndex, setHourIndex, (i) => SHI_CHEN[i])}
      {renderPicker(showJieqiPicker, () => setShowJieqiPicker(false), JIEQI_LIST, jieqi, setJieqi, (j) => j)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E6',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
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
  separator: {
    height: spacing.lg,
  },
  pickerText: {
    fontSize: responsiveFontSize(16), // 响应式字体
    color: '#1A1A1A',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'column', // 垂直排列
    gap: spacing.md, // 按钮间距
    marginTop: spacing.lg,
  },
  juName: {
    fontSize: responsiveFontSize(24), // 响应式字体
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  interpretationText: {
    fontSize: responsiveFontSize(15), // 响应式字体
    color: '#1A1A1A',
    lineHeight: responsiveHeight(6), // 响应式行高
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
    fontSize: responsiveFontSize(18), // 响应式字体
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
    fontSize: responsiveFontSize(16), // 响应式字体
  },
});

export default QiMenScreen;
