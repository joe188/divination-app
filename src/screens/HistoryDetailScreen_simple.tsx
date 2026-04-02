import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import theme from '../styles/theme';
const { colors, fonts, spacing } = theme;

interface HistoryDetailScreenProps {
  onBack: () => void;
  onDelete: (id: string) => void;
  route: { params: { item: any } };
}

export const HistoryDetailScreen: React.FC<HistoryDetailScreenProps> = ({
  route,
  onBack,
  onDelete,
}) => {
  const { item } = route.params;
  const renderDetail = () => {
    if (item.type === 'liuyao') {
      return (
        <View>
          <Text>卦名: {item.guaName}</Text>
          <Text>变卦: {item.bianguaName}</Text>
          {item.yaoTexts && item.yaoTexts.map((txt: string, i: number) => (
            <Text key={i}>{i+1}. {txt}</Text>
          ))}
          <Text>卦辞: {item.summary || ''}</Text>
        </View>
      );
    }
    return <Text>暂不支持该类型详情</Text>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>历史详情</Text>
        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Text style={styles.delete}>删除</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {renderDetail()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.riceWhite },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  back: { fontSize: fonts.sizes.md, color: colors.inkBlack },
  title: { fontFamily: fonts.kaiTi, fontSize: fonts.sizes.lg, color: colors.inkBlack },
  delete: { fontSize: fonts.sizes.md, color: colors.cinnabarRed },
  content: { flex: 1, padding: spacing.lg },
});

export { HistoryDetailScreen };
