/**
 * 本地存储工具（简化版 - 内存存储）
 * TODO: 后续可替换为 AsyncStorage 或 SharedPreferences
 */

const MAX_HISTORY = 50;
let historyCache: any[] = [];

export interface HistoryItem {
  id: string;
  timestamp: number;
  solarDate: string;
  lunarDate: string;
  hour: string;
  gender?: string;
  birthPlace?: string;
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

export const getHistory = async (): Promise<HistoryItem[]> => {
  return historyCache.slice();
};

export const addHistory = async (item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<void> => {
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
