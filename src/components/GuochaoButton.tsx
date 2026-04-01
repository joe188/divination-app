/**
 * GuochaoButton - 国潮风格按钮
 * 特色：水墨晕染效果、朱砂红主色调、微交互动画
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
} from 'react-native';
import theme from '../styles/theme';
const { colors, fonts, spacing, radii, shadows } = theme;

interface GuochaoButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const GuochaoButton: React.FC<GuochaoButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleValue = useState(new Animated.Value(1))[0];

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as const],
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as const],
    textStyle,
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue } ] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={buttonStyles}
      >
        {loading ? (
          <ActivityIndicator 
            color={variant === 'primary' ? colors.white : colors.cinnabarRed} 
          />
        ) : (
          <>
            {icon && <span style={styles.icon}>{icon}</span>}
            <Text style={textStyles}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // 基础样式
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.md,
  },
  
  // 主要样式 - 朱砂红填充
  primary: {
    backgroundColor: colors.cinnabarRed,
    borderColor: colors.cinnabarRed,
  },
  
  // 次要样式 - 米白填充
  secondary: {
    backgroundColor: colors.riceWhite,
    borderColor: colors.inkBlack,
  },
  
  // 边框样式
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.cinnabarRed,
  },
  
  // 幽灵样式
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  
  // 尺寸
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  
  medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
  },
  
  // 禁用状态
  disabled: {
    backgroundColor: colors.gray[300],
    borderColor: colors.gray[300],
  },
  
  // 文字样式
  text: {
    fontFamily: fonts.sourceHan,
    fontWeight: '500',
  },
  
  textPrimary: {
    color: colors.white,
  },
  
  textSecondary: {
    color: colors.inkBlack,
  },
  
  textOutline: {
    color: colors.cinnabarRed,
  },
  
  textGhost: {
    color: colors.inkBlack,
  },
  
  textSmall: {
    fontSize: fonts.sizes.sm,
  },
  
  textMedium: {
    fontSize: fonts.sizes.md,
  },
  
  textLarge: {
    fontSize: fonts.sizes.lg,
  },
  
  icon: {
    marginRight: spacing.sm,
  },
});

export default GuochaoButton;
