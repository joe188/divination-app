/**
 * SettingsScreen - 全局设置（国潮美化版）
 * 功能：AI 配置（自动获取模型列表）、主题设置、关于应用
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../styles/theme';

const { colors, fonts, spacing, radii } = theme;

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadSettings();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // 加载设置
  const loadSettings = async () => {
    try {
      const aiConfig = await AsyncStorage.getItem('ai_config');
      if (aiConfig) {
        const config = JSON.parse(aiConfig);
        setBaseUrl(config.baseUrl || '');
        setApiKey(config.apiKey || '');
        setSelectedModel(config.model || '');
        setModels(config.models || []);
      }
      
      const themeMode = await AsyncStorage.getItem('theme_mode');
      setDarkMode(themeMode === 'dark');
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  };

  // 保存设置
  const saveSettings = async () => {
    try {
      if (!baseUrl || !apiKey) {
        Alert.alert('⚠️ 提示', '请填写 Base URL 和 API Key');
        return;
      }

      const config = {
        baseUrl,
        apiKey,
        model: selectedModel,
        models,
        updatedAt: Date.now(),
      };

      await AsyncStorage.setItem('ai_config', JSON.stringify(config));
      Alert.alert('✅ 成功', '配置已保存');
    } catch (error: any) {
      Alert.alert('❌ 错误', `保存失败：${error.message}`);
    }
  };

  // 自动获取模型列表
  const fetchModels = async () => {
    if (!baseUrl || !apiKey) {
      Alert.alert('⚠️ 提示', '请先填写 Base URL 和 API Key');
      return;
    }

    setFetchingModels(true);
    try {
      // 确保 URL 格式正确
      let modelsUrl = baseUrl.replace(/\/$/, ''); // 移除末尾斜杠
      if (!modelsUrl.endsWith('/v1')) {
        modelsUrl = `${modelsUrl}/v1`;
      }
      modelsUrl = `${modelsUrl}/models`;

      console.log('请求模型列表:', modelsUrl);

      const response = await fetch(modelsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('模型列表响应:', data);

      // 解析模型列表（支持多种格式）
      let modelList: string[] = [];
      
      if (data.data && Array.isArray(data.data)) {
        // OpenAI 格式：{ data: [{ id: 'gpt-4' }, ...] }
        modelList = data.data.map((m: any) => m.id || m.name).filter(Boolean);
      } else if (Array.isArray(data)) {
        // 直接是数组
        modelList = data.map((m: any) => m.id || m.name || m).filter(Boolean);
      } else if (data.models && Array.isArray(data.models)) {
        // 某些 API 格式：{ models: [...] }
        modelList = data.models.map((m: any) => m.id || m.name).filter(Boolean);
      }

      if (modelList.length === 0) {
        throw new Error('未找到模型列表');
      }

      setModels(modelList);
      Alert.alert('✅ 成功', `获取到 ${modelList.length} 个模型`);
    } catch (error: any) {
      console.error('获取模型列表失败:', error);
      Alert.alert(
        '❌ 获取失败',
        `无法获取模型列表\n\n${error.message}\n\n请检查：\n1. Base URL 是否正确\n2. API Key 是否有效\n3. 网络连接是否正常`
      );
    } finally {
      setFetchingModels(false);
    }
  };

  // 测试连接
  const testConnection = async () => {
    if (!baseUrl || !apiKey) {
      Alert.alert('⚠️ 提示', '请先填写 Base URL 和 API Key');
      return;
    }

    setLoading(true);
    try {
      // 尝试调用一个简单的 API 来测试连接
      let testUrl = baseUrl.replace(/\/$/, '');
      if (!testUrl.endsWith('/v1')) {
        testUrl = `${testUrl}/v1`;
      }
      testUrl = `${testUrl}/models`;

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      if (response.ok) {
        Alert.alert('✅ 连接成功', 'API 配置正确，可以正常使用');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      Alert.alert('❌ 连接失败', `无法连接到 API 服务\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 切换主题
  const toggleTheme = async () => {
    try {
      const newMode = !darkMode;
      setDarkMode(newMode);
      await AsyncStorage.setItem('theme_mode', newMode ? 'dark' : 'light');
      Alert.alert('✅ 主题已切换', newMode ? '已切换到黑暗模式' : '已切换到明亮模式');
    } catch (error: any) {
      Alert.alert('❌ 错误', `切换主题失败：${error.message}`);
    }
  };

  // 清除配置
  const clearConfig = async () => {
    Alert.alert(
      '⚠️ 确认清除',
      '确定要清除所有 AI 配置吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('ai_config');
            setBaseUrl('');
            setApiKey('');
            setSelectedModel('');
            setModels([]);
            Alert.alert('✅ 已清除', 'AI 配置已重置');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>全局设置</Text>
        <Text style={styles.headerSubtitle}>AI 配置 · 主题 · 关于</Text>
        <View style={styles.baguaDecor}>
          <Text style={styles.baguaSymbol}>⚙️</Text>
          <Text style={styles.baguaSymbol}>📖</Text>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* AI 配置卡片 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🤖 AI 配置</Text>
            <Text style={styles.cardDesc}>配置大模型 API，支持自动获取模型列表</Text>

            <Text style={styles.label}>Base URL</Text>
            <TextInput
              style={styles.input}
              value={baseUrl}
              onChangeText={setBaseUrl}
              placeholder="http://localhost:8080 或 https://api.openai.com"
              placeholderTextColor={colors.gray[400]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.inputHint}>支持任意 OpenAI 兼容 API</Text>

            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="sk-..."
              placeholderTextColor={colors.gray[400]}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* 获取模型列表按钮 */}
            <TouchableOpacity
              style={[
                styles.fetchButton,
                (!baseUrl || !apiKey) && styles.buttonDisabled,
                fetchingModels && styles.buttonLoading,
              ]}
              onPress={fetchModels}
              disabled={!baseUrl || !apiKey || fetchingModels}
            >
              {fetchingModels ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.fetchButtonText}>📋 自动获取模型列表</Text>
              )}
            </TouchableOpacity>

            {/* 模型选择 */}
            {models.length > 0 && (
              <View style={styles.modelSection}>
                <Text style={styles.label}>选择模型 ({models.length}个)</Text>
                <TouchableOpacity
                  style={styles.modelSelector}
                  onPress={() => setShowModelPicker(true)}
                >
                  <Text style={styles.modelSelectorText}>
                    {selectedModel || '请选择模型'}
                  </Text>
                  <Text style={styles.modelSelectorArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 测试连接按钮 */}
            <TouchableOpacity
              style={[
                styles.testButton,
                (!baseUrl || !apiKey) && styles.buttonDisabled,
                loading && styles.buttonLoading,
              ]}
              onPress={testConnection}
              disabled={!baseUrl || !apiKey || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.testButtonText}>🔌 测试连接</Text>
              )}
            </TouchableOpacity>

            {/* 保存按钮 */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveSettings}
            >
              <Text style={styles.saveButtonText}>💾 保存配置</Text>
            </TouchableOpacity>

            {/* 清除配置 */}
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearConfig}
            >
              <Text style={styles.clearButtonText}>🗑️ 清除配置</Text>
            </TouchableOpacity>
          </View>

          {/* 主题设置卡片 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎨 主题设置</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>黑暗模式</Text>
                <Text style={styles.settingDesc}>切换应用主题</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.gray[300], true: colors.cinnabarRed }}
                thumbColor={darkMode ? colors.white : colors.gray[100]}
              />
            </View>
          </View>

          {/* 关于应用卡片 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📱 关于应用</Text>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>版本</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>构建日期</Text>
              <Text style={styles.aboutValue}>2026.04.19</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>技术支持</Text>
              <Text style={styles.aboutValue}>灵枢排盘团队</Text>
            </View>
            <TouchableOpacity style={styles.checkUpdateButton}>
              <Text style={styles.checkUpdateText}>🔄 检查更新</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>

      {/* 模型选择器 */}
      <Modal
        visible={showModelPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModelPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择模型 ({models.length}个)</Text>
              <TouchableOpacity onPress={() => setShowModelPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={models}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modelItem,
                    item === selectedModel && styles.modelItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedModel(item);
                    setShowModelPicker(false);
                  }}
                >
                  <Text style={[
                    styles.modelItemText,
                    item === selectedModel && styles.modelItemTextSelected,
                  ]}>
                    {item}
                  </Text>
                  {item === selectedModel && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
  header: {
    backgroundColor: colors.cinnabarRed,
    padding: spacing['2xl'],
    alignItems: 'center',
    borderBottomLeftRadius: radii['3xl'],
    borderBottomRightRadius: radii['3xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: fonts.sizes['3xl'],
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  baguaDecor: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  baguaSymbol: {
    fontSize: 24,
    marginHorizontal: spacing.md,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.sm,
  },
  cardDesc: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.riceWhite,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: radii.lg,
    padding: spacing.md,
    fontSize: fonts.sizes.md,
    fontFamily: fonts.sourceHan,
    color: colors.inkBlack,
  },
  inputHint: {
    fontSize: fonts.sizes.xs,
    fontFamily: fonts.sourceHan,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  fetchButton: {
    backgroundColor: colors.gold,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  testButton: {
    backgroundColor: colors.cinnabarRed,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.cinnabarRed,
    padding: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  clearButton: {
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[300],
  },
  buttonLoading: {
    opacity: 0.6,
  },
  fetchButtonText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
  },
  testButtonText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.semibold,
  },
  saveButtonText: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  clearButtonText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
  },
  modelSection: {
    marginTop: spacing.lg,
  },
  modelSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.riceWhite,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  modelSelectorText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.sourceHan,
    color: colors.inkBlack,
  },
  modelSelectorArrow: {
    fontSize: fonts.sizes.sm,
    color: colors.gray[500],
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingLeft: {
    flex: 1,
  },
  settingLabel: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
  },
  settingDesc: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  aboutLabel: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
  },
  aboutValue: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
  },
  checkUpdateButton: {
    backgroundColor: colors.riceWhite,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  checkUpdateText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.cinnabarRed,
    fontWeight: fonts.weights.semibold,
  },
  bottomPadding: {
    height: spacing['3xl'],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
  },
  modalClose: {
    fontSize: fonts.sizes.xl,
    color: colors.gray[500],
  },
  modelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  modelItemSelected: {
    backgroundColor: colors.riceWhite,
  },
  modelItemText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.sourceHan,
    color: colors.inkBlack,
  },
  modelItemTextSelected: {
    color: colors.cinnabarRed,
    fontWeight: fonts.weights.semibold,
  },
  checkmark: {
    fontSize: fonts.sizes.lg,
    color: colors.cinnabarRed,
    fontWeight: fonts.weights.bold,
  },
});

export default SettingsScreen;
