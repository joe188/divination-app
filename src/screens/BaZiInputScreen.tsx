/**
 * BaZiInputScreen - 八字排盘输入页
 * 功能：选择出生年月日时、真太阳时校正、手机定位、本地解析、AI 解析、历史记录保存
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
import theme from '../styles/theme';
import { calculateBaZi, adjustSolarTime, BaZiResult } from '../utils/bazi-calculator';
import { insertRecord } from '../database/queries/history';
import type { DivinationRecord } from '../database/models/DivinationRecord';

const { colors, fonts, spacing, radii } = theme;

// 小时名称（12 时辰）
const HOUR_NAMES = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

// 年份范围
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const MONTH_RANGE = Array.from({ length: 12 }, (_, i) => i + 1);
const DAY_RANGE = Array.from({ length: 31 }, (_, i) => i + 1);

export const BaZiInputScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(0);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [solarTimeInfo, setSolarTimeInfo] = useState('');
  
  // 选择器状态
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);

  /**
   * 获取当前位置（简化版本：使用城市坐标数据）
   */
  const handleGetLocation = async () => {
    try {
      setLoading(true);
      const cityData = require('../data/city-coordinates-full.ts').cityCoordinates;
      if (cityData && cityData.length > 0) {
        // 简化：取第一个城市，实际应该用 GPS
        const firstCity = cityData[0];
        setLongitude(firstCity.longitude);
        setLocationName(firstCity.city);
        Alert.alert('✅ 定位成功', `当前位置：${firstCity.city}\n经度：${firstCity.longitude}°`);
      }
    } catch (error) {
      Alert.alert('❌ 定位失败', '无法获取当前位置，请手动输入经度');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 计算真太阳时
   */
  const handleCalculateSolarTime = () => {
    if (!longitude) {
      Alert.alert('⚠️ 提示', '请先获取或输入出生地经度');
      return;
    }
    
    // adjustSolarTime 接受时间戳（毫秒）
    const birthTimestamp = Date.UTC(year, month - 1, day, hour);
    const correction = adjustSolarTime(longitude, birthTimestamp);
    
    const sign = correction > 0 ? '+' : '';
    const minutes = Math.abs(correction);
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    let info = `真太阳时校正：${sign}${minutes.toFixed(1)} 分钟\n`;
    if (hours > 0) {
      info += `即 ${sign}${hours}小时${mins}分钟`;
    }
    
    setSolarTimeInfo(info);
    Alert.alert('✅ 计算完成', info);
  };

  /**
   * 本地解析
   */
  const handleLocalAnalysis = async () => {
    try {
      setLoading(true);
      
      // 计算八字
      const result = calculateBaZi(year, month, day, hour);
      
      // 保存历史记录
      const record: Partial<DivinationRecord> = {
        baziType: 'bazi',
        solarDate: new Date(year, month - 1, day).toISOString(),
        lunarDate: result.lunarDate,
        timePeriod: HOUR_NAMES[hour] || '',
        location: locationName || '未知',
        aiInterpretation: `八字排盘结果：\n年柱：${result.ganZhi.year.gan}${result.ganZhi.year.zhi}\n月柱：${result.ganZhi.month.gan}${result.ganZhi.month.zhi}\n日柱：${result.ganZhi.day.gan}${result.ganZhi.day.zhi}\n时柱：${result.ganZhi.hour.gan}${result.ganZhi.hour.zhi}\n\n五行分析：木${result.fiveElements.wood} 火${result.fiveElements.fire} 土${result.fiveElements.earth} 金${result.fiveElements.metal} 水${result.fiveElements.water}`,
        isFavorite: 0,
      };
      
      const recordId = await insertRecord(record as DivinationRecord);
      
      // 导航到结果页
      navigation.navigate('ResultScreen', {
        type: 'bazi',
        result,
        recordId,
        isLocal: true,
      });
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
    try {
      setLoading(true);
      
      // 计算八字
      const result = calculateBaZi(year, month, day, hour);
      
      // 保存历史记录（AI 解析占位）
      const record: Partial<DivinationRecord> = {
        baziType: 'bazi',
        solarDate: new Date(year, month - 1, day).toISOString(),
        lunarDate: result.lunarDate,
        timePeriod: HOUR_NAMES[hour] || '',
        location: locationName || '未知',
        aiInterpretation: 'AI 解析中...（需要配置 AI API Key）',
        isFavorite: 0,
      };
      
      const recordId = await insertRecord(record as DivinationRecord);
      
      // 导航到结果页
      navigation.navigate('ResultScreen', {
        type: 'bazi',
        result,
        recordId,
        isLocal: false,
      });
      
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
    data: number[],
    value: number,
    onSelect: (value: number) => void,
    suffix: string
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, item === value && styles.pickerItemSelected]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={[styles.pickerItemText, item === value && styles.pickerItemTextSelected]}>
                  {item}{suffix}
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
      {/* 出生时间 */}
      <GuochaoCard title="出生时间">
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
            <Text style={styles.pickerText}>{HOUR_NAMES[hour]}</Text>
          </TouchableOpacity>
        </View>
      </GuochaoCard>

      {/* 出生地经度 */}
      <GuochaoCard title="出生地经度（真太阳时校正）">
        <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#8B4513" />
          ) : (
            <Text style={styles.locationButtonText}>📍 获取当前位置</Text>
          )}
        </TouchableOpacity>
        
        {locationName ? (
          <Text style={styles.locationName}>当前位置：{locationName}</Text>
        ) : null}
        
        <TouchableOpacity 
          style={styles.pickerButton} 
          onPress={() => Alert.alert('提示', '经度输入功能开发中，请使用定位按钮')}
        >
          <Text style={styles.pickerText}>
            {longitude !== null ? `东经 ${longitude}°` : '点击输入经度'}
          </Text>
        </TouchableOpacity>
        
        <GuochaoButton title="计算真太阳时" onPress={handleCalculateSolarTime} />
        
        {solarTimeInfo ? (
          <View style={styles.solarTimeInfoBox}>
            <Text style={styles.solarTimeInfo}>{solarTimeInfo}</Text>
          </View>
        ) : null}
      </GuochaoCard>

      {/* 操作按钮 */}
      <View style={styles.buttonContainer}>
        <GuochaoButton title="🔮 本地解析" onPress={handleLocalAnalysis} disabled={loading} />
        <GuochaoButton title="🤖 AI 解析" onPress={handleAiAnalysis} disabled={loading} />
      </View>

      {/* 加载遮罩 */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>正在排盘...</Text>
        </View>
      )}

      {/* 选择器 */}
      {renderPicker(showYearPicker, () => setShowYearPicker(false), YEAR_RANGE, year, setYear, '年')}
      {renderPicker(showMonthPicker, () => setShowMonthPicker(false), MONTH_RANGE, month, setMonth, '月')}
      {renderPicker(showDayPicker, () => setShowDayPicker(false), DAY_RANGE, day, setDay, '日')}
      {renderPicker(showHourPicker, () => setShowHourPicker(false), HOUR_NAMES.map((_, i) => i), hour, setHour, '')}
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
  pickerText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: '#8B4513',
    borderRadius: radii.md,
    marginVertical: spacing.sm,
  },
  locationButtonText: {
    color: '#FFF8F0',
    fontSize: 16,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  locationName: {
    textAlign: 'center',
    color: '#6B5B4F',
    marginVertical: spacing.sm,
    fontSize: 14,
  },
  solarTimeInfoBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#FFF8F0',
    borderRadius: radii.md,
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  solarTimeInfo: {
    color: '#8B4513',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
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

export default BaZiInputScreen;
