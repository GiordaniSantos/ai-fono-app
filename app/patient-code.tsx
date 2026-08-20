import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';

export default function PatientCodeScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const loginWithCode = useAuthStore((state) => state.loginWithCode);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleCodeChange = (text: string) => {
    setCode(text);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleEnter = async () => {
    if (!code.trim() || isLoading) return;

    setErrorMessage(null);
    const result = await loginWithCode(code.trim());

    if (result.success) {
      router.replace('/(tabs)/home');
    } else {
      setErrorMessage(result.message || 'Código não encontrado. Verifique e tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1c" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.navHeader}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Acesso Paciente</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconBadge}>
            <Ionicons name="key-outline" size={32} color="#1A82FF" />
          </View>

          <Text style={styles.title}>Digite seu código</Text>
          <Text style={styles.subtitle}>
            Insira o código fornecido pelo seu fonoaudiólogo para carregar seus exercícios.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errorMessage ? styles.inputError : null,
              ]}
              placeholder="Ex: 2YAMJT"
              placeholderTextColor="#555558"
              value={code}
              onChangeText={handleCodeChange}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isLoading}
              autoFocus
            />

            {errorMessage && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={16} color="#FF453A" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, (!code.trim() || isLoading) && styles.submitButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleEnter}
            disabled={!code.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Entrar no Consultório</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpText}>Não possui ou perdeu o código?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1c',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
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
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#16293D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1A82FF44',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#262628',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#38383A',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
  },
  inputError: {
    borderColor: '#FF453A',
    backgroundColor: '#261C1D',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#1A82FF',
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#1A82FF66',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  helpButton: {
    marginTop: 20,
  },
  helpText: {
    color: '#8E8E93',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});