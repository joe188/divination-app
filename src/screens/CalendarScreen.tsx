/**
 * CalendarScreen - 万年历
 * 每个日期下方显示农历（使用缓存避免渲染时调用 lunar-typescript）
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { solarToLunar } from '../utils/lunar-calendar';

const { width } = Dimensions.get('window');
// calendarContainer 左右 margin 各 16，内部无额外 padding
const CALENDAR_WIDTH = width - 32; // 容器宽度
const DAY_WIDTH = CALENDAR_WIDTH / 7; // 每个单元格宽度

interface DayData {
  date: number;
  dateStr: string;
  isToday: boolean;
  isSelected: boolean;
  lunarText?: string;
  isJieQi?: boolean;
}

export default function CalendarScreen() {
  const navigation = useNavigation();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedLunar, setSelectedLunar] = useState<any>(null);
  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  // 当月份变化时，预先计算所有日期的农历
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        const firstDay = new Date(currentYear, currentMonth - 1, 1);
        const lastDay = new Date(currentYear, currentMonth, 0);
        const startDayOfWeek = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const days: DayData[] = [];
        
        for (let i = 0; i < startDayOfWeek; i++) {
          days.push({ date: 0, dateStr: '', isToday: false, isSelected: false });
        }
        
        for (let day = 1; day <= totalDays; day++) {
          const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          
          const lunarInfo = solarToLunar(currentYear, currentMonth, day);
          let lunarText = lunarInfo.lunarDayName;
          let isJieQi = false;
          
          if (lunarInfo.jieQi) {
            lunarText = lunarInfo.jieQi;
            isJieQi = true;
          } else if (lunarInfo.festivals && lunarInfo.festivals.length > 0) {
            lunarText = lunarInfo.festivals[0];
          } else if (lunarInfo.lunarDay === 1) {
            lunarText = lunarInfo.lunarMonthName + '月';
          }
          
          days.push({ date: day, dateStr, isToday, isSelected, lunarText, isJieQi });
        }
        
        setCalendarDays(days);
        setLoading(false);
      } catch (e) {
        console.error('[Calendar] 计算农历失败:', e);
        setLoading(false);
      }
    }, 10);
  }, [currentYear, currentMonth, selectedDate, todayStr]);

  // 当选中日期变化时，更新详情
  useEffect(() => {
    if (!selectedDate) return;
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const lunarInfo = solarToLunar(year, month, day);
      setSelectedLunar(lunarInfo);
    } catch (e) {
      console.error('[Calendar] 详情农历计算错误:', e);
      setSelectedLunar(null);
    }
  }, [selectedDate]);

  const prevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(currentYear - 1); }
    else { setCurrentMonth(currentMonth - 1); }
  };

  const nextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(currentYear + 1); }
    else { setCurrentMonth(currentMonth + 1); }
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  // 选择年份
  const selectYear = (year: number) => {
    setCurrentYear(year);
    setShowYearSelector(false);
  };

  // 选择月份
  const selectMonth = (month: number) => {
    setCurrentMonth(month);
    setShowMonthSelector(false);
  };

  return (
    <View style={styles.container}>
      {/* 顶部导航栏 - 年/月选择按钮 */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        
        {/* 年份按钮 */}
        <TouchableOpacity onPress={() => setShowYearSelector(true)} style={styles.yearMonthButton}>
          <Text style={styles.yearMonthButtonText}>{currentYear}年</Text>
        </TouchableOpacity>
        
        {/* 月份按钮 */}
        <TouchableOpacity onPress={() => setShowMonthSelector(true)} style={styles.yearMonthButton}>
          <Text style={styles.yearMonthButtonText}>{monthNames[currentMonth - 1]}</Text>
        </TouchableOpacity>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 日历主体（星期 + 日期网格，一个整体） */}
        <View style={styles.calendarContainer}>
          {/* 星期行 */}
          <View style={styles.weekRow}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekCell}>
                <Text style={[styles.weekText, (index === 0 || index === 6) && styles.weekendText]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* 日期网格 */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2196f3" />
            </View>
          ) : (
            <View style={styles.daysGrid}>
              {calendarDays.map((item, index) => {
                if (item.date === 0) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }
                const { date, dateStr, isToday, isSelected, lunarText, isJieQi } = item;
                return (
                  <TouchableOpacity
                    key={dateStr}
                    style={[styles.dayCell, isSelected && styles.selectedDay]}
                    onPress={() => setSelectedDate(dateStr)}
                  >
                    <Text style={[styles.dayNumber, isToday && styles.todayNumber, isSelected && styles.selectedNumber]}>
                      {date}
                    </Text>
                    {lunarText ? (
                      <Text
                        style={[
                          styles.cellLunarText,
                          isJieQi && styles.cellJieQiText,
                          isToday && styles.cellTodayLunar,
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {lunarText}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* 详情卡片 */}
        <View style={styles.detailCard}>
          {selectedLunar ? (
            <>
              {/* 标题：公历日期 */}
              <Text style={styles.detailTitle}>
                {selectedDate.split('-')[0]}年{parseInt(selectedDate.split('-')[1])}月{parseInt(selectedDate.split('-')[2])}日
              </Text>
              
              {/* 农历日期 + 生肖 */}
              <Text style={styles.lunarDate}>
                {selectedLunar.lunarMonthName}{selectedLunar.lunarDayName}  {selectedLunar.zodiac}年
              </Text>
              
              {/* 干支纪年 */}
              <Text style={styles.ganZhiText}>
                {selectedLunar.ganZhiYear}年 {selectedLunar.ganZhiMonth}月 {selectedLunar.ganZhiDay}日
              </Text>

              {/* 分割线 */}
              <View style={styles.divider} />

              {/* 宜 */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabelGreen}>宜</Text>
                <Text style={styles.detailValueGreen}>{selectedLunar.yi || '无'}</Text>
              </View>
              
              {/* 忌 */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabelRed}>忌</Text>
                <Text style={styles.detailValueRed}>{selectedLunar.ji || '无'}</Text>
              </View>

              {/* 分割线 */}
              <View style={styles.divider} />

              {/* 吉神宜趋 */}
              {selectedLunar.jishen ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>吉神</Text>
                  <Text style={styles.detailValue}>{selectedLunar.jishen}</Text>
                </View>
              ) : null}

              {/* 凶煞宜忌 */}
              {selectedLunar.xiongsha ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>凶煞</Text>
                  <Text style={styles.detailValue}>{selectedLunar.xiongsha}</Text>
                </View>
              ) : null}

              {/* 冲煞 */}
              {selectedLunar.chongsha ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>冲煞</Text>
                  <Text style={styles.detailValue}>{selectedLunar.chongsha}</Text>
                </View>
              ) : null}

              {/* 节气 */}
              {selectedLunar.jieQi ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>节气</Text>
                  <Text style={[styles.detailValue, { color: '#ff9800', fontWeight: '500' }]}>{selectedLunar.jieQi}</Text>
                </View>
              ) : null}

              {/* 节日 */}
              {selectedLunar.festivals && selectedLunar.festivals.length > 0 ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>节日</Text>
                  <Text style={[styles.detailValue, { color: '#e53935', fontWeight: '500' }]}>{selectedLunar.festivals.join(', ')}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <ActivityIndicator size="small" color="#2196f3" />
          )}
        </View>

        {/* 年份选择器弹窗 - 平铺网格可滚动 */}
        {showYearSelector && (
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>选择年份</Text>
              <ScrollView 
                style={{ maxHeight: 350 }}
                contentContainerStyle={{ paddingBottom: 8 }}
                showsVerticalScrollIndicator
              >
                <View style={styles.pickerGrid}>
                  {Array.from({ length: 101 }, (_, i) => 1950 + i).map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerGridItem,
                        year === currentYear && styles.pickerGridItemSelected,
                      ]}
                      onPress={() => selectYear(year)}
                    >
                      <Text
                        style={[
                          styles.pickerGridItemText,
                          year === currentYear && styles.pickerGridItemTextSelected,
                        ]}
                      >
                        {year}年
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TouchableOpacity onPress={() => setShowYearSelector(false)} style={styles.pickerClose}>
                <Text style={styles.pickerCloseText}>关闭</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 月份选择器弹窗 - 平铺网格 */}
        {showMonthSelector && (
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>选择月份</Text>
              <View style={styles.pickerGrid}>
                {monthNames.map((name, index) => (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.pickerGridItem,
                      (index + 1) === currentMonth && styles.pickerGridItemSelected,
                    ]}
                    onPress={() => selectMonth(index + 1)}
                  >
                    <Text
                      style={[
                        styles.pickerGridItemText,
                        (index + 1) === currentMonth && styles.pickerGridItemTextSelected,
                      ]}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={() => setShowMonthSelector(false)} style={styles.pickerClose}>
                <Text style={styles.pickerCloseText}>关闭</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#faf8f5', borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 24, color: '#333' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  // 日历容器（星期 + 日期网格，一个整体）
  calendarContainer: {
    backgroundColor: '#fff',
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  // 星期行
  weekRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: '#fafafa',
  },
  weekCell: {
    width: DAY_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekText: { fontSize: 12, color: '#999', fontWeight: '600' },
  weekendText: { color: '#e53935' },

  // 日期网格
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: CALENDAR_WIDTH,
  },
  dayCell: {
    width: DAY_WIDTH,
    height: DAY_WIDTH * 1.1, // 紧凑行距
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: { fontSize: 15, fontWeight: '500', color: '#333' },
  todayNumber: { color: '#2196f3', fontWeight: 'bold' },
  selectedNumber: { color: '#fff' },
  selectedDay: { backgroundColor: '#2196f3', borderRadius: 18 },
  // 日期格子内的农历文字
  cellLunarText: { fontSize: 9, color: '#bbb', marginTop: 1 },
  cellJieQiText: { fontSize: 9, color: '#ff9800', fontWeight: '500' },
  cellTodayLunar: { color: '#2196f3' },

  loadingContainer: { padding: 20, alignItems: 'center' },

  // 详情卡片
  detailCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  detailTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  lunarDate: { fontSize: 15, color: '#c62828', textAlign: 'center', marginTop: 6, fontWeight: '600' },
  ganZhiText: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#eee', marginVertical: 10 },
  detailRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  detailLabel: { fontSize: 13, color: '#999', width: 65, fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#333', flex: 1, textAlign: 'left' },
  detailLabelGreen: { fontSize: 13, color: '#2e7d32', width: 65, fontWeight: 'bold' },
  detailValueGreen: { fontSize: 13, color: '#2e7d32', flex: 1, fontWeight: '500' },
  detailLabelRed: { fontSize: 13, color: '#c62828', width: 65, fontWeight: 'bold' },
  detailValueRed: { fontSize: 13, color: '#c62828', flex: 1, fontWeight: '500' },
  // 年份/月份按钮
  yearMonthButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 80,
    alignItems: 'center',
  },
  yearMonthButtonText: { fontSize: 16, fontWeight: '500', color: '#333' },
  // 选择器弹窗（平铺网格）
  pickerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  },
  pickerContainer: {
    backgroundColor: '#fff', borderRadius: 16, width: 320, maxHeight: 450,
    overflow: 'hidden', padding: 16,
  },
  pickerTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center',
    marginBottom: 16,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pickerGridItem: {
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
  },
  pickerGridItemSelected: { backgroundColor: '#e3f2fd' },
  pickerGridItemText: { fontSize: 15, color: '#333' },
  pickerGridItemTextSelected: { fontSize: 15, color: '#1976d2', fontWeight: 'bold' },
  pickerClose: {
    marginTop: 8,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  pickerCloseText: { fontSize: 16, color: '#666', textAlign: 'center' },
});
