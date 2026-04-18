/**
 * BaZiInputScreen - 八字排盘（国潮美化版）
 * 功能：选择出生年月日时、真太阳时校正、手机定位、本地/AI 解析
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
  Animated,
} from 'react-native';
import theme from '../styles/theme';
import { calculateBaZi, adjustSolarTime, BaZiResult } from '../utils/bazi-calculator';
import { getCities, getCoordinate } from '../data/city-coordinates-full';

const { colors, fonts, spacing, radii } = theme;

// 小时名称（12 时辰）
const HOUR_NAMES = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];
const HOUR_TIME = ['23-01', '01-03', '03-05', '05-07', '07-09', '09-11', '11-13', '13-15', '15-17', '17-19', '19-21', '21-23'];

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
  
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  /**
   * 获取当前位置
   */
  const handleGetLocation = async () => {
    setLoading(true);
    try {
      const geolocation = require('react-native-geolocation-service');
      
      await geolocation.requestAuthorization('whenInUse');
      
      geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLongitude(longitude);
          
          // 查找最近城市
          const cities = getCities();
          const nearest = cities.find(c => 
            Math.abs(c.latitude - latitude) < 1 && Math.abs(c.longitude - longitude) < 1
          );
          
          if (nearest) {
            setLocationName(nearest.city);
            setLongitude(nearest.longitude);
            Alert.alert('✅ 定位成功', `当前位置：${nearest.city}\n经度：${nearest.longitude}°`);
          } else {
            setLocationName(`自定义地点 (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
            Alert.alert('✅ 定位成功', `获取到坐标，但未找到对应城市`);
          }
          setLoading(false);
        },
        (error) => {
          Alert.alert('❌ 定位失败', '无法获取当前位置，请手动选择城市');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (error) {
      Alert.alert('❌ 错误', '定位功能不可用');
      setLoading(false);
    }
  };

  /**
   * 真太阳时校正
   */
  const handleSolarTimeAdjust = () => {
    if (!longitude) {
      Alert.alert('⚠️ 提示', '请先设置出生地点或经度');
      return;
    }

    const adjusted = adjustSolarTime(year, month, day, hour, longitude);
    const timeDiff = (longitude - 120) * 4; // 分钟
    
    setSolarTimeInfo(
      `出生地经度：${longitude}°\n` +
      `与东经 120°时差：${timeDiff > 0 ? '+' : ''}${timeDiff.toFixed(1)}分钟\n` +
      `真太阳时：${adjusted.hour}时 (${HOUR_NAMES[adjusted.hour]})`
    );
    setHour(adjusted.hour);
    
    Alert.alert('✅ 校正完成', `真太阳时已调整为${HOUR_NAMES[adjusted.hour]}`);
  };

  /**
   * 开始排盘
   */
  const handleDivination = async () => {
    setLoading(true);
    try {
      const result: BaZiResult = calculateBaZi(year, month, day, hour);
      
      navigation.navigate('Result', {
        type: 'bazi',
        result: {
          ...result,
          year,
          month,
          day,
          hour,
          location: locationName,
        },
      });
    } catch (error: any) {
      Alert.alert('❌ 错误', `排盘失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 渲染选择器
  const renderPicker = (items: any[], value: any, onChange: (item: any) => void, visible: boolean, onClose: () => void) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalButton}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>请选择</Text>
            <TouchableOpacity onPress={() => onClose()}>
              <Text style={[styles.modalButton, styles.modalConfirm]}>确定</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={items}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  item === value && styles.pickerItemSelected,
                ]}
                onPress={() => onChange(item)}
              >
                <Text style={[
                  styles.pickerItemText,
                  item === value && styles.pickerItemTextSelected,
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            getItemLayout={(data, index) => ({
              length: 50,
              offset: 50 * index,
              index,
            })}
            initialScrollIndex={items.indexOf(value)}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>八字排盘</Text>
        <Text style={styles.headerSubtitle}>四柱命理 · 推算人生</Text>
        <View style={styles.baguaDecor}>
          <Text style={styles.baguaSymbol}>乾</Text>
          <Text style={styles.baguaSymbol}>坤</Text>
          <Text style={styles.baguaSymbol}>震</Text>
          <Text style={styles.baguaSymbol}>巽</Text>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 日期选择卡片 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📅 出生时间</Text>
            
            <View style={styles.dateGrid}>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowYearPicker(true)}>
                <Text style={styles.dateLabel}>年</Text>
                <Text style={styles.dateValue}>{year}年</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowMonthPicker(true)}>
                <Text style={styles.dateLabel}>月</Text>
                <Text style={styles.dateValue}>{month}月</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDayPicker(true)}>
                <Text style={styles.dateLabel}>日</Text>
                <Text style={styles.dateValue}>{day}日</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowHourPicker(true)}>
                <Text style={styles.dateLabel}>时</Text>
                <Text style={styles.dateValue}>{HOUR_NAMES[hour]}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.timeDetail}>{HOUR_TIME[hour]} ({hour}时)</Text>
          </View>

          {/* 地点选择卡片 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📍 出生地点</Text>
            
            <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.cinnabarRed} />
              ) : (
                <Text style={styles.locationButtonText}>📍 获取当前位置</Text>
              )}
            </TouchableOpacity>

            {locationName ? (
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>已选择：</Text>
                <Text style={styles.locationValue}>{locationName}</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.manualLocationButton}
                onPress={() => setShowLocationPicker(true)}
              >
                <Text style={styles.manualLocationText}>🏙️ 手动选择城市</Text>
              </TouchableOpacity>
            )}

            {longitude && (
              <Text style={styles.longitudeText}>经度：{longitude}°</Text>
            )}
          </View>

          {/* 真太阳时卡片 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>☀️ 真太阳时校正</Text>
            <Text style={styles.cardDesc}>根据出生地经度校正时间</Text>
            
            <TouchableOpacity 
              style={[
                styles.solarButton,
                !longitude && styles.solarButtonDisabled,
              ]}
              onPress={handleSolarTimeAdjust}
              disabled={!longitude}
            >
              <Text style={styles.solarButtonText}>🔄 校正真太阳时</Text>
            </TouchableOpacity>

            {solarTimeInfo && (
              <View style={styles.solarInfo}>
                <Text style={styles.solarInfoText}>{solarTimeInfo}</Text>
              </View>
            )}
          </View>

          {/* 开始排盘按钮 */}
          <TouchableOpacity
            style={[
              styles.divinationButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleDivination}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.divinationButtonText}>🔮 开始排盘</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* 选择器 */}
      {renderPicker(YEAR_RANGE, year, setYear, showYearPicker, () => setShowYearPicker(false))}
      {renderPicker(MONTH_RANGE, month, setMonth, showMonthPicker, () => setShowMonthPicker(false))}
      {renderPicker(DAY_RANGE, day, setDay, showDayPicker, () => setShowDayPicker(false))}
      {renderPicker(HOUR_NAMES.map((_, i) => i), hour, setHour, showHourPicker, () => setShowHourPicker(false))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
  header: {
    backgroundColor: colors.cinnabarRed,
    padding: spacing['2xl'],
    alignItems: 'center',
    borderBottomLeftRadius: radii['3xl'],
    borderBottomRightRadius: radii['3xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: fonts.sizes['3xl'],
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  baguaDecor: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  baguaSymbol: {
    fontSize: 20,
    color: colors.gold,
    marginHorizontal: spacing.md,
    fontFamily: fonts.kaiTi,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.lg,
  },
  cardDesc: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  dateGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.riceWhite,
    padding: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  dateLabel: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  dateValue: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
  },
  timeDetail: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
    textAlign: 'center',
  },
  locationButton: {
    backgroundColor: colors.cinnabarRed,
    padding: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  locationButtonText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.semibold,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.riceWhite,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  locationLabel: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
  },
  locationValue: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
  },
  manualLocationButton: {
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: radii.md,
    borderStyle: 'dashed',
  },
  manualLocationText: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
  },
  longitudeText: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
    textAlign: 'center',
  },
  solarButton: {
    backgroundColor: colors.gold,
    padding: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  solarButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  solarButtonText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
  },
  solarInfo: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.riceWhite,
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
  },
  solarInfoText: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.inkBlack,
    lineHeight: 20,
  },
  divinationButton: {
    backgroundColor: colors.cinnabarRed,
    padding: spacing.xl,
    borderRadius: radii.xl,
    alignItems: 'center',
    marginTop: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[300],
  },
  divinationButtonText: {
    fontSize: fonts.sizes.xl,
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalButton: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.sourceHan,
    color: colors.cinnabarRed,
  },
  modalConfirm: {
    fontWeight: fonts.weights.semibold,
  },
  modalTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
  },
  pickerItem: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  pickerItemSelected: {
    backgroundColor: colors.riceWhite,
  },
  pickerItemText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.sourceHan,
    color: colors.inkBlack,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: colors.cinnabarRed,
    fontWeight: fonts.weights.bold,
  },
});

export default BaZiInputScreen;
