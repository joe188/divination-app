/**
 * BaZiInputScreen - 八字排盘（国潮美化版）
 * 功能：选择出生年月日时、真太阳时校正、手机定位、本地/AI 解析
 */

import React, { useState, useRef } from 'react';
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
  TextInput,
} from 'react-native';
import theme from '../styles/theme';
import { calculateBaZi, adjustSolarTime, BaZiResult } from '../utils/bazi-calculator';
import { CITY_COORDINATES, getCoordinate } from '../data/city-coordinates-full';
import { solarToLunar, getGanZhiYear, getZodiac } from '../utils/lunar-calendar';

const { colors, fonts, spacing, radii } = theme;

// 小时名称（12 时辰）
const HOUR_NAMES = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];
const HOUR_TIME = ['23-01', '01-03', '03-05', '05-07', '07-09', '09-11', '11-13', '13-15', '15-17', '17-19', '19-21', '21-23'];

// 时辰索引 → 实际小时（用于计算）
const INDEX_TO_HOUR = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];

// 实际小时 → 时辰索引
const HOUR_TO_INDEX: Record<number, number> = {
  23:0, 0:0, 1:1, 2:1, 3:2, 4:2, 5:3, 6:3, 7:4, 8:4, 9:5, 10:5,
  11:6, 12:6, 13:7, 14:7, 15:8, 16:8, 17:9, 18:9, 19:10, 20:10, 21:11, 22:11
};

// 年份范围（1900-2100，共 201 年）
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const YEAR_RANGE = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);
const MONTH_RANGE = Array.from({ length: 12 }, (_, i) => i + 1);
const DAY_RANGE = Array.from({ length: 31 }, (_, i) => i + 1);

export const BaZiInputScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(0);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [solarTimeInfo, setSolarTimeInfo] = useState('');
  const [isLunar, setIsLunar] = useState(false); // 是否农历
  const [citySearchText, setCitySearchText] = useState(''); // 城市搜索关键字
  
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  /**
   * 获取农历月份名称
   */
  const getLunarMonthName = (month: number): string => {
    const months = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
    return months[month - 1] || '';
  };

  /**
   * 获取农历日期名称
   */
  const getLunarDayName = (day: number): string => {
    const days = [
      '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];
    return days[(day - 1) % 30] || '';
  };

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
      
      // 检查是否有定位权限
      let hasPermission = false;
      try {
        const result = await geolocation.requestAuthorization('whenInUse');
        hasPermission = result === 'granted';
      } catch (e) {
        console.log('📍 requestAuthorization not available, trying to get position directly');
        hasPermission = true; // 尝试直接获取位置
      }
      
      console.log('📍 定位权限:', hasPermission);
      
      geolocation.getCurrentPosition(
        (position: any) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 定位成功:', { latitude, longitude });
          setLongitude(longitude);
          
          // 查找最近城市
          const nearest = CITY_COORDINATES.find((c: any) => 
            Math.abs(c.latitude - latitude) < 1 && Math.abs(c.longitude - longitude) < 1
          );
          
          if (nearest) {
            setLocationName(`${nearest.province} ${nearest.city} ${nearest.district}`);
            setLongitude(nearest.longitude);
            Alert.alert('✅ 定位成功', `当前位置：${nearest.province} ${nearest.city} ${nearest.district}\n经度：${nearest.longitude.toFixed(2)}° 纬度：${nearest.latitude.toFixed(2)}°`);
          } else {
            setLocationName(`自定义地点 (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
            Alert.alert('✅ 定位成功', `经度：${longitude.toFixed(2)}° 纬度：${latitude.toFixed(2)}°\n未找到对应城市，请手动选择`);
          }
          setLoading(false);
        },
        (error: any) => {
          console.error('📍 定位失败:', error);
          Alert.alert('❌ 定位失败', `错误：${error.message}\n请手动选择城市`);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (error: any) {
      console.error('📍 定位错误:', error);
      Alert.alert('❌ 错误', `定位功能不可用：${error.message}`);
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

    // 当前选择的实际小时
    const currentHour = INDEX_TO_HOUR[hour];
    const localTime = currentHour + 0.5; // 该时辰中点
    const adjustedHour: number = adjustSolarTime(longitude, localTime);
    const timeDiff = (longitude - 120) * 4; // 分钟

    // 计算校正后的时辰索引（取整并用模处理跨天）
    const rounded = Math.round(adjustedHour) % 24;
    const adjustedIndex = HOUR_TO_INDEX[rounded] ?? hour;
    setHour(adjustedIndex);

    setSolarTimeInfo(
      `出生地经度：${longitude}°\n` +
      `与东经 120°时差：${timeDiff > 0 ? '+' : ''}${timeDiff.toFixed(1)}分钟\n` +
      `真太阳时：${HOUR_NAMES[adjustedIndex]} (${adjustedHour.toFixed(1)}时)`
    );

    Alert.alert('✅ 校正完成', `真太阳时已调整为${HOUR_NAMES[adjustedIndex]}`);
  };

  /**
   * 开始排盘
   */
  const handleDivination = async () => {
    setLoading(true);
    try {
      // 将时辰索引转换为实际小时
      const actualHour = INDEX_TO_HOUR[hour];
      const result: BaZiResult = calculateBaZi(year, month, day, actualHour, isLunar);
      
      // 调试日志
      console.log('🔍 calculateBaZi result:', JSON.stringify(result, null, 2));
      console.log('🔍 result.ganZhi:', JSON.stringify(result.ganZhi, null, 2));
      
      navigation.navigate('Result', {
        type: 'bazi',
        result: {
          ...result,
          year,
          month,
          day,
          hour,
          hourLabel: HOUR_NAMES[hour],
          location: locationName,
          calendarType: isLunar ? 'lunar' : 'solar',
          solarCorrection: !!longitude,
        },
      });
    } catch (error: any) {
      console.error('❌ calculateBaZi error:', error);
      Alert.alert('❌ 错误', `排盘失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 渲染时辰选择器（显示时间范围）
  const renderHourPicker = () => (
    <Modal visible={showHourPicker} transparent animationType="slide" onRequestClose={() => setShowHourPicker(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowHourPicker(false)}>
              <Text style={styles.modalButton}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>选择时辰</Text>
            <TouchableOpacity onPress={() => setShowHourPicker(false)}>
              <Text style={[styles.modalButton, styles.modalConfirm]}>确定</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={HOUR_NAMES.map((name, index) => ({ name, time: HOUR_TIME[index], index }))}
            keyExtractor={(item) => item.index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  item.index === hour && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  setHour(item.index);
                  setShowHourPicker(false);
                }}
              >
                <View style={styles.hourItemContent}>
                  <Text style={[
                    styles.pickerItemText,
                    item.index === hour && styles.pickerItemTextSelected,
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={styles.hourTimeText}>
                    {item.time}时
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            getItemLayout={(data, index) => ({
              length: 60,
              offset: 60 * index,
              index,
            })}
          />
        </View>
      </View>
    </Modal>
  );
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
          />
        </View>
      </View>
    </Modal>
  );

  // 渲染城市选择器（带搜索功能）
  const renderCityPicker = () => {
    const filteredCities = CITY_COORDINATES
      .map((c: any) => `${c.province} ${c.city} ${c.district}`)
      .filter((name: string) => 
        citySearchText === '' || name.toLowerCase().includes(citySearchText.toLowerCase())
      );
    
    return (
      <Modal visible={showLocationPicker} transparent animationType="slide" onRequestClose={() => setShowLocationPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                setShowLocationPicker(false);
                setCitySearchText('');
              }}>
                <Text style={styles.modalButton}>取消</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>选择城市</Text>
              <TouchableOpacity onPress={() => {
                setShowLocationPicker(false);
                setCitySearchText('');
              }}>
                <Text style={[styles.modalButton, styles.modalConfirm]}>确定</Text>
              </TouchableOpacity>
            </View>
            {/* 搜索输入框 */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="输入城市名称搜索..."
                value={citySearchText}
                onChangeText={setCitySearchText}
                clearButtonMode="while-editing"
              />
            </View>
            {/* 城市列表 */}
            <FlatList
              data={filteredCities}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => {
                const coord = CITY_COORDINATES.find((c: any) => 
                  `${c.province} ${c.city} ${c.district}` === item
                );
                return (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      item === locationName && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      setLocationName(item);
                      if (coord) {
                        setLongitude(coord.longitude);
                      }
                      setShowLocationPicker(false);
                      setCitySearchText('');
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      item === locationName && styles.pickerItemTextSelected,
                    ]}>
                      {item}
                    </Text>
                    {coord && (
                      <Text style={styles.pickerItemSubtext}>
                        经度: {coord.longitude.toFixed(2)}° 纬度: {coord.latitude.toFixed(2)}°
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              getItemLayout={(data, index) => ({
                length: 60,
                offset: 60 * index,
                index,
              })}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>未找到匹配的城市</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    );
  };

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[{ opacity: fadeAnim }]}>
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

            <Text style={styles.timeDetail}>{HOUR_TIME[hour]} ({INDEX_TO_HOUR[hour]}时)</Text>
            
            {/* 农历切换 */}
            <View style={styles.lunarToggle}>
              <TouchableOpacity
                style={[styles.toggleButton, !isLunar && styles.toggleButtonActive]}
                onPress={() => setIsLunar(false)}
              >
                <Text style={[styles.toggleText, !isLunar && styles.toggleTextActive]}>公历</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, isLunar && styles.toggleButtonActive]}
                onPress={() => setIsLunar(true)}
              >
                <Text style={[styles.toggleText, isLunar && styles.toggleTextActive]}>农历</Text>
              </TouchableOpacity>
            </View>
            
            {/* 农历信息显示 */}
            {isLunar && (
              <View style={styles.lunarInfo}>
                <Text style={styles.lunarText}>
                  农历：{year}年 {getLunarMonthName(Math.max(1, Math.min(12, month)))}月 {getLunarDayName(Math.max(1, Math.min(31, day)))}
                </Text>
              </View>
            )}
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
        </Animated.View>
      </ScrollView>

      {/* 选择器 */}
      {renderPicker(YEAR_RANGE, year, setYear, showYearPicker, () => setShowYearPicker(false))}
      {renderPicker(MONTH_RANGE, month, setMonth, showMonthPicker, () => setShowMonthPicker(false))}
      {renderPicker(DAY_RANGE, day, setDay, showDayPicker, () => setShowDayPicker(false))}
      {renderHourPicker()}
      {renderPicker(
        CITY_COORDINATES.map((c: any) => `${c.province} ${c.city} ${c.district}`),
        locationName,
        (fullName: string) => {
          setLocationName(fullName);
          // 从完整名称中提取城市名称，查找坐标
          const parts = fullName.split(' ');
          const district = parts[2] || parts[1] || parts[0];
          const coord = CITY_COORDINATES.find((c: any) => c.district === district || c.city === district);
          if (coord) {
            setLongitude(coord.longitude);
          }
          setShowLocationPicker(false);
        },
        showLocationPicker,
        () => setShowLocationPicker(false)
      )}
      {/* 城市选择器（带搜索功能） */}
      {renderCityPicker()}
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
  lunarToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  toggleButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  toggleButtonActive: {
    backgroundColor: colors.cinnabarRed,
    borderColor: colors.cinnabarRed,
  },
  toggleText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
    fontWeight: fonts.weights.medium,
  },
  toggleTextActive: {
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  lunarInfo: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.riceWhite,
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.cinnabarRed,
  },
  lunarText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontSize: fonts.sizes.md,
    backgroundColor: colors.white,
  },
  pickerItemSubtext: {
    fontSize: fonts.sizes.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fonts.sizes.md,
    color: colors.gray[400],
  },
  hourItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hourTimeText: {
    fontSize: fonts.sizes.sm,
    color: colors.gray[500],
  },
});

export default BaZiInputScreen;
