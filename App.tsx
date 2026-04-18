/**
 * 灵枢智能排盘 - 主入口
 * 国潮风格设计，让传统文化触手可及
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  checkFirstTime, 
  checkRollback, 
  autoCheckUpdate 
} from './src/utils/UpdateContext';
import HomeScreen from './src/screens/HomeScreen';
import LiuYaoScreen from './src/screens/LiuYaoScreen';
import LiuYaoResultScreen from './src/screens/LiuYaoResultScreen';
import BaZiInputScreen from './src/screens/BaZiInputScreen';
import QiMenScreen from './src/screens/QiMenScreen';
import { HistoryScreen } from './src/screens';
import HistoryDetailScreen from './src/screens/HistoryDetailScreen';
import ResultScreen from './src/screens/ResultScreen';
import YijingTestScreen from './src/screens/YijingTestScreen';
import db from './src/database';

const Stack = createNativeStackNavigator();

function AppContent() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F0E6" />
        <Stack.Navigator
          id="root"
          screenOptions={{
            headerStyle: { backgroundColor: '#F5F0E6' },
            headerTintColor: '#1A1A1A',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen as any} options={{ title: '灵枢排盘' }} />
          <Stack.Screen name="LiuYao" component={LiuYaoScreen as any} options={{ title: '六爻占卜' }} />
          <Stack.Screen name="LiuYaoResult" component={LiuYaoResultScreen as any} options={{ title: '六爻结果' }} />
          <Stack.Screen name="BaZiInput" component={BaZiInputScreen as any} options={{ title: '八字排盘' }} />
          <Stack.Screen name="QiMen" component={QiMenScreen as any} options={{ title: '奇门遁甲' }} />
          <Stack.Screen name="History" component={HistoryScreen as any} options={{ title: '历史记录' }} />
          <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen as any} options={{ title: '详情' }} />
          <Stack.Screen name="Result" component={ResultScreen as any} options={{ title: '排盘结果' }} />
          <Stack.Screen name="YijingTest" component={YijingTestScreen as any} options={{ title: '易经测试' }} />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#8B4513" />
      <Text style={styles.loadingText}>正在初始化数据库...</Text>
    </View>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 初始化数据库
    const initDatabase = async () => {
      try {
        await db.init();
        console.log('✅ Database initialized');
        setDbReady(true);
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
        setError('数据库初始化失败');
      }
    };
    initDatabase();
    
    // 热更新检查
    checkFirstTime();
    checkRollback();
    
    // 延迟 5 秒后自动检查更新
    const timer = setTimeout(() => {
      autoCheckUpdate();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // 根据状态渲染不同的组件
  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (!dbReady) {
    return <LoadingScreen />;
  }

  return <AppContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0E6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B4513',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
