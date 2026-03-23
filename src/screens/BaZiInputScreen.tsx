/**
 * BaZiInputScreen - 八字排盘输入页
 * 功能：选择出生年月日时、真太阳时校正
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import { GuochaoInput } from '../components/GuochaoInput';
import { colors, fonts, spacing, radii } from '../styles/theme';

interface BaZiInputScreenProps {
  onSubmit?: (data: BaziData) => void;
  onBack?: () => void;
}

interface BaziData {
  year: number;
  month: number;
  day: number;
  hour: string;
  location: string;
  solarCorrection: boolean;
}

// Mock 数据
const years = Array.from({ length: 100 }, (_, i) => 1900 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const shichen = [
  { label: '子时', value: '23:00-01:00', time: '23:00' },
  { label: '丑时', value: '01:00-03:00', time: '01:00' },
  { label: '寅时', value: '03:00-05:00', time: '03:00' },
  { label: '卯时', value: '05:00-07:00', time: '05:00' },
  { label: '辰时', value: '07:00-09:00', time: '07:00' },
  { label: '巳时', value: '09:00-11:00', time: '09:00' },
  { label: '午时', value: '11:00-13:00', time: '11:00' },
  { label: '未时', value: '13:00-15:00', time: '13:00' },
  { label: '申时', value: '15:00-17:00', time: '15:00' },
  { label: '酉时', value: '17:00-19:00', time: '17:00' },
  { label: '戌时', value: '19:00-21:00', time: '19:00' },
  { label: '亥时', value: '21:00-23:00', time: '21:00' },
];

const zodiacMap: Record<number, string> = {
  0: '猴', 1: '鸡', 2: '狗', 3: '猪', 4: '鼠', 5: '牛',
  6: '虎', 7: '兔', 8: '龙', 9: '蛇', 10: '马', 11: '羊',
};

const getZodiac = (year: number) => zodiacMap[year % 12] || '龙';

export const BaZiInputScreen: React.FC<BaZiInputScreenProps> = ({
  onSubmit,
  onBack,
}) => {
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [selectedYear, setSelectedYear] = useState(1990);
  const [selectedMonth, setSelectedMonth] = useState(8);
  const [selectedDay, setSelectedDay] = useState(15);
  const [selectedHour, setSelectedHour] = useState(shichen[0]);
  const [location, setLocation] = useState('北京市');
  const [solarCorrection, setSolarCorrection] = useState(true);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);

  const handleSubmit = () => {
    onSubmit?.({
      year: selectedYear,
      month: selectedMonth,
      day: selectedDay,
      hour: selectedHour.value,
      location,
      solarCorrection,
    });
  };

  const renderPicker = (
    visible: boolean,
    onClose: () => void,
    title: string,
    data: any[],
    selected: any,
    onSelect: (item: any) => void
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
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
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  selected === item.value && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selected === item.value && styles.pickerItemTextSelected,
                  ]}
                >
                  {item.label || item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 标题栏 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>八字排盘</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* 日历类型选择 */}
        <GuochaoCard variant="elevated">
          <View style={styles.calendarType}>
            <TouchableOpacity
              style={[
                styles.calendarButton,
                calendarType === 'solar' && styles.calendarButtonActive,
              ]}
              onPress={() => setCalendarType('solar')}
            >
              <Text
                style={[
                  styles.calendarButtonText,
                  calendarType === 'solar' && styles.calendarButtonTextActive,
                ]}
              >
                公历
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.calendarButton,
                calendarType === 'lunar' && styles.calendarButtonActive,
              ]}
              onPress={() => setCalendarType('lunar')}
            >
              <Text
                style={[
                  styles.calendarButtonText,
                  calendarType === 'lunar' && styles.calendarButtonTextActive,
                ]}
              >
                农历
              </Text>
            </TouchableOpacity>
          </View>
        </GuochaoCard>

        {/* 日期选择 */}
        <GuochaoCard title="出生信息" variant="pattern">
          <View style={styles.dateSelectors}>
            {/* 年选择 */}
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowYearPicker(true)}
            >
              <Text style={styles.dateSelectorLabel}>年</Text>
              <Text style={styles.dateSelectorValue}>{selectedYear}年</Text>
              <Text style={styles.dateSelectorZodiac}>{getZodiac(selectedYear)}肖</Text>
            </TouchableOpacity>

            {/* 月选择 */}
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowMonthPicker(true)}
            >
              <Text style={styles.dateSelectorLabel}>月</Text>
              <Text style={styles.dateSelectorValue}>{selectedMonth}月</Text>
            </TouchableOpacity>

            {/* 日选择 */}
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDayPicker(true)}
            >
              <Text style={styles.dateSelectorLabel}>日</Text>
              <Text style={styles.dateSelectorValue}>{selectedDay}日</Text>
            </TouchableOpacity>

            {/* 时选择 */}
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowHourPicker(true)}
            >
              <Text style={styles.dateSelectorLabel}>时</Text>
              <Text style={styles.dateSelectorValue}>{selectedHour.label}</Text>
            </TouchableOpacity>
          </View>
        </GuochaoCard>

        {/* 出生地 */}
        <GuochaoCard variant="elevated">
          <GuochaoInput
            label="出生地"
            value={location}
            onChangeText={setLocation}
            placeholder="请输入出生城市"
          />
        </GuochaoCard>

        {/* 真太阳时开关 */}
        <GuochaoCard variant="elevated">
          <View style={styles.solarCorrection}>
            <View style={styles.solarInfo}>
              <Text style={styles.solarTitle}>真太阳时校正</Text>
              <Text style={styles.solarDesc}>
                根据出生地经纬度自动校正时间
              </Text>
              <Text style={styles.solarHint}>
                北京地区约 -12 分钟
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.switch,
                solarCorrection && styles.switchActive,
              ]}
              onPress={() => setSolarCorrection(!solarCorrection)}
            >
              <View
                style={[
                  styles.switchKnob,
                  solarCorrection && styles.switchKnobActive,
                ]}
              />
            </TouchableOpacity>
          </View>
        </GuochaoCard>

        {/* 提交按钮 */}
        <GuochaoButton
          title="开始排盘"
          variant="primary"
          size="large"
          onPress={handleSubmit}
          style={styles.submitButton}
        />

        <View style={styles.spacer} />
      </ScrollView>

      {/* 选择器 Modals */}
      {renderPicker(
        showYearPicker,
        () => setShowYearPicker(false),
        '选择年份',
        years.reverse(),
        selectedYear,
        (item: number) => setSelectedYear(item)
      )}

      {renderPicker(
        showMonthPicker,
        () => setShowMonthPicker(false),
        '选择月份',
        months.map(m => ({ label: `${m}月`, value: m })),
        selectedMonth,
        (item: any) => setSelectedMonth(item.value)
      )}

      {renderPicker(
        showDayPicker,
        () => setShowDayPicker(false),
        '选择日期',
        days.map(d => ({ label: `${d}日`, value: d })),
        selectedDay,
        (item: any) => setSelectedDay(item.value)
      )}

      {renderPicker(
        showHourPicker,
        () => setShowHourPicker(false),
        '选择时辰',
        shichen,
        selectedHour,
        (item: any) => setSelectedHour(item)
      )}
    </SafeAreaView>
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
  
  calendarType: {
    flexDirection: 'row',
  },
  
  calendarButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  
  calendarButtonActive: {
    backgroundColor: colors.cinnabarRed,
    borderColor: colors.cinnabarRed,
  },
  
  calendarButtonText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[600],
  },
  
  calendarButtonTextActive: {
    color: colors.white,
    fontWeight: '500',
  },
  
  dateSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  dateSelector: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  
  dateSelectorLabel: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.xs,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  
  dateSelectorValue: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.lg,
    color: colors.inkBlack,
    fontWeight: '600',
  },
  
  dateSelectorZodiac: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.sm,
    color: colors.cinnabarRed,
    marginTop: spacing.xs,
  },
  
  solarCorrection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  solarInfo: {
    flex: 1,
  },
  
  solarTitle: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    fontWeight: '600',
    color: colors.inkBlack,
  },
  
  solarDesc: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  
  solarHint: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.xs,
    color: colors.cinnabarRed,
    marginTop: spacing.xs,
  },
  
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray[300],
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  
  switchActive: {
    backgroundColor: colors.cinnabarRed,
  },
  
  switchKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
  },
  
  switchKnobActive: {
    alignSelf: 'flex-end',
  },
  
  submitButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  
  spacer: {
    height: spacing['6xl'],
  },
  
  // Modal 样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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

export default BaZiInputScreen;
