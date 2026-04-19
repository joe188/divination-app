/**
 * KnowledgeScreen - 易学知识库
 * 功能：浏览、搜索六爻、八字、奇门遁甲知识
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import theme from '../styles/theme';
import {
  knowledgeData,
  getKnowledgeByCategory,
  searchKnowledge,
  getCategories,
  KnowledgeItem,
} from '../data/knowledge-data';

const { colors, fonts, spacing, radii } = theme;

export const KnowledgeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const categories = getCategories();
  const filteredData = searchKeyword
    ? searchKnowledge(searchKeyword)
    : getKnowledgeByCategory(selectedCategory);

  const renderCategory = (cat: { id: string; name: string; count: number }) => (
    <TouchableOpacity
      key={cat.id}
      style={[
        styles.categoryButton,
        selectedCategory === cat.id && styles.categoryButtonActive,
      ]}
      onPress={() => {
        setSelectedCategory(cat.id);
        setSearchKeyword('');
      }}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === cat.id && styles.categoryTextActive,
        ]}
      >
        {cat.name}
      </Text>
      <Text
        style={[
          styles.categoryCount,
          selectedCategory === cat.id && styles.categoryCountActive,
        ]}
      >
        {cat.count}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: KnowledgeItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedItem(item);
        setShowDetail(true);
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>
            {item.category === 'liuyao' && '六爻'}
            {item.category === 'bazi' && '八字'}
            {item.category === 'qimen' && '奇门'}
            {item.category === 'general' && '通用'}
          </Text>
        </View>
      </View>
      <Text style={styles.cardPreview} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.tagsContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 易学知识库</Text>
        <Text style={styles.headerSubtitle}>传统易学知识大全</Text>
      </View>

      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索知识点..."
          placeholderTextColor={colors.gray[400]}
          value={searchKeyword}
          onChangeText={setSearchKeyword}
        />
      </View>

      {/* 分类选择 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map(renderCategory)}
      </ScrollView>

      {/* 知识列表 */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>😕 没有找到相关知识</Text>
          </View>
        }
      />

      {/* 详情弹窗 */}
      <Modal
        visible={showDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedItem?.title}</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {selectedItem && (
                <>
                  <View style={styles.detailCategory}>
                    <Text style={styles.detailCategoryText}>
                      分类：
                      {selectedItem.category === 'liuyao' && '六爻'}
                      {selectedItem.category === 'bazi' && '八字'}
                      {selectedItem.category === 'qimen' && '奇门'}
                      {selectedItem.category === 'general' && '通用'}
                    </Text>
                  </View>
                  <Text style={styles.detailContent}>{selectedItem.content}</Text>
                  <View style={styles.detailTags}>
                    {selectedItem.tags.map((tag, index) => (
                      <View key={index} style={styles.detailTag}>
                        <Text style={styles.detailTagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
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
  searchContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    fontSize: fonts.sizes.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginRight: spacing.md,
  },
  categoryButtonActive: {
    backgroundColor: colors.cinnabarRed,
    borderColor: colors.cinnabarRed,
  },
  categoryText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.sourceHan,
    color: colors.gray[700],
    marginRight: spacing.xs,
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: fonts.weights.semibold,
  },
  categoryCount: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.gray[500],
  },
  categoryCountActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
    flex: 1,
    marginRight: spacing.md,
  },
  categoryTag: {
    backgroundColor: colors.cinnabarRed,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  categoryTagText: {
    fontSize: fonts.sizes.xs,
    fontFamily: fonts.sourceHan,
    color: colors.white,
  },
  cardPreview: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.riceWhite,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  tagText: {
    fontSize: fonts.sizes.xs,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.sourceHan,
    color: colors.gray[500],
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
    maxHeight: '80%',
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
    fontSize: fonts.sizes.xl,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
  },
  modalClose: {
    fontSize: fonts.sizes['2xl'],
    color: colors.gray[500],
  },
  modalBody: {
    padding: spacing.lg,
  },
  detailCategory: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  detailCategoryText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.sourceHan,
    color: colors.gray[600],
  },
  detailContent: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.sourceHan,
    color: colors.inkBlack,
    lineHeight: 28,
    marginBottom: spacing.lg,
  },
  detailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  detailTag: {
    backgroundColor: colors.cinnabarRed,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  detailTagText: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.white,
  },
});
