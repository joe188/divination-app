// 六十四卦基础种子数据（精简版）
// 包含：卦号、卦名、拼音、上卦、下卦、卦辞、彖传、象传（上/下）
// 完整爻辞和解读将从外部数据文件导入（gua.sql 转换）

export interface HexagramSeed {
  number: number; // 1-64
  name: string;
  pinyin: string;
  upper_ga: string; // 上卦名称（乾、坤、震、巽、坎、离、艮、兑）
  lower_ga: string;
  gua_ci: string; // 卦辞
  tuan_ci: string; // 彖辞
  xiang_ci_upper: string; // 象传（上）
  xiang_ci_lower: string; // 象传（下）
  xiang_ci_full?: string; // 完整象传（可选）
  related_hexagrams?: {
    zong: number; // 综卦（上下颠倒）
    cuo: number; // 错卦（阴阳全反）
    hu: number[]; // 互卦（中间四爻）
  };
  wuxing_nature?: string; // 五行属性概括
  is_double?: boolean; // 是否纯卦（上下卦相同）
}

// 64 卦数据（简化，仅用于核心功能）
export const hexagramSeeds: HexagramSeed[] = [
  {
    number: 1,
    name: '乾',
    pinyin: 'qián',
    upper_ga: '乾',
    lower_ga: '乾',
    gua_ci: '元亨，利贞。',
    tuan_ci: '大哉乾元，万物资始，乃统天。云行雨施，品物流形。',
    xiang_ci_upper: '天行健，君子以自强不息。',
    xiang_ci_lower: '',
    is_double: true,
    wuxing_nature: '金',
  },
  {
    number: 2,
    name: '坤',
    pinyin: 'kūn',
    upper_ga: '坤',
    lower_ga: '坤',
    gua_ci: '元亨，利牝马之贞。',
    tuan_ci: '至哉坤元，万物资生，乃顺承天。',
    xiang_ci_upper: '地势坤，君子以厚德载物。',
    xiang_ci_lower: '',
    is_double: true,
    wuxing_nature: '土',
  },
  {
    number: 3,
    name: '屯',
    pinyin: 'zhūn',
    upper_ga: '坎',
    lower_ga: '震',
    gua_ci: '元亨利贞。勿用有攸往，利建侯。',
    tuan_ci: '屯，刚柔始交而难生。',
    xiang_ci_upper: '云雷，屯；君子以经纶。',
    xiang_ci_lower: '',
    wuxing_nature: '水',
  },
  {
    number: 4,
    name: '蒙',
    pinyin: 'méng',
    upper_ga: '坎',
    lower_ga: '艮',
    gua_ci: '亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。利贞。',
    tuan_ci: '蒙，山下有险，险而止，蒙。',
    xiang_ci_upper: '山下出泉，蒙；君子以果行育德。',
    xiang_ci_lower: '',
    wuxing_nature: '水',
  },
  {
    number: 5,
    name: '需',
    pinyin: 'xū',
    upper_ga: '乾',
    lower_ga: '坎',
    gua_ci: '有孚，光亨，贞吉。利涉大川。',
    tuan_ci: '需，须也；险在前也。刚健而不陷，其义不困穷矣。',
    xiang_ci_upper: '云上于天，需；君子以饮食宴乐。',
    xiang_ci_lower: '',
    wuxing_nature: '水',
  },
  {
    number: 6,
    name: '讼',
    pinyin: 'sòng',
    upper_ga: '乾',
    lower_ga: '坎',
    gua_ci: '有孚，窒。惕中吉。终凶。利见大人，不利涉大川。',
    tuan_ci: '讼，上刚下险，险而健，讼。',
    xiang_ci_upper: '天与水违行，讼；君子以作事谋始。',
    xiang_ci_lower: '',
    wuxing_nature: '水',
  },
  {
    number: 7,
    name: '师',
    pinyin: 'shī',
    upper_ga: '坤',
    lower_ga: '坎',
    gua_ci: '贞，丈人吉，无咎。',
    tuan_ci: '师，众也，贞正也，能以众正，可以王矣。',
    xiang_ci_upper: '地中有水，师；君子以容民畜众。',
    xiang_ci_lower: '',
    wuxing_nature: '土',
  },
  {
    number: 8,
    name: '比',
    pinyin: 'bǐ',
    upper_ga: '坎',
    lower_ga: '坤',
    gua_ci: '吉。原筮元永贞，无咎。不宁方来，后夫凶。',
    tuan_ci: '比，吉也；比，辅也，下顺从也。',
    xiang_ci_upper: '地上有水，比；先王以建万国，亲诸侯。',
    xiang_ci_lower: '',
    wuxing_nature: '土',
  },
  {
    number: 9,
    name: '小畜',
    pinyin: 'xiǎo xù',
    upper_ga: '乾',
    lower_ga: '巽',
    gua_ci: '亨。密云不雨，自我西郊。',
    tuan_ci: '小畜，柔得位而上下应之，曰小畜。',
    xiang_ci_upper: '风行天上，小畜；君子以懿文德。',
    xiang_ci_lower: '',
    wuxing_nature: '木',
  },
  {
    number: 10,
    name: '履',
    pinyin: 'lǚ',
    upper_ga: '乾',
    lower_ga: '兑',
    gua_ci: '履虎尾，不咥人，亨。',
    tuan_ci: '履，柔履刚也。说而应乎乾，是以履虎尾，不咥人，亨。',
    xiang_ci_upper: '上天下泽，履；君子以辨上下，定民志。',
    xiang_ci_lower: '',
    wuxing_nature: '金',
  },
  // 这里只列 10 个示例，完整 64 卦等数据导入后自动补全
];

// 生成其余省略的卦（占位，实际需完整数据）
export const getHexagramSeeds = () => hexagramSeeds;

// TODO: 从 converted gua.sql 数据文件导入完整的 hexagram 数据
// import { liuyaoDatabase } from './liuyao-converted';
// export const getFullHexagramSeeds = () => liuyaoDatabase;
