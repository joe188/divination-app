/**
 * ManualScreen - 使用手册
 * 功能：所有功能说明 + AI 大模型设置说明
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import theme from '../styles/theme';

const { colors, fonts, spacing, radii } = theme;

// 手册章节
const manualSections = [
  {
    id: 'intro',
    title: '📱 应用简介',
    content: `灵枢排盘是一款专业的易学排盘应用，集成六爻、八字、奇门遁甲三大传统预测体系。

【核心功能】
• 六爻占卜：传统铜钱摇卦，智能解析
• 八字排盘：精准万年历，真太阳时校正
• 奇门遁甲：时家奇门，八门九星
• AI 解卦：接入主流 AI 大模型，智能解读
• 历史记录：完整保存每次排盘记录
• 知识库：丰富的易学基础知识`,
  },
  {
    id: 'liuyao',
    title: '🪙 六爻占卜',
    content: `【使用方法】
1. 点击「六爻占卜」进入排盘页面
2. 点击「摇卦」按钮，模拟抛掷三枚铜钱
3. 重复 6 次，自动生成完整卦象
4. 查看卦象、动爻、变卦信息

【摇卦规则】
• 3 正（字）= 老阴 ⚋ 变爻
• 2 正 1 背 = 少阳 ⚊
• 1 正 2 背 = 少阴 ⚋
• 0 正（3 背）= 老阳 ⚊ 变爻

【解析方式】
• 本地解析：基于传统断卦方法
• AI 解析：连接 AI 大模型详细解读

【注意事项】
• 摇卦前静心凝神，专注所问之事
• 一卦一问，不要重复摇同一问题
• 动爻越多，变化越复杂`,
  },
  {
    id: 'bazi',
    title: '📅 八字排盘',
    content: `【使用方法】
1. 点击「八字排盘」进入输入页面
2. 选择出生年月日时（支持 1900-2100 年）
3. 选择性别（影响大运排法）
4. 可选择公历/农历切换
5. 点击「手机定位」自动获取出生地
6. 点击「真太阳时校正」精确时辰

【真太阳时】
• 北京时间是东经 120°的时间
• 出生地经度不同，实际太阳时不同
• 每 1 度经度相差 4 分钟
• 建议进行校正，提高准确度

【排盘内容】
• 四柱：年柱、月柱、日柱、时柱
• 十神：比肩、劫财、食神等
• 五行：金木水火土分布
• 大运：十年一大运
• 流年：每年运势

【注意事项】
• 时辰尽量准确（误差不要超过 1 小时）
• 真太阳时校正需要准确的出生地
• 农历日期已自动转换为干支`,
  },
  {
    id: 'qimen',
    title: '🧭 奇门遁甲',
    content: `【使用方法】
1. 点击「奇门遁甲」进入排盘页面
2. 选择排盘时间（默认当前时间）
3. 选择节气（影响定局）
4. 点击「起局」生成奇门盘

【奇门组成】
• 九宫：坎一宫到离九宫
• 八门：休生伤杜景死惊开
• 九星：天蓬、天任等
• 八神：值符、螣蛇等
• 三奇六仪：乙丙丁 + 戊己庚辛壬癸

【应用范围】
• 择吉：选择有利时间和方向
• 预测：判断事物发展趋势
• 运筹：制定最佳行动方案

【注意事项】
• 奇门遁甲以时家奇门为主
• 节气交接时间影响定局
• 结合用神落宫综合判断`,
  },
  {
    id: 'ai',
    title: '🤖 AI 大模型设置',
    content: `【支持的 AI 提供商】
• OpenAI（GPT-4、GPT-3.5）
• 文心一言（百度）
• 通义千问（阿里）
• 讯飞星火（科大讯飞）
• 自定义兼容接口

【配置步骤】
1. 点击底部「设置」进入全局设置
2. 填写 Base URL（API 接口地址）
3. 填写 API Key（密钥）
4. 点击「自动获取模型列表」
5. 选择要使用的模型
6. 点击「保存配置」

【各平台配置示例】

OpenAI：
• Base URL: https://api.openai.com/v1
• 模型：gpt-4, gpt-3.5-turbo

文心一言：
• Base URL: https://aip.baidubce.com/rpc/2.0/ai_custom/v1
• 需要申请 API Key 和 Secret Key

通义千问：
• Base URL: https://dashscope.aliyuncs.com/api/v1
• 模型：qwen-turbo, qwen-plus

【注意事项】
• API Key 请妥善保管，不要泄露
• 部分平台需要实名认证
• AI 解析需要网络连接
• 解析结果仅供参考，不要迷信`,
  },
  {
    id: 'history',
    title: '📜 历史记录',
    content: `【查看记录】
1. 点击底部「历史」标签
2. 按时间顺序显示所有排盘记录
3. 支持按类型筛选（六爻/八字/奇门）

【记录管理】
• 点击记录查看详情
• 支持收藏重要记录
• 支持搜索历史记录
• 支持删除不需要的记录

【记录内容】
• 排盘时间、类型
• 完整的卦象/八字/奇门盘
• AI 解析结果（如果有）
• 个人备注（可选）

【数据备份】
• 记录保存在本地数据库
• 卸载应用会清除所有数据
• 建议定期截图保存重要记录`,
  },
  {
    id: 'knowledge',
    title: '📚 知识库',
    content: `【知识库内容】
• 六爻基础：概念、六亲、断卦方法
• 八字基础：四柱、十神、真太阳时
• 奇门基础：九宫、八门、三奇六仪
• 通用知识：阴阳五行、天干地支

【使用方法】
1. 点击「设置」>「易学知识库」
2. 按分类浏览或搜索关键词
3. 点击条目查看详细内容

【学习建议】
• 先学习基础知识，再实践排盘
• 理论与实践相结合
• 多记录、多总结、多思考`,
  },
  {
    id: 'tips',
    title: '💡 使用技巧',
    content: `【提高准确度】
1. 保持心诚，专注所问之事
2. 使用真太阳时校正（八字）
3. 准确记录摇卦结果（六爻）
4. 选择正确的节气（奇门）

【常见问题】
Q: AI 解析不准确怎么办？
A: AI 只是辅助工具，建议结合传统断卦方法综合判断。

Q: 历史记录丢失？
A: 检查是否卸载过应用，本地数据会随卸载清除。

Q: 定位功能不可用？
A: 检查是否授予了位置权限，或手动选择城市。

Q: 模型列表获取失败？
A: 检查 Base URL 和 API Key 是否正确，网络连接是否正常。

【免责声明】
• 本应用仅供学习和娱乐
• 预测结果仅供参考
• 不要用于违法活动
• 相信科学，理性对待`,
  },
];

export const ManualScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <ScrollView style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📖 使用手册</Text>
        <Text style={styles.headerSubtitle}>灵枢排盘完全指南</Text>
      </View>

      {/* 章节列表 */}
      {manualSections.map((section) => (
        <View key={section.id} style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() =>
              setExpandedSection(expandedSection === section.id ? null : section.id)
            }
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionArrow}>
              {expandedSection === section.id ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {expandedSection === section.id && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>{section.content}</Text>
            </View>
          )}
        </View>
      ))}

      {/* 底部信息 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>灵枢排盘 v1.0.0</Text>
        <Text style={styles.footerText}>© 2026 灵枢排盘团队</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://github.com/joe188/divination-app')}
        >
          <Text style={styles.footerLink}>GitHub 项目地址</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
  header: {
    backgroundColor: colors.cinnabarRed,
    padding: spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
    flex: 1,
  },
  sectionArrow: {
    fontSize: fonts.sizes.lg,
    color: colors.gray[500],
  },
  sectionContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  sectionText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.sourceHan,
    color: colors.inkBlack,
    lineHeight: 26,
    whiteSpace: 'pre-line',
  },
  footer: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  footerLink: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.cinnabarRed,
    fontWeight: fonts.weights.semibold,
    marginTop: spacing.md,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});
