/**
 * 分享工具模块
 * 支持生成排盘结果图片并分享到各平台
 */
import Share from 'react-native-share';
import { Platform } from 'react-native';

export interface ShareOptions {
  title: string;
  message: string;
  imageUrl?: string;
}

/**
 * 分享排盘结果
 * @param fourPillars 四柱八字信息
 * @param fiveElements 五行信息
 */
export const shareDivinationResult = async (
  fourPillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  },
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  }
): Promise<void> => {
  try {
    // 生成分享文本
    const title = '🦐 灵虾排盘 - 八字结果';
    const message = `
${title}
━━━━━━━━━━━━━━
📅 四柱八字
年柱：${fourPillars.year}
月柱：${fourPillars.month}
日柱：${fourPillars.day}
时柱：${fourPillars.hour}
━━━━━━━━━━━━━━
🔥 五行分布
木：${fiveElements.wood}%  火：${fiveElements.fire}%
土：${fiveElements.earth}%  金：${fiveElements.metal}%
水：${fiveElements.water}%
━━━━━━━━━━━━━━
✨ 让传统文化触手可及
    `.trim();

    // 调用系统分享
    await Share.open({
      title: '灵虾排盘',
      message: message,
      subject: '灵虾排盘 - 八字结果',
      // TODO: 后续可以添加生成的图片
      // url: imageUrl,
    });
  } catch (error: any) {
    // 用户取消分享是正常行为
    if (error.message !== 'User did not share') {
      console.error('分享失败:', error);
    }
  }
};

/**
 * 分享到微信 (如果安装了微信)
 */
export const shareToWeChat = async (message: string): Promise<void> => {
  try {
    await Share.open({
      message,
      social: Share.Social.WECHAT,
    });
  } catch (error) {
    console.error('微信分享失败:', error);
    // 如果微信未安装，回退到系统分享
    await Share.open({ message });
  }
};

/**
 * 分享到 QQ
 */
export const shareToQQ = async (message: string): Promise<void> => {
  try {
    await Share.open({
      message,
      social: Share.Social.QQ,
    });
  } catch (error) {
    console.error('QQ 分享失败:', error);
    // 如果 QQ 未安装，回退到系统分享
    await Share.open({ message });
  }
};

/**
 * 生成排盘结果图片（占位符）
 * TODO: 使用 react-native-view-shot 生成图片
 */
export const generateResultImage = async (data: any): Promise<string | null> => {
  // TODO: 实现图片生成逻辑
  console.log('生成排盘结果图片:', data);
  return null;
};
