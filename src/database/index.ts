import { initDatabase, getDatabase, closeDatabase } from './Database';

export const db = {
  init: initDatabase,
  get: getDatabase,
  close: closeDatabase,
};

// 导出查询模块
export { default as historyQueries } from './queries/history';
export { default as settingsQueries } from './queries/settings';
export { default as yijingQueries } from './queries/yijing';
export { default as liuyaoQueries } from './queries/liuyao';

export default db;
