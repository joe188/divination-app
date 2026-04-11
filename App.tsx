import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, LiuYaoScreen, BaZiInputScreen, QiMenScreen, HistoryScreen, HistoryDetailScreen, ResultScreen } from './src/screens';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen as any} />
        <Stack.Screen name="LiuYao" component={LiuYaoScreen as any} />
        <Stack.Screen name="BaZiInput" component={BaZiInputScreen as any} />
        <Stack.Screen name="QiMen" component={QiMenScreen as any} />
        <Stack.Screen name="History" component={HistoryScreen as any} />
        <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen as any} />
        <Stack.Screen name="Result" component={ResultScreen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}