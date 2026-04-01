/**
 * GuochaoCard - 国潮风格卡片容器
 * 特色：宣纸纹理背景、水墨边框、传统纹样装饰
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ImageBackground,
  Text,
} from 'react-native';
import theme from '../styles/theme';
const { colors, spacing, radii, shadows, fonts } = theme;

interface GuochaoCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'pattern' | 'plain';
  style?: ViewStyle;
  onPress?: () => void;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export const GuochaoCard: React.FC<GuochaoCardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  style,
  onPress,
  icon,
  headerRight,
}) => {
  const renderHeader = () => {
    if (!title && !icon) return null;
    
    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {title && <Text style={styles.title}>{title}</Text>}
        </View>
        {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
      </View>
    );
  };

  return (
    <View 
      style={[
        styles.container,
        styles[variant],
        style,
      ]}
    >
      {(title || icon) && renderHeader()}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginVertical: spacing.md,
    ...shadows.md,
  },
  
  // 默认样式 - 宣纸质感背景
  default: {
    backgroundColor: colors.riceWhite,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  
  // 浮起样式 - 带阴影
  elevated: {
    backgroundColor: colors.white,
    ...shadows.lg,
  },
  
  // 纹样样式 - 带传统纹样
  pattern: {
    backgroundColor: colors.riceWhite,
    borderWidth: 2,
    borderColor: colors.cinnabarRed,
    // 实际项目中可以添加传统纹样背景图
    // backgroundImage: require('@/assets/patterns/cloud-pattern.png'),
  },
  
  // 简洁样式
  plain: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowColor: 'transparent',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  headerRight: {
    flex: 0,
  },
  
  iconContainer: {
    marginRight: spacing.sm,
  },
  
  title: {
    fontFamily: fonts.kaiTi,
    fontSize: fonts.sizes.xl,
    fontWeight: '600',
    color: colors.inkBlack,
  },
  
  content: {
    flex: 1,
  },
});

export default GuochaoCard;
