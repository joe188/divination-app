/**
 * 周易排盘 App - 主入口
 * 国潮风格设计，让传统文化触手可及
 */
import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { BaZiInputScreen } from './src/screens/BaZiInputScreen';
import { LiuYaoScreen } from './src/screens/LiuYaoScreen';
import { QiMenScreen } from './src/screens/QiMenScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { colors } from './src/styles/theme';
import { addHistory, type HistoryItem } from './src/utils/storage';
import { generateAIInterpretation } from './src/utils/ai-interpret';

// 简单路由状态
type Screen = 'home' | 'bazi' | 'liuyao' | 'qimen' | 'result' | 'history';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [baziData, setBaziData] = useState<any>(null);

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
    console.log('查看历史记录详情:', item);
    // TODO: 显示详情或跳转到详情页
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
        alert(interpretation);
      } catch (error) {
        alert('AI 解卦失败，请检查网络或稍后重试');
      }
    } else {
      alert('暂无排盘数据');
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
              alert('六爻排盘功能开发中，暂只做演示');
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
              alert('奇门遁甲排盘功能开发中，暂只做演示');
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
