/**
 * 周易排盘 App - 主入口
 * 国潮风格设计，让传统文化触手可及
 */
import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { BaZiInputScreen } from './src/screens/BaZiInputScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { colors } from './src/styles/theme';
import { addHistory, type HistoryItem } from './src/utils/storage';

// 简单路由状态
type Screen = 'home' | 'input' | 'result' | 'ai' | 'history';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [baziData, setBaziData] = useState<any>(null);

  const handleStartDivination = () => {
    setCurrentScreen('input');
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const handleSubmitBazi = (data: any) => {
    setBaziData(data);
    // 添加到历史记录
    addHistory({
      solarDate: data.solarDate || '',
      lunarDate: data.lunarDate || '',
      hour: data.hour || '',
      fourPillars: data.fourPillars || {},
      fiveElements: data.fiveElements || {},
    });
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
      const { generateAIInterpretation } = await import('./src/utils/ai-interpret');
      const interpretation = generateAIInterpretation(
        baziData.fourPillars || {},
        baziData.fiveElements || { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
      );
      console.log('AI 解卦结果:', interpretation);
      // TODO: 显示解卦结果（可以用 Alert 或新页面）
      alert(interpretation);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onStartDivination={handleStartDivination}
            onViewHistory={handleViewHistory}
          />
        );
      case 'input':
        return (
          <BaZiInputScreen
            onBack={handleBack}
            onSubmit={handleSubmitBazi}
          />
        );
      case 'result':
        return (
          <ResultScreen
            onBack={handleBack}
            onShare={handleShare}
            onAIInterpret={handleAIInterpret}
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
