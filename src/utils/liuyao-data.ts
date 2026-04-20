/**
 * 六爻 64 卦数据
 * 来源：传统《易经》原文（彖传、象传、爻辞）
 */

// 64 卦简表（卦名、卦象、彖传、象传、爻辞）
// 完整数据可后续扩展，这里先实现前 8 卦作为 demo

export interface Hexagram {
  number: number;
  name: string;
  symbol: string; // 如 "䷀"
  gua: string; // 上下卦名，如 "乾下乾上"
  judgement: string; // 彖传（卦辞）
  image: string; // 象传
  lines: LineText[];
}

export interface LineText {
  position: number; // 1-6，从下往上
  content: string; // 爻辞
  nineOrSix: string; // 阳爻(九)或阴爻(六)，包括'九五','上九'等
}

// 简化版：前 8 卦数据
export const hexagramData: Hexagram[] = [
  {
    number: 1,
    name: '乾',
    symbol: '䷀',
    gua: '乾下乾上',
    judgement: '元亨利贞。',
    image: '天行健，君子以自强不息。',
    lines: [
      { position: 1, nineOrSix: '九', content: '初九：潜龙勿用。' },
      { position: 2, nineOrSix: '九', content: '九二：见龙在田，利见大人。' },
      { position: 3, nineOrSix: '九', content: '九三：君子终日乾乾，夕惕若厉，无咎。' },
      { position: 4, nineOrSix: '九', content: '九四：或跃在渊，无咎。' },
      { position: 5, nineOrSix: '九', content: '九五：飞龙在天，利见大人。' },
      { position: 6, nineOrSix: '九', content: '上九：亢龙有悔。' },
    ],
  },
  {
    number: 2,
    name: '坤',
    symbol: '䷁',
    gua: '坤下坤上',
    judgement: '元亨，利牝马之贞。',
    image: '地势坤，君子以厚德载物。',
    lines: [
      { position: 1, nineOrSix: '六', content: '初六：履霜，坚冰至。' },
      { position: 2, nineOrSix: '六', content: '六二：直方大，不习无不利。' },
      { position: 3, nineOrSix: '六', content: '六三：含章可贞，或从王事，无成有终。' },
      { position: 4, nineOrSix: '六', content: '六四：括囊，无咎无誉。' },
      { position: 5, nineOrSix: '六', content: '六五：黄裳，元吉。' },
      { position: 6, nineOrSix: '六', content: '上六：龙战于野，其血玄黄。' },
    ],
  },
  {
    number: 3,
    name: '屯',
    symbol: '䷂',
    gua: '坎下震上',
    judgement: '元亨利贞。勿用有攸往，利建侯。',
    image: '云雷屯，君子以经纶。',
    lines: [
      { position: 1, nineOrSix: '六', content: '初九：磐桓，利居贞，利建侯。' },
      { position: 2, nineOrSix: '六', content: '六二：屯如邅如，乘马班如，求婚媾，往无不利。' },
      { position: 3, nineOrSix: '六', content: '六三：即鹿无虞，惟入于林中，君子几不如舍，往吝。' },
      { position: 4, nineOrSix: '六', content: '六四：乘马班如，求婚媾，吉，往来无所咎。' },
      { position: 5, nineOrSix: '六', content: '九五：屯其膏，小贞吉，大贞凶。' },
      { position: 6, nineOrSix: '六', content: '上六：乘马班如，泣血涟如。' },
    ],
  },
  {
    number: 4,
    name: '蒙',
    symbol: '䷃',
    gua: '艮下坎上',
    judgement: '亨。匪我求童蒙，童蒙求我。',
    image: '山下出泉，蒙；君子以果行育德。',
    lines: [
      { position: 1, nineOrSix: '六', content: '初六：发蒙，利用刑人，用说桎梏，以往吝。' },
      { position: 2, nineOrSix: '九', content: '九二：包蒙，吉。纳妇，吉。子克家。' },
      { position: 3, nineOrSix: '六', content: '六三：勿用娶女，见金夫，不有躬，无攸利。' },
      { position: 4, nineOrSix: '六', content: '六四：困蒙，吝。' },
      { position: 5, nineOrSix: '六', content: '六五：童蒙，吉。' },
      { position: 6, nineOrSix: '九', content: '上九：击蒙，不利为寇，利御寇。' },
    ],
  },
  {
    number: 5,
    name: '需',
    symbol: '䷄',
    gua: '乾下坎上',
    judgement: '有孚，光亨，贞吉。利涉大川。',
    image: '云上于天，需；君子以饮食宴乐。',
    lines: [
      { position: 1, nineOrSix: '九', content: '初九：需于郊，利用恒，无咎。' },
      { position: 2, nineOrSix: '九', content: '九二：需于沙，小有言，终吉。' },
      { position: 3, nineOrSix: '九', content: '九三：需于泥，致寇至。' },
      { position: 4, nineOrSix: '六', content: '六四：需于血，出自穴。' },
      { position: 5, nineOrSix: '九', content: '九五：需于酒食，贞吉。' },
      { position: 6, nineOrSix: '六', content: '上六：入于穴，有不速之客三人来，敬之终吉。' },
    ],
  },
  {
    number: 6,
    name: '讼',
    symbol: '䷅',
    gua: '坎下乾上',
    judgement: '有孚，窒惕，中吉，终凶。利见大人，不利涉大川。',
    image: '天与水违行，讼；君子以作事谋始。',
    lines: [
      { position: 1, nineOrSix: '六', content: '初六：不永所事，小有言，终吉。' },
      { position: 2, nineOrSix: '九', content: '九二：不克讼，归而逋，其邑人三百户无眚。' },
      { position: 3, nineOrSix: '六', content: '六三：食旧德，贞厉，终吉。或从王事，无成。' },
      { position: 4, nineOrSix: '九', content: '九四：不克讼，复即命渝，安贞吉。' },
      { position: 5, nineOrSix: '九', content: '九五：讼，元吉。' },
      { position: 6, nineOrSix: '九', content: '上九：或锡之鞶带，终朝三褫之。' },
    ],
  },
  {
    number: 7,
    name: '师',
    symbol: '䷆',
    gua: '坎下坤上',
    judgement: '贞，丈人吉，无咎。',
    image: '地中有水，师；君子以容民畜众。',
    lines: [
      { position: 1, nineOrSix: '六', content: '初六：师出以律，否臧凶。' },
      { position: 2, nineOrSix: '九', content: '九二：在师中吉，无咎，王三锡命。' },
      { position: 3, nineOrSix: '六', content: '六三：师或舆尸，凶。' },
      { position: 4, nineOrSix: '六', content: '六四：师左次，无咎。' },
      { position: 5, nineOrSix: '六', content: '六五：田有禽，利执言，无咎。长子帅师，弟子舆尸，贞凶。' },
      { position: 6, nineOrSix: '六', content: '上六：大君有命，开国承家，小人勿用。' },
    ],
  },
  {
    number: 8,
    name: '比',
    symbol: '䷇',
    gua: '坤下坎上',
    judgement: '吉。原筮元永贞，无咎。不宁方来，后夫凶。',
    image: '地上有水，比；先王以建万国，亲诸侯。',
    lines: [
      { position: 1, nineOrSix: '六', content: '初六：有孚比之，无咎。有孚盈缶，终来有它，吉。' },
      { position: 2, nineOrSix: '六', content: '六二：比之自内，贞吉。' },
      { position: 3, nineOrSix: '六', content: '六三：比之匪人。' },
      { position: 4, nineOrSix: '六', content: '六四：外比之，贞吉。' },
      { position: 5, nineOrSix: '九', content: '九五：显比，王用三驱，失前禽，邑人不诫，吉。' },
      { position: 6, nineOrSix: '六', content: '上六：比之无首，凶。' },
    ],
  },
];

// 根据卦编号获取数据
export function getHexagramByNumber(num: number): Hexagram | undefined {
  return hexagramData.find((h) => h.number === num);
}

// 根据六爻数组计算卦象（简化：从下往上，阳为1，阴为0，生成两个 3-bit 二进制）
// 上卦：第4-6爻；下卦：第1-3爻
export function calculateHexagramNumber(
  lines: Array<{ isYang: boolean }>
): { lower: number; upper: number; hexagram: number } {
  const bits = lines.map((l) => (l.isYang ? 1 : 0));
  const lower = bits[0] * 1 + bits[1] * 2 + bits[2] * 4; // 低位到高位
  const upper = bits[3] * 1 + bits[4] * 2 + bits[5] * 4;
  const hexagram = lower + upper;
  return { lower, upper, hexagram };
}

// 获取动爻（阳变阴、阴变阳）
export function getDynamicLines(
  lines: Array<{ isYang: boolean; isDynamic: boolean }>
): number[] {
  return lines
    .map((l, idx) => (l.isDynamic ? idx + 1 : 0))
    .filter((pos) => pos > 0);
}

// 获取变卦（根据动爻变化）
// 返回 0(阴) / 1(阳) 数组
export function getChangedHexagram(
  lines: Array<{ isYang: boolean; isDynamic: boolean }>
): number[] {
  return lines.map((l) => (l.isDynamic ? (l.isYang ? 0 : 1) : l.isYang ? 1 : 0));
}

// 64 卦名称数组（索引 0-63）
export const GUA64_NAME: string[] = [
  '乾为天', '坤为地', '水雷屯', '山水蒙', '水天需', '天水讼', '地水师', '水地比',
  '风天小畜', '天泽履', '地天泰', '天地否', '天火同人', '火天大有', '地山谦', '雷地豫',
  '泽雷随', '山风蛊', '地泽临', '风地观', '火雷噬嗑', '山火贲', '山地剥', '地雷复',
  '天雷无妄', '山天大畜', '山雷颐', '泽风大过', '坎为水', '离为火', '泽山咸', '雷风恒',
  '天山遁', '雷天大壮', '火地晋', '地火明夷', '风火家人', '火泽睽', '水山蹇', '雷水解',
  '山泽损', '风雷益', '泽天夬', '天风姤', '泽地萃', '地风升', '泽水困', '水风井',
  '泽火革', '火风鼎', '震为雷', '艮为山', '风山渐', '雷泽归妹', '雷火丰', '火山旅',
  '巽为风', '兑为泽', '风水涣', '水泽节', '风泽中孚', '雷山小过', '水火既济', '火水未济',
];

/**
 * 获取卦象含义
 */
export const getHexagramMeaning = (guaName: string): { summary: string; image: string } | null => {
  const index = GUA64_NAME.indexOf(guaName);
  if (index === -1 || !hexagramData[index]) return null;
  
  const gua = hexagramData[index];
  return {
    summary: gua.judgement,
    image: gua.image,
  };
};