/**
 * BaZiInputScreen - 八字排盘输入页
 * 功能：选择出生年月日时、真太阳时校正
 */

import React, { useState } from 'react';
import { calculateBaZi } from '../utils/bazi-calculator';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Alert 
} from 'react-native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import { GuochaoInput } from '../components/GuochaoInput';
import theme from '../styles/theme';
const { colors, fonts, spacing, radii } = theme;

export const BaZiInputScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Text>八字排盘输入页</Text>
    </View>
  );
};

export default BaZiInputScreen;