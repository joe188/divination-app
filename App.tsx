/**
 * 周易排盘 App - 主入口
 * 国潮风格设计，让传统文化触手可及
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { BaZiInputScreen } from './src/screens/BaZiInputScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { colors } from './src/styles/theme';

// 简单路由状态
type Screen = 'home' | 'input' | 'result' | 'ai';

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
    setCurrentScreen('result');
  };

  const handleViewHistory = () => {
    // TODO: 实现历史记录功能
    console.log('查看历史记录');
  };

  const handleShare = () => {
    // TODO: 实现分享功能
    console.log('分享排盘结果');
  };

  const handleAIInterpret = () => {
    // TODO: 实现 AI 解卦功能
    console.log('AI 解卦');
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
