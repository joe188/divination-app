# 国潮 UI 组件使用指南

> 🦐 灵枢智能排盘 - 国潮风格组件库  
> 让传统文化触手可及

---

## 🎨 色彩系统

```typescript
import { colors } from './src/styles/theme';

// 主色调
colors.cinnabarRed  // #C43C3C - 朱砂红
colors.inkBlack     // #1A1A1A - 墨黑
colors.riceWhite    // #F5F0E6 - 米白
colors.gold         // #D4A76A - 金色

// 五行色
colors.wood   // #4CAF50 - 木绿
colors.fire   // #F44336 - 火红
colors.earth  // #FFC107 - 土黄
colors.metal  // #FFFFFF - 金白
colors.water  // #2196F3 - 水蓝
```

---

## 🧩 基础组件

### 1. GuochaoButton (国潮按钮)

**特点**: 朱砂红主色调、水墨晕染效果、微交互动画

```tsx
import { GuochaoButton } from './src/components';

// 主要按钮 - 朱砂红
<GuochaoButton
  title="开始排盘"
  variant="primary"
  size="large"
  onPress={() => console.log('点击')}
/>

// 次要按钮 - 米白色
<GuochaoButton
  title="取消"
  variant="secondary"
  onPress={() => console.log('取消')}
/>

// 边框按钮
<GuochaoButton
  title="查看详情"
  variant="outline"
  onPress={() => console.log('查看')}
/>

// 幽灵按钮
<GuochaoButton
  title="跳过"
  variant="ghost"
  onPress={() => console.log('跳过')}
/>

// 带加载状态
<GuochaoButton
  title="提交"
  variant="primary"
  loading={isLoading}
  onPress={handleSubmit}
/>

// 禁用状态
<GuochaoButton
  title="提交"
  variant="primary"
  disabled={true}
/>
```

**Props 说明**:

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 按钮文字 |
| variant | primary\|secondary\|outline\|ghost | primary | 按钮变体 |
| size | small\|medium\|large | medium | 按钮尺寸 |
| onPress | () => void | - | 点击事件 |
| disabled | boolean | false | 禁用状态 |
| loading | boolean | false | 加载状态 |
| icon | ReactNode | - | 图标 |
| style | ViewStyle | - | 自定义样式 |

---

### 2. GuochaoInput (国潮输入框)

**特点**: 宣纸质感、极简设计、聚焦动画

```tsx
import { GuochaoInput } from './src/components';

// 基础用法
<GuochaoInput
  label="姓名"
  value={name}
  onChangeText={setName}
  placeholder="请输入姓名"
/>

// 带错误提示
<GuochaoInput
  label="手机号"
  value={phone}
  onChangeText={setPhone}
  error="手机号格式不正确"
  keyboardType="phone-pad"
/>

// 多行输入
<GuochaoInput
  label="备注"
  value={note}
  onChangeText={setNote}
  multiline
  numberOfLines={4}
/>

// 带图标
<GuochaoInput
  label="搜索"
  value={searchText}
  onChangeText={setSearchText}
  icon={<Text>🔍</Text>}
/>

// 禁用状态
<GuochaoInput
  label="只读"
  value="只读内容"
  disabled
/>
```

**Props 说明**:

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string | - | 标签文字 |
| value | string | - | 输入值 |
| onChangeText | (text) => void | - | 值变化回调 |
| placeholder | string | - | 占位符 |
| keyboardType | KeyboardTypeOptions | default | 键盘类型 |
| error | string | - | 错误信息 |
| disabled | boolean | false | 禁用状态 |
| multiline | boolean | false | 多行输入 |
| numberOfLines | number | 1 | 多行行数 |
| maxLength | number | - | 最大长度 |

---

### 3. GuochaoCard (国潮卡片)

**特点**: 宣纸纹理、传统纹样、层次分明

```tsx
import { GuochaoCard } from './src/components';

// 默认卡片
<GuochaoCard>
  <Text>卡片内容</Text>
</GuochaoCard>

// 带标题
<GuochaoCard title="基本信息">
  <Text>内容...</Text>
</GuochaoCard>

// 带图标
<GuochaoCard 
  title="今日运势"
  icon={<Text>🔮</Text>}
>
  <Text>内容...</Text>
</GuochaoCard>

// 浮起样式
<GuochaoCard variant="elevated">
  <Text>浮起效果</Text>
</GuochaoCard>

// 传统纹样样式
<GuochaoCard variant="pattern">
  <Text>传统纹样</Text>
</GuochaoCard>

// 带右侧内容
<GuochaoCard
  title="设置"
  headerRight={
    <TouchableOpacity>
      <Text>更多</Text>
    </TouchableOpacity>
  }
>
  <Text>内容...</Text>
</GuochaoCard>
```

**Props 说明**:

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 卡片标题 |
| variant | default\|elevated\|pattern\|plain | default | 卡片变体 |
| icon | ReactNode | - | 标题图标 |
| headerRight | ReactNode | - | 标题右侧内容 |
| style | ViewStyle | - | 自定义样式 |

---

## 📱 页面组件

### 页面导航结构

```
App.tsx
├── HomeScreen (首页)
│   ├── 今日运势卡片
│   ├── 开始排盘按钮
│   └── 历史记录
│
├── BaZiInputScreen (排盘输入页)
│   ├── 公历/农历切换
│   ├── 年月日时选择
│   ├── 出生地输入
│   └── 真太阳时开关
│
└── ResultScreen (结果页)
    ├── 四柱八字展示
    ├── 五行分布图
    └── AI 解卦入口
```

---

## 🎨 使用场景示例

### 场景 1: 表单页面

```tsx
import { GuochaoCard, GuochaoInput, GuochaoButton } from './src/components';
import { colors } from './src/styles/theme';

export default function FormPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  return (
    <View style={{ padding: 20 }}>
      <GuochaoCard title="个人信息">
        <GuochaoInput
          label="姓名"
          value={name}
          onChangeText={setName}
          placeholder="请输入姓名"
        />
        
        <GuochaoInput
          label="手机号"
          value={phone}
          onChangeText={setPhone}
          placeholder="请输入手机号"
          keyboardType="phone-pad"
        />
        
        <GuochaoInput
          label="备注"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />
      </GuochaoCard>
      
      <GuochaoButton
        title="提交"
        variant="primary"
        size="large"
        onPress={handleSubmit}
      />
    </View>
  );
}
```

---

### 场景 2: 信息展示

```tsx
import { GuochaoCard } from './src/components';
import { colors } from './src/styles/theme';

export default function InfoPage() {
  return (
    <View style={{ padding: 20 }}>
      <GuochaoCard title="基本信息" variant="pattern">
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Text style={{ fontWeight: '600' }}>姓名：</Text>
          <Text>张三</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ fontWeight: '600' }}>生日：</Text>
          <Text>1990 年 8 月 15 日</Text>
        </View>
      </GuochaoCard>
      
      <GuochaoCard title="五行分析" variant="elevated">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>木：25%</Text>
          <Text>火：20%</Text>
          <Text>土：30%</Text>
          <Text>金：15%</Text>
          <Text>水：10%</Text>
        </View>
      </GuochaoCard>
    </View>
  );
}
```

---

### 场景 3: 操作确认

```tsx
import { GuochaoCard, GuochaoButton } from './src/components';

export default function ConfirmDialog() {
  return (
    <GuochaoCard variant="elevated">
      <Text style={{ textAlign: 'center', marginBottom: 20 }}>
        确定要执行此操作吗？
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <GuochaoButton
          title="取消"
          variant="outline"
          style={{ flex: 0.48 }}
          onPress={handleCancel}
        />
        
        <GuochaoButton
          title="确定"
          variant="primary"
          style={{ flex: 0.48 }}
          onPress={handleConfirm}
        />
      </View>
    </GuochaoCard>
  );
}
```

---

## 🎯 最佳实践

### 1. 保持一致性

```tsx
// ✅ 推荐：统一使用主题色
import { colors } from './src/styles/theme';

<View style={{ backgroundColor: colors.riceWhite }}>
  <Text style={{ color: colors.inkBlack }}>内容</Text>
</View>

// ❌ 避免：硬编码颜色
<View style={{ backgroundColor: '#F5F0E6' }}>
  <Text style={{ color: '#1A1A1A' }}>内容</Text>
</View>
```

### 2. 合理使用卡片变体

```tsx
// 内容分组 - 使用 default
<GuochaoCard title="基本信息">
  <Text>内容...</Text>
</GuochaoCard>

// 强调内容 - 使用 pattern
<GuochaoCard title="今日运势" variant="pattern">
  <Text>重点内容...</Text>
</GuochaoCard>

// 浮起效果 - 使用 elevated
<GuochaoCard variant="elevated">
  <Text>浮起内容...</Text>
</GuochaoCard>
```

### 3. 按钮使用规范

```tsx
// 主要操作 - 使用 primary
<GuochaoButton title="提交" variant="primary" />

// 次要操作 - 使用 outline
<GuochaoButton title="取消" variant="outline" />

// 危险操作 - 使用 fire 色（需自定义）
// 一般操作 - 使用 ghost
<GuochaoButton title="跳过" variant="ghost" />
```

---

## 📐 间距系统

```typescript
import { spacing } from './src/styles/theme';

// 间距基准：8px
spacing.xs   // 4px
spacing.sm   // 8px
spacing.md   // 12px
spacing.lg   // 16px
spacing.xl   // 20px
spacing['2xl']  // 24px
spacing['3xl']  // 32px
spacing['4xl']  // 40px
spacing['5xl']  // 48px
spacing['6xl']  // 64px
```

**使用示例**:

```tsx
<View style={{ padding: spacing.lg }}>
  <Text style={{ marginBottom: spacing.md }}>内容</Text>
  <View style={{ marginTop: spacing.xl }}>
    <GuochaoButton title="提交" />
  </View>
</View>
```

---

## 🎭 动画效果

组件内置动画效果：

1. **按钮按压**: 缩放至 0.96 倍
2. **输入框聚焦**: 边框颜色渐变
3. **卡片阴影**: 统一阴影系统

如需自定义动画，可使用 React Native 的 Animated API。

---

## 📱 响应式支持

所有组件均支持响应式布局：

```tsx
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// 根据屏幕宽度调整
const buttonWidth = width > 400 ? 200 : width - 40;
```

---

## 🔧 自定义主题

可通过覆盖 theme.ts 中的值来自定义主题：

```tsx
// 自定义主题
const customTheme = {
  colors: {
    ...colors,
    cinnabarRed: '#YOUR_COLOR',
  },
};
```

---

> 🦐 **灵虾寄语**: 让古老智慧在指尖流转，让传统文化焕发新生。
