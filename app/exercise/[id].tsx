import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
} from 'expo-audio';
import { api } from '@/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type MediaType = 'texto' | 'imagem' | 'video';
type RecordMode = 'audio' | 'video';

interface PrescricaoCompleta {
  id: number;
  frequencia_diaria: number;
  data_fim: string | null;
  realizada: boolean;
  exercicio: {
    id: number;
    titulo: string;
    categoria: string;
    tipo: string;
    instrucoes: string;
    texto: string;
    imagem_url: string | null;
    video_url: string | null;
    video_thumb_url: string | null;
  };
}

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [prescricao, setPrescricao] = useState<PrescricaoCompleta | null>(null);

  const [activeMediaTab, setActiveMediaTab] = useState<MediaType>('texto');
  const [fontSize, setFontSize] = useState<number>(18);

  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);

  const [recordMode, setRecordMode] = useState<RecordMode>('audio');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedResult, setRecordedResult] = useState<{
    type: RecordMode;
    uri: string;
    blob?: Blob;
    name?: string;
    mimeType?: string;
  } | null>(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const player = useAudioPlayer(
    recordedResult?.type === 'audio' && Platform.OS !== 'web'
      ? recordedResult.uri
      : null
  );

  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);
  const audioElementRef = useRef<any>(null);

  const fetchPrescricao = async () => {
    try {
      const response = await api.get(`/prescricoes/${id}`);
      if (response.data.data) {
        setPrescricao(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar prescrição:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescricao();

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, [id]);

  const startAudioRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new (window as any).MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e: any) => {
          if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const blobUrl = URL.createObjectURL(blob);
          setRecordedResult({
            type: 'audio',
            uri: blobUrl,
            blob,
            name: `audio_${Date.now()}.webm`,
            mimeType: 'audio/webm',
          });
          stream.getTracks().forEach((track: any) => track.stop());
        };

        mediaRecorder.start();
      } else {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert('Permissão necessária', 'Permita o acesso ao microfone para gravar o áudio.');
          return;
        }

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });

        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
      }

      setIsRecording(true);
      setIsPlaying(false);
    } catch (err) {
      console.error('Falha ao iniciar gravação de áudio:', err);
      Alert.alert('Erro', 'Não foi possível iniciar o microfone.');
    }
  };

  const stopAudioRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      } else {
        await audioRecorder.stop();
        const uri = audioRecorder.uri;
        if (uri) {
          setRecordedResult({
            type: 'audio',
            uri,
            name: `audio_${Date.now()}.m4a`,
            mimeType: 'audio/m4a',
          });
        }
      }
    } catch (err) {
      console.error('Falha ao parar gravação:', err);
    } finally {
      setIsRecording(false);
    }
  };

  const handleRecordVideo = async () => {
    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const mediaRecorder = new (window as any).MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e: any) => {
          if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'video/webm' });
          const blobUrl = URL.createObjectURL(blob);
          setRecordedResult({
            type: 'video',
            uri: blobUrl,
            blob,
            name: `video_${Date.now()}.webm`,
            mimeType: 'video/webm',
          });
          stream.getTracks().forEach((track: any) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        Alert.alert('Permissão necessária', 'Permita o acesso à câmera no navegador.');
      }
    } else {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      if (cameraPermission.status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita o acesso à câmera para gravar o vídeo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 0.5,
        videoMaxDuration: 180,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setRecordedResult({
          type: 'video',
          uri: asset.uri,
          name: asset.fileName || `video_${Date.now()}.mp4`,
          mimeType: asset.mimeType || 'video/mp4',
        });
      }
    }
  };

  const handleToggleRecord = () => {
    if (recordMode === 'video') {
      if (Platform.OS === 'web') {
        if (!isRecording) handleRecordVideo();
        else stopAudioRecording();
      } else {
        handleRecordVideo();
      }
    } else {
      if (!isRecording) startAudioRecording();
      else stopAudioRecording();
    }
  };

  const handleTogglePlayback = () => {
    if (!recordedResult?.uri) return;

    if (Platform.OS === 'web') {
      if (isPlaying && audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      const audio = new Audio(recordedResult.uri);
      audioElementRef.current = audio;
      setIsPlaying(true);

      audio.play().catch(() => setIsPlaying(false));
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
    } else {
      // Mobile via expo-audio
      if (player.playing) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.seekTo(0);
        player.play();
        setIsPlaying(true);
      }
    }
  };

  const handleConfirmFinish = async (includeRecording: boolean = false) => {
    setFinishModalVisible(false);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('nivel_satisfacao', String(selectedRating));

      if (includeRecording && recordedResult) {
        if (Platform.OS === 'web') {
          if (recordedResult.blob) {
            formData.append('arquivo', recordedResult.blob, recordedResult.name || 'gravacao.webm');
          } else {
            const res = await fetch(recordedResult.uri);
            const blob = await res.blob();
            formData.append('arquivo', blob, recordedResult.name || 'gravacao.webm');
          }
        } else {
          formData.append('arquivo', {
            uri: recordedResult.uri,
            name: recordedResult.name || (recordedResult.type === 'video' ? 'video.mp4' : 'audio.m4a'),
            type: recordedResult.mimeType || (recordedResult.type === 'video' ? 'video/mp4' : 'audio/m4a'),
          } as any);
        }
      }

      const response = await api.post(`/prescricoes/${id}/concluir`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => data,
      });

      if (prescricao) {
        setPrescricao({
          ...prescricao,
          realizada: true,
        });
      }

      Alert.alert(
        'Sucesso!',
        response.data?.message || 'Exercício concluído e registrado!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Erro ao concluir prescrição:', error?.response?.data || error);

      let errorMsg = 'Não foi possível salvar o exercício.';
      if (error?.response?.data?.errors?.arquivo) {
        errorMsg = error.response.data.errors.arquivo[0];
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      Alert.alert('Erro ao salvar', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !prescricao) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A82FF" />
      </SafeAreaView>
    );
  }

  const { exercicio } = prescricao;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#19191b" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.headerCategory}>
            {exercicio.categoria.toUpperCase()}
          </Text>
          <Text style={styles.headerMainTitle}>{exercicio.titulo}</Text>
        </View>

        {activeMediaTab === 'texto' ? (
          <View style={styles.fontControls}>
            <TouchableOpacity
              style={styles.fontBtn}
              onPress={() => setFontSize((prev) => Math.max(14, prev - 2))}
            >
              <Text style={styles.fontBtnText}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fontBtn}
              onPress={() => setFontSize((prev) => Math.min(24, prev + 2))}
            >
              <Text style={styles.fontBtnText}>A+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.orientationCard}>
          <View style={styles.orientationHeader}>
            <View style={styles.orientationIconBadge}>
              <Ionicons name="fitness-outline" size={18} color="#1A82FF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.orientationTitle}>Orientação do Fonoaudiólogo</Text>
              <Text style={styles.orientationSubtitle}>
                Recomendação clínica de prática:{' '}
                <Text style={styles.orientationHighlight}>
                  {prescricao.frequencia_diaria}x ao dia
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.orientationFooter}>
            <View
              style={[
                styles.statusBadge,
                prescricao.realizada
                  ? styles.statusBadgeDone
                  : styles.statusBadgePending,
              ]}
            >
              <Ionicons
                name={prescricao.realizada ? 'checkmark-circle' : 'time-outline'}
                size={14}
                color={prescricao.realizada ? '#30D158' : '#FFA726'}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  prescricao.realizada
                    ? styles.statusBadgeTextDone
                    : styles.statusBadgeTextPending,
                ]}
              >
                {prescricao.realizada
                  ? 'Execução de hoje registrada'
                  : 'Pendente de registro hoje'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <Ionicons name="bulb-outline" size={20} color="#38BDF8" />
          <Text style={styles.instructionText}>{exercicio.instrucoes}</Text>
        </View>

        <View style={styles.mediaTabsContainer}>
          <TouchableOpacity
            style={[
              styles.mediaTabButton,
              activeMediaTab === 'texto' && styles.mediaTabButtonActive,
            ]}
            onPress={() => setActiveMediaTab('texto')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="document-text-outline"
              size={16}
              color={activeMediaTab === 'texto' ? '#FFFFFF' : '#8E8E93'}
            />
            <Text
              style={[
                styles.mediaTabText,
                activeMediaTab === 'texto' && styles.mediaTabTextActive,
              ]}
            >
              Texto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mediaTabButton,
              activeMediaTab === 'imagem' && styles.mediaTabButtonActive,
            ]}
            onPress={() => setActiveMediaTab('imagem')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="image-outline"
              size={16}
              color={activeMediaTab === 'imagem' ? '#FFFFFF' : '#8E8E93'}
            />
            <Text
              style={[
                styles.mediaTabText,
                activeMediaTab === 'imagem' && styles.mediaTabTextActive,
              ]}
            >
              Imagem
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mediaTabButton,
              activeMediaTab === 'video' && styles.mediaTabButtonActive,
            ]}
            onPress={() => setActiveMediaTab('video')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="play-circle-outline"
              size={16}
              color={activeMediaTab === 'video' ? '#FFFFFF' : '#8E8E93'}
            />
            <Text
              style={[
                styles.mediaTabText,
                activeMediaTab === 'video' && styles.mediaTabTextActive,
              ]}
            >
              Vídeo
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.displayCard}>
          {activeMediaTab === 'texto' && (
            <Text style={[styles.bodyText, { fontSize, lineHeight: fontSize * 1.6 }]}>
              {exercicio.texto}
            </Text>
          )}

          {activeMediaTab === 'imagem' && (
            <View style={styles.imageWrapper}>
              {exercicio.imagem_url ? (
                <Image
                  source={{ uri: exercicio.imagem_url }}
                  style={styles.contentImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.emptyMediaBox}>
                  <Ionicons name="image-outline" size={40} color="#555" />
                  <Text style={styles.emptyMediaText}>Nenhuma imagem anexada</Text>
                </View>
              )}
              <Text style={styles.mediaCaption}>
                Guia visual anatômico do exercício
              </Text>
            </View>
          )}

          {activeMediaTab === 'video' && (
            <View style={styles.videoWrapper}>
              {exercicio.video_thumb_url ? (
                <Image
                  source={{ uri: exercicio.video_thumb_url }}
                  style={styles.contentVideoThumb}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.emptyMediaBox}>
                  <Ionicons name="videocam-outline" size={40} color="#555" />
                </View>
              )}
              <TouchableOpacity style={styles.videoPlayOverlay} activeOpacity={0.8}>
                <View style={styles.playIconCircle}>
                  <Ionicons name="play" size={32} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.mediaCaption}>
                Vídeo de demonstração clínica
              </Text>
            </View>
          )}
        </View>

        {recordedResult && (
          <View style={styles.recordingResultCard}>
            <View style={styles.resultInfoRow}>
              <Ionicons
                name={recordedResult.type === 'audio' ? 'mic' : 'videocam'}
                size={20}
                color="#30D158"
              />
              <Text style={styles.resultText}>
                {recordedResult.type === 'audio'
                  ? 'Áudio gravado com sucesso!'
                  : 'Vídeo gravado com sucesso!'}
              </Text>
            </View>

            {recordedResult.type === 'audio' && (
              <TouchableOpacity
                style={[
                  styles.playbackBtn,
                  isPlaying && styles.playbackBtnPlaying,
                ]}
                onPress={handleTogglePlayback}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomDock}>
        <View style={styles.dockActionsRow}>
          <TouchableOpacity
            style={[
              styles.quickRecordBtn,
              isRecording && styles.quickRecordBtnActive,
            ]}
            activeOpacity={0.8}
            onPress={handleToggleRecord}
          >
            <Ionicons
              name={isRecording ? 'stop' : recordMode === 'audio' ? 'mic' : 'videocam'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.finishMainButton}
            activeOpacity={0.85}
            onPress={() => setFinishModalVisible(true)}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.finishMainButtonText}>
                  {prescricao.realizada ? 'Refazer Exercício' : 'Finalizar Exercício'}
                </Text>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={finishModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFinishModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Concluir Exercício</Text>
              <TouchableOpacity
                onPress={() => setFinishModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Como você se sentiu realizando esta atividade?
            </Text>
            
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedRating(star)}
                  activeOpacity={0.7}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= selectedRating ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= selectedRating ? '#FFA726' : '#555558'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalOptionsContainer}>
              <TouchableOpacity
                style={styles.modalOptionCard}
                activeOpacity={0.8}
                onPress={() => {
                  setRecordMode('video');
                  setFinishModalVisible(false);
                  handleRecordVideo();
                }}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="videocam" size={22} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>Gravar Vídeo</Text>
                  <Text style={styles.optionDesc}>
                    Grave a articulação da boca e emissão com a câmera do celular.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#71717A" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOptionCard}
                activeOpacity={0.8}
                onPress={() => {
                  setRecordMode('audio');
                  setFinishModalVisible(false);
                  startAudioRecording();
                }}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#1A82FF' }]}>
                  <Ionicons name="mic" size={22} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>Gravar Áudio</Text>
                  <Text style={styles.optionDesc}>
                    Registre sua fala através do microfone do celular.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#71717A" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalOptionCard, styles.modalOptionCardDirect]}
                activeOpacity={0.8}
                onPress={() => handleConfirmFinish(!!recordedResult)}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#30D158' }]}>
                  <Ionicons name="checkmark-done" size={22} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>
                    {recordedResult ? 'Enviar com a Gravação' : 'Apenas Finalizar'}
                  </Text>
                  <Text style={styles.optionDesc}>
                    {recordedResult
                      ? 'Salva a execução anexando o vídeo/áudio gravado.'
                      : 'Registra a execução de hoje sem anexo.'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#71717A" />
              </TouchableOpacity>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#19191b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262628',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#262628',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    alignItems: 'center',
  },
  headerCategory: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerMainTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  fontControls: {
    flexDirection: 'row',
    backgroundColor: '#262628',
    borderRadius: 18,
    padding: 3,
    gap: 2,
  },
  fontBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  fontBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  orientationCard: {
    backgroundColor: '#262629',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#38383A',
  },
  orientationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  orientationIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#16293D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orientationTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  orientationSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  orientationHighlight: {
    color: '#1A82FF',
    fontWeight: '700',
  },
  orientationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333336',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeDone: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
  },
  statusBadgePending: {
    backgroundColor: 'rgba(255, 167, 38, 0.15)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadgeTextDone: {
    color: '#30D158',
  },
  statusBadgeTextPending: {
    color: '#FFA726',
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#16293D',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1A82FF33',
  },
  instructionText: {
    flex: 1,
    color: '#93C5FD',
    fontSize: 13,
    lineHeight: 18,
  },
  mediaTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#262629',
    borderRadius: 14,
    padding: 4,
    gap: 6,
    marginBottom: 14,
  },
  mediaTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  mediaTabButtonActive: {
    backgroundColor: '#1A82FF',
  },
  mediaTabText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
  },
  mediaTabTextActive: {
    color: '#FFFFFF',
  },
  displayCard: {
    backgroundColor: '#262629',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#38383A',
    minHeight: 220,
  },
  bodyText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  imageWrapper: {
    alignItems: 'center',
    gap: 12,
  },
  contentImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
  },
  videoWrapper: {
    position: 'relative',
    alignItems: 'center',
    gap: 12,
  },
  contentVideoThumb: {
    width: '100%',
    height: 220,
    borderRadius: 14,
  },
  videoPlayOverlay: {
    ...StyleSheet.absoluteFill,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
  },
  playIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1A82FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  emptyMediaBox: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    backgroundColor: '#1E1E22',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyMediaText: {
    color: '#71717A',
    fontSize: 13,
  },
  mediaCaption: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
  },
  recordingResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16293D',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#30D15844',
  },
  resultInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  playbackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1A82FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackBtnPlaying: {
    backgroundColor: '#FF453A',
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#202024',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#333336',
  },
  dockActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickRecordBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#333338',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickRecordBtnActive: {
    backgroundColor: '#FF453A',
  },
  finishMainButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#30D158',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  finishMainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#262629',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#38383A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    paddingVertical: 6,
  },
  starButton: {
    padding: 4,
  },
  modalOptionsContainer: {
    gap: 12,
  },
  modalOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1F1F22',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#333336',
  },
  modalOptionCardDirect: {
    borderColor: '#30D15844',
  },
  optionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },
});