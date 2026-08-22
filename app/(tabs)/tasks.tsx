import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/ScreenHeader';
import { api } from '../../services/api';

export interface PrescricaoItem {
  id: number;
  titulo: string;
  subtitulo: string;
  tipo: string;
  categoria: string;
  concluido: boolean;
  dias_restantes: number;
}

export default function TasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoria?: string }>();

  const [loading, setLoading] = useState(true);
  const [prescricoes, setPrescricoes] = useState<PrescricaoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  
  useEffect(() => {
    if (params.categoria) {
      setSelectedCategory(params.categoria);
    }
  }, [params.categoria]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/prescricoes');
      if (response.data.data) {
        setPrescricoes(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar prescrições:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const categoriasDisponiveis = useMemo(() => {
    const rawCategories = Array.from(new Set(prescricoes.map((p) => p.categoria)));
    return ['Todas', ...rawCategories];
  }, [prescricoes]);

  const prescricoesFiltradas = useMemo(() => {
    return prescricoes.filter((item) => {
      if (selectedCategory === 'Todas') return true;
      return item.categoria.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [selectedCategory, prescricoes]);

  const totalGeral = prescricoes.length;
  const concluidasGeral = prescricoes.filter((p) => p.concluido).length;
  const progressoPercent = totalGeral > 0 ? Math.round((concluidasGeral / totalGeral) * 100) : 0;

  const handleOpenExercise = (prescricaoId: number) => {
    router.push({
      pathname: '/exercise/[id]',
      params: { id: prescricaoId },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#19191b" />

      <View style={styles.content}>
        <View style={{ marginTop: 16 }}>
          <ScreenHeader title="Tarefas Prescritas" showBack={true} />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Progresso das Tarefas</Text>
            <Text style={styles.summarySubtitle}>
              {concluidasGeral} de {totalGeral} prescrições realizadas
            </Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPercentage}>{progressoPercent}%</Text>
          </View>
        </View>

        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {categoriasDisponiveis.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              const count =
                cat === 'Todas'
                  ? prescricoes.length
                  : prescricoes.filter(
                      (item) => item.categoria.toLowerCase() === cat.toLowerCase()
                    ).length;

              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                  <View
                    style={[
                      styles.countBadge,
                      isSelected && styles.countBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.countText,
                        isSelected && styles.countTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1A82FF" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          >
            {prescricoesFiltradas.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="folder-open-outline" size={48} color="#444448" />
                <Text style={styles.emptyStateText}>
                  Nenhum exercício encontrado para "{selectedCategory}".
                </Text>
              </View>
            ) : (
              prescricoesFiltradas.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => handleOpenExercise(item.id)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.tagsRow}>
                      <View style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>{item.categoria}</Text>
                      </View>
                      <View style={styles.typeTag}>
                        <Text style={styles.typeTagText}>{item.tipo}</Text>
                      </View>
                    </View>

                    {item.concluido ? (
                      <View style={styles.statusBadgeCompleted}>
                        <Ionicons name="checkmark-circle" size={14} color="#30D158" />
                        <Text style={styles.statusTextCompleted}>Concluído</Text>
                      </View>
                    ) : (
                      <Text style={styles.daysLeft}>
                        {item.dias_restantes} dias restantes
                      </Text>
                    )}
                  </View>

                  <Text style={styles.cardTitle}>{item.titulo}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitulo}</Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.actionPrompt}>
                      <Ionicons
                        name={item.concluido ? 'refresh-outline' : 'mic-outline'}
                        size={15}
                        color={item.concluido ? '#8E8E93' : '#1A82FF'}
                      />
                      <Text
                        style={[
                          styles.actionPromptText,
                          item.concluido && styles.actionPromptTextMuted,
                        ]}
                      >
                        {item.concluido ? 'Treinar novamente' : 'Iniciar exercício'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#71717A" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#19191b',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: '#262629',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#38383A',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  progressCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#16293D',
    borderWidth: 3,
    borderColor: '#1A82FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    color: '#1A82FF',
    fontWeight: '800',
    fontSize: 14,
  },
  filterSection: {
    marginBottom: 16,
    marginHorizontal: -20,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#262629',
    borderWidth: 1,
    borderColor: '#333336',
  },
  categoryChipActive: {
    backgroundColor: '#1A82FF',
    borderColor: '#1A82FF',
  },
  categoryChipText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#19191B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeActive: {
    backgroundColor: '#0F56B3',
  },
  countText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 30,
    gap: 14,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 12,
  },
  emptyStateText: {
    color: '#71717A',
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#262629',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#38383A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryTag: {
    backgroundColor: '#16293D',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  categoryTagText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  typeTag: {
    backgroundColor: '#1F1F22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },
  typeTagText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTextCompleted: {
    color: '#30D158',
    fontSize: 12,
    fontWeight: '700',
  },
  daysLeft: {
    color: '#8E8E93',
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333336',
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionPromptText: {
    color: '#1A82FF',
    fontSize: 13,
    fontWeight: '600',
  },
  actionPromptTextMuted: {
    color: '#8E8E93',
  },
});