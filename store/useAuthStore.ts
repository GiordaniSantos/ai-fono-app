import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { api, setupApiAuth } from '../services/api';

export interface Fonoaudiologo {
    id: number;
    nome: string;
    foto: string | null;
}

export interface Paciente {
    id: number;
    nome: string;
    foto_url: string | null;
    email: string | null;
    interesses: string[];
    codigo_acesso: string;
    fonoaudiologo: Fonoaudiologo;
}

interface AuthState {
    paciente: Paciente | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setPaciente: (paciente: Paciente) => void;
    loginWithCode: (code: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
    resetAuth: () => void;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            paciente: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            _hasHydrated: false,
            setHasHydrated: (hasHydrated: boolean) => set({ _hasHydrated: hasHydrated }),
            setPaciente: (paciente) => set({ paciente }),

        loginWithCode: async (code: string) => {
            set({ isLoading: true });

            try {
                const response = await api.post('/login', {
                    codigo_acesso: code,
                });

                const { paciente, token } = response.data;

                if (token) {
                    set({
                    paciente,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                    });
                    return { success: true };
                }

                set({ isLoading: false });
                return {
                    success: false,
                    message: 'Resposta inválida do servidor.',
                };
            } catch (error) {
                set({ isLoading: false });

                if (axios.isAxiosError(error)) {
                    return {
                        success: false,
                        message:
                        error.response?.data?.message ||
                        'Código não encontrado. Verifique e tente novamente.',
                    };
                }

                return {
                    success: false,
                    message: 'Não foi possível conectar ao servidor.',
                };
            }
        },

        logout: async () => {
            try {
                await api.post('/logout');
            } catch (error) {
            } finally {
                set({
                    paciente: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        },

        resetAuth: () => {
            set({
                paciente: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        },
    }),
    {
        name: '@aifono:auth',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
            paciente: state.paciente,
            token: state.token,
            isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
            state?.setHasHydrated(true);
        },
    }
  )
);

setupApiAuth(
  () => useAuthStore.getState().token,
  () => useAuthStore.getState().resetAuth()
);