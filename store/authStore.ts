import { login as loginService, logout as logoutService } from '@/services/auth/login';
import { IAuthCredentials, IAuthInfo } from '@/types/auth';
import { jwtDecode } from 'jwt-decode';
import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 创建 MMKV 存储实例
const storage = createMMKV();

// Zustand MMKV 适配器
const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

interface AuthState {
  token: string | null;
  authInfo: IAuthInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: IAuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      authInfo: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: IAuthCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await loginService(credentials);
          const token = response.token;
          
          // 解码 JWT token 获取用户信息
          const authInfo = jwtDecode<IAuthInfo>(token);
          
          set({
            token,
            authInfo,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || '登录失败，请重试',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await logoutService();
          
          set({
            token: null,
            authInfo: null,
            isAuthenticated: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Logout error:', error);
          // 即使登出失败，也清除本地状态
          set({
            token: null,
            authInfo: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      setToken: (token: string) => {
        try {
          const authInfo = jwtDecode<IAuthInfo>(token);
          
          set({
            token,
            authInfo,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Invalid token:', error);
          set({
            token: null,
            authInfo: null,
            isAuthenticated: false,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // 只持久化这些字段
      partialize: (state) => ({
        token: state.token,
        authInfo: state.authInfo,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
