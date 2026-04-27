/**
 * AiConfigScreen - AI 配置页面
 * 功能：配置大模型 API，支持自动获取模型列表
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
  Modal,
  FlatList,
} from 'react-native';
import theme from '../styles/theme';
import { getAiConfig, saveAiConfig, clearAiConfig, AiConfig } from '../database/queries/ai-config';

const { colors, fonts, spacing, radii } = theme;

export const AiConfigScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [enabled, setEnabled] = useState(true);  // 默认启用
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  // 加载设置
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const config = await getAiConfig();
      if (config) {
        setEnabled(config.enabled ?? true);  // 兼容旧数据
        setBaseUrl(config.baseUrl || '');
        setApiKey(config.apiKey || '');
        setSelectedModel(config.model || '');
        setModels(config.models || []);
      }
    } catch (error) {
      console.error('加载设置失败:', error);
      Alert.alert('❌ 错误', '加载设置失败，请重试');
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
      let modelsUrl = baseUrl.replace(/\/$/, '');
      if (!modelsUrl.endsWith('/v1')) {
        modelsUrl = `${modelsUrl}/v1`;
      }
      modelsUrl = `${modelsUrl}/models`;

      console.log('获取模型列表:', modelsUrl);

      const response = await fetch(modelsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      let modelList: string[] = [];
      
      if (data.data && Array.isArray(data.data)) {
        modelList = data.data.map((m: any) => m.id || m.name).filter(Boolean);
      } else if (Array.isArray(data)) {
        modelList = data.map((m: any) => m.id || m.name || m).filter(Boolean);
      }

      if (modelList.length === 0) {
        throw new Error('未找到模型列表');
      }

      setModels(modelList);
      Alert.alert('✅ 成功', `获取到 ${modelList.length} 个模型`);
    } catch (error: any) {
      console.error('获取模型列表失败:', error);
      Alert.alert('❌ 获取失败', `无法获取模型列表\n\n${error.message}`);
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
      let testUrl = baseUrl.replace(/\/$/, '');
      if (!testUrl.endsWith('/v1')) {
        testUrl = `${testUrl}/v1`;
      }
      testUrl = `${testUrl}/models`;

      console.log('测试连接:', testUrl);

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('✅ 连接成功', 'API 配置正确');
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error: any) {
      console.error('测试连接失败:', error);
      Alert.alert('❌ 连接失败', `${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 保存配置
  const saveSettings = async () => {
    if (!baseUrl || !apiKey) {
      Alert.alert('⚠️ 提示', '请填写 Base URL 和 API Key');
      return;
    }

    try {
      const config: AiConfig = {
        enabled,
        baseUrl,
        apiKey,
        model: selectedModel,
        models,
        updatedAt: Date.now(),
      };

      console.log('保存配置:', config);

      const success = await saveAiConfig(config);
      
      if (success) {
        Alert.alert('✅ 成功', '配置已保存（永久有效）');
      } else {
        throw new Error('保存失败');
      }
    } catch (error: any) {
      console.error('保存配置失败:', error);
      Alert.alert('❌ 错误', `保存失败：${error.message}`);
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
            try {
              const success = await clearAiConfig();
              if (success) {
                setBaseUrl('');
                setApiKey('');
                setSelectedModel('');
                setModels([]);
                Alert.alert('✅ 已清除', 'AI 配置已重置');
              } else {
                throw new Error('清除失败');
              }
            } catch (error: any) {
              console.error('清除配置失败:', error);
              Alert.alert('❌ 错误', `清除失败：${error.message}`);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🤖 AI 配置</Text>
        <Text style={styles.headerSubtitle}>配置大模型 API</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* 配置卡片 */}
        <View style={styles.card}>
          <Text style={styles.cardDesc}>支持任意 OpenAI 兼容 API，自动获取模型列表</Text>

          <Text style={styles.label}>Base URL</Text>
          <TextInput
            style={styles.input}
            value={baseUrl}
            onChangeText={setBaseUrl}
            placeholder="http://localhost:8080"
            placeholderTextColor={colors.gray[400]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.inputHint}>例如：http://127.0.0.1:8080/v1</Text>

          <Text style={styles.label}>API Key</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-..."
            placeholderTextColor={colors.gray[400]}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.inputHint}>任意字符串即可（如：sk-local）</Text>

          {/* 启用 AI 解卦开关 */}
          <View style={styles.enabledToggle}>
            <Text style={styles.label}>🤖 启用 AI 解卦</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  enabled ? styles.toggleButtonOn : styles.toggleButtonOff,
                ]}
                onPress={() => setEnabled(!enabled)}
              >
                <View
                  style={[
                    styles.toggleCircle,
                    enabled ? styles.toggleCircleOn : styles.toggleCircleOff,
                  ]}
                />
              </TouchableOpacity>
              <Text style={styles.enabledText}>
                {enabled ? '✅ 已启用' : '❌ 已禁用'}
              </Text>
            </View>
            <Text style={styles.inputHint}>
              {enabled
                ? 'AI 解卦已启用，将使用配置的 API 进行智能分析'
                : 'AI 解卦已禁用，仅使用本地规则引擎'}
            </Text>
          </View>

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
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={styles.saveButtonText}>💾 保存配置</Text>
          </TouchableOpacity>

          {/* 清除配置 */}
          <TouchableOpacity style={styles.clearButton} onPress={clearConfig}>
            <Text style={styles.clearButtonText}>🗑️ 清除配置</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

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
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: radii['3xl'],
    borderBottomRightRadius: radii['3xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    position: 'absolute' as const,
    left: spacing.lg,
    top: spacing.xl,
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: fonts.sizes.md,
    color: colors.white,
  },
  headerTitle: {
    fontSize: fonts.sizes['2xl'],
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.bold,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  // 启用 AI 解卦开关样式
  enabledToggle: {
    marginTop: spacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  toggleButtonOn: {
    backgroundColor: colors.cinnabarRed,
  },
  toggleButtonOff: {
    backgroundColor: colors.gray[300],
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  toggleCircleOn: {
    transform: [{ translateX: 22 }],
  },
  toggleCircleOff: {
    transform: [{ translateX: 0 }],
  },
  enabledText: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
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

export default AiConfigScreen;
