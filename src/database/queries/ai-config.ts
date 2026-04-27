/**
 * AI 配置查询
 * 使用 SQLite 存储 AI 配置
 */

import db from '../Database';

export interface AiConfig {
  enabled: boolean;     // 是否启用 AI 解卦
  baseUrl: string;
  apiKey: string;
  model: string;
  models: string[];
  updatedAt: number;
}

const AI_CONFIG_KEY = 'ai_config';

/**
 * 获取 AI 配置
 */
export const getAiConfig = async (): Promise<AiConfig | null> => {
  try {
    const database = db.get();
    console.log('🔍 读取 AI 配置...');
    
    const result = database.executeSync(
      'SELECT value FROM app_settings WHERE key = ?',
      [AI_CONFIG_KEY]
    );
    
    console.log('🔍 查询结果:', JSON.stringify(result, null, 2));
    
    // op-sqlite 返回的结构可能是 { rows: { _array: [...] } }
    if (result && result.rows) {
      const rows = result.rows._array || result.rows;
      console.log('🔍 rows:', JSON.stringify(rows, null, 2));
      
      if (Array.isArray(rows) && rows.length > 0) {
        const value = rows[0].value;
        console.log('🔍 value:', value);
        if (value) {
          const config = JSON.parse(value) as AiConfig;
          // 兼容旧数据：如果没有 enabled 字段，默认启用
          if (config.enabled === undefined) {
            config.enabled = true;
          }
          console.log('✅ AI 配置读取成功:', config);
          return config;
        }
      }
    }
    
    console.log('❌ AI 配置不存在');
    return null;
  } catch (error) {
    console.error('获取 AI 配置失败:', error);
    return null;
  }
};

/**
 * 保存 AI 配置
 */
export const saveAiConfig = async (config: AiConfig): Promise<boolean> => {
  try {
    const database = db.get();
    const value = JSON.stringify(config);
    const now = Date.now();
    
    // 使用 INSERT OR REPLACE（更简单）
    database.executeSync(
      'INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)',
      [AI_CONFIG_KEY, value, now]
    );
    
    console.log('✅ AI 配置已保存');
    return true;
  } catch (error) {
    console.error('保存 AI 配置失败:', error);
    return false;
  }
};

/**
 * 清除 AI 配置
 */
export const clearAiConfig = async (): Promise<boolean> => {
  try {
    const database = db.get();
    database.executeSync(
      'DELETE FROM app_settings WHERE key = ?',
      [AI_CONFIG_KEY]
    );
    console.log('✅ AI 配置已清除');
    return true;
  } catch (error) {
    console.error('清除 AI 配置失败:', error);
    return false;
  }
};
