import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';

const AVATAR_URL = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'productivity'>('overview');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#19191b" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Home" />

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingPrefix}>Olá,</Text>
          <Text style={styles.greetingName}>José Almeida</Text>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeTab === 'overview' && styles.filterPillActive,
            ]}
            onPress={() => setActiveTab('overview')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeTab === 'overview' && styles.filterTextActive,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              activeTab === 'productivity' && styles.filterPillActive,
            ]}
            onPress={() => setActiveTab('productivity')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeTab === 'productivity' && styles.filterTextActive,
              ]}
            >
              Productivity
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dailyProgressWrapper}>
          <View style={styles.dailyProgressCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Daily progress</Text>
              <Image source={{ uri: AVATAR_URL }} style={styles.miniAvatar} />
            </View>

            <Text style={styles.cardSubtitle}>Here you can see your daily task</Text>

            <Text style={styles.progressPercentage}>76%</Text>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '76%' }]} />
            </View>
          </View>
          <View style={styles.cardLayer1} />
          <View style={styles.cardLayer2} />
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>

          <View style={styles.gridRow}>
            <TouchableOpacity style={styles.categoryCard} activeOpacity={0.85}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.categoryIconBadge, { backgroundColor: '#1A82FF' }]}>
                  <Ionicons name="book" size={18} color="#FFFFFF" />
                </View>
                <Image source={{ uri: AVATAR_URL }} style={styles.miniAvatar} />
              </View>

              <Text style={styles.badgeNewText}>5 New</Text>
              <Text style={styles.categoryName}>Treino de{'\n'}voz</Text>

              <View style={styles.cardFooter}>
                <View style={styles.miniTrack}>
                  <View style={[styles.miniFill, { width: '45%', backgroundColor: '#1A82FF' }]} />
                </View>
                <View style={[styles.counterBadge, { backgroundColor: '#1A82FF' }]}>
                  <Text style={styles.counterText}>9/24</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard} activeOpacity={0.85}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.categoryIconBadge, { backgroundColor: '#FFA726' }]}>
                  <Ionicons name="file-tray-full" size={18} color="#FFFFFF" />
                </View>
                <Image source={{ uri: AVATAR_URL }} style={styles.miniAvatar} />
              </View>

              <Text style={styles.badgeNewText}>2 New</Text>
              <Text style={styles.categoryName}>Exercícios{'\n'}respiratórios</Text>

              <View style={styles.cardFooter}>
                <View style={styles.miniTrack}>
                  <View style={[styles.miniFill, { width: '30%', backgroundColor: '#FFA726' }]} />
                </View>
                <View style={[styles.counterBadge, { backgroundColor: '#FFA726' }]}>
                  <Text style={styles.counterText}>4/18</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#19191b',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#333336',
  },
  greetingContainer: {
    marginBottom: 20,
  },
  greetingPrefix: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 38,
  },
  greetingName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 38,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  filterPill: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterPillActive: {
    backgroundColor: '#1A82FF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  dailyProgressWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 32,
  },
  dailyProgressCard: {
    width: '100%',
    backgroundColor: '#262629',
    borderRadius: 24,
    padding: 20,
    zIndex: 3,
  },
  cardLayer1: {
    position: 'absolute',
    bottom: -6,
    width: '92%',
    height: 20,
    backgroundColor: '#202022',
    borderRadius: 20,
    zIndex: 2,
  },
  cardLayer2: {
    position: 'absolute',
    bottom: -12,
    width: '84%',
    height: 20,
    backgroundColor: '#1B1B1D',
    borderRadius: 16,
    zIndex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 16,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#38383C',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1A82FF',
    borderRadius: 3,
  },
  categoriesSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 14,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#262629',
    borderRadius: 20,
    padding: 16,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  categoryIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNewText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 20,
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  miniTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#38383C',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 2,
  },
  counterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});