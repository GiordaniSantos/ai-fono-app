import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';

interface CategoryItem {
  id: number;
  nome: string;
  novos_count: number;
  concluidas_count: number;
  total_count: number;
  progresso_percent: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const paciente = useAuthStore((state) => state.paciente);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progresso, setProgresso] = useState({ total: 0, concluidas: 0, porcentagem: 0 });
  const [categorias, setCategorias] = useState<CategoryItem[]>([]);

  const fetchHomeData = async () => {
    try {
      const response = await api.get('/home');
      if (response.data) {
        setProgresso(response.data.progresso_geral || { total: 0, concluidas: 0, porcentagem: 0 });
        setCategorias(response.data.categorias || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da Home:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/(tabs)/tasks',
      params: { categoria: categoryName },
    });
  };

  const getCategoryColor = (index: number) => {
    const colors = ['#FFA726', '#30D158', '#9333EA', '#EC4899', '#06B6D4'];
    return colors[index % colors.length];
  };

  const getCategoryIcon = (nome: string): keyof typeof Ionicons.glyphMap => {
    const lower = nome.toLowerCase();
    if (lower.includes('voz')) return 'mic';
    if (lower.includes('respira')) return 'file-tray-full';
    if (lower.includes('articula') || lower.includes('fala')) return 'shapes';
    if (lower.includes('flu') || lower.includes('deglut')) return 'water';
    if (lower.includes('orofacial')) return 'happy';
    return 'book';
  };

  const pendentesGerais = Math.max(0, progresso.total - progresso.concluidas);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#19191b" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1A82FF"
            colors={['#1A82FF']}
          />
        }
      >
        <ScreenHeader title="Home" />

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingPrefix}>Olá,</Text>
          <Text style={styles.greetingName}>{paciente?.nome || 'Paciente'}</Text>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, styles.filterPillActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, styles.filterTextActive]}>
              Visão Geral
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => router.push('/(tabs)/tasks')}
            activeOpacity={0.8}
          >
            <Text style={styles.filterText}>Tarefas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dailyProgressWrapper}>
          <View style={styles.dailyProgressCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Progresso diário</Text>
              {paciente?.foto_url ? (
                <Image source={{ uri: paciente.foto_url }} style={styles.miniAvatar} />
              ) : (
                <View style={styles.miniAvatarPlaceholder}>
                  <Ionicons name="person" size={14} color="#1A82FF" />
                </View>
              )}
            </View>

            <Text style={styles.cardSubtitle}>
              {progresso.concluidas} de {progresso.total} exercícios concluídos hoje.
            </Text>

            <Text style={styles.progressPercentage}>{progresso.porcentagem || 0}%</Text>

            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, Math.max(0, progresso.porcentagem || 0))}%` },
                ]}
              />
            </View>
          </View>
          <View style={styles.cardLayer1} />
          <View style={styles.cardLayer2} />
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categorias</Text>

          {loading && !refreshing ? (
            <ActivityIndicator size="small" color="#1A82FF" style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.gridContainer}>
              <TouchableOpacity
                style={styles.categoryCard}
                activeOpacity={0.85}
                onPress={() => handleCategoryPress('Todas')}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.categoryIconBadge, { backgroundColor: '#1A82FF' }]}>
                    <Ionicons name="layers" size={18} color="#FFFFFF" />
                  </View>
                  <Ionicons name="arrow-forward-circle" size={20} color="#71717A" />
                </View>

                {pendentesGerais > 0 && (
                  <Text style={styles.badgeNewText}>
                    {pendentesGerais} Pendentes
                  </Text>
                )}

                <Text style={styles.categoryName} numberOfLines={2}>
                  Todas as{'\n'}Tarefas
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.miniTrack}>
                    <View
                      style={[
                        styles.miniFill,
                        {
                          width: `${Math.min(100, Math.max(0, progresso.porcentagem || 0))}%`,
                          backgroundColor: '#1A82FF',
                        },
                      ]}
                    />
                  </View>
                  <View style={[styles.counterBadge, { backgroundColor: '#1A82FF' }]}>
                    <Text style={styles.counterText}>
                      {progresso.concluidas}/{progresso.total}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              {categorias.map((cat, index) => {
                const color = getCategoryColor(index);
                const iconName = getCategoryIcon(cat.nome);

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryCard}
                    activeOpacity={0.85}
                    onPress={() => handleCategoryPress(cat.nome)}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View style={[styles.categoryIconBadge, { backgroundColor: color }]}>
                        <Ionicons name={iconName} size={18} color="#FFFFFF" />
                      </View>
                      <Ionicons name="arrow-forward-circle" size={20} color="#71717A" />
                    </View>

                    {cat.novos_count > 0 && (
                      <Text style={styles.badgeNewText}>{cat.novos_count} Pendentes</Text>
                    )}

                    <Text style={styles.categoryName} numberOfLines={2}>
                      {cat.nome}
                    </Text>

                    <View style={styles.cardFooter}>
                      <View style={styles.miniTrack}>
                        <View
                          style={[
                            styles.miniFill,
                            {
                              width: `${Math.min(100, Math.max(0, cat.progresso_percent || 0))}%`,
                              backgroundColor: color,
                            },
                          ]}
                        />
                      </View>
                      <View style={[styles.counterBadge, { backgroundColor: color }]}>
                        <Text style={styles.counterText}>
                          {cat.concluidas_count}/{cat.total_count}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
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
    backgroundColor: '#262629',
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
  miniAvatarPlaceholder: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#16293D',
    alignItems: 'center',
    justifyContent: 'center',
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  categoryCard: {
    width: '47.8%',
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