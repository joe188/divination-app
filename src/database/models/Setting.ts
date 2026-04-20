// 应用设置数据模型

export interface AppSetting {
  key: string;
  value: string;
  updatedAt: number;
}

export const SettingKeys = {
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language',
  AI_API_KEY: 'ai_api_key',
  AI_PROVIDER: 'ai_provider',
  TIME_CORRECTION_ENABLED: 'time_correction_enabled',
  DEFAULT_LOCATION: 'default_location',
} as const;

export type SettingKey = typeof SettingKeys[keyof typeof SettingKeys];
