import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';

interface TaskItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  completed?: boolean;
  hasBorder?: boolean;
}

const TASKS: TaskItem[] = [
  {
    id: '1',
    title: 'Sustentação da vogal “A”',
    icon: 'book',
    iconBg: '#1A82FF',
    hasBorder: true,
  },
  {
    id: '2',
    title: 'Nomeação de objetos',
    icon: 'checkmark',
    iconBg: '#A855F7',
    hasBorder: true,
  },
  {
    id: '3',
    title: 'Melhorar o controle da\nrespiração para fala',
    icon: 'file-tray-full',
    iconBg: '#FFA726',
    hasBorder: false,
  },
];

export default function TasksScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'favorite'>('all');
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#19191b" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Daily progress" showBack />

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#71717A"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
            activeOpacity={0.8}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === 'favorite' && styles.filterPillActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setFilter('favorite')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'favorite' && styles.filterTextActive,
              ]}
            >
              Favorite
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.taskList}>
          {TASKS.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.taskCard,
                task.hasBorder && styles.taskCardBorderActive,
              ]}
              activeOpacity={0.8}
            >
              <View style={styles.taskLeftSection}>
                <View style={[styles.taskIconBadge, { backgroundColor: task.iconBg }]}>
                  <Ionicons name={task.icon} size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          ))}
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1A82FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  searchContainer: {
    width: '100%',
    marginBottom: 20,
  },
  searchInput: {
    width: '100%',
    height: 52,
    backgroundColor: '#2A2A2D',
    borderRadius: 14,
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 26,
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
  taskList: {
    gap: 14,
  },
  taskCard: {
    backgroundColor: '#262629',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  taskCardBorderActive: {
    borderColor: '#22C55E',
  },
  taskLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    paddingRight: 10,
  },
  taskIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 20,
    flexShrink: 1,
  },
});