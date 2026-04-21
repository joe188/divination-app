/**
 * ResultScreen - 排盘结果页
 * 功能:展示四柱八字、五行分布、AI 解卦入口
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
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import { insertRecord, getRecord, updateRecord } from '../database/queries/history';
import { getAIInterpretation } from '../utils/ai-interpret';
import { DivinationRecord } from '../database/models/DivinationRecord';
import theme from '../styles/theme';
const { colors, fonts, spacing, radii } = theme;

// 导入 BaziData 类型定义(与 BaZiInputScreen 一致)
// 为避免循环依赖,这里重新声明
interface BaziData {
  year: number;
  month: number;
  day: number;
  hour: number;
  hourLabel: string;
  location: string;
  calendarType: 'solar' | 'lunar';
  solarCorrection: boolean;
  baziResult?: {
    solarDate: string;
    lunarDate: string;
    ganZhi: {
      year: { gan: string; zhi: string };
      month: { gan: string; zhi: string };
      day: { gan: string; zhi: string };
      hour: { gan: string; zhi: string };
    };
    fiveElements: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
    shishen: string[];
    wuxingDistribution: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
  };
}

interface ResultScreenProps {
  onBack?: () => void;
  onShare?: () => void;
  onAIInterpret?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  onBack,
  onShare,
  onAIInterpret,
}) => {
  const route = useRoute();
  const navigation = useNavigation();

  // AI 解卦结果状态（已改为数据库持久化）

  // 从 route.params 获取数据
  const routeParams = (route.params as any);

  // 调试日志
  console.log('🔍 route.params:', JSON.stringify(routeParams, null, 2));
  console.log('🔍 routeParams?.result:', JSON.stringify(routeParams?.result, null, 2));

  // BaZiInputScreen 传递的是 { type: 'bazi', result: { ...result, year, month, day, hour, location } }
  // 需要将其转换为 ResultScreen 期望的格式
  const result = routeParams?.result;

  // 安全检查:确保 result 存在且包含必要字段
  const baziData = result && result.ganZhi ? {
    year: result.year,
    month: result.month,
    day: result.day,
    hour: result.hour,
    hourLabel: result.hourLabel || `${result.hour}时`,
    location: result.location || '',
    calendarType: result.calendarType || ('solar' as const),
    solarCorrection: result.solarCorrection || false,
    baziResult: {
      solarDate: result.solarDate,
      lunarDate: result.lunarDate,
      ganZhi: result.ganZhi,
      fiveElements: result.fiveElements,
      shishen: result.shishen,
      wuxingDistribution: result.wuxingDistribution,
    },
  } : null;

  console.log('🔍 baziData:', JSON.stringify(baziData, null, 2));
  console.log('🔍 baziData?.baziResult?.ganZhi:', JSON.stringify(baziData?.baziResult?.ganZhi, null, 2));

  const [activeTab, setActiveTab] = useState<'wuxing' | 'shishen'>('wuxing');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 使用传入的 baziData 或默认空数据(必须先定义,供 useEffect 使用)
  const data = baziData?.baziResult;
  const hasData = !!data && !!data.ganZhi;

  // 计算 ganZhi(如果数据存在)
  const ganZhi = data?.ganZhi;

  // 自动保存排盘结果到数据库(并触发 AI 生成)
  useEffect(() => {
    if (hasData && !saved && !saving) {
      saveToDatabase();
    }
  }, [hasData]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, []);

  // 触发后台 AI 解读生成
  const generateAIInterpretation = async (id: number) => {
    try {
      setAiGenerating(true);
      const fourPillars = {
        year: ganZhi.year.gan + ganZhi.year.zhi,
        month: ganZhi.month.gan + ganZhi.month.zhi,
        day: ganZhi.day.gan + ganZhi.day.zhi,
        hour: ganZhi.hour.gan + ganZhi.hour.zhi,
      };
      const fiveElements = data?.fiveElements || { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
      const interpretation = await getAIInterpretation({ fourPillars, fiveElements });
      // 更新数据库
      await updateRecord(id, { aiInterpretation: interpretation });
      // 更新本地状态
      setAiInterpretation(interpretation);
      setAiGenerating(false);
    } catch (error) {
      console.error('❌ AI 生成失败:', error);
      // 即使失败也停止生成状态
      setAiGenerating(false);
    }
  };

  // 轮询等待 AI 结果(备用同步)
  const startPollingAIResult = (id: number) => {
    pollingTimerRef.current = setInterval(async () => {
      try {
        const record = await getRecord(id);
        if (record?.aiInterpretation) {
          setAiInterpretation(record.aiInterpretation);
          setAiGenerating(false);
          if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
          }
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 2000);
  };

  // 保存到数据库
  const saveToDatabase = async () => {
    if (!data || !baziData) return;

    setSaving(true);
    try {
      const record: DivinationRecord = {
        createdAt: Date.now(),
        baziType: 'bazi', // 简化处理,可根据需要扩展
        solarDate: data.solarDate,
        lunarDate: data.lunarDate,
        timePeriod: baziData.hourLabel,
        yearGanzhi: `${ganZhi.year.gan}${ganZhi.year.zhi}`,
        monthGanzhi: `${ganZhi.month.gan}${ganZhi.month.zhi}`,
        dayGanzhi: `${ganZhi.day.gan}${ganZhi.day.zhi}`,
        hourGanzhi: `${ganZhi.hour.gan}${ganZhi.hour.zhi}`,
        wuxingData: JSON.stringify(data.wuxingDistribution),
        shishenData: JSON.stringify(data.shishen),
        location: baziData.location,
        timeCorrection: baziData.solarCorrection ? 0 : undefined,
        aiInterpretation: '', // 初始为空,后台会填充
        userNotes: '',
        isFavorite: 0,
      };

      const id = await insertRecord(record);
      setRecordId(id);
      setSaved(true);
      console.log('✅ Record saved to database, ID:', id);

      // 触发后台 AI 解读生成
      generateAIInterpretation(id);

      // 开始轮询等待 AI 结果
      startPollingAIResult(id);
    } catch (error) {
      console.error('❌ Failed to save record:', error);
      Alert.alert('保存失败', '无法保存到本地数据库,请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  // 获取天干对应五行颜色
  const getGanElementColor = (gan: string) => {
    const ganElement: Record<string, string> = {
      甲: colors.wood, 乙: colors.wood,
      丙: colors.fire, 丁: colors.fire,
      戊: colors.earth, 己: colors.earth,
      庚: colors.gold, 辛: colors.gold,
      壬: colors.water, 癸: colors.water,
    };
    return ganElement[gan] || colors.inkBlack;
  };

  // 构建日期显示
  const dateDisplay = baziData?.calendarType === 'lunar'
    ? `${data?.lunarDate} ${baziData?.hourLabel}`
    : `${data?.solarDate} ${baziData?.hourLabel}`;

  // 使用上方已定义的 ganZhi(data?.ganZhi),如果 data 存在

  // AI 解卦函数
  // AI 解卦直接在本页面展示，无需单独导航

  // 如果数据不存在,显示空状态
  if (!hasData || !ganZhi) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>排盘结果</Text>
          <View style={styles.shareButton} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无排盘数据</Text>
          <GuochaoButton
            title="返回重新排盘"
            variant="primary"
            size="medium"
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 标题栏 */}
        <View style={[styles.header, { paddingTop: spacing.xl }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>排盘结果</Text>
          <TouchableOpacity onPress={onShare} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>分享</Text>
          </TouchableOpacity>
        </View>

        {/* 日期信息 */}
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>{dateDisplay}</Text>
          <Text style={styles.ganzhiText}>
            {ganZhi.year.gan}{ganZhi.year.zhi}年
            {ganZhi.month.gan}{ganZhi.month.zhi}月
            {ganZhi.day.gan}{ganZhi.day.zhi}日
            {ganZhi.hour.gan}{ganZhi.hour.zhi}时
          </Text>
        </View>

        {/* 四柱展示 */}
        <GuochaoCard title="四柱八字" variant="pattern">
          <View style={styles.sizhuContainer}>
            {/* 年柱 */}
            <View style={styles.zhuItem}>
              <Text style={styles.zhuLabel}>年柱</Text>
              <Text style={[styles.zhuGan, { color: getGanElementColor(ganZhi.year.gan) }]}>
                {ganZhi.year.gan}
              </Text>
              <Text style={[styles.zhuZhi, { color: getGanElementColor(ganZhi.year.zhi) }]}>
                {ganZhi.year.zhi}
              </Text>
              <Text style={styles.zhuElement}>
                {getGanElementColor(ganZhi.year.gan).replace('#', '') === colors.wood ? '木' :
                 getGanElementColor(ganZhi.year.gan).replace('#', '') === colors.fire ? '火' :
                 getGanElementColor(ganZhi.year.gan).replace('#', '') === colors.earth ? '土' :
                 getGanElementColor(ganZhi.year.gan).replace('#', '') === colors.gold ? '金' : '水'}
              </Text>
            </View>

            {/* 月柱 */}
            <View style={styles.zhuItem}>
              <Text style={styles.zhuLabel}>月柱</Text>
              <Text style={[styles.zhuGan, { color: getGanElementColor(ganZhi.month.gan) }]}>
                {ganZhi.month.gan}
              </Text>
              <Text style={[styles.zhuZhi, { color: getGanElementColor(ganZhi.month.zhi) }]}>
                {ganZhi.month.zhi}
              </Text>
              <Text style={styles.zhuElement}>
                {getGanElementColor(ganZhi.month.gan).replace('#', '') === colors.wood ? '木' :
                 getGanElementColor(ganZhi.month.gan).replace('#', '') === colors.fire ? '火' :
                 getGanElementColor(ganZhi.month.gan).replace('#', '') === colors.earth ? '土' :
                 getGanElementColor(ganZhi.month.gan).replace('#', '') === colors.gold ? '金' : '水'}
              </Text>
            </View>

            {/* 日柱 */}
            <View style={styles.zhuItem}>
              <Text style={styles.zhuLabel}>日柱</Text>
              <Text style={[styles.zhuGan, { color: getGanElementColor(ganZhi.day.gan) }]}>
                {ganZhi.day.gan}
              </Text>
              <Text style={[styles.zhuZhi, { color: getGanElementColor(ganZhi.day.zhi) }]}>
                {ganZhi.day.zhi}
              </Text>
              <Text style={styles.zhuElement}>
                {getGanElementColor(ganZhi.day.gan).replace('#', '') === colors.wood ? '木' :
                 getGanElementColor(ganZhi.day.gan).replace('#', '') === colors.fire ? '火' :
                 getGanElementColor(ganZhi.day.gan).replace('#', '') === colors.earth ? '土' :
                 getGanElementColor(ganZhi.day.gan).replace('#', '') === colors.gold ? '金' : '水'}
              </Text>
            </View>

            {/* 时柱 */}
            <View style={styles.zhuItem}>
              <Text style={styles.zhuLabel}>时柱</Text>
              <Text style={[styles.zhuGan, { color: getGanElementColor(ganZhi.hour.gan) }]}>
                {ganZhi.hour.gan}
              </Text>
              <Text style={[styles.zhuZhi, { color: getGanElementColor(ganZhi.hour.zhi) }]}>
                {ganZhi.hour.zhi}
              </Text>
              <Text style={styles.zhuElement}>
                {getGanElementColor(ganZhi.hour.gan).replace('#', '') === colors.wood ? '木' :
                 getGanElementColor(ganZhi.hour.gan).replace('#', '') === colors.fire ? '火' :
                 getGanElementColor(ganZhi.hour.gan).replace('#', '') === colors.earth ? '土' :
                 getGanElementColor(ganZhi.hour.gan).replace('#', '') === colors.gold ? '金' : '水'}
              </Text>
            </View>
          </View>
        </GuochaoCard>

        {/* 五行分布图 */}
        <GuochaoCard
          title="五行分布"
          variant="elevated"
          headerRight={
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'wuxing' && styles.tabActive]}
                onPress={() => setActiveTab('wuxing')}
              >
                <Text style={[styles.tabText, activeTab === 'wuxing' && styles.tabTextActive]}>
                  五行
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'shishen' && styles.tabActive]}
                onPress={() => setActiveTab('shishen')}
              >
                <Text style={[styles.tabText, activeTab === 'shishen' && styles.tabTextActive]}>
                  十神
                </Text>
              </TouchableOpacity>
            </View>
          }
        >
          {activeTab === 'wuxing' ? (
            <View style={styles.wuxingContent}>
              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.wood }]}>●</Text>
                  <Text style={styles.wuxingName}>木</Text>
                  <Text style={styles.wuxingValue}>{data.wuxingDistribution.wood}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${data.wuxingDistribution.wood}%`, backgroundColor: colors.wood }]} />
                </View>
              </View>

              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.fire }]}>●</Text>
                  <Text style={styles.wuxingName}>火</Text>
                  <Text style={styles.wuxingValue}>{data.wuxingDistribution.fire}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${data.wuxingDistribution.fire}%`, backgroundColor: colors.fire }]} />
                </View>
              </View>

              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.earth }]}>●</Text>
                  <Text style={styles.wuxingName}>土</Text>
                  <Text style={styles.wuxingValue}>{data.wuxingDistribution.earth}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${data.wuxingDistribution.earth}%`, backgroundColor: colors.earth }]} />
                </View>
              </View>

              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.gold }]}>●</Text>
                  <Text style={styles.wuxingName}>金</Text>
                  <Text style={styles.wuxingValue}>{data.wuxingDistribution.metal}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${data.wuxingDistribution.metal}%`, backgroundColor: colors.gold }]} />
                </View>
              </View>

              <View style={styles.wuxingBar}>
                <View style={styles.wuxingLabel}>
                  <Text style={[styles.wuxingDot, { color: colors.water }]}>●</Text>
                  <Text style={styles.wuxingName}>水</Text>
                  <Text style={styles.wuxingValue}>{data.wuxingDistribution.water}%</Text>
                </View>
                <View style={styles.wuxingTrack}>
                  <View style={[styles.wuxingFill, { width: `${data.wuxingDistribution.water}%`, backgroundColor: colors.water }]} />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.shishenContent}>
              {(data.shishen || []).map((item, index) => (
                <View key={index} style={styles.shishenItem}>
                  <Text style={styles.shishenLabel}>{['年', '月', '日', '时'][index]}</Text>
                  <Text style={styles.shishenValue}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </GuochaoCard>

        {/* AI 解卦 */}
        <GuochaoCard title="💡 AI 解卦" variant="silk">
          {aiGenerating ? (
            <View style={styles.aiStatusLoading}>
              <ActivityIndicator size="small" color={colors.cinnabarRed} />
              <Text style={styles.aiStatusText}>AI 正在解卦中...</Text>
            </View>
          ) : aiInterpretation ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.aiResultText}>{aiInterpretation}</Text>
            </ScrollView>
          ) : (
            <Text style={styles.aiPlaceholder}>等待生成...</Text>
          )}
        </GuochaoCard>

        {/* 五行分析(简化,后续可增强) */}
        <GuochaoCard title="五行分析" variant="elevated">
          <View style={styles.analysisContent}>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>五行强弱:</Text>
              <Text style={styles.analysisValue}>
                木、火、土、金、水分布如上
              </Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>建议:</Text>
              <Text style={styles.analysisValue}>
                根据五行缺失,可适当补益相应元素
              </Text>
            </View>
          </View>
        </GuochaoCard>

        {/* 已在上方 AI 解卦卡片中集成 */}
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

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

  shareButton: {
    padding: spacing.sm,
  },

  shareButtonText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.cinnabarRed,
  },

  dateInfo: {
    marginBottom: spacing.lg,
  },

  dateText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[700],
    fontWeight: '500',
  },

  ganzhiText: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.sm,
    color: colors.cinnabarRed,
    marginTop: spacing.xs,
  },

  sizhuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  zhuItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },

  zhuLabel: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.xs,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },

  zhuGan: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes['2xl'],
    fontWeight: '600',
    marginBottom: spacing.xs,
  },

  zhuZhi: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.xl,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },

  zhuElement: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.xs,
    color: colors.gray[600],
  },

  tabContainer: {
    flexDirection: 'row',
  },

  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabActive: {
    borderBottomColor: colors.cinnabarRed,
  },

  tabText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[600],
  },

  tabTextActive: {
    color: colors.cinnabarRed,
    fontWeight: '600',
  },

  wuxingContent: {
    paddingTop: spacing.md,
  },

  wuxingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  wuxingLabel: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },

  wuxingDot: {
    fontSize: fonts.sizes.md,
  },

  wuxingName: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.inkBlack,
    marginLeft: spacing.xs,
    marginRight: spacing.sm,
  },

  wuxingValue: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[600],
    width: 35,
  },

  wuxingTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: radii.full,
    overflow: 'hidden',
  },

  wuxingFill: {
    height: '100%',
    borderRadius: radii.full,
  },

  shishenContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
  },

  shishenItem: {
    alignItems: 'center',
  },

  shishenLabel: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.xs,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },

  shishenValue: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.lg,
    color: colors.inkBlack,
    fontWeight: '600',
  },

  analysisContent: {
    paddingTop: spacing.sm,
  },

  analysisItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },

  analysisLabel: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[700],
    fontWeight: '500',
    width: 80,
  },

  analysisValue: {
    flex: 1,
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[600],
  },

  aiSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },

  aiCard: {
    backgroundColor: colors.cinnabarRed,
    borderWidth: 0,
  },

  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  aiIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },

  aiText: {
    flex: 1,
  },

  aiTitle: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.lg,
    color: colors.white,
    fontWeight: '600',
  },

  aiDesc: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },

  aiButton: {
    backgroundColor: colors.white,
  },

  aiResultContainer: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
  },

  aiResultTitle: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.lg,
    color: colors.cinnabarRed,
    marginBottom: spacing.md,
  },

  aiResultText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.inkBlack,
    lineHeight: fonts.sizes.md * 1.6,
  },

  saveStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },

  saveText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.wood, // 使用木色替代 green
  },

  saveTextPending: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.gray[500],
    fontStyle: 'italic',
  },

  spacer: {
    height: spacing['6xl'],
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing['3xl'],
  },

  emptyText: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.xl,
    color: colors.gray[500],
  },

  // AI 解卦状态
  aiStatusLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  aiStatusText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.cinnabarRed,
    marginLeft: spacing.sm,
  },
  aiResultText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.inkBlack,
    lineHeight: 28,
    whiteSpace: 'pre-wrap',
  },
  aiPlaceholder: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.gray[400],
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
});

export default ResultScreen;
