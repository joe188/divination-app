// 六爻解读查询模块
import { getDatabase } from '../Database';
import { YijingTables } from '../schema-yijing';

export type LiuyaoInterpretation = {
  id: string;
  hexagram_name: string;
  scenario: string;
  target: 'hexagram' | 'yao_1' | 'yao_2' | 'yao_3' | 'yao_4' | 'yao_5' | 'yao_6' | 'general';
  yao_condition: string | null; // 1-6 或 null
  content: string; // HTML
  search_text: string;
  created_at: number;
};

export class LiuyaoQueries {
  /**
   * 全文搜索（卦名、场景、目标、爻条件）
   */
  async search(query: string, limit: number = 20): Promise<LiuyaoInterpretation[]> {
    const db = getDatabase();
    const sql = `
      SELECT * FROM ${YijingTables.LIUYAO_INTERPRETATION}
      WHERE search_text LIKE '%' || ? || '%'
      ORDER BY hexagram_name, scenario, target
      LIMIT ?
    `;
    const result = db.executeSync(sql, [query, limit]);
    return result.rows as LiuyaoInterpretation[];
  }

  /**
   * 按卦名查询所有解读
   */
  async findByHexagram(hexagramName: string): Promise<LiuyaoInterpretation[]> {
    const db = getDatabase();
    const sql = `
      SELECT * FROM ${YijingTables.LIUYAO_INTERPRETATION}
      WHERE hexagram_name = ?
      ORDER BY scenario, target
    `;
    const result = db.executeSync(sql, [hexagramName]);
    return result.rows as LiuyaoInterpretation[];
  }

  /**
   * 按场景筛选（如：婚姻、事业）
   */
  async findByScenario(scenario: string): Promise<LiuyaoInterpretation[]> {
    const db = getDatabase();
    const sql = `
      SELECT * FROM ${YijingTables.LIUYAO_INTERPRETATION}
      WHERE scenario = ?
      ORDER BY hexagram_name, target
    `;
    const result = db.executeSync(sql, [scenario]);
    return result.rows as LiuyaoInterpretation[];
  }

  /**
   * 查询特定卦+爻动组合
   */
  async findByCondition(
    hexagramName: string,
    yaoCondition: string | null
  ): Promise<LiuyaoInterpretation | null> {
    const db = getDatabase();
    const sql = `
      SELECT * FROM ${YijingTables.LIUYAO_INTERPRETATION}
      WHERE hexagram_name = ? AND yao_condition IS ?
      LIMIT 1
    `;
    const result = db.executeSync(sql, [hexagramName, yaoCondition]);
    return result.rows[0] as LiuyaoInterpretation || null;
  }

  /**
   * 列出所有可用场景
   */
  async listScenarios(): Promise<string[]> {
    const db = getDatabase();
    const sql = `
      SELECT DISTINCT scenario FROM ${YijingTables.LIUYAO_INTERPRETATION}
      ORDER BY scenario
    `;
    const result = db.executeSync(sql);
    return result.rows.map(row => row.scenario as string);
  }
}

export default new LiuyaoQueries();
