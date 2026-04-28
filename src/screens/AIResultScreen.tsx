/**
 * AIResultScreen - AI 解卦结果页
 * 功能：显示 AI 解卦结果，支持保存、分享、历史记录
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import { insertRecord } from '../database/queries/history';
import theme from '../styles/theme';
import { responsiveFontSize, responsivePadding } from '../styles/responsive';
const { colors, fonts, spacing, radii } = theme;

interface AIResultScreenProps {
  route?: any;
  navigation?: any;
}

export const AIResultScreen: React.FC<AIResultScreenProps> = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // 从 route.params 获取数据
  const { baziInfo, aiResult: initialAiResult } = (route.params as any) || {};
  
  // 状态
  const [aiResult, setAiResult] = useState<string | null>(initialAiResult);
  const [aiLoading, setAiLoading] = useState(!initialAiResult);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // 防止重复调用
  const hasCalledRef = useRef(false);
  
  // 在页面加载时调用 AI 服务
  useEffect(() => {
    if (!initialAiResult && !hasCalledRef.current) {
      // 根据类型判断是否有足够的数据
      const hasData = baziInfo?.type === 'liuyao' 
        ? (baziInfo?.guaName || baziInfo?.lines)
        : (baziInfo?.ganZhi || baziInfo?.jieqi);
      
      if (hasData) {
        hasCalledRef.current = true;
        callAIService();
      }
    }
  }, []);
  
  // 调用 AI 服务
  const callAIService = async () => {
    try {
      setAiLoading(true);
      const aiService = require('../services/ai-service').default;
      
      // 根据类型调用不同的 AI 服务
      if (baziInfo?.type === 'qimen') {
        // 奇门遁甲
        const request = {
          question: `请详细解读这个奇门遁甲局：\n节气：${baziInfo.jieqi}\n日干支：${baziInfo.ganZhi?.year?.gan}${baziInfo.ganZhi?.year?.zhi}\n时干支：${baziInfo.ganZhi?.hour?.gan}${baziInfo.ganZhi?.hour?.zhi}\n值符：${baziInfo.zhiFu}\n值使：${baziInfo.zhiShi}\n\n请从以下几个方面进行分析：\n1. 局象特点\n2. 吉凶方位\n3. 用神分析\n4. 建议\n\n请用通俗易懂的语言进行解读。`,
          provider: 'openai',
        };
        
        const result = await aiService.analyzeQiMen(request);
        setAiResult(result);
      } else if (baziInfo?.type === 'liuyao') {
        // 六爻
        const request = {
          question: `请详细解读这个六爻卦象：${baziInfo.guaName}卦，卦象为${baziInfo.lines}，动爻：${baziInfo.movingLines?.join(',') || '无'}\n\n请从以下几个方面进行分析：\n1. 卦象含义\n2. 动爻解析\n3. 吉凶判断\n4. 建议\n\n请用通俗易懂的语言进行解读。`,
          provider: 'openai',
        };
        
        const result = await aiService.analyzeLiuYao(request);
        setAiResult(result);
      } else {
        // 八字
        const ganZhi = baziInfo?.ganZhi;
        const request = {
          question: `请详细解读这个八字：\n${ganZhi.year.gan}${ganZhi.year.zhi}年 ${ganZhi.month.gan}${ganZhi.month.zhi}月 ${ganZhi.day.gan}${ganZhi.day.zhi}日 ${ganZhi.hour.gan}${ganZhi.hour.zhi}时\n\n请从以下几个方面进行分析：\n1. 命局特点\n2. 五行强弱\n3. 性格特点\n4. 运势建议\n\n请用通俗易懂的语言进行解读。`,
          provider: 'openai',
        };
        
        const result = await aiService.analyzeBaZi(request);
        setAiResult(result);
      }
    } catch (error: any) {
      console.error('AI 解卦失败:', error);
      Alert.alert('❌ 错误', `AI 解卦失败：${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };
  
  // 保存到历史记录
  const handleSave = async () => {
    if (saved) {
      Alert.alert('ℹ️ 提示', '已经保存过了');
      return;
    }
    
    try {
      setSaving(true);
      
      // 根据 baziInfo.type 确定正确的 baziType
      const baziType = baziInfo?.type || 'bazi';
      
      const record: any = {
        baziType,
        solarDate: baziInfo?.solarDate || new Date().toISOString().split('T')[0],
        lunarDate: baziInfo?.lunarDate || '',
        timePeriod: baziInfo?.hourLabel || '',
        location: baziInfo?.location || '',
        aiInterpretation: aiResult,
        isFavorite: false,
        createdAt: Date.now(),
      };
      
      // 根据类型添加不同的字段
      if (baziType === 'bazi') {
        record.yearGanzhi = baziInfo?.ganZhi?.year ? `${baziInfo.ganZhi.year.gan}${baziInfo.ganZhi.year.zhi}` : '';
        record.monthGanzhi = baziInfo?.ganZhi?.month ? `${baziInfo.ganZhi.month.gan}${baziInfo.ganZhi.month.zhi}` : '';
        record.dayGanzhi = baziInfo?.ganZhi?.day ? `${baziInfo.ganZhi.day.gan}${baziInfo.ganZhi.day.zhi}` : '';
        record.hourGanzhi = baziInfo?.ganZhi?.hour ? `${baziInfo.ganZhi.hour.gan}${baziInfo.ganZhi.hour.zhi}` : '';
      } else if (baziType === 'liuyao') {
        record.hexagram = baziInfo?.guaName || '';
        record.movingLines = baziInfo?.movingLines?.join(',') || '';
      } else if (baziType === 'qimen') {
        record.jieqi = baziInfo?.jieqi || '';
        record.juName = baziInfo?.juName || '';
      }
      
      await insertRecord(record);
      setSaved(true);
      Alert.alert('✅ 保存成功', '解卦结果已保存到历史记录');
    } catch (error: any) {
      console.error('保存失败:', error);
      Alert.alert('❌ 保存失败', error.message);
    } finally {
      setSaving(false);
    }
  };
  
  // 分享
  const handleShare = async () => {
    try {
      const shareContent = `
【灵枢排盘 - AI 解卦结果】

八字：${baziInfo?.ganZhi?.year?.gan || ''}${baziInfo?.ganZhi?.year?.zhi || ''}年 ${baziInfo?.ganZhi?.month?.gan || ''}${baziInfo?.ganZhi?.month?.zhi || ''}月 ${baziInfo?.ganZhi?.day?.gan || ''}${baziInfo?.ganZhi?.day?.zhi || ''}日 ${baziInfo?.ganZhi?.hour?.gan || ''}${baziInfo?.ganZhi?.hour?.zhi || ''}时

${aiResult}

—— 灵枢排盘 AI 智能解卦
      `.trim();
      
      await Share.share({
        message: shareContent,
        title: 'AI 解卦结果',
      });
    } catch (error: any) {
      console.error('分享失败:', error);
      Alert.alert('❌ 分享失败', error.message);
    }
  };
  
  // 查看历史记录
  const handleViewHistory = () => {
    navigation.navigate('History');
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 标题栏 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI 解卦结果</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* 信息卡片 */}
        {baziInfo?.type === 'liuyao' ? (
          // 六爻信息
          <GuochaoCard title="六爻卦象" variant="pattern">
            <View style={styles.baziInfo}>
              <Text style={styles.baziText}>
                {baziInfo?.guaName || ''}卦
              </Text>
              {baziInfo?.transformedGuaName && (
                <Text style={styles.dateText}>变卦：{baziInfo.transformedGuaName}</Text>
              )}
              {baziInfo?.lines && (
                <Text style={styles.dateText}>卦象：{baziInfo.lines}</Text>
              )}
              {baziInfo?.movingLines && baziInfo.movingLines.length > 0 && (
                <Text style={styles.dateText}>动爻：{baziInfo.movingLines.join('、')}爻</Text>
              )}
            </View>
          </GuochaoCard>
        ) : baziInfo?.type === 'qimen' ? (
          // 奇门遁甲信息
          <GuochaoCard title="奇门遁甲局" variant="pattern">
            <View style={styles.baziInfo}>
              {baziInfo?.jieqi && (
                <Text style={styles.baziText}>节气：{baziInfo.jieqi}</Text>
              )}
              {baziInfo?.ganZhi?.year && (
                <Text style={styles.dateText}>日干支：{baziInfo.ganZhi.year.gan}{baziInfo.ganZhi.year.zhi}</Text>
              )}
              {baziInfo?.ganZhi?.hour && (
                <Text style={styles.dateText}>时干支：{baziInfo.ganZhi.hour.gan}{baziInfo.ganZhi.hour.zhi}</Text>
              )}
              {baziInfo?.zhiFu && (
                <Text style={styles.dateText}>值符：{baziInfo.zhiFu}</Text>
              )}
              {baziInfo?.zhiShi && (
                <Text style={styles.dateText}>值使：{baziInfo.zhiShi}</Text>
              )}
            </View>
          </GuochaoCard>
        ) : (
          // 八字信息
          <GuochaoCard title="八字信息" variant="pattern">
            <View style={styles.baziInfo}>
              <Text style={styles.baziText}>
                {baziInfo?.ganZhi?.year?.gan || ''}{baziInfo?.ganZhi?.year?.zhi || ''}年 
                {baziInfo?.ganZhi?.month?.gan || ''}{baziInfo?.ganZhi?.month?.zhi || ''}月 
                {baziInfo?.ganZhi?.day?.gan || ''}{baziInfo?.ganZhi?.day?.zhi || ''}日 
                {baziInfo?.ganZhi?.hour?.gan || ''}{baziInfo?.ganZhi?.hour?.zhi || ''}时
              </Text>
              {baziInfo?.solarDate && (
                <Text style={styles.dateText}>公历：{baziInfo.solarDate}</Text>
              )}
              {baziInfo?.lunarDate && (
                <Text style={styles.dateText}>农历：{baziInfo.lunarDate}</Text>
              )}
            </View>
          </GuochaoCard>
        )}
        
        {/* AI 解卦结果 */}
        <GuochaoCard title="🤖 AI 解卦" variant="pattern" style={styles.resultCard}>
          {aiLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.cinnabarRed} />
              <Text style={styles.loadingText}>正在调用 AI 进行解卦，请稍候...</Text>
            </View>
          ) : (
            <Text style={styles.resultText}>{aiResult}</Text>
          )}
        </GuochaoCard>
        
        {/* 操作按钮 */}
        <View style={styles.buttonGroup}>
          <GuochaoButton
            title={saved ? "已保存" : "保存到历史"}
            variant="primary"
            size="medium"
            onPress={handleSave}
            disabled={saved}
            loading={saving}
            style={styles.button}
          />
          <GuochaoButton
            title="分享结果"
            variant="outline"
            size="medium"
            onPress={handleShare}
            style={styles.button}
          />
        </View>
        
        <GuochaoButton
          title="查看历史记录"
          variant="ghost"
          size="medium"
          onPress={handleViewHistory}
          style={styles.historyButton}
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
    fontSize: fonts.sizes.xl,
    color: colors.inkBlack,
  },
  
  placeholder: {
    width: 40,
  },
  
  baziInfo: {
    paddingVertical: spacing.md,
  },
  
  baziText: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.xl,
    color: colors.cinnabarRed,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  dateText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.inkBlack,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  
  resultCard: {
    marginTop: spacing.lg,
  },
  
  resultText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.inkBlack,
    lineHeight: fonts.sizes.md * 1.8,
  },
  
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  loadingText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.inkBlack,
    marginTop: spacing.md,
  },
  
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  
  historyButton: {
    marginTop: spacing.lg,
  },
  
  spacer: {
    height: spacing['2xl'],
  },
});

export default AIResultScreen;
