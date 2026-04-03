import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { calculateQiMen } from '../utils/qimen-calculator';
import { GuochaoCard } from '../components/GuochaoCard';
import { GuochaoButton } from '../components/GuochaoButton';

interface QiMenScreenProps {
  onBack: () => void;
  onSubmit?: (data: any) => void;
}

export const QiMenScreen: React.FC<QiMenScreenProps> = ({
  onBack,
  onSubmit,
}) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const qimenResult = calculateQiMen(new Date(), 1, 1, 1);
      setResult(qimenResult);
      if (onSubmit) {
        onSubmit({
          dateTime: new Date(),
          panType: 'current',
          liuJia: 1,
          diZhi: '子',
          jieQi: '冬至',
          fuShen: qimenResult.zhiFu,
          tianPan: qimenResult.baMen,
          diPan: qimenResult.jiuXing,
          result: qimenResult,
        });
      }
    } catch (e) {
      Alert.alert('起卦失败', String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>奇门遁甲</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <GuochaoCard title="起卦方式" variant="elevated">
          <View style={styles.row}>
            <Text style={styles.label}>使用当前系统时间起卦</Text>
          </View>
        </GuochaoCard>

        {result && (
          <GuochaoCard title="奇门遁甲盘" variant="pattern">
            <View style={styles.resultPreview}>
              <Text>值符：{result.zhiFu}</Text>
              <Text>值使：{result.zhiShi}</Text>
              <Text>八门：{result.baMen}</Text>
              <Text>九星：{result.jiuXing}</Text>
            </View>
          </GuochaoCard>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <GuochaoButton title={loading ? '起卦中...' : '起卦'} onPress={handleGenerate} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  back: { fontSize: 18, color: '#333' },
  headerTitle: { fontFamily: 'serif', fontSize: 20, color: '#000' },
  content: { flex: 1, padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { fontSize: 16, color: '#333' },
  switchText: { color: '#007AFF', fontSize: 16 },
  spacer: { height: 32 },
  footer: { padding: 16 },
  resultPreview: { gap: 8 },
});

export { QiMenScreen };
