// 国潮主题色彩系统
// 遵循 DESIGN.md 中的色彩定义

export const colors = {
  // 主色调
  cinnabarRed: '#C43C3C',    // 朱砂红 - 主按钮、重点强调
  inkBlack: '#1A1A1A',       // 墨黑 - 文字、边框
  riceWhite: '#F5F0E6',      // 米白 - 背景色
  gold: '#D4A76A',           // 金色 - 高级功能、VIP 元素
  
  // 别名（兼容旧代码）
  primary: '#C43C3C',        // 朱砂红
  secondary: '#D4A76A',      // 金色
  accent: '#4CAF50',         // 木绿
  background: '#F5F0E6',     // 米白背景
  card: '#FFFFFF',           // 白色卡片
  text: '#1A1A1A',           // 墨黑文字
  textSecondary: '#757575',  // 灰色文字
  textLight: '#FFFFFF',      // 白色文字
  border: '#E0E0E0',         // 边框
  error: '#F44336',          // 错误红
  success: '#4CAF50',        // 成功绿
  
  // 五行色
  wood: '#4CAF50',           // 木 - 绿
  fire: '#F44336',           // 火 - 红
  earth: '#FFC107',          // 土 - 黄
  metal: '#FFFFFF',          // 金 - 白
  water: '#2196F3',          // 水 - 蓝
  
  // 辅助色
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // 透明度
  transparent: 'transparent',
  rgba: (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },
};

// 字体配置
export const fonts = {
  // 中文字体
  kaiTi: 'Kaiti SC, Kaiti, STKaiti, KaiTi, cursive',  // 楷体 - 标题
  songTi: 'Songti SC, SimSun, STSong, serif',         // 宋体 - 副标题
  sourceHan: '"Source Han Sans CN", "Noto Sans CJK SC", sans-serif', // 思源黑体 - 正文
  
  // 字号
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // 字重
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  } as const,
};

// 间距系统
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

// 圆角
export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

// 阴影
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// 动画时长
export const durations = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// 国潮特色
export const guochao = {
  // 传统纹样颜色
  patterns: {
    cloud: '#E8E4D9',      // 云纹
    dragon: '#D4A76A',     // 龙纹
    phoenix: '#C43C3C',    // 凤纹
    lotus: '#F5F0E6',      // 莲纹
  },
  
  // 水墨效果
  ink: {
    light: 'rgba(26, 26, 26, 0.3)',
    medium: 'rgba(26, 26, 26, 0.6)',
    heavy: 'rgba(26, 26, 26, 0.9)',
  },
};

export default {
  colors,
  fonts,
  spacing,
  radii,
  shadows,
  durations,
  guochao,
};
