/**
 * SettingsScreen - 设置入口页面
 * 功能：提供 AI 配置和知识库的入口
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import theme from '../styles/theme';
import { responsiveFontSize, responsivePadding } from '../styles/responsive';

const { colors, fonts, spacing, radii } = theme;

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ 设置</Text>
        <Text style={styles.headerSubtitle}>AI 配置 · 知识库 · 关于</Text>
      </View>

      <View style={styles.content}>
        {/* 用户手册入口 */}
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('Manual')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>📖</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>用户手册</Text>
            <Text style={styles.menuDesc}>详细使用说明和 AI 配置指南</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* AI 配置入口 */}
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('AiConfig')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>🤖</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>AI 配置</Text>
            <Text style={styles.menuDesc}>配置大模型 API，自动获取模型列表</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* 知识库入口 */}
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('Knowledge')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>📚</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>易学知识库</Text>
            <Text style={styles.menuDesc}>六爻、八字、奇门遁甲知识</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* 关于应用 */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>📱 关于应用</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>版本</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>构建日期</Text>
            <Text style={styles.aboutValue}>2026.04.20</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>技术支持</Text>
            <Text style={styles.aboutValue}>灵枢排盘团队</Text>
          </View>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.riceWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  menuEmoji: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.xs,
  },
  menuDesc: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
  },
  menuArrow: {
    fontSize: 24,
    color: colors.gray[400],
  },
  aboutCard: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aboutTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.lg,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  aboutLabel: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
  },
  aboutValue: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
  },
});

export default SettingsScreen;
