/**
 * QiMenScreen - 奇门遁甲排盘输入页
 * 功能：选择排盘类型、节气、时辰、方位等
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
import theme from '../styles/theme';
const { colors, fonts, spacing, radii } = theme;

interface QiMenScreenProps {
  onSubmit?: (data: QiMenData) => void;
  onBack?: () => void;
}

interface QiMenData {
  dateTime: Date;
  panType: 'solar' | 'lunar' | 'current';
  liuJia: string; // 当前干支
  diZhi: string;  // 当前时辰地支
  jieQi: string;  // 当前节气
  fuShen?: string; // 值符
  tianPan?: any;   // 天盘配置
  diPan?: any;     // 地盘配置
  result?: QiMenResult;
}

// 排盘类型
const panTypes = [
  { label: '依当前时间', value: 'current' },
  { label: '依指定时间', value: 'solar' },
  { label: '依农历时间', value: 'lunar' },
];

// 节气列表（简化）
const jieQiList = [
  { label: '立春', value: 'Lichun' },
  { label: '雨水', value: 'Yushui' },
  { label: '惊蛰', value: 'Jingzhe' },
  { label: '春分', value: 'Chunfen' },
  { label: '清明', value: 'Qingming' },
  { label: '谷雨', value: 'Guyu' },
  { label: '立夏', value: 'Lixia' },
  { label: '小满', value: 'Xiaoman' },
  { label: '芒种', value: 'Mangzhong' },
  { label: '夏至', value: 'Xiazhi' },
  { label: '小暑', value: 'Xiaoshu' },
  { label: '大暑', value: 'Dashu' },
  { label: '立秋', value: 'Liqiu' },
  { label: '处暑', value: 'Chushu' },
  { label: '白露', value: 'Bailu' },
  { label: '秋分', value: 'Qiufen' },
  { label: '寒露', value: 'Hanlu' },
  { label: '霜降', value: 'Shuangjiang' },
  { label: '立冬', value: 'Lidong' },
  { label: '小雪', value: 'Xiaoxue' },
  { label: '大雪', value: 'Daxue' },
  { label: '冬至', value: 'Dongzhi' },
  { label: '小寒', value: 'Xiaohan' },
  { label: '大寒', value: 'Dahan' },
];

// 时辰（地支）
const shiChenList = [
  { label: '子时 (23:00-01:00)', value: 'zi' },
  { label: '丑时 (01:00-03:00)', value: 'chou' },
  { label: '寅时 (03:00-05:00)', value: 'yin' },
  { label: '卯时 (05:00-07:00)', value: 'mao' },
  { label: '辰时 (07:00-09:00)', value: 'chen' },
  { label: '巳时 (09:00-11:00)', value: 'si' },
  { label: '午时 (11:00-13:00)', value: 'wu' },
  { label: '未时 (13:00-15:00)', value: 'wei' },
  { label: '申时 (15:00-17:00)', value: 'shen' },
  { label: '酉时 (17:00-19:00)', value: 'you' },
  { label: '戌时 (19:00-21:00)', value: 'xu' },
  { label: '亥时 (21:00-23:00)', value: 'hai' },
];

// 六甲值符（简化）
const liuJia = ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉'];

export const QiMenScreen: React.FC<QiMenScreenProps> = ({
  onSubmit,
  onBack,
}) => {
  const [panType, setPanType] = useState<'current' | 'solar' | 'lunar'>('current');
  const [selectedJieQi, setSelectedJieQi] = useState(jieQiList[0]);
  const [selectedShiChen, setSelectedShiChen] = useState(shiChenList[0]);
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [dateTime, setDateTime] = useState(new Date());

  const handleSubmit = () => {
    const now = new Date();
    const liuJiaIndex = (now.getFullYear() * 12 + now.getMonth() + 1) % 10;
    const liuJiaValue = liuJia[liuJiaIndex] || '甲子';

    const result: QiMenResult = {
      luoPan: '阳遁某局',
      description: `值符: ${liuJiaValue}，节气: ${selectedJieQi.label}，时辰: ${selectedShiChen.label}`,
      analysis: '奇门排盘需复杂算法，此处为简化演示...',
      suggestions: [
        '利于: 未定',
        '不利: 未定',
        '吉方: 待计算',
      ],
    };

    onSubmit?.({
      dateTime: now,
      panType: useCurrentTime ? 'current' : 'solar',
      liuJia: liuJiaValue,
      diZhi: selectedShiChen.value,
      jieQi: selectedJieQi.label,
      fuShen: liuJiaValue,
      result,
    });
  };

  const renderPicker = (
    visible: boolean,
    onClose: () => void,
    title: string,
    data: any[],
    selected: any,
    onSelect: (item: any) => void,
    valueKey = 'value',
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
              const isSelected = selected[valueKey] === item[valueKey] || selected === item[valueKey];
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
          <Text style={styles.headerTitle}>奇门遁甲</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* 排盘类型 */}
        <GuochaoCard title="排盘依据" variant="elevated">
          <View style={styles.typeButtons}>
            {panTypes.map(pt => (
              <TouchableOpacity
                key={pt.value}
                style={[
                  styles.typeButton,
                  panType === pt.value && styles.typeButtonActive,
                ]}
                onPress={() => {
                  setPanType(pt.value);
                  setUseCurrentTime(pt.value === 'current');
                }}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    panType === pt.value && styles.typeButtonTextActive,
                  ]}
                >
                  {pt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GuochaoCard>

        {/* 时间选项 */}
        {!useCurrentTime && (
          <GuochaoCard title="选择时间" variant="elevated">
            <GuochaoInput
              label="公历日期时间"
              value={dateTime.toLocaleString('zh-CN')}
              onChangeText={() => {}}
              placeholder="点击选择日期时间"
            />
          </GuochaoCard>
        )}

        {/* 节气选择 */}
        <GuochaoCard title="当前节气" variant="pattern">
          <TouchableOpacity
            style={styles.selector}
            onPress={() => {
              /* show jieqi picker */
            }}
          >
            <Text style={styles.selectorText}>{selectedJieQi.label}</Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>
        </GuochaoCard>

        {/* 时辰选择 */}
        <GuochaoCard title="当前时辰" variant="elevated">
          <View style={styles.shiChenGrid}>
            {shiChenList.map((sc, idx) => (
              <TouchableOpacity
                key={sc.value}
                style={[
                  styles.shiChenItem,
                  selectedShiChen.value === sc.value && styles.shiChenItemActive,
                ]}
                onPress={() => setSelectedShiChen(sc)}
              >
                <Text
                  style={[
                    styles.shiChenText,
                    selectedShiChen.value === sc.value && styles.shiChenTextActive,
                  ]}
                >
                  {sc.label.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GuochaoCard>

        {/* 信息概览 */}
        <GuochaoCard title="排盘信息" variant="pattern">
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>当前干支:</Text>
            <Text style={styles.infoValue}>{'待计算'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>值符:</Text>
            <Text style={styles.infoValue}>{'甲子'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>节气:</Text>
            <Text style={styles.infoValue}>{selectedJieQi.label}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>时辰:</Text>
            <Text style={styles.infoValue}>{selectedShiChen.label}</Text>
          </View>
        </GuochaoCard>

        {/* 提交按钮 */}
        <GuochaoButton
          title="🗺️ 生成奇门盘"
          variant="primary"
          size="large"
          onPress={handleSubmit}
          style={styles.submitButton}
        />

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

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
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  typeButtonActive: {
    backgroundColor: colors.cinnabarRed,
    borderColor: colors.cinnabarRed,
  },
  typeButtonText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[600],
  },
  typeButtonTextActive: {
    color: colors.white,
    fontWeight: '500',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  selectorText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.inkBlack,
  },
  selectorArrow: {
    color: colors.gray[500],
  },
  shiChenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  shiChenItem: {
    width: '30%',
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginBottom: spacing.sm,
  },
  shiChenItemActive: {
    backgroundColor: colors.cinnabarRed,
    borderColor: colors.cinnabarRed,
  },
  shiChenText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[700],
  },
  shiChenTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  infoLabel: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[600],
  },
  infoValue: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.md,
    color: colors.inkBlack,
    fontWeight: '600',
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

export default QiMenScreen;