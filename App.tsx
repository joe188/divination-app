/**
 * 周易排盘 App - 主入口
 * 国潮风格设计，让传统文化触手可及
 */
import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, Alert } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { BaZiInputScreen } from './src/screens/BaZiInputScreen';
import { LiuYaoScreen } from './src/screens/LiuYaoScreen';
import { QiMenScreen } from './src/screens/QiMenScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HistoryDetailScreen } from './src/screens/HistoryDetailScreen';
import { colors } from './src/styles/theme';
import { addHistory, deleteHistory, type HistoryItem } from './src/utils/storage';
import { generateAIInterpretation } from './src/utils/ai-interpret';

// 简单路由状态
type Screen = 'home' | 'bazi' | 'liuyao' | 'qimen' | 'result' | 'history' | 'history-detail';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [baziData, setBaziData] = useState<any>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  const handleStartDivination = () => {
    setCurrentScreen('bazi'); // 默认进入八字排盘
  };

  const handleStartLiuYao = () => {
    setCurrentScreen('liuyao');
  };

  const handleStartQiMen = () => {
    setCurrentScreen('qimen');
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const handleSubmitBazi = (data: any) => {
    setBaziData(data);
    // 添加历史记录
    if (data.baziResult) {
      const bz = data.baziResult;
      addHistory({
        title: data.question || '八字排盘',
        type: 'bazi',
        date: bz.solarDate,
        time: data.hourLabel,
        solarDate: bz.solarDate,
        lunarDate: bz.lunarDate,
        hour: data.hourLabel,
        fourPillars: {
          year: bz.ganZhi.year.gan + bz.ganZhi.year.zhi,
          month: bz.ganZhi.month.gan + bz.ganZhi.month.zhi,
          day: bz.ganZhi.day.gan + bz.ganZhi.day.zhi,
          hour: bz.ganZhi.hour.gan + bz.ganZhi.hour.zhi,
        },
        fiveElements: bz.fiveElements,
      });
    }
    setCurrentScreen('result');
  };

  const handleViewHistory = () => {
    setCurrentScreen('history');
  };

  const handleViewHistoryItem = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setCurrentScreen('history-detail');
  };

  const handleShare = async () => {
    // 实现分享功能
    if (baziData) {
      const { shareDivinationResult } = await import('./src/utils/share');
      await shareDivinationResult(
        baziData.fourPillars || {},
        baziData.fiveElements || { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
      );
    }
  };

  const handleAIInterpret = async () => {
    // 实现 AI 解卦功能
    if (baziData) {
      try {
        const interpretation = await generateAIInterpretation(
          baziData.fourPillars || {},
          baziData.fiveElements || { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
        );
        Alert.alert(interpretation);
      } catch (error) {
        Alert.alert('AI 解卦失败，请检查网络或稍后重试');
      }
    } else {
      Alert.alert('暂无排盘数据');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onStartDivination={handleStartDivination}
            onStartLiuYao={handleStartLiuYao}
            onStartQiMen={handleStartQiMen}
            onViewHistory={handleViewHistory}
          />
        );
      case 'bazi':
        return (
          <BaZiInputScreen
            onBack={handleBack}
            onSubmit={handleSubmitBazi}
          />
        );
      case 'liuyao':
        return (
          <LiuYaoScreen
            onBack={handleBack}
            onSubmit={(data) => {
              console.log('六爻数据:', data);
              // 添加历史记录
              addHistory({
                title: data.question,
                type: 'liuyao',
                date: new Date().toLocaleDateString('zh-CN'),
                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                guaName: data.result?.guaName,
                bianguaName: data.result?.bianguaName,
                yaoTexts: data.result?.yaoTexts,
                summary: data.result?.summary,
              });
              Alert.alert('六爻排盘完成，已保存到历史');
              setCurrentScreen('home');
            }}
          />
        );
      case 'qimen':
        return (
          <QiMenScreen
            onBack={handleBack}
            onSubmit={(data) => {
              console.log('奇门数据:', data);
              // 添加历史记录
              addHistory({
                title: '奇门遁甲',
                type: 'qimen',
                date: new Date().toLocaleDateString('zh-CN'),
                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                jieQi: data.jieQi,
                diZhi: data.diZhi,
                fuShen: data.fuShen,
                tianPan: data.tianPan,
                diPan: data.diPan,
              });
              Alert.alert('奇门排盘完成，已保存到历史');
              setCurrentScreen('home');
            }}
          />
        );
      case 'result':
        return (
          <ResultScreen
            onBack={handleBack}
            onShare={handleShare}
            onAIInterpret={handleAIInterpret}
            baziData={baziData}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            onBack={handleBack}
            onViewItem={handleViewHistoryItem}
          />
        );
      case 'history-detail':
        return (
          <HistoryDetailScreen
            onBack={() => setCurrentScreen('history')}
            onDelete={async (id) => {
              await deleteHistory(id);
              Alert.alert('已删除');
              setCurrentScreen('history');
            }}
            route={{ params: { item: selectedHistoryItem! } }}
          />
        );
      default:
        return (
          <HomeScreen
            onStartDivination={handleStartDivination}
            onStartLiuYao={handleStartLiuYao}
            onStartQiMen={handleStartQiMen}
            onViewHistory={handleViewHistory}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.riceWhite} />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
});
