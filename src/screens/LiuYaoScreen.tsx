/**
 * LiuYaoScreen - 六爻排盘输入页
 * 功能：选择问题类型、起卦方式、爻位编辑
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
} from 'react-native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import { GuochaoInput } from '../components/GuochaoInput';
import { liuyaoInterpret } from '../utils/liuyao-interpret';

// 六爻解卦结果接口（简化版，与 utils/liuyao-interpret.ts 中一致）
interface LiuYaoResult {
  guaId: number;
  guaName: string;
  bianguaId?: number;
  bianguaName?: string;
  dianhuaIndex?: number;
  yaoTexts: string[];
  duanyan: string;
  summary: string;
}
import theme from '../styles/theme';
const { colors, fonts, spacing, radii } = theme;

interface LiuYaoScreenProps {
  onSubmit?: (data: LiuYaoData) => void;
  onBack?: () => void;
}

interface LiuYaoData {
  question: string;
  method: 'coin' | 'datetime' | 'manual';
  dateTime?: Date;
  yao: number[]; // 6个爻，0-3（少阳、少阴、老阳、老阴）
  result?: LiuYaoResult;
}

// 问题类型
const questionTypes = [
  { label: '事业学业', value: 'career' },
  { label: '感情婚姻', value: 'love' },
  { label: '财富投资', value: 'money' },
  { label: '健康疾病', value: 'health' },
  { label: '家宅风水', value: 'home' },
  { label: '其他事项', value: 'other' },
];

// 起卦方式
const methods = [
  { label: '手摇铜钱', value: 'coin' },
  { label: '时间起卦', value: 'datetime' },
  { label: '手动输入', value: 'manual' },
];

// 爻的类型（0=少阳，1=少阴，2=老阳，3=老阴）
const yaoTypes = [
  { label: '少阳', value: 0, description: '⚊' },
  { label: '少阴', value: 1, description: '⚋' },
  { label: '老阳', value: 2, description: '⚊ (动)' },
  { label: '老阴', value: 3, description: '⚋ (动)' },
];

// 将内部 yao 值转为展示符号（6爻值转为三枚铜钱和）
function yaoToDisplay(yao: number): { symbol: string; label: string } {
  switch (yao) {
    case 0: // 少阳
      return { symbol: '⚊', label: '少阳' };
    case 1: // 少阴
      return { symbol: '⚋', label: '少阴' };
    case 2: // 老阳（阴变阳）
      return { symbol: '⚊', label: '老阳' };
    case 3: // 老阴（阳变阴）
      return { symbol: '⚋', label: '老阴' };
    default:
      return { symbol: '?', label: '未知' };
  }
}

export const LiuYaoScreen: React.FC<LiuYaoScreenProps> = ({
  onSubmit,
  onBack,
}) => {
  const [question, setQuestion] = useState('');
  const [questionType, setQuestionType] = useState(questionTypes[0].value);
  const [method, setMethod] = useState<'coin' | 'datetime' | 'manual'>('coin');
  const [yao, setYao] = useState<number[]>([0, 0, 0, 0, 0, 0]); // 从下到上
  const [showQuestionType, setShowQuestionType] = useState(false);
  const [showMethod, setShowMethod] = useState(false);
  const [showYaoEditor, setShowYaoEditor] = useState(false);
  const [editingYaoIndex, setEditingYaoIndex] = useState(0);

  // 模拟摇卦
  const handleCoinDivination = () => {
    const newYao: number[] = [];
    for (let i = 0; i < 6; i++) {
      // 三枚铜钱，0=正面(3)，1=反面(2)
      const toss = Array.from({ length: 3 }, () => Math.random() > 0.5 ? 3 : 2);
      const sum = toss.reduce((a, b) => a + b, 0);
      let yao: number;
      if (sum === 9) yao = 3; // 老阴
      else if (sum === 7) yao = 0; // 少阳
      else if (sum === 8) yao = 1; // 少阴
      else if (sum === 6) yao = 2; // 老阳
      else yao = 0;
      newYao.push(yao);
    }
    setYao(newYao);
  };

  // 时间起卦（简化）
  const handleDateTimeDivination = () => {
    const now = new Date();
    const year = now.getFullYear() % 100;
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    // 简易算法：年月日时取余
    const yao1 = (year + month + day) % 4;
    const yao2 = (month + day + hour) % 4;
    const yao3 = (day + hour) % 4;
    const yao4 = (hour) % 4;
    const yao5 = (year + hour) % 4;
    const yao6 = (month + year) % 4;
    setYao([yao1, yao2, yao3, yao4, yao5, yao6]);
  };

  const handleSubmit = () => {
    if (!question.trim()) {
      Alert.alert('请输入所问之事');
      return;
    }
    if (method === 'manual' && yao.some(y => y < 0 || y > 3)) {
      Alert.alert('请完善所有爻的设置');
      return;
    }

    // 调用完整解卦逻辑
    const fullResult = liuyaoInterpret(yao);

    onSubmit?.({
      question,
      method,
      dateTime: new Date(),
      yao,
      result: fullResult,
    });
  };

  // 使用 yaoToDisplay 函数在前端直接渲染，不引入中间状态

  const renderPicker = (
    visible: boolean,
    onClose: () => void,
    title: string,
    data: any[],
    selected: any,
    onSelect: (item: any) => void,
    valueKey?: string,
    labelKey = 'label'
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.pickerCard}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.pickerClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              const isSelected = valueKey
                ? selected === item[valueKey]
                : selected === (item.value ?? item);
              return (
                <TouchableOpacity
                  style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
                    {item[labelKey] || item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 标题栏 */}
        <View style={[styles.header, { paddingTop: spacing.xl }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>六爻排盘</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* 问题输入 */}
        <GuochaoCard title="所问何事" variant="elevated">
          <GuochaoInput
            label="问题描述"
            value={question}
            onChangeText={setQuestion}
            placeholder="例如：今年事业运如何？"
            multiline
            style={{ height: 80 }}
          />
        </GuochaoCard>

        {/* 问题类型 */}
        <GuochaoCard title="问题类型" variant="pattern">
          <View style={styles.typeButtons}>
            {questionTypes.map(qt => (
              <TouchableOpacity
                key={qt.value}
                style={[
                  styles.typeButton,
                  questionType === qt.value && styles.typeButtonActive,
                ]}
                onPress={() => setQuestionType(qt.value)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    questionType === qt.value && styles.typeButtonTextActive,
                  ]}
                >
                  {qt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GuochaoCard>

        {/* 起卦方式 */}
        <GuochaoCard title="起卦方式" variant="elevated">
          <View style={styles.methodButtons}>
            {methods.map(m => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.methodButton,
                  method === m.value && styles.methodButtonActive,
                ]}
                onPress={() => setMethod(m.value)}
              >
                <Text
                  style={[
                    styles.methodButtonText,
                    method === m.value && styles.methodButtonTextActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {method === 'coin' && (
            <GuochaoButton
              title="🎲 开始摇卦"
              variant="primary"
              size="medium"
              onPress={handleCoinDivination}
              style={styles.actionButton}
            />
          )}
          {method === 'datetime' && (
            <GuochaoButton
              title="🕐 按当前时间起卦"
              variant="primary"
              size="medium"
              onPress={handleDateTimeDivination}
              style={styles.actionButton}
            />
          )}
          {method === 'manual' && (
            <GuochaoButton
              title="✎ 手动设置爻"
              variant="outline"
              size="medium"
              onPress={() => setShowYaoEditor(true)}
              style={styles.actionButton}
            />
          )}
        </GuochaoCard>

        {/* 爻象预览 */}
        {yao.some(y => y !== 0) && (
          <GuochaoCard title="当前卦象" variant="pattern">
            <View style={styles.yaoPreview}>
              {yao.map((y, idx) => {
                const disp = yaoToDisplay(y);
                return (
                  <View key={idx} style={styles.yaoItem}>
                    <Text style={styles.yaoLabel}>{['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][idx]}</Text>
                    <Text style={[styles.yaoSymbol, { fontSize: fonts.sizes['2xl'] }]}>
                      {disp.symbol}
                    </Text>
                    <Text style={styles.yaoType}>{disp.label}</Text>
                  </View>
                );
              })}
            </View>
          </GuochaoCard>
        )}

        {/* 提交按钮 */}
        <GuochaoButton
          title="🔮 起卦"
          variant="primary"
          size="large"
          onPress={handleSubmit}
          style={styles.submitButton}
        />

        <View style={styles.spacer} />

        {/* 爻编辑器 Modal */}
        {renderPicker(
          showYaoEditor,
          () => setShowYaoEditor(false),
          '设置六个爻（从下到上）',
          yao.map((y, i) => ({ label: `${['初爻','二爻','三爻','四爻','五爻','上爻'][i]}: ${yaoTypes[y]?.label}`, value: i })),
          editingYaoIndex,
          (item) => setEditingYaoIndex(item.value),
          'value'
        )}

        {showYaoEditor && (
          <Modal visible={showYaoEditor} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={[styles.pickerCard, { maxHeight: '80%' }]}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>编辑 {['初爻','二爻','三爻','四爻','五爻','上爻'][editingYaoIndex]}</Text>
                  <TouchableOpacity onPress={() => setShowYaoEditor(false)}>
                    <Text style={styles.pickerClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={yaoTypes}
                  keyExtractor={(item) => item.value.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.pickerItem, yao[editingYaoIndex] === item.value && styles.pickerItemSelected]}
                      onPress={() => {
                        const newYao = [...yao];
                        newYao[editingYaoIndex] = item.value;
                        setYao(newYao);
                      }}
                    >
                      <Text style={[styles.pickerItemText, { fontSize: fonts.sizes.xl }]}>
                        {item.description} {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </View>
  );
};

// (已迁移至 utils/liuyao-interpret.ts)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: fonts.sizes.xl,
    color: colors.inkBlack,
  },
  headerTitle: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes['2xl'],
    fontWeight: '600',
    color: colors.inkBlack,
  },
  headerPlaceholder: {
    width: 40,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginBottom: spacing.sm,
  },
  typeButtonActive: {
    backgroundColor: colors.cinnabarRed,
    borderColor: colors.cinnabarRed,
  },
  typeButtonText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[700],
  },
  typeButtonTextActive: {
    color: colors.white,
    fontWeight: '500',
  },
  methodButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  methodButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  methodButtonActive: {
    backgroundColor: colors.cinnabarRed,
    borderColor: colors.cinnabarRed,
  },
  methodButtonText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[600],
  },
  methodButtonTextActive: {
    color: colors.white,
    fontWeight: '500',
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  yaoPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  yaoItem: {
    alignItems: 'center',
  },
  yaoLabel: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.xs,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  yaoSymbol: {
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    marginBottom: spacing.xs,
  },
  yaoType: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.xs,
    color: colors.cinnabarRed,
  },
  submitButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  spacer: {
    height: spacing['6xl'],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  pickerTitle: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.lg,
    fontWeight: '600',
    color: colors.inkBlack,
  },
  pickerClose: {
    fontSize: fonts.sizes.xl,
    color: colors.gray[500],
  },
  pickerItem: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  pickerItemSelected: {
    backgroundColor: colors.riceWhite,
  },
  pickerItemText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[700],
  },
  pickerItemTextSelected: {
    color: colors.cinnabarRed,
    fontWeight: '600',
  },
});

export default LiuYaoScreen;