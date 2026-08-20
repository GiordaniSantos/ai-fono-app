import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Switch,
  StatusBar,
  ScrollView,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const paciente = useAuthStore((state) => state.paciente);
  const setPaciente = useAuthStore((state) => state.setPaciente);
  const logout = useAuthStore((state) => state.logout);

  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/me');
      const freshData = response.data.paciente || response.data;
      if (freshData) {
        setPaciente(freshData);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do perfil:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const fonoFoto = paciente?.fonoaudiologo?.foto;
  const pacienteFoto = paciente?.foto_url;

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
        {pacienteFoto ? (
          <TouchableOpacity
            style={styles.avatarWrapper}
            activeOpacity={0.85}
            onPress={() => setSelectedImage(pacienteFoto)}
          >
            <Image source={{ uri: pacienteFoto }} style={styles.avatarLarge} />
            <View style={styles.zoomBadge}>
              <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={54} color="#1A82FF" />
            </View>
          </View>
        )}

        <Text style={styles.userName}>{paciente?.nome || 'Paciente'}</Text>
        {paciente?.email ? (
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.userEmail}>{paciente.email}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.userCode}>Código: {paciente?.codigo_acesso}</Text>
        )}

        <TouchableOpacity style={styles.editButton} activeOpacity={0.8} onPress={() => router.push('/edit-profile')}>
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notificações</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>Ligar Notificações</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#3A3A3C', true: '#1A82FF' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Fonoaudiólogo Responsável</Text>
          <View style={styles.card}>
            <View style={styles.doctorInfoRow}>
              {fonoFoto ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedImage(fonoFoto)}
                >
                  <Image source={{ uri: fonoFoto }} style={styles.doctorAvatar} />
                </TouchableOpacity>
              ) : (
                <View style={styles.doctorAvatarPlaceholder}>
                  <Ionicons name="medical" size={18} color="#1A82FF" />
                </View>
              )}
              <Text style={styles.cardText}>
                {paciente?.fonoaudiologo?.nome || 'Não informado'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            activeOpacity={0.8}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          {selectedImage && (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalImageContainer}
              onPress={() => setSelectedImage(null)}
            >
              <Image
                source={{ uri: selectedImage }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      </Modal>
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
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#262629',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#16293D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A82FF44',
  },
  zoomBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#1A82FF',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#19191b',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  userCode: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#1A82FF',
    paddingHorizontal: 32,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717A',
    marginBottom: 10,
    paddingLeft: 4,
  },
  card: {
    width: '100%',
    backgroundColor: '#262629',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#38383A',
  },
  doctorAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16293D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1A82FF44',
  },
  logoutButton: {
    marginTop: 32,
    paddingVertical: 12,
  },
  logoutText: {
    color: '#71717A',
    fontSize: 15,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#262629',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalImageContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
});