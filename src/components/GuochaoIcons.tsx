/**
 * 国潮风格 SVG 图标库
 * 统一的视觉识别：朱砂红 #C43C3C / 墨黑 #1A1A1A / 金色 #D4A76A
 */
import React from 'react';
import Svg, { Path, Circle, Rect, Line, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../styles/theme';

type IconProps = {
  size?: number;
  color?: string;
  style?: any;
};

// 八极图（太极）
export const BaziIcon: React.FC<IconProps> = ({ size = 48, color = colors.cinnabarRed, style }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" style={style}>
    <G fill={color}>
      {/* 太极阴阳 */}
      <Circle cx={24} cy={24} r={22} fill="none" stroke={color} strokeWidth={2} />
      <Path d="M24,2 A22,22 0 1,1 24,46 A22,22 0 0,1 24,2 Z" fill={color} />
      <Circle cx={24} cy={24} r={8} fill={colors.riceWhite} />
      <Circle cx={24} cy={16} r={4} fill={color} />
      <Circle cx={24} cy={32} r={4} fill={colors.inkBlack} />
      {/* 八卦点阵（简化：四象） */}
      <Circle cx={24} cy={10} r={1.5} fill={color} />
      <Circle cx={38} cy={24} r={1.5} fill={color} />
      <Circle cx={10} cy={24} r={1.5} fill={color} />
      <Circle cx={24} cy={38} r={1.5} fill={color} />
    </G>
  </Svg>
);

// 六爻（铜钱）
export const LiuYaoIcon: React.FC<IconProps> = ({ size = 48, color = colors.cinnabarRed, style }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" style={style}>
    {/* 三枚铜钱 */}
    {[0, 1, 2].map((i) => (
      <Circle
        key={i}
        cx={12 + i * 12}
        cy={24}
        r={8}
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
    ))}
    {/* 爻线（阴阳） */}
    <Line x1="4" y1="38" x2="20" y2="38" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1="28" y1="38" x2="44" y2="38" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1="28" y1="34" x2="44" y2="34" stroke="none" /> {/* Placeholder */}
    <Line x1="4" y1="34" x2="20" y2="34" stroke="none" /> {/* Above/below for yin/yang */}
    {/* 简化为两阳爻一直线表示 */}
  </Svg>
);

// 奇门遁甲（九宫 + 三门）
export const QiMenIcon: React.FC<IconProps> = ({ size = 48, color = colors.cinnabarRed, style }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" style={style}>
    {/* 九宫格子 */}
    <G stroke={color} strokeWidth={1.5} fill="none">
      <Line x1="16" y1="0" x2="16" y2="48" />
      <Line x1="32" y1="0" x2="32" y2="48" />
      <Line x1="0" y1="16" x2="48" y2="16" />
      <Line x1="0" y1="32" x2="48" y2="32" />
    </G>
    {/* 中心“值符”圈 */}
    <Circle cx={24} cy={24} r={6} fill={color} opacity={0.2} stroke={color} strokeWidth={2} />
    <Circle cx={24} cy={24} r={2} fill={color} />
    {/* 三门标记（开休生） */}
    <Path d="M10,10 L14,14 M34,34 L38,38" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M38,10 L34,14 M14,34 L10,38" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// 历史卷轴
export const HistoryIcon: React.FC<IconProps> = ({ size = 48, color = colors.cinnabarRed, style }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" style={style}>
    {/* 卷轴轴 */}
    <Rect x="20" y="4" width="8" height="40" rx={4} fill={color} opacity={0.8} />
    {/* 展开的纸 */}
    <Rect x="4" y="8" width="40" height="32" rx={2} fill={colors.riceWhite} stroke={color} strokeWidth={2} />
    {/* 文字线 */}
    <Line x1="10" y1="18" x2="38" y2="18" stroke={color} strokeWidth={1} opacity={0.6} />
    <Line x1="10" y1="26" x2="38" y2="26" stroke={color} strokeWidth={1} opacity={0.6} />
    <Line x1="10" y1="34" x2="30" y2="34" stroke={color} strokeWidth={1} opacity={0.6} />
  </Svg>
);

// 太极（用于其他场景）
export const TaiChiIcon: React.FC<IconProps> = ({ size = 24, color = colors.cinnabarRed, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Circle cx={12} cy={12} r={10} fill={color} />
    <Path d="M12,2 A10,10 0 1,1 12,22 A10,10 0 0,1 12,2 Z" fill={colors.riceWhite} />
    <Circle cx={12} cy={8} r={3} fill={color} />
    <Circle cx={12} cy={16} r={3} fill={colors.inkBlack} />
  </Svg>
);

// 问题：检查是否有冲突的导入？
// 所有颜色使用 theme 中的 colors，确保国潮配色一致。

export default {
  BaziIcon,
  LiuYaoIcon,
  QiMenIcon,
  HistoryIcon,
  TaiChiIcon,
};