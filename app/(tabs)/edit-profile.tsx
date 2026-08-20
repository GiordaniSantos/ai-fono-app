import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';

const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) {
        return digits.length > 0 ? `(${digits}` : '';
    }
    if (digits.length <= 6) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export default function EditProfileScreen() {
    const router = useRouter();
    const paciente = useAuthStore((state) => state.paciente);
    const setPaciente = useAuthStore((state) => state.setPaciente);

    const [nome, setNome] = useState(paciente?.nome || '');
    const [email, setEmail] = useState(paciente?.email || '');
    const [telefone, setTelefone] = useState(
        maskPhone((paciente as any)?.telefone || '')
    );
    const [fotoUri, setFotoUri] = useState<string | null>(paciente?.foto_url || null);
    const [fotoChanged, setFotoChanged] = useState(false);
    const [saving, setSaving] = useState(false);

    const handlePhoneChange = (text: string) => {
        setTelefone(maskPhone(text));
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permissão necessária',
                'Precisamos de acesso à sua galeria para alterar a foto de perfil.'
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            setFotoUri(result.assets[0].uri);
            setFotoChanged(true);
        }
    };

    const handleSave = async () => {
        if (!nome.trim()) {
            Alert.alert('Atenção', 'O campo Nome é obrigatório.');
            return;
        }

        setSaving(true);

        try {
            const formData = new FormData();
            formData.append('nome', nome.trim());
            formData.append('email', email.trim());
            formData.append('telefone', telefone);

            if (fotoChanged && fotoUri) {
                const filename = fotoUri.split('/').pop() || 'avatar.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('foto', {
                    uri: fotoUri,
                    name: filename,
                    type,
                } as any);
            }

            const response = await api.post('/pacientes/update', formData, {
                headers: {
                'Content-Type': 'multipart/form-data',
                },
            });

            const updatedPaciente = response.data.paciente || response.data;
            if (updatedPaciente) {
                setPaciente(updatedPaciente);
            }

            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Não foi possível salvar as alterações.';
            Alert.alert('Erro ao salvar', message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#19191b" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.navHeader}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.navTitle}>Editar Perfil</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >

                    <View style={styles.avatarSection}>
                        <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handlePickImage}
                                style={styles.avatarWrapper}
                            >
                            {fotoUri ? (
                                <Image source={{ uri: fotoUri }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={54} color="#1A82FF" />
                                </View>
                            )}
                            <View style={styles.cameraBadge}>
                                <Ionicons name="camera" size={18} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.changePhotoText}>Toque para alterar a foto</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nome Completo</Text>
                            <TextInput
                                style={styles.input}
                                value={nome}
                                onChangeText={setNome}
                                placeholder="Seu nome completo"
                                placeholderTextColor="#555558"
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>E-mail</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="exemplo@email.com"
                                placeholderTextColor="#555558"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Telefone / WhatsApp</Text>
                            <TextInput
                                style={styles.input}
                                value={telefone}
                                onChangeText={handlePhoneChange}
                                placeholder="(99) 99999-9999"
                                placeholderTextColor="#555558"
                                keyboardType="phone-pad"
                                maxLength={15}
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                        activeOpacity={0.8}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#19191b',
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#262628',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navTitle: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
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
    cameraBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#1A82FF',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#19191b',
    },
    changePhotoText: {
        color: '#8E8E93',
        fontSize: 13,
        marginTop: 10,
    },
    form: {
        gap: 18,
        marginTop: 12,
        marginBottom: 32,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: '#8E8E93',
        fontSize: 13,
        fontWeight: '600',
        paddingLeft: 4,
    },
    input: {
        height: 54,
        backgroundColor: '#262628',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#38383A',
        paddingHorizontal: 16,
        color: '#FFFFFF',
        fontSize: 15,
    },
    saveButton: {
        backgroundColor: '#1A82FF',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#1A82FF66',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});