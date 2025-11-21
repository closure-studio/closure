import { login as loginService, logout as logoutService } from '@/services/auth/login';
import { IAuthInfo } from '@/types/auth';
import { LOG } from '@/utils/logger/logger';
import { storageUtils } from '@/utils/storage';
import { useEffect, useState } from 'react';

const STORAGE_KEY = {
  TOKEN: 'auth_token',
  USER_INFO: 'user_info',
};

export interface AuthState {
  user: IAuthInfo | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
}

/**
 * 认证状态管理 Hook
 * 这是一个普通的 hook，会被 DataProvider 调用
 */
export const useAuthState = (): AuthState => {
  const [user, setUser] = useState<IAuthInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从 token 中解析用户信息（JWT）
  const parseUserFromToken = (token: string): IAuthInfo | null => {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload) as IAuthInfo;
      return decoded;
    } catch (error) {
      LOG.error('Failed to parse token', error);
      return null;
    }
  };

  // 登出函数（需要在 useEffect 之前定义）
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // 调用登出服务
      await logoutService();

      // 清除本地存储
      storageUtils.remove(STORAGE_KEY.TOKEN);
      storageUtils.remove(STORAGE_KEY.USER_INFO);

      // 清除状态
      setToken(null);
      setUser(null);

      LOG.info('Logout successful');
    } catch (error) {
      LOG.error('Logout failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化：从本地存储恢复认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = storageUtils.getString(STORAGE_KEY.TOKEN);
        const savedUser = storageUtils.getObject<IAuthInfo>(STORAGE_KEY.USER_INFO);

        if (savedToken && savedUser) {
          // 检查 token 是否过期
          if (savedUser.exp && savedUser.exp * 1000 > Date.now()) {
            setToken(savedToken);
            setUser(savedUser);
            LOG.info('Auth restored from storage');
          } else {
            // Token 已过期，清除本地数据
            LOG.info('Token expired, clearing storage');
            await logout();
          }
        }
      } catch (error) {
        LOG.error('Failed to initialize auth', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 登录
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await loginService({ email, password });
      
      if (!response.token) {
        throw new Error('No token received');
      }

      // 解析用户信息
      const userInfo = parseUserFromToken(response.token);
      if (!userInfo) {
        throw new Error('Failed to parse user info from token');
      }

      // 保存到本地存储
      storageUtils.setString(STORAGE_KEY.TOKEN, response.token);
      storageUtils.setObject(STORAGE_KEY.USER_INFO, userInfo);

      // 更新状态
      setToken(response.token);
      setUser(userInfo);

      LOG.info('Login successful', { email });
    } catch (error) {
      LOG.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新用户信息
  const refreshUserInfo = async () => {
    if (!token) return;

    try {
      const userInfo = parseUserFromToken(token);
      if (userInfo) {
        setUser(userInfo);
        storageUtils.setObject(STORAGE_KEY.USER_INFO, userInfo);
      }
    } catch (error) {
      LOG.error('Failed to refresh user info', error);
      throw error;
    }
  };

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUserInfo,
  };
};
