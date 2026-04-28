import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { liuyaoQueries } from '../database';
import theme from '../styles/theme';
import { responsiveFontSize } from '../styles/responsive';

const { colors, fonts, spacing } = theme;

export default function YijingTestScreen() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    // 自动初始化并加载所有
    loadAllReadings();
  }, []);

  const loadAllReadings = async () => {
    setLoading(true);
    try {
      const all = await liuyaoQueries.findByHexagram('天风姤');
      setResults(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await liuyaoQueries.search(query);
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleScenario = async (scenario: string) => {
    setLoading(true);
    try {
      const res = await liuyaoQueries.findByScenario(scenario);
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>六爻解读测试页</Text>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="搜索卦名/场景/目标"
          value={query}
          onChangeText={setQuery}
        />
        <Button title="搜索" onPress={handleSearch} />
      </View>

      <View style={styles.row}>
        <Button title="天风姤" onPress={loadAllReadings} />
        <Button title="婚姻" onPress={() => handleScenario('婚姻')} />
        <Button title="事业" onPress={() => handleScenario('事业')} />
        <Button title="健康" onPress={() => handleScenario('健康')} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.list}>
          {results.map((r, i) => (
            <View key={i} style={styles.item}>
              <Text style={styles.header}>
                {r.hexagram_name} · {r.scenario} · {r.target} {r.yao_condition ? `(${r.yao_condition})` : ''}
              </Text>
              <Text style={styles.content} numberOfLines={5}>
                {r.content.replace(/<[^>]+>/g, '').slice(0, 150)}...
              </Text>
            </View>
          ))}
          {results.length === 0 && !loading && (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>暂无结果</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, marginRight: 8 },
  list: { flex: 1 },
  item: { borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 12 },
  header: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  content: { fontSize: 14, color: '#666' },
});
