/**
 * 本地存储工具（简化版 - 内存存储）
 * TODO: 后续可替换为 AsyncStorage 或 SharedPreferences
 */

const MAX_HISTORY = 50;
let historyCache: any[] = [];

export interface HistoryItem {
  id: string;
  timestamp: number;
  title: string;      // 求测事项
  type: 'bazi' | 'liuyao' | 'qimen';
  date: string;      // 显示用日期
  time: string;      // 显示用时间
  // 以下是可能的数据字段（依类型可选）
  solarDate?: string;
  lunarDate?: string;
  hour?: string;
  fourPillars?: any;
  fiveElements?: any;
  guaName?: string;
  bianguaName?: string;
  yaoTexts?: string[];
  summary?: string;
  jieQi?: string;
  diZhi?: string;
  fuShen?: string;
  tianPan?: any;
  diPan?: any;
}

export const getHistory = async (): Promise<HistoryItem[]> => {
  return historyCache.slice();
};

export const addHistory = async (item: any): Promise<void> => {
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };
  historyCache.unshift(newItem);
  if (historyCache.length > MAX_HISTORY) {
    historyCache = historyCache.slice(0, MAX_HISTORY);
  }
};

export const deleteHistory = async (id: string): Promise<void> => {
  historyCache = historyCache.filter(item => item.id !== id);
};

export const clearHistory = async (): Promise<void> => {
  historyCache = [];
};
