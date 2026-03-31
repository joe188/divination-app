/**
 * 本地存储工具
 * 使用 AsyncStorage 存储排盘历史
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@lingshu:history';
const MAX_HISTORY = 50; // 最多保存 50 条记录

export interface HistoryItem {
  id: string;
  timestamp: number;
  solarDate: string; // 公历日期
  lunarDate: string; // 农历日期
  hour: string; // 时辰
  gender?: string; // 性别
  birthPlace?: string; // 出生地
  fourPillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
}

/**
 * 获取所有历史记录
 */
export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    if (historyJson) {
      return JSON.parse(historyJson);
    }
    return [];
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return [];
  }
};

/**
 * 添加历史记录
 */
export const addHistory = async (item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const history = await getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    // 添加到开头
    history.unshift(newItem);
    
    // 限制数量
    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }
    
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('添加历史记录失败:', error);
  }
};

/**
 * 删除历史记录
 */
export const deleteHistory = async (id: string): Promise<void> => {
  try {
    const history = await getHistory();
    const filtered = history.filter(item => item.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('删除历史记录失败:', error);
  }
};

/**
 * 清空历史记录
 */
export const clearHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('清空历史记录失败:', error);
  }
};
