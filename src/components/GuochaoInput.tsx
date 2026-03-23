/**
 * GuochaoInput - 国潮风格输入框
 * 特色：极简设计、宣纸质感、微交互动画
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  KeyboardTypeOptions,
} from 'react-native';
import { colors, fonts, spacing, radii } from '../styles/theme';

interface GuochaoInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText?: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  disabled?: boolean;
  error?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  icon?: React.ReactNode;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
}

export const GuochaoInput: React.FC<GuochaoInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  disabled = false,
  error,
  style,
  inputStyle,
  icon,
  maxLength,
  multiline = false,
  numberOfLines = 1,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.gray[300], colors.cinnabarRed],
  });

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View 
        style={[
          styles.inputContainer,
          { 
            borderColor: isFocused ? colors.cinnabarRed : colors.gray[300],
          },
          error && styles.error,
          disabled && styles.disabled,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          style={[
            styles.input,
            multiline && styles.multiline,
            inputStyle,
          ]}
          editable={!disabled}
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  
  label: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.sm,
    color: colors.inkBlack,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.riceWhite,
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  
  input: {
    flex: 1,
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.md,
    color: colors.inkBlack,
    paddingVertical: spacing.sm,
  },
  
  multiline: {
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  
  iconContainer: {
    marginRight: spacing.sm,
  },
  
  error: {
    borderColor: colors.fire,
  },
  
  errorText: {
    fontFamily: fonts.sourceHan,
    fontSize: fonts.sizes.xs,
    color: colors.fire,
    marginTop: spacing.xs,
  },
  
  disabled: {
    backgroundColor: colors.gray[100],
  },
});

export default GuochaoInput;
