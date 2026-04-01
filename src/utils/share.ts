/**
 * 分享工具模块（暂未实现）
 * 未来可集成 react-native-share 或系统分享功能
 */

export interface ShareOptions {
  title: string;
  message: string;
  imageUrl?: string;
}

/**
 * 分享排盘结果（暂存 stub）
 */
export const shareDivinationResult = async () => {
  alert('分享功能开发中，敬请期待！');
};

/**
 * 生成排盘结果图片（占位符）
 */
export const generateResultImage = async (_data: any): Promise<string | null> => {
  return null;
};
